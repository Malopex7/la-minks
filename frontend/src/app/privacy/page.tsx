"use client";

import Link from "next/link";
import { Shield, Lock, Eye, FileText, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="bg-[#fafcf8] min-h-screen pb-24">
            {/* Header */}
            <section className="bg-[#f4f1ea] py-20 px-6 lg:px-20 border-b border-[#86a373]/10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#86a373] bg-[#86a373]/15 mb-4">
                        <Shield className="w-3.5 h-3.5" />
                        POPIA & Data Privacy
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Learn how La-Minks collects, uses, protects, and respects your personal information.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 px-6 lg:px-20">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#86a373]/15 shadow-sm space-y-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#86a373]/15 text-[#5c7a4d] rounded-lg">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">1. Commitment to Privacy (POPIA)</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            La-Minks Cleaning Services is committed to safeguarding your personal information in strict compliance with the South African <strong>Protection of Personal Information Act (POPIA)</strong>. This policy applies to all personal information collected through our web platform, booking systems, and support communications.
                        </p>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#d46b4e]/10 text-[#d46b4e] rounded-lg">
                                <Eye className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">2. Information We Collect</h2>
                        </div>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600 leading-relaxed">
                            <li><strong>Account & Contact Info:</strong> Full name, email address, phone/WhatsApp number.</li>
                            <li><strong>Service Address Details:</strong> Physical address, suburb, complex/estate name, and access instructions.</li>
                            <li><strong>Property Specifications:</strong> Number of bedrooms, bathrooms, square meterage, and optional property condition level.</li>
                            <li><strong>Transaction & Payment Data:</strong> Processed securely via Paystack. We do not store raw credit card numbers on our servers.</li>
                            <li><strong>Service Documentation:</strong> Before/after quality check photos taken by our cleaning specialists for quality assurance.</li>
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#86a373]/15 text-[#5c7a4d] rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">3. How We Use Your Information</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Your information is strictly used to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600 leading-relaxed mt-2">
                            <li>Generate accurate, instant pricing quotes.</li>
                            <li>Dispatch vetted cleaning specialists to your address.</li>
                            <li>Send booking confirmations, status notifications, and receipts.</li>
                            <li>Facilitate customer support inquiries and quality assessments.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Your Rights & Data Access</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Under POPIA, you have the right to request access to the personal data we hold about you, request corrections, or request deletion of your account and service records.
                        </p>
                        <p className="text-slate-600 leading-relaxed mt-3">
                            To exercise any of these rights, contact our Information Officer at <a href="mailto:info@cryobyte.co.za" className="text-[#d46b4e] font-medium underline">info@cryobyte.co.za</a>.
                        </p>
                    </div>

                    <div className="border-t border-zinc-100 pt-8 flex items-center justify-between flex-wrap gap-4">
                        <span className="text-xs text-slate-400">Last updated: August 2026</span>
                        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-[#d46b4e] hover:underline">
                            Contact Information Officer <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
