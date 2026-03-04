'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuoteStore } from '@/store/useQuoteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface QuoteDetails {
    baseCost: number;
    extrasCost: number;
    estimatedHours: number;
    finalPrice: number;
}

export default function ReviewQuote() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { data, prevStep } = useQuoteStore();
    const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const payload = {
                    serviceId: data.serviceId,
                    property: data.property,
                    extrasSelected: data.extrasSelected,
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

    const handleBook = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setBookingLoading(true);
        setErrorMsg('');

        try {
            // 1. Create the booking
            const bookingPayload = {
                serviceId: data.serviceId,
                address: data.address,
                property: data.property,
                extrasSelected: data.extrasSelected,
                schedule: data.schedule,
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
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12 animate-pulse space-y-4">
                <div className="h-8 w-64 bg-slate-200 rounded mx-auto"></div>
                <div className="h-4 w-48 bg-slate-200 rounded mx-auto"></div>
                <div className="w-full max-w-md mx-auto h-64 bg-slate-100 rounded-xl mt-8"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Final Quote</h2>
                <p className="text-slate-500">Review your cleaning details and confirm your booking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Property</h3>
                        <ul className="space-y-2 text-slate-600">
                            <li><span className="font-medium">Size:</span> {data.property.sqm} sqm</li>
                            <li><span className="font-medium">Rooms:</span> {data.property.bedrooms} beds, {data.property.bathrooms} baths</li>
                            <li><span className="font-medium">Condition:</span> <span className="capitalize">{data.property.conditionLevel}</span></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Schedule & Location</h3>
                        <ul className="space-y-2 text-slate-600">
                            <li>
                                <span className="font-medium">Date:</span>{' '}
                                {data.schedule.date ? data.schedule.date.toDateString() : 'N/A'}
                            </li>
                            <li><span className="font-medium">Time:</span> {data.schedule.timeSlot}</li>
                            <li><span className="font-medium">Address:</span> {data.address.line1}, {data.address.city}</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <Card className="border-2 border-blue-100 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 w-full h-2 bg-blue-600"></div>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-center text-slate-800">Price Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quoteDetails && (
                                <>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Base Service</span>
                                        <span className="font-medium">R{quoteDetails.baseCost.toFixed(2)}</span>
                                    </div>
                                    {quoteDetails.extrasCost > 0 && (
                                        <div className="flex justify-between text-slate-600">
                                            <span>Extras</span>
                                            <span className="font-medium">R{quoteDetails.extrasCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-4 mt-2 flex justify-between items-end">
                                        <div>
                                            <span className="block font-bold text-slate-900 text-lg">Total Price</span>
                                            <span className="text-sm text-slate-500">Est. {quoteDetails.estimatedHours} hours</span>
                                        </div>
                                        <span className="text-3xl font-extrabold text-blue-600">
                                            R{quoteDetails.finalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    {errorMsg && (
                                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                                            {errorMsg}
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="bg-slate-50 pt-6">
                            <Button
                                onClick={handleBook}
                                disabled={bookingLoading}
                                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-md transition-all font-semibold"
                            >
                                {bookingLoading ? 'Processing...' : 'Confirm & Book Now'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <div className="pt-8">
                <Button variant="outline" onClick={prevStep} size="lg">
                    Back to Schedule
                </Button>
            </div>
        </div>
    );
}
