import express from 'express';
import {
    getPricingRules,
    getAdminPricingRules,
    getPricingRuleById,
    createPricingRule,
    updatePricingRule,
    deletePricingRule,
} from '../controllers/pricingRuleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPricingRules);
router.get('/:id', getPricingRuleById);

// Admin-only routes
router.post('/', protect, authorize('admin'), createPricingRule);
router.get('/admin/all', protect, authorize('admin'), getAdminPricingRules);
router.put('/:id', protect, authorize('admin'), updatePricingRule);
router.delete('/:id', protect, authorize('admin'), deletePricingRule);

export default router;
