import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';

// @desc    Calculate quote based on dynamic serviceDetails and extras
// @route   POST /api/quote
// @access  Public
export const calculateQuote = async (req, res) => {
    try {
        const { serviceId, serviceDetails, extrasSelected, aiExtras } = req.body;

        if (!serviceId) {
            return res.status(400).json({ message: 'serviceId is required' });
        }

        // 1. Fetch the service and its pricing rule
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const pricingRule = await PricingRule.findOne({ serviceId });
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

        // 4. Final Price and Hours
        const finalPrice = baseCost + extrasCost;

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
            estimatedHours: totalEstimatedHours,
            finalPrice,
        });
    } catch (error) {
        console.error('Error calculating quote:', error);
        res.status(500).json({ message: 'Server error calculating quote' });
    }
};
