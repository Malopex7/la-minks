import { create } from 'zustand';

export interface Service {
    _id: string;
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    imageUrl?: string;
}

interface PublicState {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    fetchActiveServices: () => Promise<void>;
}

const API_URL = 'http://localhost:5000/api';

export const usePublicStore = create<PublicState>((set) => ({
    services: [],
    isLoading: false,
    error: null,

    fetchActiveServices: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/services`);
            if (!res.ok) throw new Error('Failed to fetch services');

            const data = await res.json();
            set({ services: data, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error fetching services', isLoading: false });
        }
    },
}));
