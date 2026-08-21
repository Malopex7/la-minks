import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        basePrice: {
            type: Number,
            required: true,
            min: 0,
        },
        vatRate: {
            type: Number,
            default: 15,
            min: 0,
            max: 100,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        imageUrl: {
            type: String,
        },
        inputs: [
            {
                name: { type: String, required: true },
                label: { type: String, required: true },
                type: { type: String, enum: ['number', 'select', 'boolean'], required: true },
                options: [String], // Only required/used if type is 'select'
                required: { type: Boolean, default: true },
            }
        ],
    },
    {
        timestamps: true,
    }
);

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);

export default Service;
