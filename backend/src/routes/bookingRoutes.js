import express from 'express';
import { getMyBookings, getBookingById, createBooking } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.route('/').post(protect, createBooking);
router.route('/my').get(protect, getMyBookings);
router.route('/:id').get(protect, getBookingById);

export default router;
