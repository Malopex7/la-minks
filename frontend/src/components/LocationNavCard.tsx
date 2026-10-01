/// <reference types="@types/google.maps" />
'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    loadGoogleMaps,
    getGoogleMapsDirectionsUrl,
    getWazeDirectionsUrl,
    isGoogleMapsConfigured,
} from '@/lib/googleMaps';
import { MapPin, Navigation, ExternalLink, Copy, Check, Compass, Car } from 'lucide-react';

interface LocationNavCardProps {
    address?: {
        line1?: string;
        suburb?: string;
        city?: string;
        province?: string;
        postalCode?: string;
        formattedAddress?: string;
        lat?: number;
        lng?: number;
    };
    travelFee?: {
        distanceKm?: number;
        durationMinutes?: number;
        fee?: number;
    };
    title?: string;
    showDirections?: boolean;
    compact?: boolean;
}

export default function LocationNavCard({
    address,
    travelFee,
    title = 'Job Location & Navigation',
    showDirections = true,
    compact = false,
}: LocationNavCardProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);

    const [copied, setCopied] = useState(false);
    const [mapsReady, setMapsReady] = useState(false);

    const destinationAddress =
        address?.formattedAddress ||
        [address?.line1, address?.suburb, address?.city, address?.province, 'South Africa']
            .filter(Boolean)
            .join(', ');

    const lat = address?.lat;
    const lng = address?.lng;
    const hasCoords = typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0;

    useEffect(() => {
        if (!isGoogleMapsConfigured()) return;

        let active = true;
        loadGoogleMaps()
            .then(() => {
                if (!active) return;
                setMapsReady(true);
            })
            .catch((err) => {
                console.warn('LocationNavCard maps load:', err.message);
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!mapsReady || !mapRef.current || !window.google?.maps || typeof window.google.maps.Map !== 'function') return;

        const renderMap = (centerLat: number, centerLng: number) => {
            if (!mapRef.current) return;
            const center = { lat: centerLat, lng: centerLng };

            if (!mapInstance.current) {
                const map = new window.google.maps.Map(mapRef.current, {
                    center,
                    zoom: 15,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: !compact,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                    ],
                });
                mapInstance.current = map;

                new window.google.maps.Marker({
                    position: center,
                    map,
                    title: destinationAddress || 'Cleaning Site',
                    animation: window.google.maps.Animation.DROP,
                });
            } else {
                mapInstance.current.setCenter(center);
            }
        };

        if (hasCoords) {
            renderMap(lat!, lng!);
        } else if (destinationAddress && window.google?.maps?.Geocoder) {
            // Geocode address fallback
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: destinationAddress }, (results, status) => {
                if (status === 'OK' && results?.[0]?.geometry?.location) {
                    const loc = results[0].geometry.location;
                    renderMap(loc.lat(), loc.lng());
                }
            });
        }
    }, [mapsReady, lat, lng, hasCoords, destinationAddress, compact]);

    const handleCopy = () => {
        if (!destinationAddress) return;
        navigator.clipboard.writeText(destinationAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const googleMapsUrl = getGoogleMapsDirectionsUrl(destinationAddress, lat, lng);
    const wazeUrl = getWazeDirectionsUrl(lat, lng, destinationAddress);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#d46b4e]" />
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">{title}</h3>
                </div>
                {travelFee?.distanceKm && travelFee.distanceKm > 0 ? (
                    <span className="text-xs px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium rounded-full flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        ~{travelFee.distanceKm} km from HQ
                    </span>
                ) : null}
            </div>

            {/* Embedded Map */}
            <div
                ref={mapRef}
                className={`w-full ${compact ? 'h-36' : 'h-48 md:h-56'} bg-slate-100 dark:bg-zinc-800 relative`}
            >
                {!mapsReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-4 text-center">
                        <Compass className="w-6 h-6 mb-1 text-zinc-300 animate-spin" />
                        <span className="text-xs">Loading map view...</span>
                    </div>
                )}
            </div>

            {/* Address Details & Action Buttons */}
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-0.5">
                            Destination
                        </span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                            {destinationAddress || 'No address specified'}
                        </p>
                        {hasCoords && (
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                {lat?.toFixed(4)}, {lng?.toFixed(4)}
                            </p>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shrink-0 h-8 px-2"
                        title="Copy address"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>

                {showDirections && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2">
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[130px]"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-1.5 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <Navigation className="w-3.5 h-3.5 text-[#d46b4e]" />
                                <span>Google Maps</span>
                                <ExternalLink className="w-3 h-3 text-zinc-400" />
                            </Button>
                        </a>

                        <a
                            href={wazeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-[110px]"
                        >
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-1.5 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <Compass className="w-3.5 h-3.5 text-blue-500" />
                                <span>Waze</span>
                                <ExternalLink className="w-3 h-3 text-zinc-400" />
                            </Button>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
