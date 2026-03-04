import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            default: 'pending',
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
        },
        staffAssigned: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        notes: {
            type: String,
            trim: true,
        },
        photos: {
            before: [String], // Array of ObjectIds as Strings or URLs (GridFS references)
            after: [String],
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
