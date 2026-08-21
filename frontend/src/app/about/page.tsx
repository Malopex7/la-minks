"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, HeartHandshake, Award, Clock, ArrowRight } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-[#fafcf8] min-h-screen pb-24">
            {/* Header / Hero */}
            <section className="bg-[#f4f1ea] py-20 px-6 lg:px-20 border-b border-[#86a373]/10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#d46b4e] bg-[#d46b4e]/10 mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        Our Story & Promise
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Elevating the Standard of Property & Space Care in South Africa
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        We believe a clean, well-maintained space is the foundation for a productive, balanced, and serene lifestyle.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-20 px-6 lg:px-20">
                <div className="max-w-5xl mx-auto space-y-16">
                    {/* Story Grid */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Crafting Pristine Spaces with Care & Precision
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                Founded with a dedication to meticulous hospitality and craftsmanship, <strong className="text-slate-800">La-Minks Cleaning Services</strong> delivers premium residential, commercial, and specialized property care across South Africa.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                From routine cleans and deep sanitation to gardening, window care, and painting, we combine rigorous hospitality standards, background-checked professionals, and eco-conscious products to ensure every space is revitalized.
                            </p>
                        </div>

                        {/* Stats card */}
                        <div className="grid grid-cols-2 gap-4 bg-white p-8 rounded-3xl border border-[#86a373]/15 shadow-sm">
                            <div className="p-4 bg-[#fafcf8] rounded-2xl border border-[#86a373]/10 text-center">
                                <p className="text-3xl font-extrabold text-[#d46b4e]">100%</p>
                                <p className="text-xs font-medium text-slate-600 mt-1">Vetted & Trained Staff</p>
                            </div>
                            <div className="p-4 bg-[#fafcf8] rounded-2xl border border-[#86a373]/10 text-center">
                                <p className="text-3xl font-extrabold text-[#86a373]">4.9★</p>
                                <p className="text-xs font-medium text-slate-600 mt-1">Customer Satisfaction</p>
                            </div>
                            <div className="p-4 bg-[#fafcf8] rounded-2xl border border-[#86a373]/10 text-center">
                                <p className="text-3xl font-extrabold text-[#86a373]">1,500+</p>
                                <p className="text-xs font-medium text-slate-600 mt-1">Spaces Transformed</p>
                            </div>
                            <div className="p-4 bg-[#fafcf8] rounded-2xl border border-[#86a373]/10 text-center">
                                <p className="text-3xl font-extrabold text-[#d46b4e]">24/7</p>
                                <p className="text-xs font-medium text-slate-600 mt-1">Online Booking</p>
                            </div>
                        </div>
                    </div>

                    {/* Core Pillars */}
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 text-center mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Why Clients & Property Owners Choose La-Minks
                        </h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-[#d46b4e]/10 text-[#d46b4e] flex items-center justify-center mb-4">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Strict Background Checks</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Every cleaner undergoes comprehensive identity verification and background vetting.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-[#86a373]/15 text-[#5c7a4d] flex items-center justify-center mb-4">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Hospitality Grade</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Standardized multi-point checklists ensure consistent, spotless results every time.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-[#d46b4e]/10 text-[#d46b4e] flex items-center justify-center mb-4">
                                    <HeartHandshake className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Eco-Friendly Care</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Pet and child-safe cleaning formulations that protect your surfaces and the environment.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                                <div className="w-12 h-12 rounded-xl bg-[#86a373]/15 text-[#5c7a4d] flex items-center justify-center mb-4">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Punctual & Flexible</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Reliable time slots and easy instant rescheduling whenever your schedule changes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Banner */}
                    <div className="bg-[#3a4f41] text-white rounded-3xl p-10 md:p-14 text-center space-y-6">
                        <h3 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Experience Pristine Spaces Today
                        </h3>
                        <p className="text-zinc-200 max-w-xl mx-auto text-base md:text-lg">
                            Get an instant, customized quote for your home, office, or property in less than 2 minutes.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 pt-2">
                            <Link
                                href="/quote"
                                className="bg-[#d46b4e] hover:bg-[#b3573c] text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-lg inline-flex items-center gap-2"
                            >
                                Get a Free Quote <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/services"
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3.5 rounded-full font-bold transition-all"
                            >
                                View All Services
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
