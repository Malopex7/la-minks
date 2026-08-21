'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Briefcase } from 'lucide-react';

export default function AuthNav() {
    const { user, checkAuth, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    if (!mounted) {
        return (
            <div className="flex items-center gap-4">
                <div className="w-16"></div>
                <div className="bg-[#d46b4e] text-white px-6 py-2.5 rounded-full text-sm font-bold opacity-0">
                    Get a Quote
                </div>
            </div>
        );
    }

    if (user) {
        const isAdminUser = user.role === 'admin' || user.role === 'superadmin';
        const isStaffUser = user.role === 'staff';
        const dashboardHref = isAdminUser ? '/admin' : isStaffUser ? '/staff' : '/dashboard';
        const dashboardLabel = user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin Dashboard' : isStaffUser ? 'Staff Portal' : 'Dashboard';

        return (
            <div className="flex items-center gap-4">
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

                {isStaffUser ? (
                    <Link
                        href="/staff"
                        className="bg-[#86a373] hover:bg-[#728f5f] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#86a373]/20 transition-all flex items-center gap-1.5"
                    >
                        <Briefcase className="w-4 h-4" />
                        <span>My Jobs</span>
                    </Link>
                ) : (
                    <Link
                        href="/quote"
                        className="bg-[#d46b4e] hover:bg-[#d46b4e]/90 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#d46b4e]/20 transition-all"
                    >
                        Get a Quote
                    </Link>
                )}
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
            <Link
                href="/quote"
                className="bg-[#d46b4e] hover:bg-[#d46b4e]/90 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#d46b4e]/20 transition-all"
            >
                Get a Quote
            </Link>
        </div>
    );
}

