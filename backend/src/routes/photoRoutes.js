// src/routes/photoRoutes.js
// Booking-scoped photo upload routes — mounted under /api/bookings
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';
import { uploadBeforePhoto, uploadAfterPhoto } from '../controllers/photoController.js';

const router = express.Router();

// POST /api/bookings/:id/photos/before
router.post('/:id/photos/before', protect, authorize('staff', 'admin'), uploadPhoto, uploadBeforePhoto);

// POST /api/bookings/:id/photos/after
router.post('/:id/photos/after', protect, authorize('staff', 'admin'), uploadPhoto, uploadAfterPhoto);

export default router;
