import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Service from '../src/models/Service.js';
import PricingRule from '../src/models/PricingRule.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Try loading from different possible paths depending on where the script is executed
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('Loading .env from:', envPath);
console.log('MONGO_URI present?', !!process.env.MONGO_URI);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const initialServices = [
    {
        name: 'Home Cleaning',
        description: 'Standard cleaning service for your entire home. Perfect for regular maintenance.',
        basePrice: 400,
        imageUrl: '/images/home-cleaning.jpg',
        inputs: [
            { name: 'sqm', label: 'Property Size (sqm)', type: 'number', required: true },
            { name: 'bedrooms', label: 'Number of Bedrooms', type: 'number', required: true },
            { name: 'bathrooms', label: 'Number of Bathrooms', type: 'number', required: true }
        ],
        pricingRuleDef: {
            baseCalculators: [
                { inputName: 'sqm', multiplierRate: 2 }, // R2 per square meter
                { inputName: 'bedrooms', multiplierRate: 100 }, // R100 per bedroom
                { inputName: 'bathrooms', multiplierRate: 150 } // R150 per bathroom
            ],
            conditionMultipliers: { standard: 1, deep: 1.5, heavy_duty: 2.0 },
            extras: [
                { name: 'Inside Fridge', price: 150, estimatedAdditionalHours: 0.5 },
                { name: 'Inside Oven', price: 150, estimatedAdditionalHours: 0.5 },
                { name: 'Inside Cabinets', price: 200, estimatedAdditionalHours: 1 },
                { name: 'Interior Windows', price: 250, estimatedAdditionalHours: 1 },
                { name: 'Wall Washing', price: 300, estimatedAdditionalHours: 1.5 }
            ]
        }
    },
    {
        name: 'Move In/Out Cleaning',
        description: 'Comprehensive cleaning designed for empty homes. Ensures you get your deposit back or a fresh start.',
        basePrice: 800,
        imageUrl: '/images/move-cleaning.jpg',
        inputs: [
            { name: 'sqm', label: 'Property Size (sqm)', type: 'number', required: true },
            { name: 'bedrooms', label: 'Number of Bedrooms', type: 'number', required: true }
        ],
        pricingRuleDef: {
            baseCalculators: [
                { inputName: 'sqm', multiplierRate: 3 },
                { inputName: 'bedrooms', multiplierRate: 150 }
            ],
            conditionMultipliers: { standard: 1.2, deep: 1.5, heavy_duty: 2.0 },
            extras: [
                { name: 'Carpet Steam Cleaning (Per Room)', price: 250, estimatedAdditionalHours: 0.5 },
                { name: 'High Pressure Patio Wash', price: 400, estimatedAdditionalHours: 1.5 }
            ]
        }
    },
    {
        name: 'Gardening & Landscaping',
        description: 'Professional gardening services including lawn care, weed removal, and general tidying.',
        basePrice: 500,
        imageUrl: '/images/gardening.jpg',
        inputs: [
            { name: 'gardenSizeSqm', label: 'Estimated Garden Size (sqm)', type: 'number', required: true }
        ],
        pricingRuleDef: {
            baseCalculators: [
                { inputName: 'gardenSizeSqm', multiplierRate: 5 } // R5 per sqm of garden
            ],
            conditionMultipliers: { standard: 1, deep: 1.5, heavy_duty: 2.0 }, // Overgrown = heavy_duty
            extras: [
                { name: 'Weed Removal', price: 250, estimatedAdditionalHours: 1 },
                { name: 'Green Waste Removal / Dumping', price: 400, estimatedAdditionalHours: 1 },
                { name: 'Tree Trimming', price: 600, estimatedAdditionalHours: 2 }
            ]
        }
    },
    {
        name: 'Office & Retail Cleaning',
        description: 'Tailored commercial cleaning for your workspace. Ensuring a professional and hygienic environment.',
        basePrice: 1200,
        imageUrl: '/images/office-cleaning.jpg',
        inputs: [
            { name: 'sqm', label: 'Office/Retail Space Size (sqm)', type: 'number', required: true },
            { name: 'desks', label: 'Number of Desks/Workstations', type: 'number', required: false }
        ],
        pricingRuleDef: {
            baseCalculators: [
                { inputName: 'sqm', multiplierRate: 2.5 },
                { inputName: 'desks', multiplierRate: 50 }
            ],
            conditionMultipliers: { standard: 1, deep: 1.5, heavy_duty: 2.0 },
            extras: [
                { name: 'Restroom Deep Sanitation', price: 500, estimatedAdditionalHours: 1.5 },
                { name: 'Kitchenette Disinfecting', price: 300, estimatedAdditionalHours: 1 },
                { name: 'Window Washing (Exterior Ground Floor)', price: 450, estimatedAdditionalHours: 1.5 }
            ]
        }
    }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log('Clearing existing Services and Pricing Rules...');
        await Service.deleteMany();
        await PricingRule.deleteMany();

        console.log('Inserting new services...');
        for (const serviceData of initialServices) {
            // Extract pricing rule definition from the data
            const pricingRuleDef = serviceData.pricingRuleDef;
            delete serviceData.pricingRuleDef;

            // 1. Create the Service
            const createdService = await Service.create(serviceData);
            console.log(`Created Service: ${createdService.name}`);

            // 2. Create the linked PricingRule
            const pricingRule = await PricingRule.create({
                serviceId: createdService._id,
                ...pricingRuleDef
            });
            console.log(`Created PricingRule for: ${createdService.name}`);
        }

        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error importing data: ${error}`);
        process.exit(1);
    }
};

seedData();
