'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, checkAuth, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!mounted || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    const getLinkClasses = (path: string, exact = false) => {
        const isActive = exact ? pathname === path : pathname.startsWith(path);
        return `flex items-center p-2 rounded-lg group transition-colors ${isActive
                ? 'bg-[#86a373]/20 text-[#d46b4e] font-bold dark:bg-gray-700 dark:text-white border-l-4 border-[#d46b4e]'
                : 'text-gray-900 border-l-4 border-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#d46b4e]'
            }`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0">
                <div className="flex-1 px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link href="/admin" className={getLinkClasses('/admin', true)}>
                                <span className="ms-3">Overview</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/services" className={getLinkClasses('/admin/services')}>
                                <span className="flex-1 ms-3 whitespace-nowrap">Services</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/bookings" className={getLinkClasses('/admin/bookings')}>
                                <span className="flex-1 ms-3 whitespace-nowrap">Bookings</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/admin/audit" className={`${getLinkClasses('/admin/audit')} gap-2`}>
                                <ShieldAlert className={`w-4 h-4 ${pathname.startsWith('/admin/audit') ? 'text-[#d46b4e]' : 'text-zinc-400'}`} />
                                <span className="flex-1 whitespace-nowrap">Audit Log</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-semibold">
                            {user.firstName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
