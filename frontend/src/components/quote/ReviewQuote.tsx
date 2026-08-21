'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuoteStore } from '@/store/useQuoteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Printer, Mail, CheckCircle2, CreditCard,
    FileText, Loader2, ArrowRight, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

interface QuoteDetails {
    baseCost: number;
    extrasCost: number;
    estimatedHours: number;
    finalPrice: number;
}

export default function ReviewQuote() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data, prevStep, reset } = useQuoteStore();
    const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [payLoading, setPayLoading] = useState(false);
    const [saveQuoteLoading, setSaveQuoteLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successQuote, setSuccessQuote] = useState<{ id: string; ref: string } | null>(null);

    // Email modal state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailInput, setEmailInput] = useState(user?.email || '');
    const [nameInput, setNameInput] = useState(user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '');
    const [emailSending, setEmailSending] = useState(false);
    const [emailSuccessMsg, setEmailSuccessMsg] = useState('');

    const resolvedRef = successQuote?.ref || (data.serviceId ? data.serviceId.substring(data.serviceId.length - 6).toUpperCase() : 'LMQ-890');

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const payload = {
                    serviceId: data.serviceId,
                    serviceDetails: data.serviceDetails,
                    extrasSelected: data.extrasSelected,
                    aiExtras: data.aiExtras,
                };

                const response = await fetch('http://localhost:5001/api/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to calculate quote');
                }

                const json = await response.json();
                setQuoteDetails(json);
            } catch (err: unknown) {
                console.error(err instanceof Error ? err.message : 'Unknown error');
                // Fallback mock quote for demonstration 
                setQuoteDetails({
                    baseCost: 800,
                    extrasCost: 150,
                    estimatedHours: 4.5,
                    finalPrice: 950
                });
            } finally {
                setLoading(false);
            }
        };

        if (data.serviceId) {
            fetchQuote();
        }
    }, [data]);

    // Handle "Save & Generate Quote" (No immediate payment required)
    const handleGenerateQuoteOnly = async () => {
        if (user?.role === 'staff') {
            setErrorMsg('Cleaners and staff members are not permitted to create quotes or bookings.');
            return;
        }

        if (!user) {
            // Prompt guest email modal to send/save
            setShowEmailModal(true);
            return;
        }

        setSaveQuoteLoading(true);
        setErrorMsg('');

        try {
            const bookingPayload = {
                serviceId: data.serviceId,
                address: data.address,
                serviceDetails: data.serviceDetails,
                extrasSelected: data.extrasSelected,
                aiExtras: data.aiExtras,
                schedule: data.schedule,
                status: 'QUOTE', // Saved as quote without payment
            };

            const bookingRes = await fetchWithAuth('http://localhost:5001/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload),
            });

            if (!bookingRes.ok) {
                const errData = await bookingRes.json();
                throw new Error(errData.message || 'Failed to generate quote');
            }

            const newBooking = await bookingRes.json();
            setSuccessQuote({
                id: newBooking._id,
                ref: newBooking._id.substring(newBooking._id.length - 6).toUpperCase(),
            });
        } catch (err: unknown) {
            console.error('Quote generation error:', err);
            setErrorMsg(err instanceof Error ? err.message : 'An error occurred while saving your quote');
        } finally {
            setSaveQuoteLoading(false);
        }
    };

    // Handle "Pay & Book Now" (Proceeds directly to Paystack payment)
    const handlePayAndBook = async () => {
        if (user?.role === 'staff') {
            setErrorMsg('Cleaners and staff members are not permitted to create quotes or bookings.');
            return;
        }

        if (!user) {
            router.push('/login');
            return;
        }

        setPayLoading(true);
        setErrorMsg('');

        try {
            // 1. Create the booking with status BOOKED
            const bookingPayload = {
                serviceId: data.serviceId,
                address: data.address,
                serviceDetails: data.serviceDetails,
                extrasSelected: data.extrasSelected,
                aiExtras: data.aiExtras,
                schedule: data.schedule,
                status: 'BOOKED',
            };

            const bookingRes = await fetchWithAuth('http://localhost:5001/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload),
            });

            if (!bookingRes.ok) {
                const errData = await bookingRes.json();
                throw new Error(errData.message || 'Failed to create booking');
            }

            const newBooking = await bookingRes.json();

            // 2. Initialize Paystack transaction
            const paystackRes = await fetchWithAuth('http://localhost:5001/api/payments/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: newBooking._id }),
            });

            if (!paystackRes.ok) {
                const errData = await paystackRes.json();
                throw new Error(errData.message || 'Failed to initialize payment');
            }

            const paymentData = await paystackRes.json();

            // 3. Redirect to Paystack checkout
            if (paymentData.authorization_url) {
                window.location.href = paymentData.authorization_url;
            }
        } catch (err: unknown) {
            console.error('Booking error:', err);
            setErrorMsg(err instanceof Error ? err.message : 'An error occurred during booking');
            setPayLoading(false);
        }
    };

    // Handle sending quote breakdown to an email
    const handleSendQuoteEmail = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!emailInput) {
            setErrorMsg('Please provide a valid email address.');
            return;
        }

        setEmailSending(true);
        setEmailSuccessMsg('');
        setErrorMsg('');

        try {
            const res = await fetch('http://localhost:5001/api/quote/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    name: nameInput || 'Customer',
                    serviceId: data.serviceId,
                    serviceName: data.serviceName,
                    serviceDetails: data.serviceDetails,
                    extrasSelected: data.extrasSelected,
                    aiExtras: data.aiExtras,
                    schedule: data.schedule,
                    address: data.address,
                    pricing: quoteDetails,
                }),
            });

            const resData = await res.json();
            if (!res.ok) throw new Error(resData.message || 'Failed to send quote email');

            setEmailSuccessMsg(`Quote emailed to ${emailInput}! Check your inbox.`);
            setTimeout(() => {
                setShowEmailModal(false);
                setEmailSuccessMsg('');
            }, 2500);
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Failed to send email');
        } finally {
            setEmailSending(false);
        }
    };

    const handlePrintQuote = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="text-center py-12 animate-pulse space-y-4 print:hidden">
                <div className="h-8 w-64 bg-slate-200 rounded mx-auto"></div>
                <div className="h-4 w-48 bg-slate-200 rounded mx-auto"></div>
                <div className="w-full max-w-md mx-auto h-64 bg-slate-100 rounded-xl mt-8"></div>
            </div>
        );
    }

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
                            Official Quotation
                        </span>
                        <p className="text-sm font-mono font-bold text-gray-900">Ref: #{resolvedRef}</p>
                        <p className="text-xs text-gray-600">Date: {new Date().toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500">Valid: 30 Days from issue</p>
                    </div>
                </div>

                {/* Customer & Location Details */}
                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Client / Recipient</h4>
                        <p className="font-semibold text-gray-900">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (nameInput || 'Valued Customer')}</p>
                        <p className="text-xs text-gray-600">{user?.email || emailInput || 'Online Quote Request'}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Service Location & Schedule</h4>
                        <p className="text-xs text-gray-800 font-medium">
                            {data.address.line1 ? `${data.address.line1}, ${data.address.suburb || data.address.city || ''}` : 'Address to be confirmed upon booking'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            <strong>Date:</strong> {data.schedule.date ? new Date(data.schedule.date).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible'}
                        </p>
                        <p className="text-xs text-gray-600">
                            <strong>Preferred Slot:</strong> {data.schedule.timeSlot || 'Standard working hours'}
                        </p>
                    </div>
                </div>

                {/* Specifications & Breakdown Table */}
                <div className="mb-6">
                    <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider mb-3">Service & Cost Breakdown</h4>
                    <table className="w-full border-collapse border border-gray-200 text-xs">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Description</th>
                                <th className="text-left py-2 px-3 font-semibold text-gray-700">Scope / Specifications</th>
                                <th className="text-right py-2 px-3 font-semibold text-gray-700">Amount (ZAR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr>
                                <td className="py-3 px-3 font-semibold text-gray-900">
                                    {data.serviceName || 'Standard Cleaning Service'} (Base)
                                </td>
                                <td className="py-3 px-3 text-gray-600">
                                    {Object.entries(data.serviceDetails).map(([k, v]) => {
                                        const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        return `${label}: ${v}`;
                                    }).join(' • ')}
                                </td>
                                <td className="py-3 px-3 text-right font-medium text-gray-900">
                                    R{quoteDetails?.baseCost.toFixed(2)}
                                </td>
                            </tr>

                            {data.extrasSelected && data.extrasSelected.length > 0 && (
                                <tr>
                                    <td className="py-3 px-3 font-semibold text-gray-900">
                                        Selected Service Extras
                                    </td>
                                    <td className="py-3 px-3 text-gray-600">
                                        {data.extrasSelected.join(', ')}
                                    </td>
                                    <td className="py-3 px-3 text-right font-medium text-gray-900">
                                        R{quoteDetails?.extrasCost.toFixed(2)}
                                    </td>
                                </tr>
                            )}

                            <tr className="bg-gray-50/50">
                                <td className="py-2.5 px-3 font-medium text-gray-700">
                                    Estimated Duration
                                </td>
                                <td className="py-2.5 px-3 text-gray-600">
                                    Approx. {quoteDetails?.estimatedHours} hours on-site
                                </td>
                                <td className="py-2.5 px-3 text-right text-gray-500">
                                    Included
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-900 bg-gray-50">
                                <td colSpan={2} className="py-3 px-3 text-base font-bold text-gray-900 text-right">
                                    Total Estimated Quote:
                                </td>
                                <td className="py-3 px-3 text-right text-base font-extrabold text-[#d46b4e]">
                                    R{quoteDetails?.finalPrice.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Terms & Confirmation Notice */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/60 text-xs text-gray-600 space-y-1.5 mb-8">
                    <p className="font-bold text-gray-800">Quotation Terms & Acceptance:</p>
                    <p>• This estimate is non-binding and valid for 30 calendar days from the date of issue.</p>
                    <p>• All pricing is quoted in South African Rands (ZAR) and inclusive of professional equipment and eco-friendly supplies.</p>
                    <p>• To confirm this quotation and book your cleaners, visit <strong>www.laminks.co.za</strong>, log in to your dashboard, or present Ref <strong>#{resolvedRef}</strong> to our dispatch team.</p>
                </div>

                {/* Print Footer */}
                <div className="text-center pt-4 border-t border-gray-200 text-[10px] text-gray-500">
                    <p>Thank you for choosing La-Minks. For inquiries, call us at +27 71 234 5678 or email info@cryobyte.co.za.</p>
                </div>
            </div>

            {/* ============================================================ */}
            {/* SCREEN-ONLY INTERACTIVE QUOTE WIZARD (Hidden on print)       */}
            {/* ============================================================ */}
            <div className="print:hidden space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Success Screen if Quote was generated and saved */}
                {successQuote ? (
                    <div className="space-y-6 text-center py-6">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
                            Quote Generated Successfully!
                        </h2>
                        <p className="text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                            Your official quote has been saved to your account with Reference <span className="font-mono font-bold text-slate-900 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">#{successQuote.ref}</span>.
                        </p>

                        <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
                                <span className="text-sm font-medium text-slate-500">Estimated Total</span>
                                <span className="text-2xl font-bold text-[#d46b4e]">
                                    R{quoteDetails?.finalPrice.toFixed(2)}
                                </span>
                            </div>
                            <div className="text-xs text-slate-500 space-y-1">
                                <p>• Estimated Duration: ~{quoteDetails?.estimatedHours} hours</p>
                                <p>• No upfront payment was processed.</p>
                                <p>• You can convert this quote to a confirmed booking whenever you are ready.</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4 max-w-md mx-auto">
                            <Link
                                href={`/dashboard/bookings/${successQuote.id}`}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d46b4e] hover:bg-[#b3573c] text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all"
                            >
                                View & Pay in Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Button
                                variant="outline"
                                onClick={handlePrintQuote}
                                className="w-full sm:w-auto inline-flex items-center gap-2 border-slate-300"
                            >
                                <Printer className="w-4 h-4" />
                                Print Quote
                            </Button>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => reset()}
                                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 inline-flex items-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Start Another Quote
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d46b4e]/10 text-[#d46b4e] text-xs font-bold uppercase tracking-wider mb-3">
                                <Sparkles className="w-3.5 h-3.5" />
                                Transparent Pricing
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-zinc-100 mb-2">Your Cleaning Quote</h2>
                            <p className="text-slate-500 dark:text-zinc-400">Review your customized details. You can generate a free quote or book and pay immediately.</p>
                        </div>

                        {/* Quick Action Utilities */}
                        <div className="flex justify-end gap-2 text-sm no-print">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowEmailModal(true)}
                                className="text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 inline-flex items-center gap-1.5"
                            >
                                <Mail className="w-4 h-4" />
                                Email Quote
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handlePrintQuote}
                                className="text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 inline-flex items-center gap-1.5"
                            >
                                <Printer className="w-4 h-4" />
                                Print / Save PDF
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 mb-3 border-b pb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#d46b4e]" />
                                        Service Specifications
                                    </h3>
                                    <ul className="space-y-2 text-slate-600 dark:text-zinc-400 text-sm">
                                        {Object.entries(data.serviceDetails).map(([key, value]) => {
                                            const inputDef = data.serviceInputs.find(i => i.name === key);
                                            const label = inputDef ? inputDef.label : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                            return (
                                                <li key={key} className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                                                    <span className="font-medium text-slate-700 dark:text-zinc-300">{label}:</span>
                                                    <span className={key === 'conditionLevel' ? 'capitalize font-semibold text-slate-900 dark:text-zinc-100' : 'font-semibold text-slate-900 dark:text-zinc-100'}>
                                                        {String(value)}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {data.extrasSelected && data.extrasSelected.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mb-2">Selected Extras</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.extrasSelected.map((extra, idx) => (
                                                <span key={idx} className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-md font-medium">
                                                    {extra}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-200 mb-3 border-b pb-2">Schedule & Location</h3>
                                    <ul className="space-y-2 text-slate-600 dark:text-zinc-400 text-sm">
                                        <li className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                                            <span className="font-medium text-slate-700 dark:text-zinc-300">Date:</span>
                                            <span>{data.schedule.date ? data.schedule.date.toDateString() : 'To be scheduled'}</span>
                                        </li>
                                        <li className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                                            <span className="font-medium text-slate-700 dark:text-zinc-300">Time Slot:</span>
                                            <span>{data.schedule.timeSlot || 'Flexible'}</span>
                                        </li>
                                        <li className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
                                            <span className="font-medium text-slate-700 dark:text-zinc-300">Address:</span>
                                            <span className="text-right truncate max-w-[200px]">{data.address.line1 ? `${data.address.line1}, ${data.address.suburb || data.address.city}` : 'To be confirmed'}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <Card className="border-2 border-[#d46b4e]/30 shadow-xl relative overflow-hidden bg-white dark:bg-zinc-900">
                                    <div className="absolute top-0 w-full h-2 bg-[#d46b4e]"></div>
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl text-center text-slate-800 dark:text-zinc-100">
                                            Price Breakdown
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {quoteDetails && (
                                            <>
                                                <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                                                    <span>Base Cleaning Rate</span>
                                                    <span className="font-medium text-slate-900 dark:text-zinc-100">R{quoteDetails.baseCost.toFixed(2)}</span>
                                                </div>
                                                {quoteDetails.extrasCost > 0 && (
                                                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                                                        <span>Optional Extras</span>
                                                        <span className="font-medium text-slate-900 dark:text-zinc-100">R{quoteDetails.extrasCost.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2 flex justify-between items-end">
                                                    <div>
                                                        <span className="block font-bold text-slate-900 dark:text-zinc-100 text-lg">Total Quote</span>
                                                        <span className="text-xs text-slate-500 dark:text-zinc-400">Est. {quoteDetails.estimatedHours} hours</span>
                                                    </div>
                                                    <span className="text-3xl font-extrabold text-[#d46b4e]">
                                                        R{quoteDetails.finalPrice.toFixed(2)}
                                                    </span>
                                                </div>

                                                {user?.role === 'staff' ? (
                                                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                                                        <span>
                                                            <strong>Cleaner Account:</strong> Staff members cannot book or generate quotes. Please visit your <Link href="/staff" className="underline font-bold">Staff Portal</Link>.
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300">
                                                        <span className="font-bold">No obligation:</span> You can generate and save this quote for free without paying today, or proceed to book right away.
                                                    </div>
                                                )}

                                                {errorMsg && (
                                                    <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
                                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                        <span>{errorMsg}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </CardContent>

                                    <CardFooter className="bg-slate-50 dark:bg-zinc-950/50 p-6 flex flex-col gap-3">
                                        {/* Option 1: Save & Generate Quote (No Payment Required) */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleGenerateQuoteOnly}
                                            disabled={saveQuoteLoading || payLoading || user?.role === 'staff'}
                                            className="w-full h-12 text-base font-semibold border-2 border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-all disabled:opacity-50"
                                        >
                                            {saveQuoteLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating Quote...
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-4 h-4 mr-2 text-[#d46b4e]" />
                                                    Generate & Save Quote Only
                                                </>
                                            )}
                                        </Button>

                                        {/* Option 2: Pay Online & Book Now */}
                                        <Button
                                            type="button"
                                            onClick={handlePayAndBook}
                                            disabled={payLoading || saveQuoteLoading || user?.role === 'staff'}
                                            className="w-full h-12 text-base bg-[#d46b4e] hover:bg-[#b3573c] text-white shadow-md transition-all font-semibold disabled:opacity-50"
                                        >
                                            {payLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    Pay & Book Now (R{quoteDetails?.finalPrice.toFixed(2)})
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-between items-center">
                            <Button variant="outline" onClick={prevStep} size="lg">
                                Back to Schedule
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Email Quote Modal / Overlay */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200 no-print">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#d46b4e]/10 text-[#d46b4e] rounded-xl">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Email This Quote</h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">Receive a full itemized quote breakdown directly in your inbox.</p>
                            </div>
                        </div>

                        {emailSuccessMsg ? (
                            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200">
                                {emailSuccessMsg}
                            </div>
                        ) : (
                            <form onSubmit={handleSendQuoteEmail} className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        placeholder="e.g. Sipho Ndlovu"
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#d46b4e]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                        placeholder="you@example.co.za"
                                        className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#d46b4e]"
                                    />
                                </div>

                                {!user && (
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                                        Want to save this quote to an account?{' '}
                                        <Link href="/register" className="text-[#d46b4e] font-semibold hover:underline">
                                            Create free account
                                        </Link>
                                    </p>
                                )}

                                <div className="flex gap-2 justify-end pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowEmailModal(false)}
                                        disabled={emailSending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={emailSending}
                                        className="bg-[#d46b4e] hover:bg-[#b3573c] text-white font-semibold"
                                    >
                                        {emailSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                        Send Quote Email
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
