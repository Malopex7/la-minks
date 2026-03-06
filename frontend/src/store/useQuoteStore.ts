import { create } from 'zustand';

export type QuoteData = {
    serviceId?: string;
    // Store the selected service's required inputs schema (e.g. from the backend)
    serviceInputs: any[];
    // Track the available extras config for the selected service
    serviceExtras: any[];
    // Track AI-suggested extras that are not in the DB
    aiExtras: any[];
    // Dynamic mapping of input answers, e.g. { numWindows: 12, conditionLevel: 'standard' }
    serviceDetails: Record<string, any>;
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
