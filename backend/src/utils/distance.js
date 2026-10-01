/**
 * Travel Distance & Surcharge Calculator for La-Minks
 * Calculates travel distance and duration from Sandton HQ to customer destination.
 * Uses Google Distance Matrix API when available, falling back to Haversine routing estimation.
 */

// Default: Sandton City / Hub, Gauteng, South Africa
const HQ_COORDINATES = {
    lat: parseFloat(process.env.HQ_LAT || '-26.1076'),
    lng: parseFloat(process.env.HQ_LNG || '28.0567'),
    address: 'Sandton, Johannesburg, Gauteng, South Africa',
};

const BASE_RADIUS_KM = parseFloat(process.env.BASE_SERVICE_RADIUS_KM || '25');
const RATE_PER_KM = parseFloat(process.env.TRAVEL_RATE_PER_KM || '5');

/**
 * Calculates Great-Circle distance in km between two lat/lng coordinates (Haversine formula).
 */
export const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculates driving distance and travel surcharge from HQ to destination.
 * @param {Object} destination - { lat, lng, address }
 * @returns {Promise<{ distanceKm: number, durationMinutes: number, fee: number, isBeyondBaseRadius: boolean, source: string }>}
 */
export const calculateTravelSurcharge = async (destination) => {
    const { lat, lng, formattedAddress, line1, suburb, city } = destination || {};

    const hasCoords = typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0;
    const destString = formattedAddress || [line1, suburb, city, 'South Africa'].filter(Boolean).join(', ');

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // Try Google Distance Matrix API if apiKey and destination exist
    if (apiKey && (hasCoords || destString)) {
        try {
            const origins = `${HQ_COORDINATES.lat},${HQ_COORDINATES.lng}`;
            const destinations = hasCoords ? `${lat},${lng}` : encodeURIComponent(destString);
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}&units=metric`;

            const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
            const data = await response.json();

            if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
                const element = data.rows[0].elements[0];
                const distanceMeters = element.distance.value;
                const durationSeconds = element.duration.value;

                const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
                const durationMinutes = Math.round(durationSeconds / 60);

                const billableKm = Math.max(0, distanceKm - BASE_RADIUS_KM);
                const fee = Math.round(billableKm * RATE_PER_KM);

                return {
                    distanceKm,
                    durationMinutes,
                    fee,
                    isBeyondBaseRadius: distanceKm > BASE_RADIUS_KM,
                    source: 'google_distance_matrix',
                };
            }
        } catch (err) {
            console.warn('Google Distance Matrix call failed, falling back to Haversine:', err.message);
        }
    }

    // Fallback: Haversine distance with a 1.3x road curvature factor
    if (hasCoords) {
        const straightLineKm = calculateHaversineKm(
            HQ_COORDINATES.lat,
            HQ_COORDINATES.lng,
            lat,
            lng
        );
        // Estimate road distance with 1.3 multiplier (standard urban/suburban road factor)
        const estimatedRoadKm = Math.round(straightLineKm * 1.3 * 10) / 10;
        // Estimate average urban driving speed: 45 km/h
        const durationMinutes = Math.round((estimatedRoadKm / 45) * 60);

        const billableKm = Math.max(0, estimatedRoadKm - BASE_RADIUS_KM);
        const fee = Math.round(billableKm * RATE_PER_KM);

        return {
            distanceKm: estimatedRoadKm,
            durationMinutes,
            fee,
            isBeyondBaseRadius: estimatedRoadKm > BASE_RADIUS_KM,
            source: 'haversine_estimate',
        };
    }

    // If no coordinates or address could be resolved, travel fee is 0
    return {
        distanceKm: 0,
        durationMinutes: 0,
        fee: 0,
        isBeyondBaseRadius: false,
        source: 'default',
    };
};
