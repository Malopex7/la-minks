'use client';

import { Suspense } from 'react';
import { useQuoteStore } from '@/store/useQuoteStore';
import ServiceSelection from '@/components/quote/ServiceSelection';
import ServiceDetails from '@/components/quote/ServiceDetails';
import SelectExtras from '@/components/quote/SelectExtras';
import AddressInput from '@/components/quote/AddressInput';
import ScheduleSelection from '@/components/quote/ScheduleSelection';
import ReviewQuote from '@/components/quote/ReviewQuote';

export default function QuotePage() {
    const step = useQuoteStore((state) => state.step);

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

