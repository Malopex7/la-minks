import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import Booking from '../src/models/Booking.js';
import { calculateTravelSurcharge } from '../src/utils/distance.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function backfillBookings() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        console.error('No Google Maps API key found in .env');
        process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} total bookings.`);

    let updatedCount = 0;

    for (const booking of bookings) {
        const addr = booking.address || {};
        const hasCoords = typeof addr.lat === 'number' && typeof addr.lng === 'number' && addr.lat !== 0 && addr.lng !== 0;

        if (hasCoords) {
            console.log(`Booking ${booking._id} already has coords: (${addr.lat}, ${addr.lng})`);
            continue;
        }

        const addressParts = [addr.line1, addr.suburb, addr.city, addr.province, 'South Africa'].filter(Boolean);
        const queryStr = addressParts.join(', ');

        if (!queryStr || addressParts.length <= 1) {
            console.warn(`Booking ${booking._id} has no valid address text:`, addr);
            continue;
        }

        console.log(`Geocoding Booking ${booking._id}: "${queryStr}"...`);

        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(queryStr)}&key=${apiKey}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.status === 'OK' && data.results && data.results[0]) {
                const result = data.results[0];
                const loc = result.geometry.location;
                const formatted = result.formatted_address;
                const placeId = result.place_id;

                booking.address.lat = loc.lat;
                booking.address.lng = loc.lng;
                booking.address.formattedAddress = formatted;
                booking.address.placeId = placeId;

                // Calculate travel surcharge from Sandton HQ
                const travelResult = await calculateTravelSurcharge({
                    lat: loc.lat,
                    lng: loc.lng,
                    formattedAddress: formatted,
                });

                booking.travelFee = {
                    distanceKm: travelResult.distanceKm,
                    durationMinutes: travelResult.durationMinutes,
                    fee: travelResult.fee,
                };

                await booking.save();
                updatedCount++;
                console.log(`-> Successfully updated Booking ${booking._id}: lat=${loc.lat}, lng=${loc.lng}, fee=R${travelResult.fee}`);
            } else {
                console.error(`-> Geocoding failed for ${booking._id}: status=${data.status}, error=${data.error_message}`);
            }
        } catch (err) {
            console.error(`-> Error processing booking ${booking._id}:`, err.message);
        }
    }

    console.log(`\nBackfill complete! Updated ${updatedCount} bookings with GPS coordinates.`);
    await mongoose.disconnect();
}

backfillBookings().catch(console.error);
