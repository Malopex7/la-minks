'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthNav() {
    const { user, checkAuth } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    if (!mounted) return <div className="w-16"></div>; // Placeholder space before hydration

    if (user) {
        const dashboardHref = user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard';
        const dashboardLabel = user.role === 'admin' ? 'Admin Dashboard' : user.role === 'staff' ? 'Staff Dashboard' : 'Dashboard';

        return (
            <Link href={dashboardHref} className="text-sm font-medium hover:text-[#d46b4e] transition-colors flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#86a373]/20 flex items-center justify-center text-[#86a373] font-bold">
                    {user.firstName?.charAt(0) || 'U'}
                </div>
                <span className="hidden sm:inline">{dashboardLabel}</span>
            </Link>
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
