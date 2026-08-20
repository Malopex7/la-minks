'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

import { LogOut } from 'lucide-react';

export default function AuthNav() {
    const { user, checkAuth, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    if (!mounted) return <div className="w-16"></div>; // Placeholder space before hydration

    if (user) {
        const isAdminUser = user.role === 'admin' || user.role === 'superadmin';
        const dashboardHref = isAdminUser ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard';
        const dashboardLabel = user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin Dashboard' : user.role === 'staff' ? 'Staff Dashboard' : 'Dashboard';

        return (
            <div className="flex items-center gap-3">
                <Link href={dashboardHref} className="text-sm font-semibold text-slate-700 hover:text-[#d46b4e] transition-colors">
                    {dashboardLabel}
                </Link>
                <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                    title="Sign Out"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-[#d46b4e] transition-colors">
                Log In
            </Link>
            <Link href="/register" className="text-sm font-medium hover:text-[#d46b4e] transition-colors hidden sm:block">
                Sign Up
            </Link>
        </div>
    );
}
