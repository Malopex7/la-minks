import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const TARGET_EMAIL = process.argv[2] || 'info@cryobyte.co.za';
const PASSWORD = 'L0c@l@6m1n';

async function promoteSuperAdmin() {
    await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');

    const user = await User.findOne({ email: TARGET_EMAIL.toLowerCase().trim() });

    if (!user) {
        console.error(`❌ User with email "${TARGET_EMAIL}" not found.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(PASSWORD, salt);
    user.role = 'superadmin';
    user.isEmailVerified = true;
    await user.save();

    console.log(`🎉 SUCCESS: ${user.firstName} ${user.lastName} (${user.email}) is now a SUPERADMIN with verified status and PW: ${PASSWORD}!`);
    await mongoose.disconnect();
    process.exit(0);
}

promoteSuperAdmin().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
