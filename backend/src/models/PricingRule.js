import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
            unique: true, // Typically one pricing rule per service
        },
        propertySizeBands: [
            {
                minSqm: Number,
                maxSqm: Number,
                multiplier: Number, // Multiplier applied to baseRate for this size band
            }
        ],
        roomRates: {
            bedroomRate: { type: Number, default: 0 },
            bathroomRate: { type: Number, default: 0 },
        },
        conditionMultipliers: {
            standard: { type: Number, default: 1 },
            deep: { type: Number, default: 1.5 },
            heavy_duty: { type: Number, default: 2.0 },
        },
        extras: [
            {
                name: String,
                price: Number,
                estimatedAdditionalHours: { type: Number, default: 0 },
            }
        ],
    },
    {
        timestamps: true,
    }
);

const PricingRule = mongoose.models.PricingRule || mongoose.model('PricingRule', pricingRuleSchema);

export default PricingRule;
