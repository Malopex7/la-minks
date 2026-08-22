import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email.js';

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, firebaseUid } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let hashedPassword = undefined;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            firebaseUid,
            isEmailVerified: false,
            role: 'customer',
            verificationToken,
        });

        if (user) {
            // Send Verification Email Async (fallback)
            sendVerificationEmail(user.email, user.firstName, verificationToken).catch(err => {
                console.error('Failed to send verification email:', err);
            });

            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                _id: user._id,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { email, firstName, lastName, firebaseUid } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required for Google authentication' });
        }

        let user = await User.findOne({ email });

        if (user) {
            if (firebaseUid && !user.firebaseUid) {
                user.firebaseUid = firebaseUid;
            }
            // Google OAuth guarantees verified email
            user.isEmailVerified = true;
            await user.save();
        } else {
            // New Google accounts are strictly created as customers
            user = await User.create({
                firstName: firstName || 'Google',
                lastName: lastName || 'User',
                email,
                firebaseUid,
                isEmailVerified: true,
                role: 'customer',
            });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            accessToken,
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const firebaseSync = async (req, res) => {
    try {
        const { email, firebaseUid, isEmailVerified, firstName, lastName } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        let user = await User.findOne({ email });

        if (user) {
            if (firebaseUid && !user.firebaseUid) {
                user.firebaseUid = firebaseUid;
            }
            if (isEmailVerified !== undefined) {
                user.isEmailVerified = isEmailVerified || user.isEmailVerified;
            }
            await user.save();
        } else {
            user = await User.create({
                firstName: firstName || 'Customer',
                lastName: lastName || 'User',
                email,
                firebaseUid,
                isEmailVerified: isEmailVerified || false,
                role: 'customer',
            });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            accessToken,
        });
    } catch (error) {
        console.error('Firebase Sync Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If user registered with Google/Firebase OAuth and has no password set
        if (!user.password) {
            return res.status(400).json({
                message: 'This account was registered using Google Sign-In. Please log in with Google.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Block login if email is not verified
        if (!user.isEmailVerified) {
            // Generate a new token in case the old one expired
            const newToken = crypto.randomBytes(32).toString('hex');
            user.verificationToken = newToken;
            await user.save();

            // Send it async
            sendVerificationEmail(user.email, user.firstName, newToken).catch(err => {
                console.error('Failed to resend verification email on login:', err);
            });

            return res.status(403).json({ message: 'Please verify your email address to log in. We just sent you a new verification link.' });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            accessToken,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};

export const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.jwt;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Not authorized, no refresh token' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // We only need a new access token
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });

        res.json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0),
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Verify the user
        user.isEmailVerified = true;
        user.verificationToken = undefined; // Clear the token so it can't be used again
        await user.save();

        // Immediately log them in
        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'Email verified successfully',
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            accessToken,
        });
    } catch (error) {
        console.error('Email Verification Error:', error);
        res.status(500).json({ message: 'Failed to verify email' });
    }
};
