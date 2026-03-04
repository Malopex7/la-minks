import express from 'express';
import {
    getServices,
    getAdminServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createService);
router.get('/admin/all', protect, authorize('admin'), getAdminServices);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

export default router;
