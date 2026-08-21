'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, LogIn, AlertCircle, Mail, Sparkles, KeyRound } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink } from 'firebase/auth';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

function GoogleIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
        </svg>
    );
}

function LoginContent() {
    const { login, loginWithGoogle, sendMagicLink, completeMagicLinkSignIn, isLoading } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
    const [magicLinkEmail, setMagicLinkEmail] = useState('');
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isMagicLoading, setIsMagicLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [autoVerifying, setAutoVerifying] = useState(false);

    const isTimeout = searchParams.get('timeout') === 'true';

    // Check for Email Magic Link on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
            setAutoVerifying(true);
            completeMagicLinkSignIn()
                .then((user) => {
                    if (user.role === 'admin' || user.role === 'superadmin') {
                        router.push('/admin');
                    } else if (user.role === 'staff') {
                        router.push('/staff');
                    } else {
                        router.push('/dashboard');
                    }
                })
                .catch((err) => {
                    setLoginError(err.message || 'Failed to complete email link verification.');
                })
                .finally(() => setAutoVerifying(false));
        }
    }, [completeMagicLinkSignIn, router]);

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const routeByUserRole = (role: string) => {
        if (role === 'admin' || role === 'superadmin') {
            router.push('/admin');
        } else if (role === 'staff') {
            router.push('/staff');
        } else {
            router.push('/dashboard');
        }
    };

    const onSubmit = async (data: LoginValues) => {
        setLoginError('');
        try {
            const user = await login(data);
            routeByUserRole(user.role);
        } catch (err) {
            setLoginError((err as Error).message);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoginError('');
        setIsGoogleLoading(true);
        try {
            const user = await loginWithGoogle();
            routeByUserRole(user.role);
        } catch (err) {
            setLoginError((err as Error).message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleSendMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!magicLinkEmail || !magicLinkEmail.includes('@')) {
            setLoginError('Please enter a valid email address');
            return;
        }
        setLoginError('');
        setIsMagicLoading(true);
        try {
            await sendMagicLink(magicLinkEmail);
            setMagicLinkSent(true);
        } catch (err) {
            setLoginError((err as Error).message);
        } finally {
            setIsMagicLoading(false);
        }
    };

    if (autoVerifying) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#d46b4e] mx-auto" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Verifying Magic Link...</h2>
                    <p className="text-sm text-zinc-500">Authenticating your secure session.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Main Site
                </Link>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="mb-6 text-center">
                        <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-[#d46b4e]/10 text-[#d46b4e] mb-4">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome to La-Minks</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Sign in to manage your bookings and account.</p>
                    </div>

                    {/* Google OAuth (Customer One-Click) */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-100 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                    >
                        {isGoogleLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                Connecting to Google...
                            </>
                        ) : (
                            <>
                                <GoogleIcon />
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-medium tracking-wider">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Auth Mode Toggle: Password vs Passwordless Magic Link */}
                    <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => { setAuthMode('password'); setLoginError(''); setMagicLinkSent(false); }}
                            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${authMode === 'password'
                                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                        >
                            <KeyRound className="w-3.5 h-3.5" /> Password
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAuthMode('magic-link'); setLoginError(''); }}
                            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${authMode === 'magic-link'
                                ? 'bg-white dark:bg-zinc-900 text-[#d46b4e] font-bold shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#d46b4e]" /> Magic Link
                        </button>
                    </div>

                    {isTimeout && (
                        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p><strong>Session Expired:</strong> Your session timed out. Please sign in again.</p>
                        </div>
                    )}

                    {loginError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                            {loginError}
                        </div>
                    )}

                    {/* Mode 1: Standard Password Login */}
                    {authMode === 'password' && (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Email Address</label>
                                <input
                                    {...form.register('email')}
                                    type="email"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow text-sm"
                                    placeholder="name@example.com"
                                />
                                {form.formState.errors.email && (
                                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Password</label>
                                <input
                                    {...form.register('password')}
                                    type="password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow text-sm"
                                    placeholder="••••••••"
                                />
                                {form.formState.errors.password && (
                                    <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-4 rounded-xl bg-[#d46b4e] hover:bg-[#b3573c] text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#d46b4e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-[#d46b4e]/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In with Password'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Mode 2: Passwordless Magic Link Login */}
                    {authMode === 'magic-link' && (
                        <div>
                            {magicLinkSent ? (
                                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3">
                                    <Mail className="w-10 h-10 text-emerald-600 mx-auto" />
                                    <h3 className="font-bold text-emerald-900 dark:text-emerald-300 text-base">Check your inbox!</h3>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                                        We sent a secure one-click sign-in link to <strong>{magicLinkEmail}</strong>. Click it to log in instantly.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setMagicLinkSent(false)}
                                        className="text-xs text-emerald-800 underline font-semibold pt-2"
                                    >
                                        Send to a different email
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendMagicLink} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Your Email Address</label>
                                        <input
                                            type="email"
                                            value={magicLinkEmail}
                                            onChange={(e) => setMagicLinkEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow text-sm"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        No password needed. We&apos;ll email you an instant sign-in link.
                                    </p>
                                    <button
                                        type="submit"
                                        disabled={isMagicLoading}
                                        className="w-full py-3 px-4 rounded-xl bg-[#86a373] hover:bg-[#6e8a5c] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#86a373]/20"
                                    >
                                        {isMagicLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending Link...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Send Magic Sign-In Link
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-semibold text-[#d46b4e] hover:text-[#b3573c] transition-colors">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#d46b4e]" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
