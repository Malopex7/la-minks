import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all staff users (for booking assignment dropdowns)
// @route   GET /api/users/staff
// @access  Private/Admin
export const getStaffUsers = async (req, res) => {
    try {
        const staff = await User.find({ role: 'staff' }).select('-password -__v').sort({ firstName: 1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users with search & role filter (Super Admin only)
// @route   GET /api/users
// @access  Private/SuperAdmin
export const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        const filter = {};

        if (role) {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter)
            .select('-password -__v')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new user by Super Admin
// @route   POST /api/users
// @access  Private/SuperAdmin
export const createUserByAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone, isEmailVerified } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'First name, last name, email, and password are required' });
        }

        const validRoles = ['superadmin', 'admin', 'staff', 'customer'];
        const assignedRole = role && validRoles.includes(role) ? role : 'customer';

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email address already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: assignedRole,
            phone: phone ? phone.trim() : undefined,
            isEmailVerified: isEmailVerified !== undefined ? isEmailVerified : true,
        });

        // Audit Log
        AuditLog.create({
            userId: req.user._id,
            action: 'CREATE',
            entityType: 'User',
            entityId: user._id,
            details: { email: user.email, role: user.role, createdBy: req.user.email },
        }).catch(() => {});

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user details & role by Super Admin
// @route   PUT /api/users/:id
// @access  Private/SuperAdmin
export const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { firstName, lastName, email, role, phone, isEmailVerified, password } = req.body;

        if (email && email.toLowerCase().trim() !== user.email) {
            const emailTaken = await User.findOne({ email: email.toLowerCase().trim() });
            if (emailTaken) {
                return res.status(400).json({ message: 'Email is already in use by another account' });
            }
            user.email = email.toLowerCase().trim();
        }

        if (firstName) user.firstName = firstName.trim();
        if (lastName) user.lastName = lastName.trim();
        if (phone !== undefined) user.phone = phone ? phone.trim() : undefined;
        if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;

        if (role) {
            const validRoles = ['superadmin', 'admin', 'staff', 'customer'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role specified' });
            }
            user.role = role;
        }

        if (password && password.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password.trim(), salt);
        }

        const updatedUser = await user.save();

        // Audit Log
        AuditLog.create({
            userId: req.user._id,
            action: 'UPDATE',
            entityType: 'User',
            entityId: updatedUser._id,
            details: { email: updatedUser.email, role: updatedUser.role, updatedBy: req.user.email },
        }).catch(() => {});

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            isEmailVerified: updatedUser.isEmailVerified,
            updatedAt: updatedUser.updatedAt,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user by Super Admin
// @route   DELETE /api/users/:id
// @access  Private/SuperAdmin
export const deleteUserByAdmin = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'You cannot delete your own superadmin account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);

        // Audit Log
        AuditLog.create({
            userId: req.user._id,
            action: 'DELETE',
            entityType: 'User',
            entityId: req.params.id,
            details: { deletedEmail: user.email, deletedRole: user.role, deletedBy: req.user.email },
        }).catch(() => {});

        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
