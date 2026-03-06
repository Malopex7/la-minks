'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { Loader2, Users, Calendar, Banknote, Camera, ChevronDown, ChevronUp, Download } from 'lucide-react';
import Image from 'next/image';
import PhotoLightbox from '@/components/PhotoLightbox';
import { bookingsToCsv, downloadCsv } from '@/lib/exportCsv';

const API_URL = 'http://localhost:5001/api';
const VALID_STATUSES = ['QUOTE', 'BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const statusColors: Record<string, string> = {
    QUOTE: 'bg-zinc-100 text-zinc-600',
    BOOKED: 'bg-blue-100 text-blue-700',
    CONFIRMED: 'bg-indigo-100 text-indigo-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
};

interface LightboxState {
    photos: string[];
    index: number;
}



export default function AdminBookingsPage() {
    const { bookings, staffMembers, fetchAllBookings, fetchStaffMembers, assignStaffToBooking, isLoading } = useAdminStore();
    const [mounted, setMounted] = useState(false);
    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<LightboxState | null>(null);

    useEffect(() => {
        setMounted(true);
        fetchAllBookings();
        fetchStaffMembers();
    }, [fetchAllBookings, fetchStaffMembers]);

    if (!mounted) return null;

    const handleAssign = async (bookingId: string, staffId: string) => {
        if (!staffId) return;
        setAssigningId(bookingId);
        await assignStaffToBooking(bookingId, [staffId]);
        setAssigningId(null);
    };

    const handleStatusChange = async (bookingId: string, newStatus: string) => {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).accessToken : null;
        setUpdatingStatusId(bookingId);
        try {
            const res = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) await fetchAllBookings();
        } finally {
            setUpdatingStatusId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Lightbox */}
            {lightbox && (
                <PhotoLightbox
                    photos={lightbox.photos}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox(null)}
                />
            )}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage customer bookings and assign staff members to jobs.</p>
                </div>
                <button
                    onClick={() => {
                        const csv = bookingsToCsv(bookings);
                        const date = new Date().toISOString().slice(0, 10);
                        downloadCsv(csv, `laminks-bookings-${date}.csv`);
                    }}
                    disabled={bookings.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {isLoading && !bookings.length ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            ) : (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Customer</th>
                                    <th className="px-6 py-4 font-medium">Service</th>
                                    <th className="px-6 py-4 font-medium">Date & Time</th>
                                    <th className="px-6 py-4 font-medium">Status & Price</th>
                                    <th className="px-6 py-4 font-medium">Assigned Staff</th>
                                    <th className="px-6 py-4 font-medium">Photos</th>
                                    <th className="px-6 py-4 font-medium w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {bookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                            No bookings found.
                                        </td>
                                    </tr>
                                ) : (
                                    bookings.map((booking) => {
                                        const assignedStaff = booking.staffAssignedIds?.[0];
                                        const photos = booking.photos;
                                        const beforeCount = photos?.before?.length ?? 0;
                                        const afterCount = photos?.after?.length ?? 0;
                                        const hasPhotos = beforeCount + afterCount > 0;
                                        const isExpanded = expandedId === booking._id;

                                        return (
                                            <React.Fragment key={booking._id}>
                                                <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                            {booking.customerId?.firstName} {booking.customerId?.lastName}
                                                        </div>
                                                        <div className="text-xs text-zinc-500">{booking.customerId?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
                                                        <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                            {booking.serviceId?.name || 'Unknown Service'}
                                                        </div>

                                                        {/* Service Details (Inputs) */}
                                                        {booking.serviceDetails && Object.keys(booking.serviceDetails).length > 0 && (
                                                            <div className="mt-2 text-xs text-zinc-500">
                                                                <span className="font-semibold block mb-0.5">Details:</span>
                                                                <ul className="list-disc pl-4 space-y-0.5">
                                                                    {Object.entries(booking.serviceDetails).map(([k, v]) => (
                                                                        <li key={k}>
                                                                            {k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {String(v)}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}

                                                        {/* Extras */}
                                                        {(booking.extrasSelected?.length > 0 || booking.aiExtras?.length > 0) && (
                                                            <div className="mt-2 text-xs text-zinc-500">
                                                                <span className="font-semibold block mb-0.5">Extras:</span>
                                                                <ul className="list-disc pl-4 space-y-0.5">
                                                                    {booking.extrasSelected?.map((e: string) => (
                                                                        <li key={e}>{e}</li>
                                                                    ))}
                                                                    {booking.aiExtras?.map((e: any) => (
                                                                        <li key={e.name} className="text-amber-600 dark:text-amber-500">✨ {e.name}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2 text-zinc-700 dark:text-zinc-300">
                                                            <Calendar className="w-4 h-4 text-zinc-400" />
                                                            <span>{
                                                                (booking.schedule?.date || booking.date)
                                                                    ? new Date(booking.schedule?.date || booking.date || '').toLocaleDateString()
                                                                    : 'No Date'
                                                            }</span>
                                                        </div>
                                                        <div className="text-xs text-zinc-500 mt-1">
                                                            {booking.schedule?.timeSlot || booking.time || 'No Time'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${statusColors[booking.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                                                            value={booking.status}
                                                            disabled={updatingStatusId === booking._id}
                                                            onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                        >
                                                            {VALID_STATUSES.map(s => (
                                                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                                            ))}
                                                        </select>
                                                        <div className="flex items-center space-x-1 text-zinc-700 dark:text-zinc-300 font-medium mt-1">
                                                            <Banknote className="w-4 h-4 text-emerald-500" />
                                                            <span>R {booking.totalPrice}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="w-4 h-4 text-zinc-400" />
                                                            {assigningId === booking._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                                                            ) : (
                                                                <select
                                                                    className="text-sm border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
                                                                    value={assignedStaff?._id || ''}
                                                                    onChange={(e) => handleAssign(booking._id, e.target.value)}
                                                                >
                                                                    <option value="" disabled>Select Staff</option>
                                                                    {staffMembers.map((staff) => (
                                                                        <option key={staff._id} value={staff._id}>
                                                                            {staff.firstName} {staff.lastName}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                            <Camera className="w-3.5 h-3.5" />
                                                            <span>{beforeCount} before / {afterCount} after</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {hasPhotos && (
                                                            <button
                                                                onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                                                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                                                                title={isExpanded ? 'Hide photos' : 'View photos'}
                                                            >
                                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>

                                                {/* Expandable photo row */}
                                                {isExpanded && hasPhotos && (
                                                    <tr className="bg-zinc-50 dark:bg-zinc-800/30">
                                                        <td colSpan={7} className="px-6 py-4">
                                                            <div className="grid grid-cols-2 gap-6">
                                                                {/* Before */}
                                                                <div>
                                                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                                                        Before ({beforeCount})
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {photos!.before.map((fileId: string, i: number) => (
                                                                            <Image
                                                                                key={i}
                                                                                src={`${API_URL}/photos/${fileId}`}
                                                                                alt={`Before ${i + 1}`}
                                                                                width={96}
                                                                                height={96}
                                                                                onClick={() => setLightbox({
                                                                                    photos: photos!.before.map((f: string) => `${API_URL}/photos/${f}`),
                                                                                    index: i
                                                                                })}
                                                                                className="h-24 w-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 hover:opacity-80 transition-opacity cursor-pointer"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {/* After */}
                                                                <div>
                                                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                                                                        After ({afterCount})
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {photos!.after.map((fileId: string, i: number) => (
                                                                            <Image
                                                                                key={i}
                                                                                src={`${API_URL}/photos/${fileId}`}
                                                                                alt={`After ${i + 1}`}
                                                                                width={96}
                                                                                height={96}
                                                                                onClick={() => setLightbox({
                                                                                    photos: photos!.after.map((f: string) => `${API_URL}/photos/${f}`),
                                                                                    index: i
                                                                                })}
                                                                                className="h-24 w-24 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700 hover:opacity-80 transition-opacity cursor-pointer"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
