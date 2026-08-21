import { create } from 'zustand';
import { fetchWithAuth } from '@/lib/api';

// Types matching the backend Mongoose models
export interface Service {
    _id: string;
    name: string;
    description?: string;
    basePrice: number;
    vatRate?: number;
    isActive: boolean;
    imageUrl?: string;
    icon?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone?: string;
    isEmailVerified?: boolean;
    createdAt?: string;
}

export interface Booking {
    _id: string;
    customerId: User & Record<string, unknown>;
    serviceId: Service & Record<string, unknown>;
    schedule?: { date?: string; timeSlot?: string; estimatedHours?: number };
    address?: { line1?: string; suburb?: string; city?: string; province?: string; postalCode?: string };
    date?: string;
    time?: string;
    status: 'QUOTE' | 'BOOKED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    totalPrice?: number;
    payment?: {
        status?: string;
        amount?: number;
        subtotal?: number;
        vatRate?: number;
        vatAmount?: number;
        provider?: string;
        reference?: string;
        currency?: string;
        paidAt?: string;
        channel?: string;
    };
    staffAssignedIds: User[];
    photos?: { before: string[]; after: string[] };
    serviceDetails?: Record<string, string | number | boolean>;
    extrasSelected?: string[];
    aiExtras?: { name: string; price: number; estimatedAdditionalHours: number }[];
    createdAt?: string;
}

interface AdminState {
    services: Service[];
    isLoading: boolean;
    error: string | null;
    fetchServices: () => Promise<void>;
    createService: (serviceData: Partial<Service>) => Promise<void>;
    updateService: (id: string, serviceData: Partial<Service>) => Promise<void>;
    deleteService: (id: string) => Promise<void>;

    // Bookings & Staff
    bookings: Booking[];
    staffMembers: User[];
    fetchAllBookings: () => Promise<void>;
    fetchStaffMembers: () => Promise<void>;
    assignStaffToBooking: (bookingId: string, staffIds: string[]) => Promise<void>;

    // Super Admin: User Management
    users: User[];
    fetchUsers: (params?: { role?: string; search?: string }) => Promise<void>;
    createUser: (userData: Record<string, unknown>) => Promise<void>;
    updateUser: (id: string, userData: Record<string, unknown>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

// In a real app we'd use environment variables for this API URL
const API_URL = 'http://localhost:5001/api';

export const useAdminStore = create<AdminState>((set) => ({
    services: [],
    bookings: [],
    staffMembers: [],
    users: [],
    isLoading: false,
    error: null,

    fetchServices: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/services/admin/all`);

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
            const res = await fetchWithAuth(`${API_URL}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetchWithAuth(`${API_URL}/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetchWithAuth(`${API_URL}/services/${id}`, {
                method: 'DELETE',
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

    fetchAllBookings: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/bookings`);
            if (!res.ok) throw new Error('Failed to fetch bookings');
            const data = await res.json();
            set({ bookings: data, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error fetching bookings', isLoading: false });
        }
    },

    fetchStaffMembers: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/users/staff`);
            if (!res.ok) throw new Error('Failed to fetch staff members');
            const data = await res.json();
            set({ staffMembers: data, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error fetching staff', isLoading: false });
        }
    },

    assignStaffToBooking: async (bookingId: string, staffIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/bookings/${bookingId}/assign-staff`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffIds })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.message || 'Failed to assign staff');
            }

            set(state => ({
                bookings: state.bookings.map(b => b._id === bookingId ? data : b),
                isLoading: false
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error assigning staff', isLoading: false });
        }
    },

    // Super Admin: User Management CRUD
    fetchUsers: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const query = new URLSearchParams();
            if (params?.role) query.set('role', params.role);
            if (params?.search) query.set('search', params.search);

            const res = await fetchWithAuth(`${API_URL}/users?${query.toString()}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to fetch users');
            }
            const data = await res.json();
            set({ users: data, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Error fetching users', isLoading: false });
        }
    },

    createUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to create user');
            }

            set(state => ({
                users: [data, ...state.users],
                isLoading: false,
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    updateUser: async (id, userData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to update user');
            }

            set(state => ({
                users: state.users.map(u => u._id === id ? data : u),
                isLoading: false,
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    deleteUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetchWithAuth(`${API_URL}/users/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete user');
            }

            set(state => ({
                users: state.users.filter(u => u._id !== id),
                isLoading: false,
            }));
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },
}));
