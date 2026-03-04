// src/index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GridFSBucket } from 'mongodb';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import pricingRuleRoutes from './routes/pricingRuleRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import { protect, authorize } from './middleware/authMiddleware.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB (use MONGO_URI from .env)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    // Set up GridFS bucket
    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
    console.log('GridFS bucket ready');
  })
  .catch(err => console.error(err));

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

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
