import Service from '../models/Service.js';
import PricingRule from '../models/PricingRule.js';

// @desc    Calculate quote based on property and service details
// @route   POST /api/quote
// @access  Public
export const calculateQuote = async (req, res) => {
    try {
        const { serviceId, property, extrasSelected } = req.body;

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

        // Apply property size multiplier if sqm is provided
        if (property?.sqm && pricingRule.propertySizeBands?.length > 0) {
            const band = pricingRule.propertySizeBands.find(
                (b) => property.sqm >= b.minSqm && property.sqm <= b.maxSqm
            );
            if (band) {
                baseCost *= band.multiplier;
            }
        }

        // Add room rates
        if (property?.bedrooms && pricingRule.roomRates?.bedroomRate) {
            baseCost += property.bedrooms * pricingRule.roomRates.bedroomRate;
        }
        if (property?.bathrooms && pricingRule.roomRates?.bathroomRate) {
            baseCost += property.bathrooms * pricingRule.roomRates.bathroomRate;
        }

        // Apply condition multiplier
        if (property?.conditionLevel && pricingRule.conditionMultipliers) {
            const conditionMultiplier = pricingRule.conditionMultipliers[property.conditionLevel] || 1;
            baseCost *= conditionMultiplier;
        }

        // 3. Extras Cost Calculation
        let extrasCost = 0;
        let estimatedAdditionalHours = 0;

        if (extrasSelected && extrasSelected.length > 0 && pricingRule.extras?.length > 0) {
            extrasSelected.forEach((extraName) => {
                const extraRule = pricingRule.extras.find((e) => e.name === extraName);
                if (extraRule) {
                    extrasCost += extraRule.price || 0;
                    estimatedAdditionalHours += extraRule.estimatedAdditionalHours || 0;
                }
            });
        }

        // 4. Final Price and Hours
        const finalPrice = baseCost + extrasCost;

        // Rough estimation: base 2 hours + 0.5 hours per bedroom/bathroom + extra hours
        const baseHours = 2;
        const roomHours = ((property?.bedrooms || 0) + (property?.bathrooms || 0)) * 0.5;
        const totalEstimatedHours = baseHours + roomHours + estimatedAdditionalHours;

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
