/**
 * Seed services and pricing rules only (preserves existing users).
 * Run: node seed-services.js
 */
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Service from './src/models/Service.js';
import PricingRule from './src/models/PricingRule.js';

const servicesList = [
    { name: 'Home Cleaning',       description: 'Standard whole-home cleaning',           basePrice: 400,  isActive: true },
    { name: 'Office Cleaning',     description: 'Commercial cleaning for offices',         basePrice: 600,  isActive: true },
    { name: 'Window Cleaning',     description: 'Professional window washing',             basePrice: 250,  isActive: true },
    { name: 'Carpet Cleaning',     description: 'Deep carpet shampooing',                  basePrice: 350,  isActive: true },
    { name: 'Move Out Cleaning',   description: 'Detailed cleaning before you move out',   basePrice: 1000, isActive: true },
    { name: 'Upholstery Cleaning', description: 'Furniture and upholstery cleaning',       basePrice: 300,  isActive: true },
    { name: 'Afterparty Cleaning', description: 'Post-event cleanup service',              basePrice: 500,  isActive: true },
    { name: 'New House Cleaning',  description: 'Pre-occupation deep clean',               basePrice: 900,  isActive: true },
    { name: 'Bedroom Cleaning',    description: 'Specialized bedroom cleaning',            basePrice: 150,  isActive: true },
    { name: 'Painting',            description: 'Interior and exterior painting services', basePrice: 1500, isActive: true },
    { name: 'Gardening',           description: 'Yard maintenance and landscaping',        basePrice: 450,  isActive: true },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 10000 });
    console.log('✅ MongoDB connected');

    // Clear only services & pricing rules — leave users intact
    await Service.deleteMany({});
    await PricingRule.deleteMany({});
    console.log('🧹 Cleared old services and pricing rules');

    // Insert services
    const createdServices = await Service.insertMany(servicesList);
    console.log(`✅ ${createdServices.length} services seeded`);

    // Create default pricing rules for each service
    for (const service of createdServices) {
        await new PricingRule({
            serviceId: service._id,
            propertySizeBands: [
                { minSqm: 0,   maxSqm: 50,  multiplier: 1   },
                { minSqm: 51,  maxSqm: 100, multiplier: 1.2 },
                { minSqm: 101, maxSqm: 200, multiplier: 1.5 },
            ],
            roomRates: { bedroomRate: 50, bathroomRate: 80 },
            conditionMultipliers: { standard: 1, deep: 1.5, heavy_duty: 2 },
            extras: [
                { name: 'Inside Fridge',  price: 100, estimatedAdditionalHours: 0.5  },
                { name: 'Inside Oven',    price: 150, estimatedAdditionalHours: 0.75 },
                { name: 'Laundry',        price: 120, estimatedAdditionalHours: 1    },
                { name: 'Inside Cabinets',price: 80,  estimatedAdditionalHours: 0.5  },
                { name: 'Ironing',        price: 90,  estimatedAdditionalHours: 0.75 },
            ],
        }).save();
    }
    console.log('✅ Pricing rules seeded for all services');

    await mongoose.disconnect();
    console.log('\n🎉 Done! Services and pricing rules are ready.\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
});
