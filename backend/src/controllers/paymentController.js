import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { initializeTransaction, verifyTransaction } from '../utils/paystack.js';

// @desc    Initialize a Paystack payment for a booking
// @route   POST /api/payments/paystack/initialize
// @access  Private (Customer)
export const initializePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Optional: Check if the user owns this booking (if customerId is set)
        if (booking.customerId && booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }

        // Check if already paid
        if (booking.payment.status === 'PAID') {
            return res.status(400).json({ message: 'Booking is already paid' });
        }

        // Calculate amount in cents (Paystack convention)
        const amountInCents = Math.round(booking.payment.amount * 100);

        // Define callback URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const callbackUrl = `${frontendUrl}/pay/callback`;

        const paystackData = {
            amount: amountInCents,
            email: req.user.email,
            currency: booking.payment.currency || 'ZAR',
            callback_url: callbackUrl,
            metadata: {
                bookingId: booking._id.toString(),
            }
        };

        const paystackRes = await initializeTransaction(paystackData);

        if (paystackRes && paystackRes.status) {
            // Update booking payment status and reference
            booking.payment.status = 'PENDING';
            booking.payment.reference = paystackRes.data.reference;
            booking.payment.provider = 'PAYSTACK';
            await booking.save();

            return res.status(200).json({
                authorization_url: paystackRes.data.authorization_url,
                reference: paystackRes.data.reference,
            });
        } else {
            return res.status(400).json({ message: 'Failed to initialize Paystack transaction' });
        }
    } catch (error) {
        console.error('Initialize Payment Error:', error);
        res.status(500).json({ message: error.message || 'Server error initializing payment' });
    }
};

// @desc    Verify a Paystack payment callback
// @route   GET /api/payments/paystack/verify/:reference
// @access  Public (Callback from Paystack)
export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({ message: 'Reference is required' });
        }

        const paystackRes = await verifyTransaction(reference);

        if (paystackRes && paystackRes.status && paystackRes.data) {
            const data = paystackRes.data;
            const status = data.status; // e.g. 'success'
            const bookingId = data.metadata?.bookingId;

            if (!bookingId) {
                return res.status(400).json({ message: 'Booking ID not found in transaction metadata' });
            }

            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }

            if (status === 'success') {
                booking.payment.status = 'PAID';
                booking.payment.paidAt = new Date(data.paid_at || Date.now());
                booking.payment.channel = data.channel;
                booking.status = 'CONFIRMED';
                await booking.save();

                return res.status(200).json({ message: 'Payment verified successfully', status: 'success' });
            } else {
                booking.payment.status = 'FAILED';
                await booking.save();
                return res.status(400).json({ message: `Payment failed with status: ${status}`, status });
            }
        } else {
            return res.status(400).json({ message: 'Invalid verification response from Paystack' });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);

        // If it's a known booking, we might want to mark it as FAILED if verification errors out,
        // but usually we rely on Paystack webhooks to eventually sort it out, or the user can retry.
        res.status(500).json({ message: error.message || 'Server error verifying payment' });
    }
};
