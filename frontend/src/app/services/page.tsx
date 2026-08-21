"use client";

import { useEffect, useState } from "react";
import { usePublicStore } from "@/store/publicStore";
import Link from "next/link";
import Image from "next/image";

/* Exact Stitch-generated service data for all 11 La-Minks services */
const STITCH_SERVICES = [
    {
        name: "Home Cleaning",
        description: "Professional daily or weekly maintenance to keep your living spaces consistently spotless and comfortable.",
        image: "/images/Services/Home Cleaning.jpg",
        price: "R450",
    },
    {
        name: "Office Cleaning",
        description: "Boost productivity with a clean workplace. We handle desks, common areas, and meeting rooms with care.",
        image: "/images/Services/Office Cleaning.png",
        price: "R650",
    },
    {
        name: "Window Cleaning",
        description: "Crystal clear views for your home or business. We clean frames, sills, and glass for a streak-free finish.",
        image: "/images/Services/Window Cleaning.png",
        price: "R300",
    },
    {
        name: "Carpet Cleaning",
        description: "Deep steam cleaning that removes allergens, dust mites, and tough stains from your carpets.",
        image: "/images/Services/Carpet Cleaning.png",
        price: "R400",
    },
    {
        name: "Move Out Cleaning",
        description: "Ensuring smooth transitions and deposit returns with a comprehensive, top-to-bottom scrub of your property.",
        image: "/images/Services/Move Out Cleaning.jpg",
        price: "R1200",
    },
    {
        name: "Upholstery Cleaning",
        description: "Restore the beauty of your sofas and armchairs with our gentle yet effective upholstery care.",
        image: "/images/Services/Upholstery Cleaning.png",
        price: "R350",
    },
    {
        name: "Afterparty Cleaning",
        description: "Enjoy your celebration without the cleanup stress. We'll handle the venue and room mess while you rest.",
        image: "/images/Services/Afterparty Cleaning.png",
        price: "R800",
    },
    {
        name: "New House Cleaning",
        description: "Post-construction, renovation, or pre-move-in cleaning to ensure your new space is perfectly sanitized and ready.",
        image: "/images/Services/New House Cleaning.png",
        price: "R1500",
    },
    {
        name: "Bedroom Cleaning",
        description: "Specialized attention to your sanctuary: linen changes, dusting, and deep vacuuming for a peaceful sleep.",
        image: "/images/Services/Bedroom Cleaning.png",
        price: "R250",
    },
    {
        name: "Painting",
        description: "Refresh your interiors with a professional coat of paint. Clean edges and flawless finishes guaranteed.",
        image: "/images/Services/Painting Service.png",
        price: "Get a Quote",
    },
    {
        name: "Gardening",
        description: "Professional lawn mowing, weeding, and garden maintenance to keep your outdoor spaces lush and tidy.",
        image: "/images/Services/Gardening Service.png",
        price: "R500",
    },
    {
        name: "Grass Cutting",
        description: "Specialized lawn care including edging, trimming, and full lawn restoration.",
        image: "/images/Services/Grass Cutting.png",
        price: "R300",
    },
];

export default function ServicesPage() {
    const { services, fetchActiveServices, isLoading } = usePublicStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchActiveServices();
    }, [fetchActiveServices]);

    if (!mounted) return null;

    /* Use backend services if available, otherwise fall back to Stitch static data */
    const displayServices = services.length > 0
        ? services.map((s, i) => ({
            id: s._id,
            name: s.name,
            description: s.description || STITCH_SERVICES.find(ss => ss.name === s.name)?.description || "A premium cleaning offering.",
            image: STITCH_SERVICES[i % STITCH_SERVICES.length].image,
            price: s.basePrice ? `R${s.basePrice.toFixed(0)}` : "Get a Quote",
        }))
        : STITCH_SERVICES.map((s, i) => ({ id: String(i), ...s }));

    return (
        <>
            {/* Page Header — exact Stitch design */}
            <section className="bg-[#f3eae7] py-16 lg:py-24 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Our Services</h2>
                        <p className="text-lg text-slate-600 font-medium leading-relaxed">
                            From routine maintenance and deep cleans to gardening and painting, La-Minks offers a comprehensive range of professional cleaning and property care services tailored to the highest South African standards.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services Grid — exact Stitch card design with all 11 services */}
            <main className="flex-grow px-6 lg:px-20 py-20 bg-[#fcf9f8]">
                <div className="max-w-7xl mx-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d46b4e]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {displayServices.map((service) => (
                                <div key={service.id} className="group bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-[#f3eae7]">
                                    <div className="relative aspect-[4/3] w-full mb-6 overflow-hidden rounded-xl">
                                        <Image
                                            src={service.image}
                                            alt={service.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex flex-col h-full space-y-3">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <h3 className="text-xl font-bold text-slate-900">{service.name}</h3>
                                            <span className="px-3 py-1 bg-[#8da399]/10 text-[#8da399] text-xs font-bold rounded-full whitespace-nowrap">
                                                {service.price.startsWith("R") ? `Starting from ${service.price}` : service.price}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed pb-4">
                                            {service.description}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-[#f3eae7]">
                                            <Link className="inline-flex items-center gap-2 text-[#d46b4e] font-bold text-sm hover:gap-3 transition-all" href={`/quote?service=${service.id}`}>
                                                Book This Service
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
