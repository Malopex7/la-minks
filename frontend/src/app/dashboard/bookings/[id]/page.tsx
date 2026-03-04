'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import {
    ArrowLeft, Loader2, CalendarDays, MapPin,
    Home, CheckCircle2, Circle, CreditCard, FileText,
    Camera
} from 'lucide-react';

interface BookingDetail {
    _id: string;
    serviceId: {
        _id: string;
        name: string;
        icon: string;
        baseRate: number;
        description: string;
    };
    customerId: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    status: string;
    address: {
        line1: string;
        suburb: string;
        city: string;
        province: string;
        postalCode: string;
    };
    property: {
        sqm: number;
        bedrooms: number;
        bathrooms: number;
        conditionLevel: string;
    };
    schedule: {
        date: string;
        timeSlot: string;
        estimatedHours?: number;
    };
    payment: {
        status: string;
        amount: number;
        provider: string;
        reference?: string;
    };
    extrasSelected: string[];
    checklist: Array<{ task: string; completed: boolean; _id: string }>;
    photos: {
        before: string[];
        after: string[];
    };
    createdAt: string;
}

export default function BookingDetailsPage() {
    const params = useParams();
    const { user } = useAuthStore();
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            if (!user || !params.id) return;
            try {
                const res = await fetch(`http://localhost:5001/api/bookings/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${user.accessToken}`
                    }
                });
                if (!res.ok) {
                    if (res.status === 404) throw new Error('Booking not found');
                    if (res.status === 403) throw new Error('Not authorized to view this booking');
                    throw new Error('Failed to fetch booking details');
                }
                const data = await res.json();
                setBooking(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooking();
    }, [user, params.id]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'BOOKED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'COMPLETED': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-2xl mb-6 inline-block border border-red-200 dark:border-red-800/30">
                    <p className="font-medium">{error || 'Booking not found'}</p>
                </div>
                <div>
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bookings
            </Link>

            {/* Header Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-3xl shrink-0">
                            {booking.serviceId?.icon || '✨'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{booking.serviceId?.name}</h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Booking ID: <span className="font-mono text-zinc-900 dark:text-zinc-300">{booking._id.substring(0, 8)}...</span></p>
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-full border text-sm font-bold tracking-wider uppercase ${getStatusStyle(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="p-6 flex items-start gap-4">
                        <CalendarDays className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Date & Time</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{new Date(booking.schedule.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 flex flex-wrap gap-x-3 items-center">
                                <span>{booking.schedule.timeSlot}</span>
                                {booking.schedule.estimatedHours && (
                                    <span className="text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">~{booking.schedule.estimatedHours}h est.</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 flex items-start gap-4">
                        <MapPin className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Location</p>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{booking.address.line1}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{booking.address.suburb}, {booking.address.city}</p>
                        </div>
                    </div>

                    <div className="p-6 flex items-start gap-4">
                        <CreditCard className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Payment</p>
                            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">R {(booking.payment.amount / 100).toFixed(2)}</p>
                            <p className="text-sm mt-1">
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium uppercase
                                    ${booking.payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                    {booking.payment.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column (Larger) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Property & Extras */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                            <Home className="w-5 h-5 text-blue-500" />
                            Property Details
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Size</p>
                                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{booking.property.sqm} sqm</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Bedrooms</p>
                                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{booking.property.bedrooms}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Bathrooms</p>
                                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{booking.property.bathrooms}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Condition</p>
                                <p className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">{booking.property.conditionLevel.replace('_', ' ')}</p>
                            </div>
                        </div>

                        {booking.extrasSelected && booking.extrasSelected.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3 uppercase tracking-wider">Selected Extras</h3>
                                <div className="flex flex-wrap gap-2">
                                    {booking.extrasSelected.map((extra, idx) => (
                                        <span key={idx} className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            {extra}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Checklist */}
                    {booking.checklist && booking.checklist.length > 0 && (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" />
                                Staff Checklist
                            </h2>
                            <div className="space-y-3">
                                {booking.checklist.map((item) => (
                                    <div key={item._id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                                        {item.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 shrink-0 mt-0.5" />
                                        )}
                                        <span className={`text-sm ${item.completed ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                            {item.task}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Smaller) */}
                <div className="space-y-6">
                    {/* Photos Preview */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-500" />
                            Job Photos
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Before</p>
                                {booking.photos?.before?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {booking.photos.before.map((url, i) => (
                                            <div key={i} className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                                <img src={url} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 text-center text-sm text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-700">
                                        No photos available
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">After</p>
                                {booking.photos?.after?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {booking.photos.after.map((url, i) => (
                                            <div key={i} className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                                <img src={url} alt={`After ${i + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 text-center text-sm text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-700">
                                        No photos available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions / Info Box */}
                    {booking.payment.status === 'UNPAID' && booking.status !== 'CANCELLED' && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm text-center">
                            <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Payment Required</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                Secure your booking by completing your payment securely via Paystack.
                            </p>
                            <button className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                Pay R {(booking.payment.amount / 100).toFixed(2)} Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
