"use client";

import Link from "next/link";
import {
    BookOpen,
    Briefcase,
    CheckCircle2,
    Camera,
    FileText,
    Clock,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    CheckSquare
} from "lucide-react";

export default function StaffGuidePage() {
    return (
        <div className="max-w-5xl space-y-10 pb-16">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-[#86a373]/15 text-[#5c7a4d] rounded-xl">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Cleaning Specialist Operational Guide
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Step-by-step handbook for managing jobs, checklists, photo verifications, and client standards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Jump Navigation */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <a
                    href="#dashboard"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <Briefcase className="w-5 h-5 text-[#86a373] shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">1. My Jobs</p>
                        <p className="text-xs text-zinc-500">Today & Upcoming</p>
                    </div>
                </a>

                <a
                    href="#status-workflow"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">2. Job Workflow</p>
                        <p className="text-xs text-zinc-500">Check-in & Status</p>
                    </div>
                </a>

                <a
                    href="#checklists"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <CheckSquare className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">3. Checklists</p>
                        <p className="text-xs text-zinc-500">Task Execution</p>
                    </div>
                </a>

                <a
                    href="#photos"
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-[#86a373] transition-colors flex items-center gap-3 shadow-sm"
                >
                    <Camera className="w-5 h-5 text-purple-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">4. Photos & Notes</p>
                        <p className="text-xs text-zinc-500">Before & After</p>
                    </div>
                </a>
            </div>

            {/* Section 1: Dashboard & Assignments */}
            <section id="dashboard" className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <Briefcase className="w-6 h-6 text-[#86a373]" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">1. Understanding Your Jobs Dashboard</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#86a373]">Today&apos;s Jobs</span>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1 mb-2">Priority Focus</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Jobs scheduled for the current calendar date. Tap the arrow button on any card to view address, client contact details, and start the job.
                        </p>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Upcoming Jobs</span>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1 mb-2">Advance Schedule</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Future scheduled assignments so you can plan routes, check equipment requirements, and anticipate special extras.
                        </p>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Recently Completed</span>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1 mb-2">Finished Log</h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Completed jobs with verified before/after photos and finalized checklists for your review.
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <Link
                        href="/staff"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#5c7a4d] hover:text-[#3a4f41]"
                    >
                        Go to My Jobs Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Section 2: On-Site Job Workflow */}
            <section id="status-workflow" className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <Clock className="w-6 h-6 text-amber-500" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">2. Step-by-Step On-Site Workflow</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-4 items-start p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                            1
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Arrive on Site & Set Status to &ldquo;IN PROGRESS&rdquo;</h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                Upon arrival, open the job details page, set the status dropdown to <strong>IN PROGRESS</strong>, and tap <strong>Update Status</strong>. The customer is immediately notified in their app.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                            2
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Upload Initial Before Photos</h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                Take 2–4 photos of the rooms and any pre-existing marks/scratches. Upload them under <strong>Job Verification Photos &rarr; Before Photos</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                            3
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Execute Tasks & Check off Checklist</h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                Work through each room following the dynamic multi-point checklist. Tap <strong>Save Checklist</strong> to broadcast real-time progress to the customer dashboard.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                            4
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Upload After Photos & Mark &ldquo;COMPLETED&rdquo;</h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                Capture after photos showcasing spotless finishes. Add any private staff notes, select <strong>COMPLETED</strong>, and tap <strong>Update Status</strong> to finish the job.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Dynamic Checklists */}
            <section id="checklists" className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <CheckSquare className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">3. Using the Dynamic Cleaning Checklist</h2>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    The platform generates a customized checklist based on the exact service booked by the client:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-2 border border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#d46b4e]" /> Deep Clean & Move-In Checklist
                        </h3>
                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                            <li>Dust ceiling corners, vents, and baseboards</li>
                            <li>Clean inside/outside ovens, fridges, and microwaves</li>
                            <li>Descale bathroom tiles, taps, and shower screens</li>
                            <li>Clean inside empty cupboards and drawers</li>
                            <li>Wash interior windows, frames, and tracks</li>
                        </ul>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl space-y-2 border border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Standard Clean Checklist
                        </h3>
                        <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                            <li>Dust all open horizontal surfaces and tables</li>
                            <li>Wipe appliance exteriors and kitchen counters</li>
                            <li>Scrub and disinfect toilets, tubs, and basins</li>
                            <li>Vacuum carpets and mop hard floor surfaces</li>
                            <li>Empty trash bins and replace liners</li>
                        </ul>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-1">
                        Adding Custom Client Tasks
                    </h4>
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                        If a client makes a specific on-site request (e.g. <em>&ldquo;Please pay special attention to patio glass&rdquo;</em>), type it into the <strong>&ldquo;Add a custom task...&rdquo;</strong> box and tap <strong>Add</strong>.
                    </p>
                </div>
            </section>

            {/* Section 4: Photo Verification & Notes */}
            <section id="photos" className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <Camera className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">4. Photos, Notes & Client Care</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Camera className="w-4 h-4 text-purple-500" /> Photo Verification Guidelines
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Always take clear, well-lit photos. Photos are stored securely in GridFS and are displayed directly on the client&apos;s digital job receipt.
                        </p>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl">
                            <p><strong>Before:</strong> Wide angle of room + close-up of heavy soiled areas.</p>
                            <p><strong>After:</strong> Same angles showing clean, polished finishes.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-500" /> Staff Private Notes
                        </h3>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Use the Staff Notes box to record property nuances (e.g. gate codes, key drop locations, delicate ornaments, pet safety reminders). These notes are private to staff and administrators.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 5: Standards & Support */}
            <section className="bg-[#f4f1ea] dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-[#86a373]/20 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#86a373]" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Emergency & On-Site Support</h2>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed max-w-2xl">
                    If you experience any client access difficulties, equipment malfunctions, or on-site emergencies, contact Admin Dispatch immediately. Never leave a property unsecured.
                </p>
                <div className="pt-2">
                    <Link
                        href="/staff"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#86a373] hover:bg-[#6e8a5c] text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                        Return to My Jobs
                    </Link>
                </div>
            </section>
        </div>
    );
}
