"use client";

import Link from "next/link";
import Image from "next/image";

/* Service data matching prompt.md — with Material Symbols icon names */
const SERVICE_ICONS: Record<string, string> = {
  "Home Cleaning": "home",
  "Office Cleaning": "business",
  "Window Cleaning": "window",
  "Carpet Cleaning": "texture",
  "Move Out Cleaning": "local_shipping",
  "Upholstery Cleaning": "weekend",
  "Afterparty Cleaning": "celebration",
  "New House Cleaning": "house",
  "Bedroom Cleaning": "bed",
  "Painting": "format_paint",
  "Gardening": "yard",
  "Grass Cutting": "grass",
};

import { useEffect, useState } from "react";
import { usePublicStore } from "@/store/publicStore";

export default function Home() {
  const { services, fetchActiveServices, isLoading } = usePublicStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchActiveServices();
  }, [fetchActiveServices]);

  if (!mounted) return null;

  return (
    <>
      {/* Hero Section — exact Stitch design */}
      <section className="relative min-h-[85vh] flex items-center px-6 lg:px-20 py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#fafcf8] via-[#fafcf8]/80 to-transparent z-10"></div>
          <Image
            src="/images/hero_banner.png"
            alt="Modern sun-drenched living room"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-20 max-w-3xl">
          <span className="inline-block py-1.5 px-3.5 rounded-full bg-[#86a373]/15 text-[#5c7a4d] text-xs font-bold uppercase tracking-widest mb-4">
            Premium Cleaning Services
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.12] mb-6 [text-wrap:balance]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Space, <br className="hidden sm:inline" />
            <span className="text-[#d46b4e] italic font-normal">Beautifully</span> Cared&nbsp;For
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
            La-Minks Cleaning Services offers a new standard of professional cleaning tailored for modern South African living. From homes and offices to gardening, we bring pristine spaces to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/quote" className="bg-[#d46b4e] hover:bg-[#d46b4e]/90 text-white px-8 py-4 rounded-xl text-base font-bold shadow-xl shadow-[#d46b4e]/30 transition-all">
              Book Your First Clean
            </Link>
            <Link href="/services" className="bg-white hover:bg-slate-50 text-slate-900 px-8 py-4 rounded-xl text-base font-bold border border-slate-200 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">play_circle</span>
              See Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Service Categories — replaces generic features grid */}
      <section className="py-24 px-6 lg:px-20 bg-[#f4f1ea]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Our Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From deep cleans to gardening, La-Minks covers every corner of your home and workspace with professional South African care.</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d46b4e]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={`/services`}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-[#86a373]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-[#86a373]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#d46b4e]/10 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[#86a373] text-3xl group-hover:text-[#d46b4e] transition-colors">
                      {service.icon || SERVICE_ICONS[service.name] || "cleaning_services"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold mb-1">{service.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{service.description || "Premium cleaning service."}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Us Section — kept from Stitch */}
      <section className="py-24 px-6 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-slate-900 mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Why South Africans Choose La-Minks</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We combine traditional care with modern efficiency to provide a cleaning service that feels personal, professional, and perfectly timed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#fafcf8] p-10 rounded-2xl shadow-sm border border-[#86a373]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#86a373]/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#86a373] text-3xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Trusted Professionals</h3>
              <p className="text-slate-600 leading-relaxed">
                Our extensively vetted team members are more than cleaners—they are professionals dedicated to respecting and reviving your space.
              </p>
            </div>
            <div className="bg-[#fafcf8] p-10 rounded-2xl shadow-sm border border-[#86a373]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#86a373]/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#86a373] text-3xl">payments</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Pricing</h3>
              <p className="text-slate-600 leading-relaxed">
                No hidden fees or surprise costs. We provide clear, upfront quotes based on your specific property size and needs.
              </p>
            </div>
            <div className="bg-[#fafcf8] p-10 rounded-2xl shadow-sm border border-[#86a373]/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-[#86a373]/10 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#86a373] text-3xl">eco</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Eco-Friendly Products</h3>
              <p className="text-slate-600 leading-relaxed">
                Safe for your family, your pets, and the South African environment. We use premium sustainable solutions for every surface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — exact Stitch design */}
      <section className="py-24 px-6 lg:px-20">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
            <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrvnF0Z8WDeiXhqAPU5yIC8CbyKUM-JMQOVBVBcWBnJEbipI8uKlWrztnqHCFDN72-LJ0ZSwOGG_iEEh-sxiqFEzurue3juqS9HlJBAragNKGh83tlK00g-NhznCQJIpTzWUUILE5kV3VvlAE4IDYY6Gq-vKih-KTUuEcfVIlcAZPN-W0D8TD60pQU0tGnLJIxsZ9yFWLQOZX3K9uu1jB_pn48esqAsKDOU1kz5hr7rV5lOiKrfGu1nz8-DUspHPODHliE-EZmu1Mt" alt="Cleaning details" fill className="object-cover opacity-50" />
          </div>
          <div className="relative z-10 p-12 lg:p-20 lg:w-3/5 text-white">
            <h2 className="text-4xl mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Ready for a cleaner, happier space?</h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed">
              Join hundreds of satisfied property owners across the country who have rediscovered their free time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/quote" className="bg-[#d46b4e] hover:bg-[#d46b4e]/90 text-white px-8 py-4 rounded-xl text-base font-bold transition-all">
                Get Your Quote Today
              </Link>
              <Link href="/services" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-8 py-4 rounded-xl text-base font-bold transition-all">
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
