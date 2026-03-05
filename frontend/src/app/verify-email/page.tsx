'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const { verifyEmail, isLoading } = useAuthStore();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    // Prevent double-fires in React Strict Mode
    const hasFired = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setErrorMessage('No verification token provided in the URL.');
            return;
        }

        if (hasFired.current) return;
        hasFired.current = true;

        const verify = async () => {
            try {
                await verifyEmail(token);
                setStatus('success');
                // Auto-redirect after short delay 
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setErrorMessage(err.message || 'Failed to verify email. The link may be expired.');
            }
        };

        verify();
    }, [token, verifyEmail, router]);

    return (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md w-full">
            {status === 'verifying' && (
                <div className="py-8">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 mb-6">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Verifying Email...</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Please wait while we confirm your account.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-8">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6 transition-all duration-500 scale-110">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Email Verified!</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                        Your account is now active. You are being redirected to your dashboard...
                    </p>
                    <Link href="/dashboard">
                        <button className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors focus:outline-none flex items-center justify-center">
                            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="py-8">
                    <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Verification Failed</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 px-4">
                        {errorMessage}
                    </p>
                    <Link href="/login">
                        <button className="w-full py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 font-medium transition-colors focus:outline-none">
                            Return to Login
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
