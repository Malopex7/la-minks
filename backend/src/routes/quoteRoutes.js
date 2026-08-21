import express from 'express';
import { calculateQuote, emailQuote } from '../controllers/quoteController.js';

const router = express.Router();

// POST /api/quote - Calculate pricing for a quote
router.post('/', calculateQuote);

// POST /api/quote/send-email - Email quote breakdown to user/guest
router.post('/send-email', emailQuote);

export default router;

