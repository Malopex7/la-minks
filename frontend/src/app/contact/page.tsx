"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="bg-[#fafcf8] min-h-screen pb-24">
            {/* Header Section */}
            <section className="bg-[#f4f1ea] py-20 px-6 lg:px-20 border-b border-[#86a373]/10">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#d46b4e] bg-[#d46b4e]/10 mb-4">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Get in Touch
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                        We&apos;re Here to Help
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        Have a question about our cleaning services, custom corporate inquiries, or need help with a booking?
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 px-6 lg:px-20">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
                    {/* Contact Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#d46b4e]/10 text-[#d46b4e] rounded-xl">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email Us</h3>
                                    <a
                                        href="mailto:info@cryobyte.co.za"
                                        className="text-base font-semibold text-slate-800 hover:text-[#d46b4e] transition-colors"
                                    >
                                        info@cryobyte.co.za
                                    </a>
                                    <p className="text-xs text-slate-500 mt-1">Average response time: &lt; 2 hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#86a373]/15 text-[#5c7a4d] rounded-xl">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">WhatsApp & Call</h3>
                                    <a
                                        href="https://wa.me/27712345678"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-base font-semibold text-slate-800 hover:text-[#5c7a4d] transition-colors"
                                    >
                                        +27 (0) 71 234 5678
                                    </a>
                                    <p className="text-xs text-slate-500 mt-1">Available Mon–Sat: 07:00 – 18:00</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-100 text-slate-700 rounded-xl">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Head Office</h3>
                                    <p className="text-sm font-semibold text-slate-800">
                                        Johannesburg, Gauteng, South Africa
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Servicing Sandton, Randburg, Midrand, Pretoria & surrounds</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#86a373]/15 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Operating Hours</h3>
                                    <p className="text-sm text-slate-700">Monday – Friday: 07:00 – 17:30</p>
                                    <p className="text-sm text-slate-700">Saturday: 08:00 – 15:00</p>
                                    <p className="text-xs text-slate-500 mt-1">Sunday & Public Holidays: By appointment</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div className="lg:col-span-3 bg-white p-8 md:p-10 rounded-3xl border border-[#86a373]/15 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Send us a Message
                        </h2>
                        <p className="text-sm text-slate-600 mb-8">
                            Fill out the form below and our customer care team will get back to you promptly.
                        </p>

                        {sent ? (
                            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                                <h3 className="text-lg font-bold text-emerald-900">Message Received!</h3>
                                <p className="text-sm text-emerald-700 max-w-sm mx-auto">
                                    Thank you for contacting La-Minks. One of our team members will respond to your inquiry shortly.
                                </p>
                                <button
                                    onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }}
                                    className="text-xs font-semibold text-emerald-800 underline pt-2"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="e.g. Lerato Khumalo"
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#86a373] text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            placeholder="lerato@example.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#86a373] text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Phone / WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        placeholder="082 123 4567"
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#86a373] text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Message *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={form.message}
                                        onChange={e => setForm({ ...form, message: e.target.value })}
                                        placeholder="Tell us about your space or any specific cleaning requirements..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#86a373] text-sm resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#d46b4e] hover:bg-[#b3573c] text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                                >
                                    <Send className="w-4 h-4" /> Send Inquiry
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
