/// <reference types="@types/google.maps" />
'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    loadGoogleMaps,
    parsePlaceResult,
    getHaversineDistanceKm,
    isGoogleMapsConfigured,
} from '@/lib/googleMaps';
import { MapPin, Navigation, Loader2, CheckCircle2, Info } from 'lucide-react';

const SANDTON_HQ = { lat: -26.1076, lng: 28.0567 };

export default function AddressInput() {
    const { data, updateData, nextStep, prevStep } = useQuoteStore();

    const inputRef = useRef<HTMLInputElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerInstanceRef = useRef<google.maps.Marker | null>(null);

    const [mapsReady, setMapsReady] = useState(false);
    const [mapsError, setMapsError] = useState<string | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    // Initialize Google Maps Places Autocomplete
    useEffect(() => {
        if (!isGoogleMapsConfigured()) {
            return;
        }

        let isMounted = true;

        loadGoogleMaps()
            .then((google) => {
                if (!isMounted) return;
                setMapsReady(true);

                if (inputRef.current) {
                    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
                        componentRestrictions: { country: 'za' }, // South Africa bounds
                        fields: ['address_components', 'geometry', 'formatted_address', 'name', 'place_id'],
                    });

                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (!place.geometry?.location) return;

                        const parsed = parsePlaceResult(place);
                        const currentAddress = useQuoteStore.getState().data.address;
                        useQuoteStore.getState().updateData({
                            address: {
                                ...currentAddress,
                                ...parsed,
                            },
                        });
                    });
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                console.warn('Google Maps loader warning:', err.message);
                setMapsError(err.message);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Render / update embedded Google Map when coordinates change
    useEffect(() => {
        if (!mapsReady || !mapContainerRef.current || !window.google?.maps || typeof window.google.maps.Map !== 'function') return;

        const { lat, lng } = data.address;
        const validCoords = typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0;

        const center = validCoords ? { lat, lng } : { lat: SANDTON_HQ.lat, lng: SANDTON_HQ.lng };
        const zoom = validCoords ? 16 : 11;

        if (!mapInstanceRef.current) {
            // Create map instance
            const map = new window.google.maps.Map(mapContainerRef.current, {
                center,
                zoom,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                    },
                ],
            });
            mapInstanceRef.current = map;

            // Create draggable marker
            const marker = new window.google.maps.Marker({
                position: center,
                map: validCoords ? map : null,
                draggable: true,
                title: 'Cleaning Location',
                animation: window.google.maps.Animation.DROP,
            });
            markerInstanceRef.current = marker;

            // Dragend listener to fine-tune pin location
            marker.addListener('dragend', () => {
                const newPos = marker.getPosition();
                if (!newPos) return;

                const newLat = newPos.lat();
                const newLng = newPos.lng();

                // Reverse geocode to keep address consistent
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
                    const currentAddress = useQuoteStore.getState().data.address;
                    if (status === 'OK' && results?.[0]) {
                        const parsed = parsePlaceResult(results[0]);
                        useQuoteStore.getState().updateData({
                            address: {
                                ...currentAddress,
                                ...parsed,
                                lat: newLat,
                                lng: newLng,
                            },
                        });
                    } else {
                        useQuoteStore.getState().updateData({
                            address: {
                                ...currentAddress,
                                lat: newLat,
                                lng: newLng,
                            },
                        });
                    }
                });
            });
        } else {
            // Update existing map and marker
            const map = mapInstanceRef.current;
            const marker = markerInstanceRef.current;

            map.setCenter(center);
            map.setZoom(zoom);

            if (marker) {
                if (validCoords) {
                    marker.setPosition(center);
                    marker.setMap(map);
                } else {
                    marker.setMap(null);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapsReady, data.address.lat, data.address.lng]);

    // Geolocation "Locate Me" handler
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                if (window.google?.maps?.Geocoder) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        setIsLocating(false);
                        if (status === 'OK' && results?.[0]) {
                            const parsed = parsePlaceResult(results[0]);
                            updateData({
                                address: {
                                    ...data.address,
                                    ...parsed,
                                },
                            });
                        } else {
                            updateData({
                                address: {
                                    ...data.address,
                                    lat: latitude,
                                    lng: longitude,
                                },
                            });
                        }
                    });
                } else {
                    setIsLocating(false);
                    updateData({
                        address: {
                            ...data.address,
                            lat: latitude,
                            lng: longitude,
                        },
                    });
                }
            },
            (err) => {
                setIsLocating(false);
                console.warn('Geolocation error:', err.message);
                alert('Could not determine your location. Please type your street address.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateData({
            address: {
                ...data.address,
                [name]: value,
            },
        });
    };

    const hasCoordinates =
        typeof data.address.lat === 'number' &&
        typeof data.address.lng === 'number' &&
        data.address.lat !== 0 &&
        data.address.lng !== 0;

    const straightLineKm = hasCoordinates
        ? getHaversineDistanceKm(SANDTON_HQ.lat, SANDTON_HQ.lng, data.address.lat!, data.address.lng!)
        : 0;
    const estRoadKm = Math.round(straightLineKm * 1.3 * 10) / 10;
    const isBeyondBase = estRoadKm > 25;

    const isComplete =
        data.address.line1.trim() !== '' &&
        data.address.city.trim() !== '' &&
        data.address.province.trim() !== '' &&
        data.address.postalCode.trim() !== '';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Property Address</h2>
                    <p className="text-slate-500 text-sm">Where should our cleaning crew go?</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="flex items-center gap-2 text-slate-700 border-slate-300 hover:bg-slate-100 self-start sm:self-auto"
                >
                    {isLocating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#d46b4e]" />
                    ) : (
                        <Navigation className="w-4 h-4 text-[#d46b4e]" />
                    )}
                    Use Current Location
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="line1" className="flex items-center justify-between text-slate-800">
                        <span>Street Address</span>
                        {mapsReady && (
                            <span className="text-xs font-normal text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Google Autocomplete active
                            </span>
                        )}
                    </Label>
                    <div className="relative">
                        <Input
                            ref={inputRef}
                            id="line1"
                            name="line1"
                            placeholder="Start typing your address (e.g. 123 Sandton Dr)..."
                            value={data.address.line1}
                            onChange={handleInputChange}
                            required
                            className="pr-10"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="suburb">Suburb (Optional)</Label>
                    <Input
                        id="suburb"
                        name="suburb"
                        placeholder="Sandton"
                        value={data.address.suburb}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        name="city"
                        placeholder="Johannesburg"
                        value={data.address.city}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                        id="province"
                        name="province"
                        placeholder="Gauteng"
                        value={data.address.province}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                        id="postalCode"
                        name="postalCode"
                        placeholder="2196"
                        value={data.address.postalCode}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            {/* Interactive Map Confirmation Container */}
            <div className="mt-6 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <MapPin className="w-4 h-4 text-[#d46b4e]" />
                        {hasCoordinates ? 'Pin confirmed on map' : 'Search address above to preview on map'}
                    </span>
                    {hasCoordinates && (
                        <span className="text-slate-500 italic">
                            💡 Drag the pin to adjust your exact gate or driveway
                        </span>
                    )}
                </div>

                <div
                    ref={mapContainerRef}
                    className="w-full h-56 md:h-64 bg-slate-100 relative"
                >
                    {!mapsReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <MapPin className="w-8 h-8 mb-2 text-slate-300 animate-pulse" />
                            <p className="text-xs">
                                {mapsError
                                    ? 'Map preview unavailable (manual address entry active)'
                                    : 'Loading Google Maps preview...'}
                            </p>
                        </div>
                    )}
                </div>

                {hasCoordinates && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
                        <span className="text-slate-600">
                            Coordinates: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">{data.address.lat?.toFixed(4)}, {data.address.lng?.toFixed(4)}</code>
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                            {isBeyondBase ? (
                                <span className="text-amber-700 font-medium">
                                    ~{estRoadKm} km from Sandton HQ (Extended travel fee applies)
                                </span>
                            ) : (
                                <span className="text-emerald-700 font-medium">
                                    ~{estRoadKm} km from Sandton HQ (Standard Free Travel Zone)
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 flex justify-between">
                <Button variant="outline" onClick={prevStep} size="lg">
                    Back
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={!isComplete}
                    size="lg"
                    className="bg-[#d46b4e] hover:bg-[#b3573c] text-white"
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}
