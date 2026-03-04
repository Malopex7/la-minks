import { create } from 'zustand';

// Types matching the backend Mongoose models
export interface Service {
    _id: string;
    name: string;
    description?: string;
    basePrice: number;
    isActive: boolean;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface AdminState {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    fetchServices: () => Promise<void>;
    createService: (serviceData: Partial<Service>) => Promise<void>;
    updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;
}

// In a real app we'd use environment variables for this API URL
const API_URL = 'http://localhost:5001/api';

export const useAdminStore = create<AdminState>((set) => ({
    services: [],
    isLoading: false,
    error: null,

    fetchServices: async () => {
        set({ isLoading: true, error: null });
        try {
            // NOTE: For Admin view, we fetch from /admin/all to get inactive ones too if needed,
            // but requires auth token. Using public one for now to ensure it works without auth wiring first
            // Assuming we need token for actual Admin, we'd pull from localStorage/cookies.
            const res = await fetch(`${API_URL}/services/admin/all`, {
                // headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Fallback if not authorized (since we may not have auth wired on frontend yet)
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    console.warn("Unauthorized to fetch admin services, falling back to public services list");
                    const pubRes = await fetch(`${API_URL}/services`);
                    if (!pubRes.ok) throw new Error("Failed to fetch services");
                    const pubData = await pubRes.json();
                    set({ services: pubData, isLoading: false });
                    return;
                }
                throw new Error('Failed to fetch services');
            }

            const data = await res.json();
            set({ services: data, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error fetching services', isLoading: false });
        }
    },

    createService: async (serviceData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceData),
            });

            if (!res.ok) throw new Error('Failed to create service');

            const newService = await res.json();
            set((state) => ({
                services: [...state.services, newService],
                isLoading: false
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
        }
    },

    updateService: async (id, serviceData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/services/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(serviceData),
            });

            if (!res.ok) throw new Error('Failed to update service');

            const updatedService = await res.json();
            set((state) => ({
                services: state.services.map((s) => (s._id === id ? updatedService : s)),
                isLoading: false
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
        }
    },

    deleteService: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/services/${id}`, {
                method: 'DELETE',
                // headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete service');

            set((state) => ({
                services: state.services.filter((s) => s._id !== id),
                isLoading: false
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
        }
    },
}));
