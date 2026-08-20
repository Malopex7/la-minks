/**
 * Seed role-based test users (staff + customer).
 * Preserves existing admin. Run: node seed-users.js
 */
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

const PASSWORD = 'L0c@l@6m1n';

const usersToSeed = [
    {
        firstName: 'Xolane',
        lastName:  'Malope',
        email:     'info@cryobyte.co.za',
        role:      'superadmin',
        phone:     '0812345678',
    },
    {
        firstName: 'Sarah',
        lastName:  'Dlamini',
        email:     'staff@laminks.co.za',
        role:      'staff',
        phone:     '0712345678',
    },
    {
        firstName: 'John',
        lastName:  'Mokoena',
        email:     'customer@laminks.co.za',
        role:      'customer',
        phone:     '0823456789',
    },
];

async function seedUsers() {
    await mongoose.connect(process.env.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected\n');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(PASSWORD, salt);

    for (const userData of usersToSeed) {
        const exists = await User.findOne({ email: userData.email });

        if (exists) {
            // Update role + password + verify
            exists.role            = userData.role;
            exists.password        = hashedPassword;
            exists.isEmailVerified = true;
            exists.verificationToken = undefined;
            await exists.save();
            console.log(`🔄 Updated:  ${userData.email}  →  role: ${userData.role}`);
        } else {
            await User.create({
                ...userData,
                password:        hashedPassword,
                isEmailVerified: true,
            });
            console.log(`✅ Created:  ${userData.email}  →  role: ${userData.role}`);
        }
    }

    console.log('\n─────────────────────────────────────────');
    console.log('  Role        Email                   PW');
    console.log('─────────────────────────────────────────');
    console.log(`  staff     staff@laminks.co.za    ${PASSWORD}`);
    console.log(`  customer  customer@laminks.co.za ${PASSWORD}`);
    console.log('─────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
}

seedUsers().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
