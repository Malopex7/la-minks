import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const patchLegacyUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Finding unverified users...');
        const result = await User.updateMany(
            { isEmailVerified: { $ne: true } },
            { $set: { isEmailVerified: true } }
        );

        console.log(`Successfully verified ${result.modifiedCount} legacy users.`);

        console.log('Disconnecting...');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error patching users:', err);
        process.exit(1);
    }
};

patchLegacyUsers();
