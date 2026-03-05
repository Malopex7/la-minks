import crypto from 'crypto';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { initializeTransaction, verifyTransaction } from '../utils/paystack.js';
import { sendPaymentSuccessEmail } from '../utils/email.js';

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

                // Send payment success email
                const populatedBooking = await Booking.findById(booking._id).populate('customerId', 'firstName email');
                if (populatedBooking && populatedBooking.customerId) {
                    sendPaymentSuccessEmail(populatedBooking, populatedBooking.customerId.email, populatedBooking.customerId.firstName)
                        .catch(err => console.error('Payment Email failed:', err));
                }

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

// @desc    Handle Paystack Webhook
// @route   POST /api/payments/paystack/webhook
// @access  Public
export const handlePaystackWebhook = async (req, res) => {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            const event = req.body;

            if (event.event === 'charge.success') {
                const data = event.data;
                const bookingId = data.metadata?.bookingId;

                if (bookingId) {
                    // Check if it's a valid ObjectId
                    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
                        console.warn(`Webhook: Invalid bookingId format: ${bookingId}`);
                        return res.sendStatus(200); // We still ACK Paystack
                    }

                    const booking = await Booking.findById(bookingId);
                    if (booking) {
                        booking.payment.status = 'PAID';
                        booking.payment.paidAt = new Date(data.paid_at || Date.now());
                        booking.payment.channel = data.channel;
                        booking.status = 'CONFIRMED';
                        await booking.save();
                        console.log(`Webhook: Booking ${bookingId} confirmed and paid.`);

                        // Send payment success email
                        const populatedBooking = await Booking.findById(booking._id).populate('customerId', 'firstName email');
                        if (populatedBooking && populatedBooking.customerId) {
                            sendPaymentSuccessEmail(populatedBooking, populatedBooking.customerId.email, populatedBooking.customerId.firstName)
                                .catch(err => console.error('Webhook Payment Email failed:', err));
                        }
                    } else {
                        console.warn(`Webhook: Booking ${bookingId} not found.`);
                    }
                }
            }

            // Always return 200 OK to Paystack
            res.sendStatus(200);
        } else {
            console.warn('Webhook: Invalid signature');
            res.status(400).send('Invalid signature');
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Webhook Error');
    }
};
