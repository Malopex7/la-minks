'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                setStatus('error');
                setMessage('No payment reference found.');
                return;
            }

            try {
                const res = await fetch(`http://localhost:5001/api/payments/paystack/verify/${reference}`);
                const data = await res.json();

                if (res.ok && data.status === 'success') {
                    setStatus('success');
                    setMessage('Payment verified successfully! Your booking is confirmed.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Payment verification failed.');
                }
            } catch (err) {
                console.error('Payment verification error', err);
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verifyPayment();
    }, [reference]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 animate-spin text-[#d46b4e] mb-4" />
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Verifying Payment</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Payment Successful</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8">{message}</p>
                        <Link
                            href="/dashboard"
                            className="bg-[#d46b4e] hover:bg-[#b3573c] text-white font-medium py-3 px-6 rounded-lg transition-colors w-full"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Payment Failed</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8">{message}</p>
                        <div className="flex gap-4 w-full">
                            <Link
                                href="/dashboard"
                                className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium py-3 px-6 rounded-lg transition-colors w-full"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PayCallbackPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12">
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#d46b4e]" /></div>}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
