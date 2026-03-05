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
        const { firstName, lastName, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            isEmailVerified: false,
            verificationToken,
        });

        if (user) {
            // Send Verification Email Async
            sendVerificationEmail(user.email, user.firstName, verificationToken).catch(err => {
                console.error('Failed to send verification email:', err);
            });

            // Do NOT generate JWTs yet. Return instruction to verify email.
            res.status(201).json({
                message: 'Registration successful. Please check your email to verify your account.',
                _id: user._id,
                email: user.email,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

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
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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
