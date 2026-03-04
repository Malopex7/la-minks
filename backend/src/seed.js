import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Service from './models/Service.js';
import PricingRule from './models/PricingRule.js';

dotenv.config();

const servicesList = [
    { name: 'Home Cleaning', description: 'Standard whole-home cleaning', basePrice: 400 },
    { name: 'Office Cleaning', description: 'Commercial cleaning for offices', basePrice: 600 },
    { name: 'Window Cleaning', description: 'Professional window washing', basePrice: 250 },
    { name: 'Carpet Cleaning', description: 'Deep carpet shampooing', basePrice: 350 },
    { name: 'Move Out Cleaning', description: 'Detailed cleaning before you move out', basePrice: 1000 },
    { name: 'Upholstery Cleaning', description: 'Furniture and upholstery cleaning', basePrice: 300 },
    { name: 'Afterparty Cleaning', description: 'Post-event cleanup service', basePrice: 500 },
    { name: 'New House Cleaning', description: 'Pre-occupation deep clean', basePrice: 900 },
    { name: 'Bedroom Cleaning', description: 'Specialized bedroom cleaning', basePrice: 150 },
    { name: 'Painting', description: 'Interior and exterior painting services', basePrice: 1500 },
    { name: 'Gardening', description: 'Yard maintenance and landscaping', basePrice: 450 },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Service.deleteMany({});
        await PricingRule.deleteMany({});
        console.log('Existing data cleared.');

        // 1. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = new User({
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@laminks.co.za',
            password: hashedPassword,
            role: 'admin',
            phone: '0821234567',
        });
        await adminUser.save();
        console.log('Admin user created (admin@laminks.co.za / admin123).');

        // 2. Create Services
        const createdServices = await Service.insertMany(servicesList);
        console.log(`${createdServices.length} services added.`);

        // 3. Create Default Pricing Rules for each service
        for (const service of createdServices) {
            const pricingRule = new PricingRule({
                serviceId: service._id,
                propertySizeBands: [
                    { minSqm: 0, maxSqm: 50, multiplier: 1 },
                    { minSqm: 51, maxSqm: 100, multiplier: 1.2 },
                    { minSqm: 101, maxSqm: 200, multiplier: 1.5 },
                ],
                roomRates: {
                    bedroomRate: 50,
                    bathroomRate: 80,
                },
                conditionMultipliers: {
                    standard: 1,
                    deep: 1.5,
                    heavy_duty: 2,
                },
                extras: [
                    { name: 'Inside Fridge', price: 100, estimatedAdditionalHours: 0.5 },
                    { name: 'Inside Oven', price: 150, estimatedAdditionalHours: 0.75 },
                    { name: 'Laundry', price: 120, estimatedAdditionalHours: 1 },
                ],
            });
            await pricingRule.save();
        }
        console.log('Default pricing rules added for all services.');

        console.log('Database successfully seeded!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
