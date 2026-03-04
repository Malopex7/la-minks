import express from 'express';
import { initializePayment, verifyPayment, handlePaystackWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Paystack transaction (requires authentication)
router.post('/paystack/initialize', protect, initializePayment);

// Verify Paystack transaction (can be called by frontend callback, so no strict authentication required)
router.get('/paystack/verify/:reference', verifyPayment);

// Paystack webhook endpoint
router.post('/paystack/webhook', handlePaystackWebhook);

export default router;
