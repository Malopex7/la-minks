"use client";

import Link from "next/link";
import {
    BookOpen,
    LayoutDashboard,
    Sparkles,
    CalendarCheck,
    Camera,
    Download,
    ShieldAlert,
    HelpCircle,
    UserCheck,
    ArrowRight
} from "lucide-react";

export default function AdminGuidePage() {
    return (
        <div className="max-w-5xl space-y-10 pb-16">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-[#d46b4e]/10 text-[#d46b4e] rounded-xl">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Admin How-To Guide
                        </h1>
                        <p className="text-sm text-zinc-500">
                            A quick-start operational reference for managing services, bookings, staff, and audits.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Jump Navigation */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                    href="#overview"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <LayoutDashboard className="w-5 h-5 text-violet-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">1. Overview</p>
                        <p className="text-xs text-zinc-500">KPIs & Metrics</p>
                    </div>
                </a>

                <a
                    href="#services"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <Sparkles className="w-5 h-5 text-[#d46b4e] shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">2. Services</p>
                        <p className="text-xs text-zinc-500">Create & Edit</p>
                    </div>
                </a>

                <a
                    href="#bookings"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <CalendarCheck className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">3. Bookings</p>
                        <p className="text-xs text-zinc-500">Staff & Statuses</p>
                    </div>
                </a>

                <a
                    href="#audit"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <ShieldAlert className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">4. Audit Logs</p>
                        <p className="text-xs text-zinc-500">Event History</p>
                    </div>
                </a>
            </div>

            {/* Section 1: Dashboard Overview */}
            <section id="overview" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-lg">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        1. Dashboard Overview & Key Metrics
                    </h2>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    The <Link href="/admin" className="text-[#d46b4e] font-semibold underline">Overview Page</Link> gives you an executive summary of your cleaning operation:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Total & Active Services</p>
                        <p className="text-xs text-zinc-500 mt-1">Tracks how many cleaning service packages are live and bookable by customers.</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Total & Pending Bookings</p>
                        <p className="text-xs text-zinc-500 mt-1">Shows all-time volume and identifies quotes/reservations needing staff dispatch.</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Completed Revenue (ZAR)</p>
                        <p className="text-xs text-zinc-500 mt-1">Live calculation of settled revenue from jobs marked as <span className="font-mono text-emerald-600 font-bold">COMPLETED</span>.</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Recent Bookings Quick-Look</p>
                        <p className="text-xs text-zinc-500 mt-1">Shows the latest 5 reservations with direct status tags and formatted price totals.</p>
                    </div>
                </div>
            </section>

            {/* Section 2: Services Management */}
            <section id="services" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="p-2 bg-[#d46b4e]/10 text-[#d46b4e] rounded-lg">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        2. Managing Cleaning Services
                    </h2>
                </div>

                <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="space-y-2">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Creating a New Service:</h3>
                        <ol className="list-decimal pl-6 space-y-1.5 leading-relaxed">
                            <li>Go to <Link href="/admin/services" className="text-[#d46b4e] font-semibold underline">Services Management</Link>.</li>
                            <li>Click the <strong>+ Add Service</strong> button in the top right.</li>
                            <li>Enter the service name (e.g. <em>Deep Sanitization & Steaming</em>), starting base rate in Rands, and description.</li>
                            <li>Ensure the <strong>Active</strong> toggle is switched on to publish it immediately to the public quote calculator.</li>
                            <li>Click <strong>Save</strong> to commit to the database.</li>
                        </ol>
                    </div>

                    <div className="space-y-2 pt-2">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Deactivating vs. Deleting:</h3>
                        <p className="leading-relaxed">
                            If a seasonal service is paused, switch its status to <strong>Inactive</strong> instead of deleting it. This hides the service from new customer quotes while preserving all previous booking records and financial analytics.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 3: Bookings & Staff Dispatch */}
            <section id="bookings" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <CalendarCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        3. Bookings, Staff Dispatch & Quality Control
                    </h2>
                </div>

                {/* Status lifecycle flow */}
                <div>
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider mb-3">
                        Booking Status Lifecycle
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">1. QUOTE</span>
                        <span className="text-zinc-400">→</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">2. BOOKED</span>
                        <span className="text-zinc-400">→</span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">3. CONFIRMED</span>
                        <span className="text-zinc-400">→</span>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">4. IN_PROGRESS</span>
                        <span className="text-zinc-400">→</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">5. COMPLETED</span>
                    </div>
                </div>

                {/* Staff Assignment & Conflict Detection */}
                <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-sm">
                        <UserCheck className="w-4 h-4" />
                        Intelligent Double-Booking Conflict Detection
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-300/80 leading-relaxed">
                        When assigning a staff member from the dropdown in <Link href="/admin/bookings" className="underline font-semibold">Bookings</Link>, the system verifies their existing assignments. If they already have an active job overlapping that time slot, the assignment will be blocked and an alert will indicate the conflicting schedule.
                    </p>
                </div>

                {/* Photos & Lightbox */}
                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
                        <Camera className="w-4 h-4 text-emerald-600" />
                        Before & After Photo Lightbox Inspection
                    </h3>
                    <p className="leading-relaxed">
                        In the Bookings table, rows with photos will display a chevron arrow (<span className="font-mono">⌄</span>). Click it to expand the thumbnail gallery, and click any photo to inspect high-resolution quality photos in the lightbox.
                    </p>
                </div>

                {/* Export CSV */}
                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
                        <Download className="w-4 h-4 text-emerald-600" />
                        Exporting CSV Reports
                    </h3>
                    <p className="leading-relaxed">
                        Click the <strong>Export CSV</strong> button at the top of the Bookings page to download a spreadsheet with complete customer details, property dimensions, extras, timestamps, amounts in Rands, and Paystack reference keys.
                    </p>
                </div>
            </section>

            {/* Section 4: Audit Logs */}
            <section id="audit" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        4. System Audit Logs & Traceability
                    </h2>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    The <Link href="/admin/audit" className="text-[#d46b4e] font-semibold underline">Audit Log</Link> records every critical event for compliance and traceability:
                </p>

                <ul className="list-disc pl-6 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    <li><strong>CREATE:</strong> Records new services and initial booking submissions.</li>
                    <li><strong>STATUS_CHANGE:</strong> Logs every time a booking transitions from one status to another.</li>
                    <li><strong>STAFF_ASSIGNED:</strong> Logs staff dispatch and assignment modifications.</li>
                    <li><strong>Filters:</strong> Filter by entity type (<em>Booking, Service, User</em>) or search by action keywords.</li>
                </ul>
            </section>

            {/* Section 5: Super Admin User Management */}
            <section id="users" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        5. Super Admin: User Creation & Role Management
                    </h2>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Super Administrators have exclusive access to the <Link href="/admin/users" className="text-[#d46b4e] font-semibold underline">User Management Portal</Link> to provision, inspect, edit, and delete accounts:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Create Any User Role</p>
                        <p className="text-xs text-zinc-500 mt-1">Create Super Admins, Admins, Staff, and Customers with initial passwords and pre-verified email status.</p>
                    </div>
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Edit & Password Resets</p>
                        <p className="text-xs text-zinc-500 mt-1">Update names, phone, role assignments, or reset passwords directly from the modal editor.</p>
                    </div>
                </div>
            </section>

            {/* Help Callout */}
            <div className="bg-[#f4f1ea] dark:bg-zinc-800/50 rounded-3xl p-8 text-center border border-[#86a373]/15 space-y-3">
                <HelpCircle className="w-8 h-8 text-[#d46b4e] mx-auto" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Need Technical Assistance?</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    For database queries, email transporter configurations, or account permissions, contact the engineering team.
                </p>
                <div className="pt-2">
                    <a
                        href="mailto:info@cryobyte.co.za"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#d46b4e] hover:bg-[#b3573c] text-white text-sm font-bold shadow transition-colors"
                    >
                        Email Tech Support <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
