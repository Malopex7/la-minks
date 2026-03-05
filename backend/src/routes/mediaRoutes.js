// src/routes/mediaRoutes.js
// Standalone media routes — mounted under /api/photos
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { servePhoto, deletePhoto } from '../controllers/photoController.js';

const router = express.Router();

// GET  /api/photos/:fileId  – stream a stored photo (public - img tags cannot send auth headers, fileIds are unguessable)
router.get('/:fileId', servePhoto);

// DELETE /api/photos/:fileId – remove from GridFS + strip from bookings (admin only)
router.delete('/:fileId', protect, authorize('admin'), deletePhoto);

export default router;
