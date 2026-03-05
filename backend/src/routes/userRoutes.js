import express from 'express';
import { getStaffUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/staff').get(protect, authorize('admin'), getStaffUsers);

export default router;
