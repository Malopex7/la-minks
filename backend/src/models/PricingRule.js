import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
            unique: true, // Typically one pricing rule per service
        },
        baseCalculators: [
            {
                inputName: String, // e.g. 'numWindows', 'sqm', 'poolSize'
                multiplierRate: Number, // Cost per unit over the base price
            }
        ],
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
