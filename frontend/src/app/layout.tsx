import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Link from "next/link";
import AuthNav from "@/components/AuthNav";
import TopNav from "@/components/TopNav";
import { Share2, Instagram, Mail, MapPin } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La-Minks | Premium Home Cleaning",
  description: "Experience a new standard of professional cleaning tailored for modern South African living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-[#fafcf8] text-slate-900 antialiased`}>
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
          {/* Navigation — exact Stitch design */}
          <header className="fixed top-0 left-0 z-50 w-full h-[120px] bg-white/90 backdrop-blur-md border-b border-[#86a373]/10 px-6 lg:px-20 py-2">
            <div className="flex items-center justify-between h-full">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/images/La-Minks-Logo.svg" alt="La-Minks Cleaning Services" width={200} height={200} className="h-[92px] w-auto" style={{ mixBlendMode: 'multiply' }} priority />
              </Link>
              <TopNav />
              <div className="flex items-center gap-6">
                <AuthNav />
                <Link href="/quote" className="bg-[#d46b4e] hover:bg-[#d46b4e]/90 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#d46b4e]/20 transition-all">
                  Get a Quote
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pt-[120px]">
            {children}
          </main>

          {/* Footer — exact Stitch design */}
          <footer className="bg-[#f4f1ea] text-slate-800 py-16 px-6 lg:px-20 border-t border-[#86a373]/10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-6">
                  <Image src="/images/La-Minks-Logo.svg" alt="La-Minks Cleaning Services" width={160} height={160} className="h-16 w-auto" style={{ mixBlendMode: 'multiply' }} />
                </div>
                <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
                  Premium cleaning services for discerning homeowners. Bringing beauty and balance back to your living space.
                </p>
                <div className="flex gap-4">
                  <a
                    className="w-10 h-10 rounded-full border border-[#86a373]/20 flex items-center justify-center text-slate-700 hover:bg-[#d46b4e] hover:text-white hover:border-[#d46b4e] transition-all"
                    href="https://wa.me/27712345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp Us"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                  <a
                    className="w-10 h-10 rounded-full border border-[#86a373]/20 flex items-center justify-center text-slate-700 hover:bg-[#d46b4e] hover:text-white hover:border-[#d46b4e] transition-all"
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    className="w-10 h-10 rounded-full border border-[#86a373]/20 flex items-center justify-center text-slate-700 hover:bg-[#d46b4e] hover:text-white hover:border-[#d46b4e] transition-all"
                    href="mailto:info@cryobyte.co.za"
                    title="Email Support"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/about">About Us</Link></li>
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/services">Our Services</Link></li>
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/quote">Pricing Plans</Link></li>
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/faqs">FAQs</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Legal</h4>
                <ul className="space-y-4 text-sm">
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/privacy">Privacy Policy</Link></li>
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/terms">Terms of Service</Link></li>
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/cookies">Cookie Policy</Link></li>
                  <li><Link className="hover:text-[#d46b4e] transition-colors" href="/contact">Contact Support</Link></li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#86a373]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} La-Minks Premium Cleaning. All rights reserved.</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#86a373]" />
                <span>Johannesburg, South Africa</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
