import express from 'express';
import { getMyBookings, getBookingById, createBooking, getAllBookings, updateBookingStatus, assignStaffToBooking } from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
// Admin only
router.route('/').get(protect, authorize('admin', 'admin'), getAllBookings);

// Admin / Customer (initial creation, usually from quote)
router.route('/').post(protect, createBooking);

// Customer specific
router.route('/my').get(protect, getMyBookings);

// Open to authenticated users, controller handles role checks for viewing
router.route('/:id').get(protect, getBookingById);

// Admin / Staff
router.route('/:id/status').put(protect, authorize('admin', 'staff'), updateBookingStatus);

// Admin only
router.route('/:id/assign-staff').put(protect, authorize('admin', 'admin'), assignStaffToBooking);

export default router;
