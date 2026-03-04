import express from 'express';
import { initializePayment, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Paystack transaction (requires authentication)
router.post('/paystack/initialize', protect, initializePayment);

// Verify Paystack transaction (can be called by frontend callback, so no strict authentication required)
router.get('/paystack/verify/:reference', verifyPayment);

export default router;
