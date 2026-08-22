import { Metadata } from "next";
import Link from "next/link";
import { Cookie, CheckCircle, Sliders, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Cookie Policy | La-Minks Cleaning Services",
    description: "Learn how La-Minks uses cookies and local storage to personalize and enhance your browsing experience.",
};

export default function CookiesPage() {
    return (
        <div className="bg-[#fafcf8] min-h-screen pb-24">
            {/* Header */}
            <section className="bg-[#f4f1ea] py-20 px-6 lg:px-20 border-b border-[#86a373]/10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#86a373] bg-[#86a373]/15 mb-4">
                        <Cookie className="w-3.5 h-3.5" />
                        Transparency
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Cookie Policy
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Learn how and why we use cookies to provide a smooth, secure booking experience.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 px-6 lg:px-20">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#86a373]/15 shadow-sm space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">What Are Cookies?</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Cookies are small data files placed on your computer or mobile device when you visit websites. They are widely used to make websites work efficiently, remember your login session, and provide reporting information.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-900">Types of Cookies We Use</h2>

                        <div className="p-6 rounded-2xl border border-zinc-100 bg-[#fafcf8] space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#86a373]/15 text-[#5c7a4d] rounded-lg">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">1. Strictly Necessary Cookies</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Essential for you to browse our site, authenticate your account, maintain secure sessions, and process cleaning bookings safely.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-zinc-100 bg-[#fafcf8] space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#d46b4e]/10 text-[#d46b4e] rounded-lg">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">2. Functionality & Preference Cookies</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                These allow the platform to remember choices you make (such as your address details or selected service options) to save you time.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border border-zinc-100 bg-[#fafcf8] space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <Sliders className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg">3. Analytics & Performance Cookies</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Help us understand how visitors interact with our quote tool and services, enabling us to continuously improve performance.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">Managing Your Preferences</h2>
                        <p className="text-slate-600 leading-relaxed">
                            You can choose to disable cookies through your browser settings. Please note that disabling essential cookies may impact your ability to log in or complete booking reservations.
                        </p>
                    </div>

                    <div className="border-t border-zinc-100 pt-8 flex items-center justify-between flex-wrap gap-4">
                        <span className="text-xs text-slate-400">Last updated: August 2026</span>
                        <Link href="/privacy" className="inline-flex items-center gap-2 text-sm font-bold text-[#d46b4e] hover:underline">
                            Read our Privacy Policy <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
