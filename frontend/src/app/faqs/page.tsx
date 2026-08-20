"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, Search, Sparkles, ArrowRight } from "lucide-react";

interface FAQItem {
    q: string;
    a: string;
    category: 'General' | 'Pricing & Payment' | 'Service & Safety';
}

const FAQS_DATA: FAQItem[] = [
    {
        category: "General",
        q: "What areas in South Africa do you service?",
        a: "We currently provide comprehensive coverage across Johannesburg and Gauteng (including Sandton, Rosebank, Randburg, Fourways, Midrand, Centurion, and Pretoria). We are continuously expanding to other major metros."
    },
    {
        category: "General",
        q: "Do I need to be home during the cleaning?",
        a: "Not necessarily! Many of our clients provide access instructions or leave keys with building security. Our vetted professionals ensure your space is treated with utmost care and respect."
    },
    {
        category: "Service & Safety",
        q: "Are your cleaning products safe for pets and children?",
        a: "Yes, absolutely. We prioritize eco-friendly, biodegradable, non-toxic formulations that leave no harmful chemical residues, ensuring safety for your loved ones and pets."
    },
    {
        category: "Service & Safety",
        q: "Are the cleaning specialists background checked?",
        a: "Yes, 100%. Every La-Minks specialist undergoes strict criminal background vetting, reference checks, identity verification, and multi-week hospitality training before entering any client home."
    },
    {
        category: "Pricing & Payment",
        q: "How does your pricing work?",
        a: "Our transparent pricing is based on your property specifications (bedrooms, bathrooms, square meterage) and condition level. You receive a guaranteed price upfront through our instant quote tool before booking."
    },
    {
        category: "Pricing & Payment",
        q: "What payment methods do you accept?",
        a: "We process secure payments online powered by Paystack, supporting Visa, Mastercard, EFT, and Instant Ozow. You only pay after confirming your booking details."
    },
    {
        category: "General",
        q: "How do I reschedule or cancel a booking?",
        a: "You can easily reschedule or manage your bookings from your Customer Dashboard, or by reaching out to our support team at least 24 hours prior to your scheduled slot."
    },
    {
        category: "Service & Safety",
        q: "What if I am not satisfied with the cleaning?",
        a: "We stand behind our 100% Satisfaction Guarantee. If any designated area was missed, notify us within 24 hours and we will send a team member back to re-clean the area at no additional charge."
    }
];

export default function FAQsPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const categories = ["All", "General", "Service & Safety", "Pricing & Payment"];

    const filtered = FAQS_DATA.filter(item => {
        const matchesCategory = activeCategory === "All" || item.category === activeCategory;
        const matchesSearch = item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-[#fafcf8] min-h-screen pb-24">
            {/* Header */}
            <section className="bg-[#f4f1ea] py-20 px-6 lg:px-20 border-b border-[#86a373]/10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#d46b4e] bg-[#d46b4e]/10 mb-4">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Common Questions
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Everything you need to know about our services, pricing, safety standards, and booking process.
                    </p>

                    {/* Search bar */}
                    <div className="mt-8 max-w-lg mx-auto relative">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search questions or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-full border border-[#86a373]/20 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#86a373]"
                        />
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-16 px-6 lg:px-20">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat
                                    ? "bg-[#3a4f41] text-white shadow-sm"
                                    : "bg-white text-slate-600 border border-zinc-200 hover:bg-zinc-50"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Accordion list */}
                    <div className="space-y-4 pt-4">
                        {filtered.length === 0 ? (
                            <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-slate-500">
                                No questions found matching &ldquo;{search}&rdquo;. Try another search term or contact our support team.
                            </div>
                        ) : (
                            filtered.map((faq, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl border border-[#86a373]/15 shadow-sm overflow-hidden transition-colors"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : index)}
                                            className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                                        >
                                            <span className="font-semibold text-slate-900 text-base md:text-lg">
                                                {faq.q}
                                            </span>
                                            <div className={`p-1.5 rounded-full bg-zinc-100 text-slate-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 bg-[#d46b4e]/10 text-[#d46b4e]' : ''}`}>
                                                <ChevronDown className="w-4 h-4" />
                                            </div>
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-6 text-slate-600 text-sm md:text-base leading-relaxed border-t border-zinc-100 pt-4">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Support Callout */}
                    <div className="mt-16 bg-[#f4f1ea] rounded-3xl p-8 text-center border border-[#86a373]/15 space-y-4">
                        <Sparkles className="w-8 h-8 text-[#d46b4e] mx-auto" />
                        <h3 className="text-xl font-bold text-slate-900">Still have questions?</h3>
                        <p className="text-sm text-slate-600 max-w-md mx-auto">
                            Our friendly team is always ready to answer any questions or build a custom cleaning package for you.
                        </p>
                        <div className="pt-2 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/contact"
                                className="bg-[#d46b4e] hover:bg-[#b3573c] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
                            >
                                Contact Support <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/quote"
                                className="bg-white hover:bg-zinc-50 text-slate-800 border border-zinc-200 px-6 py-2.5 rounded-full text-sm font-bold transition-all"
                            >
                                Get a Quote
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
