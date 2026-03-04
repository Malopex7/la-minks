import { create } from 'zustand';

export type QuoteData = {
    serviceId?: string;
    property: {
        sqm: number;
        bedrooms: number;
        bathrooms: number;
        conditionLevel: 'standard' | 'deep' | 'heavy_duty';
    };
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
    property: {
        sqm: 0,
        bedrooms: 0,
        bathrooms: 0,
        conditionLevel: 'standard',
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
