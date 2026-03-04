'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register, isLoading } = useAuthStore();
    const router = useRouter();
    const [registerError, setRegisterError] = useState('');

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    });

    const onSubmit = async (data: RegisterValues) => {
        setRegisterError('');
        try {
            await register(data);
            router.push('/dashboard');
        } catch (err) {
            setRegisterError((err as Error).message);
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
                        <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-4">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">Create an Account</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Join La-Minks to easily manage your home cleaning services.</p>
                    </div>

                    {registerError && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                            {registerError}
                        </div>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">First Name</label>
                                <input
                                    {...form.register('firstName')}
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    placeholder="John"
                                />
                                {form.formState.errors.firstName && (
                                    <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Last Name</label>
                                <input
                                    {...form.register('lastName')}
                                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                    placeholder="Doe"
                                />
                                {form.formState.errors.lastName && (
                                    <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                            <input
                                {...form.register('email')}
                                type="email"
                                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                placeholder="name@example.com"
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                            <input
                                {...form.register('password')}
                                type="password"
                                className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                                placeholder="••••••••"
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
