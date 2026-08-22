// src/index.js
import dns from 'dns';
// Override c-ares DNS servers — local router (fe80::1) refuses TCP DNS needed for SRV lookups
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import pricingRuleRoutes from './routes/pricingRuleRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { protect, authorize } from './middleware/authMiddleware.js';
import { initBucket } from './utils/gridfs.js';
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB with optimized connection pool settings
mongoose.connect(process.env.MONGO_URI, {
  family: 4,
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('MongoDB connected with pooled connections');
    initBucket(mongoose.connection.db);
  })
  .catch(err => console.error('MongoDB connection error:', err.message));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working' });
});

// Protected test route (Any authenticated user)
app.get('/api/test/protected', protect, (req, res) => {
  res.json({ message: 'You have generated a valid token!', user: req.user });
});

// Admin-only test route
app.get('/api/test/admin', protect, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin!', user: req.user });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/pricing-rules', pricingRuleRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
// Photo upload routes: POST /api/bookings/:id/photos/before|after
app.use('/api/bookings', photoRoutes);
// Photo serve/delete: GET|DELETE /api/photos/:fileId
app.use('/api/photos', mediaRoutes);
// Audit logs: GET /api/audit
app.use('/api/audit', auditRoutes);
// AI-powered extras suggestion
app.use('/api/quote', aiRoutes);

// Start server on new port (5001)
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
