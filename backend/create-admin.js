/**
 * One-time admin creation script.
 * Usage: node create-admin.js
 * After running, delete this file.
 */
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from './src/models/User.js';
import { sendVerificationEmail } from './src/utils/email.js';

const ADMIN_EMAIL     = 'info@cryobyte.co.za';
const ADMIN_FIRSTNAME = 'La-Minks';
const ADMIN_LASTNAME  = 'Admin';
const ADMIN_PASSWORD  = 'Admin@LaMinks2024!'; // Change after first login

async function createAdmin() {
    await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');

    // Check if already exists
    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
        // Update existing to admin + unverified so we can re-send the link
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.role = 'admin';
        user.isEmailVerified = false;
        user.verificationToken = verificationToken;
        await user.save();
        console.log(`🔄 Existing user updated → role: admin, re-sending verification email…`);
        await sendVerificationEmail(user.email, user.firstName, verificationToken);
    } else {
        // Create brand new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        user = await User.create({
            firstName: ADMIN_FIRSTNAME,
            lastName:  ADMIN_LASTNAME,
            email:     ADMIN_EMAIL,
            password:  hashedPassword,
            role:      'admin',
            isEmailVerified: false,
            verificationToken,
        });

        console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
        console.log(`🔑 Temporary password: ${ADMIN_PASSWORD}`);
        await sendVerificationEmail(user.email, user.firstName, verificationToken);
    }

    console.log('\n👆 Click the 🚀 Preview URL above to open the verification email in Ethereal.');
    console.log('   Then click the verification link inside the email to activate the account.\n');

    // Keep process alive briefly for email to send
    await new Promise(r => setTimeout(r, 3000));
    await mongoose.disconnect();
    process.exit(0);
}

createAdmin().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
