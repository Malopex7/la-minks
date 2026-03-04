"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/adminStore";

export default function AdminOverviewPage() {
    const { services, fetchServices, isLoading } = useAdminStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchServices();
    }, [fetchServices]);

    if (!mounted || isLoading) {
        return <div className="p-8">Loading dashboard overview...</div>;
    }

    const activeServices = services.filter((s) => s.isActive).length;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Services Card */}
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Services</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <path d="M2 10h20" />
                        </svg>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="text-2xl font-bold">{services.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeServices} active services
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
