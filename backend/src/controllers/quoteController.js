import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';
import { calculateTravelSurcharge } from '../utils/distance.js';

// Lightweight in-memory cache for fast quoting without repetitive DB roundtrips
const pricingCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const invalidatePricingCache = (serviceId) => {
    if (serviceId) {
        pricingCache.delete(`service_${serviceId}`);
        pricingCache.delete(`pricing_${serviceId}`);
    } else {
        pricingCache.clear();
    }
};

const getCached = (key) => {
    const item = pricingCache.get(key);
    if (!item) return null;
    if (Date.now() - item.cachedAt > CACHE_TTL_MS) {
        pricingCache.delete(key);
        return null;
    }
    return item.data;
};

const setCached = (key, data) => {
    pricingCache.set(key, { data, cachedAt: Date.now() });
};

// @desc    Calculate quote based on dynamic serviceDetails and extras
// @route   POST /api/quote
// @access  Public
export const calculateQuote = async (req, res) => {
    try {
        const { serviceId, serviceDetails, extrasSelected, aiExtras, address } = req.body;

        if (!serviceId) {
            return res.status(400).json({ message: 'serviceId is required' });
        }

        // 1. Fetch the service and its pricing rule (from fast in-memory cache or DB)
        let service = getCached(`service_${serviceId}`);
        if (!service) {
            service = await Service.findById(serviceId).lean();
            if (service) setCached(`service_${serviceId}`, service);
        }
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        let pricingRule = getCached(`pricing_${serviceId}`);
        if (!pricingRule) {
            pricingRule = await PricingRule.findOne({ serviceId }).lean();
            if (pricingRule) setCached(`pricing_${serviceId}`, pricingRule);
        }
        if (!pricingRule) {
            return res.status(404).json({ message: 'Pricing rules not found for this service' });
        }

        // 2. Base Price Calculation
        let baseCost = service.basePrice || 0;

        // Apply dynamic base calculators based on incoming serviceDetails
        if (serviceDetails && pricingRule.baseCalculators?.length > 0) {
            pricingRule.baseCalculators.forEach(calc => {
                const inputValue = serviceDetails[calc.inputName];
                if (inputValue && typeof inputValue === 'number') {
                    // e.g. 10 windows * R25 per window
                    baseCost += (inputValue * calc.multiplierRate);
                }
            });
        }

        // Apply condition multiplier, if provided conceptually via serviceDetails
        if (serviceDetails?.conditionLevel && pricingRule.conditionMultipliers) {
            const conditionMultiplier = pricingRule.conditionMultipliers[serviceDetails.conditionLevel] || 1;
            baseCost *= conditionMultiplier;
        }

        // 3. Extras Cost Calculation
        let extrasCost = 0;
        let estimatedAdditionalHours = 0;

        if (extrasSelected && extrasSelected.length > 0) {
            extrasSelected.forEach((extraName) => {
                // First check DB rules
                let extraRule = pricingRule.extras?.find((e) => e.name === extraName);

                // If not found in DB, check dynamically passed AI extras
                if (!extraRule && aiExtras && aiExtras.length > 0) {
                    extraRule = aiExtras.find((e) => e.name === extraName);
                }

                if (extraRule) {
                    extrasCost += extraRule.price || 0;
                    estimatedAdditionalHours += extraRule.estimatedAdditionalHours || 0;
                }
            });
        }

        // 4. Dynamic Travel Surcharge Calculation (Google Distance Matrix / Haversine)
        let travelFee = 0;
        let travelDetails = {
            distanceKm: 0,
            durationMinutes: 0,
            fee: 0,
            isBeyondBaseRadius: false,
        };

        if (address) {
            travelDetails = await calculateTravelSurcharge(address);
            travelFee = travelDetails.fee || 0;
        }

        // 5. Subtotal, Dynamic Service VAT, and Final Price Calculation
        const subtotal = Math.round((baseCost + extrasCost + travelFee) * 100) / 100;
        const vatPercentage = typeof service.vatRate === 'number' ? service.vatRate : 15;
        const vatRate = vatPercentage / 100;
        const vatAmount = Math.round((subtotal * vatRate) * 100) / 100;
        const finalPrice = Math.round((subtotal + vatAmount) * 100) / 100;

        // Rough estimation logic:
        // Base 2 hours + 0.5 hours for every major unit counted (+ extras)
        const baseHours = 2;
        let dynamicHours = 0;

        if (serviceDetails) {
            // Very roughly add 30 mins for every counted unit (like bedrooms or rooms) to give a baseline
            Object.values(serviceDetails).forEach(val => {
                if (typeof val === 'number' && val < 50) { // e.g. 3 bedrooms = 1.5 hours
                    dynamicHours += (val * 0.5);
                }
            });
        }

        const totalEstimatedHours = baseHours + dynamicHours + estimatedAdditionalHours;

        res.status(200).json({
            baseCost,
            extrasCost,
            travelFee,
            travelDetails,
            subtotal,
            vatRate,
            vatAmount,
            estimatedHours: totalEstimatedHours,
            finalPrice,
        });
    } catch (error) {
        console.error('Error calculating quote:', error);
        res.status(500).json({ message: 'Server error calculating quote' });
    }
};

// @desc    Send quote details via email (for guests or logged-in users)
// @route   POST /api/quote/send-email
// @access  Public
export const emailQuote = async (req, res) => {
    try {
        const { email, name, serviceId, serviceName, serviceDetails, extrasSelected, aiExtras, schedule, address, pricing } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email address is required' });
        }

        let resolvedServiceName = serviceName;
        if (!resolvedServiceName && serviceId) {
            const service = await Service.findById(serviceId);
            if (service) resolvedServiceName = service.name;
        }

        const quotePayload = {
            serviceName: resolvedServiceName || 'Cleaning Service',
            serviceDetails: serviceDetails || {},
            extrasSelected: extrasSelected || [],
            aiExtras: aiExtras || [],
            schedule: schedule || {},
            address: address || {},
            finalPrice: pricing?.finalPrice || pricing?.totalAmount || 0,
            estimatedHours: pricing?.estimatedHours || 0,
        };

        const { sendQuoteEmail } = await import('../utils/email.js');
        await sendQuoteEmail(quotePayload, email, name || 'Valued Customer');

        res.status(200).json({ success: true, message: 'Quote sent successfully to your email!' });
    } catch (error) {
        console.error('Error sending quote email:', error);
        res.status(500).json({ message: 'Server error sending quote email' });
    }
};

