import User from '../models/User.js';

// @desc    Get all staff users
// @route   GET /api/users/staff
// @access  Private/Admin
export const getStaffUsers = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).select('-password -__v');
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
