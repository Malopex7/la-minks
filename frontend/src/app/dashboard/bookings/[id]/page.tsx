'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth, API_URL } from '@/lib/api';
import {
    ArrowLeft, Loader2, CalendarDays, MapPin,
    Home, CheckCircle2, Circle, CreditCard, FileText,
    Camera, ShieldCheck, AlertCircle, Printer
} from 'lucide-react';
import { useLightbox } from '@/components/PhotoLightbox';

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
    serviceDetails?: Record<string, string | number | boolean>;
    schedule: {
        date: string;
        timeSlot: string;
        estimatedHours?: number;
    };
    payment: {
        status: string;
        amount: number;
        subtotal?: number;
        vatRate?: number;
        vatAmount?: number;
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
    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState('');

    const allPhotoUrls = [
        ...(booking?.photos?.before ?? []).map(id => `${API_URL}/photos/${id}`),
        ...(booking?.photos?.after ?? []).map(id => `${API_URL}/photos/${id}`),
    ];
    const beforeCount = booking?.photos?.before?.length ?? 0;
    const { lightbox, open } = useLightbox(allPhotoUrls);

    const handlePayment = async () => {
        if (!user || !booking) return;
        setIsPaying(true);
        setError('');
        try {
            const res = await fetchWithAuth(`${API_URL}/payments/paystack/initialize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookingId: booking._id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to initialize payment');

            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            }
        } catch (err) {
            setError((err as Error).message);
            setIsPaying(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        const fetchBooking = async () => {
            if (!user || !params.id) return;
            try {
                const res = await fetchWithAuth(`${API_URL}/bookings/${params.id}`);
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
            case 'QUOTE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'BOOKED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
            case 'COMPLETED': return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800';
        }
    };

    const isPaid = booking?.payment?.status?.toUpperCase() === 'PAID';
    const canPay = Boolean(booking && !isPaid && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED');
    const isQuote = booking?.status === 'QUOTE';

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#d46b4e]" />
            </div>
        );
    }

    if (error && !booking) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-2xl mb-6 inline-block border border-red-200 dark:border-red-800/30">
                    <p className="font-medium">{error}</p>
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

    if (!booking) return null;

    return (
        <div>
            {/* ============================================================ */}
            {/* OFFICIAL PRINT-ONLY QUOTATION DOCUMENT (Hidden on screen)    */}
            {/* ============================================================ */}
            <div className="hidden print:block print:w-full print:p-0 print:text-black font-sans text-sm">
                {/* Header with Logo & Brand */}
                <div className="flex justify-between items-start border-b-2 border-[#d46b4e] pb-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Image
                                src="/images/La-Minks-Logo.svg"
                                alt="La-Minks Cleaning Services"
                                width={160}
                                height={70}
                                className="h-14 w-auto"
                                priority
                            />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Premium Cleaning & Property Services</p>
                        <p className="text-xs text-gray-500">Johannesburg, Gauteng, South Africa</p>
                        <p className="text-xs text-gray-500">Email: info@cryobyte.co.za | Web: www.laminks.co.za</p>
                    </div>

                    <div className="text-right">
                        <span className="inline-block bg-[#d46b4e] text-white px-3 py-1 text-xs font-bold uppercase tracking-widest rounded mb-2">
                            {isQuote ? 'Official Quotation' : 'Booking Confirmation & Invoice'}
                        </span>
                        <p className="text-sm font-mono font-bold text-gray-900">Ref: #{booking._id}</p>
                        <p className="text-xs text-gray-600">Issued: {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">Status: <strong className="uppercase">{booking.status}</strong></p>
                    </div>
                </div>

                {/* Customer & Location Details */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Client / Recipient</h4>
                        <p className="font-semibold text-gray-900">
                            {booking.customerId?.firstName ? `${booking.customerId.firstName} ${booking.customerId.lastName || ''}` : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Valued Customer')}
                        </p>
                        <p className="text-xs text-gray-600">{booking.customerId?.email || user?.email || 'Email on file'}</p>
                        {booking.customerId?.phone && (
                            <p className="text-xs text-gray-600">Tel: {booking.customerId.phone}</p>
                        )}
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Service Schedule & Location</h4>
                        <p className="text-xs text-gray-800 font-medium">
                            {booking.address?.line1 ? `${booking.address.line1}, ${booking.address.suburb || ''} ${booking.address.city || ''}` : 'Address on file'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            <strong>Date:</strong> {booking.schedule?.date ? new Date(booking.schedule.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'To be confirmed'}
                        </p>
                        <p className="text-xs text-gray-600">
                            <strong>Slot:</strong> {booking.schedule?.timeSlot || 'Standard working hours'}
                        </p>
                    </div>
                </div>

                {/* Specifications & Cost Breakdown Table */}
                <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider mb-3">Service & Cost Breakdown</h4>
                    <table className="w-full border-collapse border border-gray-300 text-xs table-fixed">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="w-[35%] text-left py-2.5 px-3 font-semibold text-gray-700">Description</th>
                                <th className="w-[45%] text-left py-2.5 px-3 font-semibold text-gray-700">Scope / Specifications</th>
                                <th className="w-[20%] text-right py-2.5 px-3 font-semibold text-gray-700 whitespace-nowrap">Amount (ZAR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="py-3 px-3 font-semibold text-gray-900 align-top">
                                    {booking.serviceId?.name || 'Cleaning Service'} (Base Package)
                                </td>
                                <td className="py-3 px-3 text-gray-600 align-top">
                                    {booking.serviceDetails && Object.entries(booking.serviceDetails).map(([k, v]) => {
                                        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return `${label}: ${String(v).replace('_', ' ')}`;
                                    }).join(' • ')}
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-gray-900 align-top whitespace-nowrap">
                                    {booking.serviceId?.baseRate ? `R ${Number(booking.serviceId.baseRate).toFixed(2)}` : `R ${Number(booking.payment?.amount || 0).toFixed(2)}`}
                                </td>
                            </tr>

                            {booking.extrasSelected && booking.extrasSelected.length > 0 && (
                                <tr>
                                    <td className="py-3 px-3 font-semibold text-gray-900 align-top">
                                        Selected Extras & Add-ons
                                    </td>
                                    <td className="py-3 px-3 text-gray-600 align-top">
                                        {booking.extrasSelected.join(', ')}
                                    </td>
                                    <td className="py-3 px-3 text-right font-medium text-gray-900 align-top whitespace-nowrap">
                                        Included
                                    </td>
                                </tr>
                            )}

                            <tr className="bg-gray-50/50">
                                <td className="py-2.5 px-3 font-medium text-gray-700">
                                    Estimated Duration
                                </td>
                                <td className="py-2.5 px-3 text-gray-600">
                                    Approx. {booking.schedule?.estimatedHours || 2} hours on-site
                                </td>
                                <td className="py-2.5 px-3 text-right text-gray-500 whitespace-nowrap">
                                    Included
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2} className="py-2 px-3 text-xs text-gray-700 text-right font-medium">
                                    Subtotal (excl. VAT):
                                </td>
                                <td className="py-2 px-3 text-right text-xs font-semibold text-gray-900 whitespace-nowrap">
                                    R {(booking.payment.subtotal ?? (Number(booking.payment.amount || 0) / 1.15)).toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="py-1.5 px-3 text-xs text-gray-600 text-right">
                                    VAT (15%):
                                </td>
                                <td className="py-1.5 px-3 text-right text-xs font-semibold text-gray-800 whitespace-nowrap">
                                    R {(booking.payment.vatAmount ?? (Number(booking.payment.amount || 0) - (Number(booking.payment.amount || 0) / 1.15))).toFixed(2)}
                                </td>
                            </tr>
                            <tr className="border-t-2 border-gray-900 bg-gray-50">
                                <td colSpan={2} className="py-3 px-3 text-base font-bold text-gray-900 text-right">
                                    Total Amount ({isPaid ? 'PAID' : 'DUE'} - incl. 15% VAT):
                                </td>
                                <td className="py-3 px-3 text-right text-base font-extrabold text-[#d46b4e] whitespace-nowrap">
                                    R {Number(booking.payment.amount).toFixed(2)}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2} className="py-2 px-3 text-xs text-gray-600 text-right">
                                    Payment Status:
                                </td>
                                <td className="py-2 px-3 text-right text-xs font-bold uppercase text-gray-800 whitespace-nowrap">
                                    {booking.payment?.status} {booking.payment?.reference ? `(${booking.payment.reference})` : ''}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Terms & Confirmation Notice */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/60 text-xs text-gray-600 space-y-1.5 mb-8">
                    <p className="font-bold text-gray-800">Quotation Terms & Acceptance:</p>
                    <p>• All pricing is quoted in South African Rands (ZAR) and inclusive of professional equipment, staff dispatch, and supplies.</p>
                    <p>• To confirm and pay for this booking, log in to your account at <strong>www.laminks.co.za</strong> or reference booking ID <strong>#{booking._id}</strong> with our team.</p>
                </div>

                {/* Print Footer */}
                <div className="border-t border-gray-200 pt-4 flex justify-between text-xs text-gray-500">
                    <p>Thank you for choosing La-Minks Cleaning Services.</p>
                    <p>Generated automatically via La-Minks Portal</p>
                </div>
            </div>

            {/* ============================================================ */}
            {/* ON-SCREEN INTERACTIVE DASHBOARD VIEW (Hidden when printing)  */}
            {/* ============================================================ */}
            <div className="max-w-4xl mx-auto space-y-6 print:hidden">
                {lightbox}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Bookings
                    </Link>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                    >
                        <Printer className="w-4 h-4 text-[#d46b4e]" />
                        <span>Print Quote / Save PDF</span>
                    </button>
                </div>

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

                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-full border text-sm font-bold tracking-wider uppercase ${getStatusStyle(booking.status)}`}>
                                {booking.status.replace('_', ' ')}
                            </div>
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
                            <div className="flex-1">
                                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Payment</p>
                                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">R {Number(booking.payment.amount).toFixed(2)}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide
                                        ${isPaid
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {booking.payment?.status || 'UNPAID'}
                                    </span>

                                    {canPay && (
                                        <button
                                            onClick={handlePayment}
                                            disabled={isPaying}
                                            className="text-xs text-[#d46b4e] hover:text-[#b3573c] font-bold underline cursor-pointer disabled:opacity-50"
                                        >
                                            {isPaying ? 'Loading...' : 'Pay Now →'}
                                        </button>
                                    )}
                                </div>
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
                                <Home className="w-5 h-5 text-[#d46b4e]" />
                                Property Details
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                {booking.serviceDetails && Object.entries(booking.serviceDetails).map(([key, value]) => {
                                    // Format the key from camelCase to Title Space Case
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                    return (
                                        <div key={key}>
                                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">{formattedKey}</p>
                                            <p className="text-zinc-900 dark:text-zinc-100 font-medium capitalize">
                                                {String(value).replace('_', ' ')}
                                            </p>
                                        </div>
                                    );
                                })}
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
                                    <FileText className="w-5 h-5 text-[#d46b4e]" />
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
                                <Camera className="w-4 h-4 text-[#d46b4e]" />
                                Job Photos
                            </h2>

                            <div className="space-y-4">
                                {/* Before Photos */}
                                <div>
                                    <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Before</p>
                                    {booking.photos?.before?.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {booking.photos.before.map((fileId, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => open(i)}
                                                    className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden block hover:opacity-90 transition-opacity cursor-pointer"
                                                >
                                                    <Image src={`${API_URL}/photos/${fileId}`} alt={`Before ${i + 1}`} width={400} height={400} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 text-center text-sm text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-700">
                                            No photos yet
                                        </div>
                                    )}
                                </div>

                                {/* After Photos */}
                                <div>
                                    <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">After</p>
                                    {booking.photos?.after?.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {booking.photos.after.map((fileId, i) => (
                                                <div
                                                    key={i}
                                                    onClick={() => open(beforeCount + i)}
                                                    className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800 overflow-hidden block hover:opacity-90 transition-opacity cursor-pointer"
                                                >
                                                    <Image src={`${API_URL}/photos/${fileId}`} alt={`After ${i + 1}`} width={400} height={400} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 text-center text-sm text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-700">
                                            No photos yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions / Payment Box */}
                        {canPay && (
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-6 shadow-sm text-center">
                                <div className="w-12 h-12 rounded-full bg-[#d46b4e]/10 text-[#d46b4e] flex items-center justify-center mx-auto mb-3">
                                    <CreditCard className="w-6 h-6" />
                                </div>

                                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                                    {booking.status === 'QUOTE'
                                        ? 'Ready to Confirm Your Quote?'
                                        : booking.payment?.status?.toUpperCase() === 'PENDING'
                                            ? 'Complete Your Pending Payment'
                                            : 'Payment Required'}
                                </h3>

                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
                                    {booking.payment?.status?.toUpperCase() === 'PENDING'
                                        ? 'Your previous checkout was interrupted. You can securely resume and complete your payment via Paystack anytime to confirm your booking.'
                                        : booking.status === 'QUOTE'
                                            ? 'Convert this quote into a confirmed booking anytime by paying securely via Paystack.'
                                            : 'Secure your booking by completing your payment securely via Paystack.'}
                                </p>

                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 border border-red-200 dark:border-red-800/30">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handlePayment}
                                    disabled={isPaying}
                                    className="w-full py-3 px-4 bg-[#d46b4e] hover:bg-[#b3573c] text-white rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[#d46b4e]/20"
                                >
                                    {isPaying ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Redirecting to Paystack...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>
                                                {booking.status === 'QUOTE'
                                                    ? `Confirm & Pay R ${Number(booking.payment.amount).toFixed(2)}`
                                                    : `Pay R ${Number(booking.payment.amount).toFixed(2)} Now`}
                                            </span>
                                        </>
                                    )}
                                </button>

                                <div className="mt-3 flex items-center justify-center gap-3">
                                    <button
                                        onClick={handlePrint}
                                        className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print / Download PDF</span>
                                    </button>
                                </div>

                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 flex items-center justify-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span>256-bit Encrypted & Powered by Paystack</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
