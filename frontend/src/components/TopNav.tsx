"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
    const pathname = usePathname();

    const getLinkClasses = (path: string) => {
        // Exact match for Home, startsWith for others like /services/cleaning
        const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);

        return `text-sm font-medium transition-colors ${isActive ? 'text-[#d46b4e] font-bold border-b-2 border-[#d46b4e] pb-1' : 'hover:text-[#d46b4e]'
            }`;
    };

    return (
        <nav className="hidden md:flex items-center gap-8">
            <Link className={getLinkClasses('/')} href="/">Home</Link>
            <Link className={getLinkClasses('/services')} href="/services">Services</Link>
            <Link className={getLinkClasses('/about')} href="/about">About Us</Link>
            <Link className={getLinkClasses('/faqs')} href="/faqs">FAQs</Link>
            <Link className={getLinkClasses('/contact')} href="/contact">Contact</Link>
        </nav>
    );
}
