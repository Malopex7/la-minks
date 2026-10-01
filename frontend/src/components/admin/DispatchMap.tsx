/// <reference types="@types/google.maps" />
'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, isGoogleMapsConfigured } from '@/lib/googleMaps';
import { Compass, Layers } from 'lucide-react';
import { format } from 'date-fns';

import { Booking } from '@/store/adminStore';

interface DispatchMapProps {
    bookings: Booking[];
    onSelectBooking?: (bookingId: string) => void;
}

const STATUS_PIN_COLORS: Record<string, string> = {
    BOOKED: '#2563eb', // Blue
    CONFIRMED: '#4f46e5', // Indigo
    IN_PROGRESS: '#f59e0b', // Amber
    COMPLETED: '#10b981', // Emerald
    CANCELLED: '#ef4444', // Red
    QUOTE: '#6b7280', // Gray
};

const GAUTENG_CENTER = { lat: -26.15, lng: 28.05 };

export default function DispatchMap({ bookings, onSelectBooking }: DispatchMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    const [mapsReady, setMapsReady] = useState(false);
    const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'upcoming'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (!isGoogleMapsConfigured()) return;

        let active = true;
        loadGoogleMaps()
            .then(() => {
                if (!active) return;
                setMapsReady(true);
            })
            .catch((err) => {
                console.warn('DispatchMap load error:', err.message);
            });

        return () => {
            active = false;
        };
    }, []);

    // Filter bookings based on date & status
    const filteredBookings = bookings.filter((b) => {
        if (statusFilter !== 'all' && b.status !== statusFilter) return false;

        if (selectedDateFilter === 'all') return true;

        if (!b.schedule?.date) return false;
        const bDate = new Date(b.schedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDateFilter === 'today') {
            const bDay = new Date(bDate);
            bDay.setHours(0, 0, 0, 0);
            return bDay.getTime() === today.getTime();
        }

        if (selectedDateFilter === 'upcoming') {
            return bDate >= today;
        }

        return true;
    });

    // Initialize map
    useEffect(() => {
        if (!mapsReady || !mapRef.current || !window.google?.maps || typeof window.google.maps.Map !== 'function') return;

        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                center: GAUTENG_CENTER,
                zoom: 11,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                    },
                ],
            });
            infoWindowRef.current = new window.google.maps.InfoWindow();
        }
    }, [mapsReady]);

    const [pinnedCount, setPinnedCount] = useState(0);

    // Update markers whenever filteredBookings change
    useEffect(() => {
        if (!mapsReady || !mapInstance.current || !window.google?.maps || typeof window.google.maps.Map !== 'function') return;

        const map = mapInstance.current;
        const infoWindow = infoWindowRef.current;

        // Clear existing markers
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];

        const bounds = new window.google.maps.LatLngBounds();
        let validCoordsCount = 0;

        // 1. Group bookings by coordinates to detect overlapping addresses
        const coordCounts = new Map<string, number>();
        const coordIndex = new Map<string, number>();

        filteredBookings.forEach((b) => {
            if (typeof b.address?.lat === 'number' && typeof b.address?.lng === 'number' && b.address.lat !== 0 && b.address.lng !== 0) {
                const key = `${b.address.lat.toFixed(4)},${b.address.lng.toFixed(4)}`;
                coordCounts.set(key, (coordCounts.get(key) || 0) + 1);
            }
        });

        // Helper to add marker to map
        const addMarker = (booking: Booking, lat: number, lng: number) => {
            validCoordsCount++;
            setPinnedCount((prev) => prev + 1);

            const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
            const totalAtLoc = coordCounts.get(key) || 1;
            const currentIndex = coordIndex.get(key) || 0;
            coordIndex.set(key, currentIndex + 1);

            let markerLat = lat;
            let markerLng = lng;

            // Spider-disperse multiple bookings at the exact same location so every pin is visible
            if (totalAtLoc > 1) {
                const angle = (2 * Math.PI * currentIndex) / totalAtLoc;
                const offsetRadius = 0.00035; // ~35 meters
                markerLat = lat + offsetRadius * Math.sin(angle);
                markerLng = lng + (offsetRadius * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180);
            }

            const pos = { lat: markerLat, lng: markerLng };
            bounds.extend(pos);

            const color = STATUS_PIN_COLORS[booking.status] || '#6b7280';

            const svgIcon = {
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 1.8,
                anchor: new window.google.maps.Point(12, 22),
            };

            const marker = new window.google.maps.Marker({
                position: pos,
                map,
                icon: svgIcon,
                title: `${booking.serviceId?.name || 'Booking'} - ${booking.status}`,
            });

            marker.addListener('click', () => {
                if (!infoWindow) return;

                const staffName =
                    booking.staffAssignedIds && booking.staffAssignedIds.length > 0
                        ? booking.staffAssignedIds.map((s) => `${s.firstName} ${s.lastName}`).join(', ')
                        : '<span style="color:#ef4444;font-weight:600;">Unassigned</span>';

                const dateFormatted = booking.schedule?.date
                    ? format(new Date(booking.schedule.date), 'EEE, dd MMM yyyy')
                    : 'No date';

                const content = `
                    <div style="font-family: inherit; padding: 4px; max-width: 260px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                            <strong style="font-size: 14px; color: #1e293b;">${booking.serviceId?.name || 'Cleaning Job'}</strong>
                            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${color}20; color: ${color}; border: 1px solid ${color}40;">
                                ${booking.status}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: #475569; line-height: 1.5; margin-bottom: 8px;">
                            <div><strong>Client:</strong> ${booking.customerId?.firstName || ''} ${booking.customerId?.lastName || 'Guest'}</div>
                            <div><strong>Phone:</strong> ${booking.customerId?.phone || 'N/A'}</div>
                            <div><strong>Date:</strong> ${dateFormatted} (${booking.schedule?.timeSlot || 'Flexible'})</div>
                            <div><strong>Address:</strong> ${booking.address?.formattedAddress || `${booking.address?.line1 || ''}, ${booking.address?.suburb || ''}`}</div>
                            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #e2e8f0;"><strong>Assigned:</strong> ${staffName}</div>
                        </div>
                        <div style="font-size: 13px; font-weight: 700; color: #d46b4e; margin-bottom: 8px;">
                            R${(booking.payment?.amount || 0).toFixed(2)}
                        </div>
                    </div>
                `;

                infoWindow.setContent(content);
                infoWindow.open(map, marker);

                if (onSelectBooking) {
                    onSelectBooking(booking._id);
                }
            });

            markersRef.current.push(marker);
        };

        setPinnedCount(0);

        filteredBookings.forEach((booking) => {
            const lat = booking.address?.lat;
            const lng = booking.address?.lng;

            if (typeof lat === 'number' && typeof lng === 'number' && lat !== 0 && lng !== 0) {
                addMarker(booking, lat, lng);
            } else {
                // Client-side fallback: Geocode address string if lat/lng are missing
                const addr = booking.address;
                const addressStr = addr?.formattedAddress || [addr?.line1, addr?.suburb, addr?.city, 'South Africa'].filter(Boolean).join(', ');
                if (addressStr && window.google?.maps?.Geocoder) {
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ address: addressStr }, (results, status) => {
                        if (status === 'OK' && results?.[0]?.geometry?.location) {
                            const geoLat = results[0].geometry.location.lat();
                            const geoLng = results[0].geometry.location.lng();
                            addMarker(booking, geoLat, geoLng);
                            bounds.extend({ lat: geoLat, lng: geoLng });
                            map.fitBounds(bounds);
                        }
                    });
                }
            }
        });

        if (validCoordsCount > 0) {
            map.fitBounds(bounds);
            // Don't zoom in excessively for single pin
            const listener = window.google.maps.event.addListener(map, 'idle', () => {
                if (map.getZoom() && map.getZoom()! > 15) {
                    map.setZoom(14);
                }
                window.google.maps.event.removeListener(listener);
            });
        }
    }, [mapsReady, filteredBookings, onSelectBooking]);

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            {/* Filter Bar */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#d46b4e]" />
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                        Daily Dispatch & Territory Map
                    </span>
                    <span className="text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono px-2 py-0.5 rounded-full">
                        {pinnedCount} of {filteredBookings.length} Pinned
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Scope Filter */}
                    <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 bg-white dark:bg-zinc-900 text-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedDateFilter('all')}
                            className={`px-3 py-1 rounded-md transition-colors ${selectedDateFilter === 'all'
                                ? 'bg-[#d46b4e] text-white font-medium'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                }`}
                        >
                            All Dates
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedDateFilter('today')}
                            className={`px-3 py-1 rounded-md transition-colors ${selectedDateFilter === 'today'
                                ? 'bg-[#d46b4e] text-white font-medium'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedDateFilter('upcoming')}
                            className={`px-3 py-1 rounded-md transition-colors ${selectedDateFilter === 'upcoming'
                                ? 'bg-[#d46b4e] text-white font-medium'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                }`}
                        >
                            Upcoming
                        </button>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="BOOKED">Booked</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* Map Canvas */}
            <div ref={mapRef} className="w-full h-[520px] bg-slate-100 dark:bg-zinc-800 relative">
                {!mapsReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                        <Compass className="w-8 h-8 mb-2 text-zinc-300 animate-spin" />
                        <p className="text-sm font-medium">Loading Dispatch Map...</p>
                        <p className="text-xs text-zinc-400 mt-1">Connecting to Google Maps Platform</p>
                    </div>
                )}
            </div>

            {/* Status Legend Bar */}
            <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 gap-2">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Status Pins:</span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Booked
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Confirmed
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> In Progress
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Completed
                    </span>
                </div>
                <span className="text-[11px] text-zinc-400 italic">
                    Click any pin to inspect customer, assigned staff, and route details.
                </span>
            </div>
        </div>
    );
}
