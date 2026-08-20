"use client";

import Link from "next/link";
import { Scale, CheckCircle, AlertCircle, CreditCard, ArrowRight } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="bg-[#fafcf8] min-h-screen pb-24">
            {/* Header */}
            <section className="bg-[#f4f1ea] py-20 px-6 lg:px-20 border-b border-[#86a373]/10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#d46b4e] bg-[#d46b4e]/10 mb-4">
                        <Scale className="w-3.5 h-3.5" />
                        Legal Agreement
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Terms of Service
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Please review the terms and conditions governing bookings, payments, and services on La-Minks.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 px-6 lg:px-20">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#86a373]/15 shadow-sm space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#d46b4e]/10 text-[#d46b4e] rounded-lg">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">1. Service Booking & Quotes</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Quotes provided through our online quote calculator are based on the room count, square meterage, condition level, and extras you specify. If upon arrival our team finds the property condition or scope significantly exceeds the initial description, we reserve the right to adjust the booking price in consultation with you before commencing.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#86a373]/15 text-[#5c7a4d] rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">2. Payments & Billing</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            All prices are quoted in South African Rands (ZAR). Payment is processed securely via our payment partner, Paystack. Bookings may be secured online or invoiced according to approved corporate agreements.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">3. Cancellations & Rescheduling</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            We understand that plans change. You may reschedule or cancel your booking free of charge up to <strong>24 hours prior</strong> to your scheduled appointment. Cancellations made within 24 hours of the service time may be subject to a nominal late cancellation fee to compensate scheduled staff.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Satisfaction Guarantee & Claims</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Your happiness is our priority. If you are unsatisfied with any aspect of the cleaning, please notify us within 24 hours of completion with photos of the affected area. We will promptly dispatch a supervisor or team member to rectify the issue free of charge.
                        </p>
                    </div>

                    <div className="border-t border-zinc-100 pt-8 flex items-center justify-between flex-wrap gap-4">
                        <span className="text-xs text-slate-400">Effective Date: August 2026</span>
                        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[#d46b4e] hover:underline">
                            Questions about our terms? Contact Us <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
