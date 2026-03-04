import express from 'express';
import { calculateQuote } from '../controllers/quoteController.js';

const router = express.Router();

// POST /api/quote - Calculate pricing for a quote
router.post('/', calculateQuote);

export default router;
