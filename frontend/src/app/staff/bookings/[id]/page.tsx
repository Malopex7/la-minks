'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useParams } from 'next/navigation';
import {
    Loader2, ArrowLeft, Calendar, Clock, MapPin,
    CheckCircle2, Circle, Camera, Save, House
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useLightbox } from '@/components/PhotoLightbox';

const API_URL = 'http://localhost:5001/api';

interface ChecklistItem {
    _id?: string;
    task: string;
    completed: boolean;
}

interface BookingDetails {
    _id: string;
    status: string;
    schedule: { date: string; timeSlot: string; estimatedHours: number };
    address: { line1: string; suburb: string; city: string; province: string; postalCode: string };
    property: { sqm: number; bedrooms: number; bathrooms: number; conditionLevel: string };
    serviceId: { name: string; description: string };
    customerId: { firstName: string; lastName: string; phone: string; email: string };
    extrasSelected: string[];
    checklist: ChecklistItem[];
    notesStaff: string;
    photos: { before: string[]; after: string[] };
}

// A standard default checklist template if none exists
const defaultChecklistTasks = [
    "Dust all accessible surfaces",
    "Wipe down exterior of kitchen appliances",
    "Clean microwave interior and exterior",
    "Wipe down kitchen counters and sink",
    "Clean scrub bathroom sinks, tubs, and toilets",
    "Empty all trash bins",
    "Vacuum all carpets and rugs",
    "Sweep and mop hard floors",
    "Clean mirrors and glass fixtures",
    "General tidying up"
];

