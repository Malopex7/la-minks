import express from 'express';
import {
    getStaffUsers,
    getAllUsers,
    createUserByAdmin,
    updateUserByAdmin,
    deleteUserByAdmin,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Staff users (admin & superadmin access)
router.route('/staff').get(protect, authorize('admin', 'superadmin'), getStaffUsers);

// Super Admin user management routes
router.route('/')
    .get(protect, authorize('superadmin'), getAllUsers)
    .post(protect, authorize('superadmin'), createUserByAdmin);

router.route('/:id')
    .put(protect, authorize('superadmin'), updateUserByAdmin)
    .delete(protect, authorize('superadmin'), deleteUserByAdmin);

export default router;
