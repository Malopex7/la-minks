import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional for QUOTE status
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
        },
        address: {
            line1: String,
            suburb: String,
            city: String,
            province: String,
            postalCode: String,
        },
        serviceDetails: {
            type: Map,
            of: mongoose.Schema.Types.Mixed, // Allows capturing arbitrary dynamic inputs (e.g. numWindows: 12)
        },
        extrasSelected: [String],
        schedule: {
            date: Date,
            timeSlot: String,
            estimatedHours: Number,
        },
        staffAssignedIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        status: {
            type: String,
            enum: ['QUOTE', 'BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: 'QUOTE',
        },
        payment: {
            status: {
                type: String,
                enum: ['UNPAID', 'PENDING', 'PAID', 'FAILED'],
                default: 'UNPAID',
            },
            provider: {
                type: String,
                enum: ['PAYSTACK'],
            },
            reference: String,
            amount: Number,
            currency: {
                type: String,
                default: 'ZAR',
            },
            paidAt: Date,
            channel: String,
        },
        checklist: [
            {
                task: String,
                completed: { type: Boolean, default: false },
            },
        ],
        photos: {
            before: [String],
            after: [String],
        },
        aiExtras: [{
            name: String,
            price: Number,
            estimatedAdditionalHours: Number
        }],
        notesCustomer: {
            type: String,
            trim: true,
        },
        notesStaff: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
