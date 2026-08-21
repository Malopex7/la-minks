import { create } from 'zustand';

export type QuoteData = {
    serviceId?: string;
    serviceName?: string;
    // Store the selected service's required inputs schema (e.g. from the backend)
    serviceInputs: { name: string; type: string; label: string; placeholder?: string; required?: boolean }[];
    // Track the available extras config for the selected service
    serviceExtras: { name: string; price: number; estimatedAdditionalHours?: number; description?: string }[];
    // Track AI-suggested extras that are not in the DB
    aiExtras: { name: string; price: number; estimatedAdditionalHours: number }[];
    // Dynamic mapping of input answers, e.g. { numWindows: 12, conditionLevel: 'standard' }
    serviceDetails: Record<string, string | number | boolean>;
    extrasSelected: string[];
    address: {
        line1: string;
        suburb: string;
        city: string;
        province: string;
        postalCode: string;
    };
    schedule: {
        date?: Date;
        timeSlot?: string;
    };
    pricing?: {
        baseAmount: number;
        extrasAmount: number;
        aiExtrasAmount: number;
        totalAmount: number;
        estimatedHours: number;
    };
};

interface QuoteStore {
    step: number;
    data: QuoteData;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateData: (partialData: Partial<QuoteData>) => void;
    reset: () => void;
}

const initialData: QuoteData = {
    serviceInputs: [],
    serviceExtras: [],
    aiExtras: [],
    serviceDetails: {
        conditionLevel: 'standard', // Keeping a sensible default as many services still depend on this
    },
    extrasSelected: [],
    address: {
        line1: '',
        suburb: '',
        city: '',
        province: '',
        postalCode: '',
    },
    schedule: {},
};

export const useQuoteStore = create<QuoteStore>((set) => ({
    step: 1,
    data: initialData,
    setStep: (step) => set({ step }),
    nextStep: () => set((state) => ({ step: state.step + 1 })),
    prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
    updateData: (partialData) =>
        set((state) => ({
            data: { ...state.data, ...partialData },
        })),
    reset: () => set({ step: 1, data: initialData }),
}));
