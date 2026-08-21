'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, UserPlus, MailCheck } from 'lucide-react';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterValues = z.infer<typeof registerSchema>;

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

export default function RegisterPage() {
    const { register, loginWithGoogle, isLoading } = useAuthStore();
    const router = useRouter();
    const [registerError, setRegisterError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    });

    const onSubmit = async (data: RegisterValues) => {
        setRegisterError('');
        try {
            await register(data);
            setIsSuccess(true);
        } catch (err) {
            setRegisterError((err as Error).message);
        }
    };

    const handleGoogleSignUp = async () => {
        setRegisterError('');
        setIsGoogleLoading(true);
        try {
            await loginWithGoogle();
            router.push('/dashboard');
        } catch (err) {
            setRegisterError((err as Error).message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md">
                <Link href="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Main Site
                </Link>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                    {isSuccess ? (
                        <div className="text-center py-8">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-[#d46b4e]/10 text-[#d46b4e] mb-6">
                                <MailCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Check your email</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 mb-8 mx-auto max-w-[300px]">
                                We&apos;ve sent a verification link to your email address. Please click it to activate your account.
                            </p>
                            <Link href="/login">
                                <button className="w-full py-3 px-4 rounded-xl bg-[#d46b4e] hover:bg-[#b3573c] text-white font-bold text-sm transition-colors shadow-lg shadow-[#d46b4e]/20">
                                    Proceed to Sign In
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6 text-center">
                                <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-[#d46b4e]/10 text-[#d46b4e] mb-4">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create an Account</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">Join La-Minks to manage your bookings and quotes.</p>
                            </div>

                            {/* Google One-Click Registration */}
                            <button
                                type="button"
                                onClick={handleGoogleSignUp}
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
                                        Sign up with Google
                                    </>
                                )}
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-zinc-900 px-3 text-zinc-400 font-medium tracking-wider">
                                        Or register with email
                                    </span>
                                </div>
                            </div>

                            {registerError && (
                                <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                                    {registerError}
                                </div>
                            )}

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">First Name</label>
                                        <input
                                            {...form.register('firstName')}
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow text-sm"
                                            placeholder="John"
                                        />
                                        {form.formState.errors.firstName && (
                                            <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Last Name</label>
                                        <input
                                            {...form.register('lastName')}
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow text-sm"
                                            placeholder="Doe"
                                        />
                                        {form.formState.errors.lastName && (
                                            <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

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
                                    className="w-full py-3 px-4 rounded-xl bg-[#d46b4e] hover:bg-[#b3573c] text-white font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#d46b4e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6 shadow-lg shadow-[#d46b4e]/20"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-[#d46b4e] hover:text-[#b3573c] transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
