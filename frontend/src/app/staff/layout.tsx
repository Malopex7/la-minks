'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { Briefcase, LogOut, Loader2, Sparkles } from 'lucide-react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const { user, checkAuth, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (mounted && !user) {
            router.push('/login');
        } else if (mounted && user && user.role !== 'staff' && user.role !== 'admin') {
            router.push('/dashboard'); // kick customers out
        }
    }, [user, mounted, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!mounted || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-120px)] bg-zinc-50 dark:bg-zinc-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col h-[calc(100vh-120px)] sticky top-[120px]">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <Sparkles className="h-6 w-6 text-[#86a373]" />
                        <span className="text-[#3a4f41]">La-Minks Staff</span>
                    </Link>
                </div>

                <div className="p-4 flex-1">
                    <div className="mb-6 px-2">
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">My Work</h3>
                        <nav className="space-y-1">
                            <Link
                                href="/staff"
                                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname === '/staff' || pathname.startsWith('/staff/bookings')
                                    ? 'bg-[#86a373]/10 text-[#5c7a4d] font-medium'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Assigned Jobs
                            </Link>
                        </nav>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-[#86a373]/20 flex items-center justify-center text-[#5c7a4d] font-semibold">
                            {user.firstName?.charAt(0) || 'S'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-zinc-500 truncate capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="md:hidden h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <Sparkles className="h-5 w-5 text-[#86a373]" />
                        <span className="text-[#3a4f41]">La-Minks</span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-zinc-900">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 md:p-8 max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
