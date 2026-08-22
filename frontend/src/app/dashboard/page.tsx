'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth, API_URL } from '@/lib/api';
import { CalendarDays, Clock, MapPin, Search, PlusCircle, ArrowRight, Loader2 } from 'lucide-react';

interface Booking {
    _id: string;
    serviceId: {
        _id: string;
        name: string;
        icon: string;
        baseRate: number;
    };
    status: string;
    schedule: {
        date: string;
        timeSlot: string;
    };
    payment: {
        status: string;
        amount: number;
    };
    address: {
        suburb: string;
        city: string;
    };
}

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                const res = await fetchWithAuth(`${API_URL}/bookings/my`);
                if (!res.ok) throw new Error('Failed to fetch bookings');
                const data = await res.json();
                setBookings(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'QUOTE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
            case 'BOOKED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'COMPLETED': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#d46b4e]" />
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">My Bookings</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage and view the history of your cleaning services.</p>
                </div>
                <Link
                    href="/quote"
                    className="inline-flex items-center justify-center bg-[#d46b4e] hover:bg-[#b3573c] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    New Booking
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            {bookings.length === 0 && !error ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                        <Search className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No bookings found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
                        You haven&apos;t made any cleaning reservations yet. Start by getting a tailored quote for your space.
                    </p>
                    <Link
                        href="/quote"
                        className="inline-flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        Get a Free Quote
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <Link
                            key={booking._id}
                            href={`/dashboard/bookings/${booking._id}`}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 md:p-6 hover:shadow-md transition-shadow group flex flex-col md:flex-row gap-6 md:items-center"
                        >
                            <div className="w-16 h-16 rounded-xl bg-[#d46b4e]/10 dark:bg-[#d46b4e]/20 flex items-center justify-center flex-shrink-0 text-3xl">
                                {booking.serviceId?.icon || '✨'}
                            </div>

                            <div className="flex-1 grid md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                        {booking.serviceId?.name || 'Unknown Service'}
                                    </h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Schedule</p>
                                    <div className="flex items-center text-sm text-zinc-700 dark:text-zinc-300">
                                        <CalendarDays className="w-4 h-4 mr-2 text-zinc-400" />
                                        {new Date(booking.schedule?.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-sm text-zinc-700 dark:text-zinc-300">
                                        <Clock className="w-4 h-4 mr-2 text-zinc-400" />
                                        {booking.schedule?.timeSlot}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Location</p>
                                    <div className="flex items-center text-sm text-zinc-700 dark:text-zinc-300 truncate">
                                        <MapPin className="w-4 h-4 mr-2 text-zinc-400 flex-shrink-0" />
                                        <span className="truncate">{booking.address?.suburb}, {booking.address?.city}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Amount</p>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        R {booking.payment?.amount ? Number(booking.payment.amount).toFixed(2) : '0.00'}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${booking.payment?.status?.toUpperCase() === 'PAID'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                            {booking.payment?.status || 'UNPAID'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center justify-center p-2 text-zinc-400 group-hover:text-[#d46b4e] group-hover:translate-x-1 transition-all">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