export default function StaffJobDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const { user } = useAuthStore();
    const [booking, setBooking] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSavingChecklist, setIsSavingChecklist] = useState(false);

    const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>([]);
    const [notes, setNotes] = useState('');

    const [uploadingType, setUploadingType] = useState<'before' | 'after' | null>(null);
    const fileInputRefBefore = useRef<HTMLInputElement>(null);
    const fileInputRefAfter = useRef<HTMLInputElement>(null);

    // Must be called unconditionally — before any early returns
    const allPhotoUrls = [
        ...(booking?.photos?.before ?? []).map(id => `${API_URL}/photos/${id}`),
        ...(booking?.photos?.after ?? []).map(id => `${API_URL}/photos/${id}`),
    ];
    const beforeCount = booking?.photos?.before?.length ?? 0;
    const { lightbox, open } = useLightbox(allPhotoUrls);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`${API_URL}/bookings/${id}`, {
                headers: { Authorization: `Bearer ${user?.accessToken}` },
            });
            if (!res.ok) throw new Error('Failed to fetch booking');
            const data = await res.json();
            setBooking(data);
            setLocalChecklist(data.checklist || []);
            setNotes(data.notesStaff || '');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchBooking();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user]);

    const handleStatusUpdate = async (newStatus: 'IN_PROGRESS' | 'COMPLETED') => {
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
        setIsUpdatingStatus(true);
        try {
            const res = await fetch(`${API_URL}/bookings/${id}/staff-update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.accessToken}`
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            const updated = await res.json();
            setBooking(updated);
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveUpdates = async () => {
        setIsSavingChecklist(true);
        try {
            const res = await fetch(`${API_URL}/bookings/${id}/staff-update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.accessToken}`
                },
                body: JSON.stringify({
                    checklist: localChecklist,
                    notesStaff: notes
                }),
            });
            if (!res.ok) throw new Error('Failed to save updates');
            const updated = await res.json();
            setBooking(updated);
            alert('Updates saved successfully!');
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setIsSavingChecklist(false);
        }
    };

    const toggleTask = (index: number) => {
        const updated = [...localChecklist];
        updated[index].completed = !updated[index].completed;
        setLocalChecklist(updated);
    };

    const addDefaultChecklist = () => {
        if (localChecklist.length > 0) {
            if (!confirm('This will replace your current checklist. Continue?')) return;
        }
        setLocalChecklist(defaultChecklistTasks.map(t => ({ task: t, completed: false })));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingType(type);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/bookings/${id}/photos/${type}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user?.accessToken}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Upload failed');
            }

            // Refresh booking to get new photos array
            await fetchBooking();
        } catch (err) {
            alert((err as Error).message);
        } finally {
            setUploadingType(null);
            if (e.target) e.target.value = ''; // Reset input
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[#86a373]" />
        </div>
    );

    if (error || !booking) return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error || 'Booking not found'}
        </div>
    );


    return (
        <div className="space-y-6 pb-20">
            {lightbox}
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/staff" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold dark:text-white">Job Details</h1>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${booking.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' :
                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {booking.status}
                        </span>
                    </div>
                    <p className="text-zinc-500 text-sm mt-1">{booking.serviceId?.name}</p>
                </div>
            </div>

            {/* Quick Actions Action Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="text-sm font-medium dark:text-zinc-300">
                    Status Controls:
                </div>
                <div className="flex gap-2">
                    {booking.status !== 'COMPLETED' && booking.status !== 'IN_PROGRESS' && (
                        <button
                            onClick={() => handleStatusUpdate('IN_PROGRESS')}
                            disabled={isUpdatingStatus}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[120px]"
                        >
                            {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Check In To Job'}
                        </button>
                    )}

                    {booking.status === 'IN_PROGRESS' && (
                        <button
                            onClick={() => handleStatusUpdate('COMPLETED')}
                            disabled={isUpdatingStatus}
                            className="bg-[#86a373] hover:bg-[#5c7a4d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center min-w-[120px]"
                        >
                            {isUpdatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark Completed'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 dark:text-white">
                            <House className="w-5 h-5 text-[#86a373]" /> Property details
                        </h2>

                        <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <div>
                                <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">Customer</span>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{booking.customerId?.firstName} {booking.customerId?.lastName}</span>
                                <span className="block">{booking.customerId?.phone}</span>
                            </div>
                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>

                            <div>
                                <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Time & Place</span>
                                <div className="flex items-start gap-2 mb-1.5">
                                    <Calendar className="w-4 h-4 mt-0.5" />
                                    <span>{booking.schedule?.date ? format(new Date(booking.schedule.date), 'PPPP') : 'No date'}</span>
                                </div>
                                <div className="flex items-start gap-2 mb-1.5">
                                    <Clock className="w-4 h-4 mt-0.5" />
                                    <span>{booking.schedule?.timeSlot || 'Any time'} (Est. {booking.schedule?.estimatedHours || '?'} hrs)</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{booking.address?.line1}, {booking.address?.suburb}, {booking.address?.city}</span>
                                </div>
                            </div>

                            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>

                            <div>
                                <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Specs</span>
                                <div className="flex flex-wrap gap-2">
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">{booking.property?.bedrooms || 0} Beds</span>
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">{booking.property?.bathrooms || 0} Baths</span>
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">{booking.property?.sqm || 0} sqm</span>
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs uppercase">{booking.property?.conditionLevel || 'standard'} condition</span>
                                </div>
                            </div>

                            {booking.extrasSelected?.length > 0 && (
                                <>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>
                                    <div>
                                        <span className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">Extras Requested</span>
                                        <ul className="list-disc pl-4 space-y-0.5 text-zinc-700 dark:text-zinc-300">
                                            {booking.extrasSelected.map(extra => (
                                                <li key={extra}>{extra}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Photos Preview */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 dark:text-white">
                            <Camera className="w-5 h-5 text-[#86a373]" /> Photos
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium dark:text-zinc-300">Before ({booking.photos?.before?.length || 0})</h3>
                                    <button
                                        onClick={() => fileInputRefBefore.current?.click()}
                                        className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-1 rounded text-zinc-900 dark:text-white font-medium flex items-center gap-1"
                                    >
                                        {uploadingType === 'before' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />} Add
                                    </button>
                                    <input type="file" ref={fileInputRefBefore} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'before')} />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {booking.photos?.before?.map((fileId, i) => (
                                        <img
                                            key={i}
                                            src={`${API_URL}/photos/${fileId}`}
                                            alt="Before"
                                            onClick={() => open(i)}
                                            className="h-16 w-16 object-cover rounded-lg border border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                    ))}
                                    {(!booking.photos?.before || booking.photos.before.length === 0) && (
                                        <div className="h-16 w-full border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex items-center justify-center text-xs text-zinc-400">No photos</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-medium dark:text-zinc-300">After ({booking.photos?.after?.length || 0})</h3>
                                    <button
                                        onClick={() => fileInputRefAfter.current?.click()}
                                        className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2 py-1 rounded text-zinc-900 dark:text-white font-medium flex items-center gap-1"
                                    >
                                        {uploadingType === 'after' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />} Add
                                    </button>
                                    <input type="file" ref={fileInputRefAfter} className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'after')} />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {booking.photos?.after?.map((fileId, i) => (
                                        <img
                                            key={i}
                                            src={`${API_URL}/photos/${fileId}`}
                                            alt="After"
                                            onClick={() => open(beforeCount + i)}
                                            className="h-16 w-16 object-cover rounded-lg border border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                    ))}
                                    {(!booking.photos?.after || booking.photos.after.length === 0) && (
                                        <div className="h-16 w-full border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg flex items-center justify-center text-xs text-zinc-400">No photos</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Execution (Checklist / Forms) */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-semibold text-lg flex items-center gap-2 dark:text-white">
                                <CheckCircle2 className="w-5 h-5 text-blue-500" /> Cleaning Checklist
                            </h2>
                            {localChecklist.length === 0 && (
                                <button
                                    onClick={addDefaultChecklist}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    + Add Default Checklist
                                </button>
                            )}
                        </div>

                        {localChecklist.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 text-sm">
                                <p>No tasks in checklist yet.</p>
                                <button
                                    onClick={addDefaultChecklist}
                                    className="mt-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Start with default tasks
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 mb-6">
                                {localChecklist.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => toggleTask(index)}
                                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${item.completed
                                            ? 'bg-zinc-50 dark:bg-zinc-800/50 border-transparent text-zinc-500'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:text-white'
                                            }`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {item.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
                                            )}
                                        </div>
                                        <span className={`text-sm ${item.completed ? 'line-through' : ''}`}>
                                            {item.task}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-6"></div>

                        <div className="mb-6">
                            <h2 className="font-semibold text-sm mb-3 dark:text-zinc-300">Staff Notes / Anomalies</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any issues encountered? Extra tasks done? Client not home? Add notes here..."
                                className="w-full h-32 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSaveUpdates}
                                disabled={isSavingChecklist}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {isSavingChecklist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Session Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
