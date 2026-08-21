import express from 'express';
import { register, login, refresh, logout, verifyEmail, googleAuth, firebaseSync } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/google-auth', googleAuth);
router.post('/firebase-sync', firebaseSync);

export default router;
