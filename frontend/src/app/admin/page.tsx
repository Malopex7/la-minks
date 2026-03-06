"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { LayoutGrid, CalendarCheck, Clock, Banknote } from "lucide-react";

export default function AdminOverviewPage() {
    const { services, fetchServices, bookings, fetchAllBookings, isLoading } = useAdminStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchServices();
        fetchAllBookings();
    }, [fetchServices, fetchAllBookings]);

    if (!mounted || isLoading) {
        return <div className="p-8 text-zinc-500">Loading dashboard overview...</div>;
    }

    const activeServices = services.filter((s) => s.isActive).length;
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === "QUOTE" || b.status === "BOOKED").length;
    const totalRevenue = bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const stats = [
        {
            label: "Total Services",
            value: services.length,
            sub: `${activeServices} active`,
            icon: LayoutGrid,
            color: "text-violet-500",
            bg: "bg-violet-50 dark:bg-violet-900/20",
        },
        {
            label: "Total Bookings",
            value: totalBookings,
            sub: "all time",
            icon: CalendarCheck,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20",
        },
        {
            label: "Pending Bookings",
            value: pendingBookings,
            sub: "awaiting confirmation",
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
        },
        {
            label: "Completed Revenue",
            value: `R ${totalRevenue.toLocaleString()}`,
            sub: "from completed jobs",
            icon: Banknote,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    A high-level overview of your services and bookings.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                {label}
                            </span>
                            <div className={`p-2 rounded-lg ${bg}`}>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                {value}
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Bookings mini-table */}
            {bookings.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                        Recent Bookings
                    </h2>
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Customer</th>
                                    <th className="px-6 py-3 font-medium">Service</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {bookings.slice(0, 5).map((booking) => (
                                    <tr
                                        key={booking._id}
                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {booking.customerId?.firstName} {booking.customerId?.lastName}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {booking.customerId?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300">
                                            {booking.serviceId?.name || "—"}
                                        </td>
                                        <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                                            {booking.schedule?.date || booking.date ? new Date(booking.schedule?.date || booking.date || '').toLocaleDateString() : 'Invalid Date'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="px-6 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                                            R {booking.totalPrice}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    IN_PROGRESS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function StatusBadge({ status }: { status: string }) {
    const cls = statusColors[status] ?? "bg-zinc-100 text-zinc-600";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {status.replace("_", " ")}
        </span>
    );
}
