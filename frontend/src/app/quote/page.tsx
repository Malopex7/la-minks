'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuoteStore } from '@/store/useQuoteStore';
import { useAuthStore } from '@/store/useAuthStore';
import ServiceSelection from '@/components/quote/ServiceSelection';
import ServiceDetails from '@/components/quote/ServiceDetails';
import SelectExtras from '@/components/quote/SelectExtras';
import AddressInput from '@/components/quote/AddressInput';
import ScheduleSelection from '@/components/quote/ScheduleSelection';
import ReviewQuote from '@/components/quote/ReviewQuote';
import { ShieldAlert, Briefcase, LogOut } from 'lucide-react';

export default function QuotePage() {
    const step = useQuoteStore((state) => state.step);
    const { user, checkAuth, logout } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkAuth();
    }, [checkAuth]);

    // If logged in as cleaner/staff, restrict access
    if (mounted && user?.role === 'staff') {
        return (
            <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-amber-200 text-center space-y-6">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Staff Account Access Notice</h2>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Cleaners and staff members are not permitted to generate quotes or book cleaning services. Please visit your Staff Portal to manage assigned jobs.
                        </p>
                    </div>

                    <div className="pt-2 space-y-3">
                        <Link
                            href="/staff"
                            className="w-full inline-flex items-center justify-center gap-2 bg-[#86a373] hover:bg-[#728f5f] text-white py-3 px-4 rounded-xl font-bold transition-all shadow-md shadow-[#86a373]/20"
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>Go to Staff Portal</span>
                        </Link>
                        <button
                            onClick={async () => {
                                await logout();
                                router.push('/login');
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out / Switch Account</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:bg-white print:min-h-0">
            <div className="max-w-3xl mx-auto print:max-w-none print:w-full print:m-0">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 print:p-0 print:shadow-none print:rounded-none print:border-none">
                    <div className="mb-8 wizard-header no-print">
                        <h1 className="text-3xl font-extrabold text-slate-900 border-b pb-4">
                            Get a Free Quote
                        </h1>
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 font-medium">
                            <span>Step {step} of 6</span>
                            <div className="w-2/3 bg-slate-100 rounded-full h-2.5 ml-4">
                                <div
                                    className="bg-[#d46b4e] h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(step / 6) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <Suspense fallback={<div className="animate-pulse flex space-x-4">Loading step...</div>}>
                        {step === 1 && <ServiceSelection />}
                        {step === 2 && <ServiceDetails />}
                        {step === 3 && <SelectExtras />}
                        {step === 4 && <AddressInput />}
                        {step === 5 && <ScheduleSelection />}
                        {step === 6 && <ReviewQuote />}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}


