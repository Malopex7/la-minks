'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, LogIn, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginContent() {
    const { login, isLoading } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loginError, setLoginError] = useState('');

    const isTimeout = searchParams.get('timeout') === 'true';

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginValues) => {
        setLoginError('');
        try {
            const user = await login(data);
            if (user.role === 'admin') {
                router.push('/admin');
            } else if (user.role === 'staff') {
                router.push('/staff');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setLoginError((err as Error).message);
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
                    <div className="mb-8 text-center">
                        <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-[#d46b4e]/10 text-[#d46b4e] mb-4">
                            <LogIn className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome Back</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Sign in to manage your bookings and account.</p>
                    </div>

                    {isTimeout && (
                        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-sm border border-yellow-200 dark:border-yellow-800 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p><strong>Session Expired:</strong> Your session has timed out due to inactivity. Please sign in again to continue.</p>
                        </div>
                    )}

                    {loginError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                            <input
                                {...form.register('email')}
                                type="email"
                                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow"
                                placeholder="name@example.com"
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                            </div>
                            <input
                                {...form.register('password')}
                                type="password"
                                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d46b4e] transition-shadow"
                                placeholder="••••••••"
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 rounded-lg bg-[#d46b4e] hover:bg-[#b3573c] text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#d46b4e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

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
