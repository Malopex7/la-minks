import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Booking from './src/models/Booking.js';
import Service from './src/models/Service.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Create a test staff user
        const staffEmail = 'staff.test1@laminks.com';
        let staff = await User.findOne({ email: staffEmail });
        if (!staff) {
            staff = await User.create({
                firstName: 'Test',
                lastName: 'Staffer',
                email: staffEmail,
                password: 'password123',
                role: 'staff',
                phone: '000-000-1234'
            });
            console.log('Created staff user');
        } else {
            console.log('Staff user already exists');
        }

        // Get a default service
        const service = await Service.findOne({});
        if (!service) throw new Error('No services found');

        // Create a fresh booking for today assigned to this staff member
        const booking = await Booking.create({
            customerId: staff._id, // Just using staff as customer for simplicity of dummy data
            serviceId: service._id,
            address: {
                line1: '123 Cleaning St',
                suburb: 'Morningside',
                city: 'Sandton',
                province: 'Gauteng',
                postalCode: '2057'
            },
            property: {
                sqm: 100,
                bedrooms: 2,
                bathrooms: 1,
                conditionLevel: 'standard'
            },
            schedule: {
                date: new Date(), // Today
                timeSlot: 'Morning (08:00 - 12:00)',
                estimatedHours: 4
            },
            status: 'BOOKED', // Assigned but not in progress
            staffAssignedIds: [staff._id],
            payment: {
                status: 'PAID',
                provider: 'PAYSTACK',
                amount: 1500,
                currency: 'ZAR'
            }
        });

        console.log('Created test booking assigned to staff:', booking._id);

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

run();
