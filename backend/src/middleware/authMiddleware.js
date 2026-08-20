import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error('Auth protect error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    return res.status(401).json({ message: 'Not authorized, no token' });
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        // superadmin inherits all admin access automatically
        const effectiveRoles = roles.includes('admin') && !roles.includes('superadmin')
            ? [...roles, 'superadmin']
            : roles;

        if (!req.user || !effectiveRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this route`
            });
        }
        next();
    };
};
