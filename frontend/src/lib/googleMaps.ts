/// <reference types="@types/google.maps" />

/**
 * Google Maps Platform shared utility for La-Minks
 * Handles script loading, Places parsing, offline distance fallbacks, and mobile navigation deep links.
 */

declare global {
    interface Window {
        google: typeof google;
    }
}

let loadPromise: Promise<typeof google> | null = null;

export const getGoogleMapsApiKey = (): string => {
    return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
};

export const isGoogleMapsConfigured = (): boolean => {
    return !!getGoogleMapsApiKey();
};

/**
 * Dynamically and safely loads the Google Maps JavaScript API with places, geometry, and marker libraries.
 * Returns the global `google` namespace.
 */
export const loadGoogleMaps = (): Promise<typeof google> => {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Google Maps cannot be loaded on the server side.'));
    }

    // Already fully loaded
    if (window.google?.maps?.Map && window.google?.maps?.places) {
        return Promise.resolve(window.google);
    }

    if (loadPromise) {
        return loadPromise;
    }

    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
        return Promise.reject(new Error('Google Maps API key is not configured.'));
    }

    loadPromise = new Promise((resolve, reject) => {
        const checkReady = () => {
            if (typeof window.google?.maps?.Map === 'function') {
                resolve(window.google);
                return true;
            }
            return false;
        };

        const onScriptLoaded = async () => {
            try {
                if (window.google?.maps) {
                    // If modern importLibrary is available, import the required libraries
                    if (typeof window.google.maps.importLibrary === 'function') {
                        await Promise.all([
                            window.google.maps.importLibrary('maps'),
                            window.google.maps.importLibrary('places'),
                            window.google.maps.importLibrary('geometry'),
                        ]);
                    }

                    if (checkReady()) return;
                }

                // Poll briefly for constructors to attach if initialization is finalizing
                const startTime = Date.now();
                const pollInterval = setInterval(() => {
                    if (checkReady()) {
                        clearInterval(pollInterval);
                    } else if (Date.now() - startTime > 6000) {
                        clearInterval(pollInterval);
                        if (window.google?.maps) {
                            resolve(window.google);
                        } else {
                            reject(new Error('Timed out waiting for google.maps.Map constructor.'));
                        }
                    }
                }, 50);
            } catch (err) {
                reject(err);
            }
        };

        const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
        if (existingScript) {
            if (checkReady()) return;
            existingScript.addEventListener('load', onScriptLoaded);
            existingScript.addEventListener('error', (err) => reject(err));
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;

        script.onload = onScriptLoaded;
        script.onerror = (err) => {
            loadPromise = null;
            reject(err);
        };

        document.head.appendChild(script);
    });

    return loadPromise;
};

export interface ParsedAddress {
    line1: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    formattedAddress: string;
    placeId: string;
    lat: number;
    lng: number;
}

/**
 * Extracts structured address components from a Google PlaceResult
 * Tailored for South African address structures (suburbs, metros, provinces).
 */
export const parsePlaceResult = (place: google.maps.places.PlaceResult): ParsedAddress => {
    const components = place.address_components || [];
    let streetNumber = '';
    let route = '';
    let suburb = '';
    let city = '';
    let province = '';
    let postalCode = '';

    for (const comp of components) {
        const types = comp.types;

        if (types.includes('street_number')) {
            streetNumber = comp.long_name;
        } else if (types.includes('route')) {
            route = comp.long_name;
        } else if (
            types.includes('sublocality') ||
            types.includes('sublocality_level_1') ||
            types.includes('neighborhood')
        ) {
            suburb = comp.long_name;
        } else if (types.includes('locality')) {
            city = comp.long_name;
        } else if (types.includes('administrative_area_level_2') && !city) {
            city = comp.long_name;
        } else if (types.includes('administrative_area_level_1')) {
            province = comp.long_name;
        } else if (types.includes('postal_code')) {
            postalCode = comp.long_name;
        }
    }

    const line1 = [streetNumber, route].filter(Boolean).join(' ') || place.name || '';
    const lat = place.geometry?.location ? place.geometry.location.lat() : 0;
    const lng = place.geometry?.location ? place.geometry.location.lng() : 0;

    return {
        line1,
        suburb,
        city,
        province,
        postalCode,
        formattedAddress: place.formatted_address || '',
        placeId: place.place_id || '',
        lat,
        lng,
    };
};

/**
 * Calculates Great-Circle distance in kilometers between two lat/lng coordinates (Haversine formula).
 * Zero-API fallback when offline or during immediate client estimates.
 */
export const getHaversineDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
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
    return Math.round(R * c * 10) / 10;
};

/**
 * Generates universal Google Maps Turn-by-Turn directions deep link.
 */
export const getGoogleMapsDirectionsUrl = (
    destinationAddress: string,
    lat?: number,
    lng?: number
): string => {
    if (lat && lng && lat !== 0 && lng !== 0) {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`;
};

/**
 * Generates Waze Turn-by-Turn navigation deep link.
 */
export const getWazeDirectionsUrl = (
    lat?: number,
    lng?: number,
    destinationAddress?: string
): string => {
    if (lat && lng && lat !== 0 && lng !== 0) {
        return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
    }
    return `https://waze.com/ul?q=${encodeURIComponent(destinationAddress || '')}`;
};
