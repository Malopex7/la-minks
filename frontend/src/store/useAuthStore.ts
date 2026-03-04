import { create } from 'zustand';

// Match User model
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    accessToken: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: Record<string, string>) => Promise<void>;
    register: (userData: Record<string, string>) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => void; // Checks local storage for token on mount
}

const API_URL = 'http://localhost:5001/api/auth';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to login');
            }

            const userData: User = await res.json();
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to register');
            }

            const newUserData: User = await res.json();
            localStorage.setItem('user', JSON.stringify(newUserData));
            set({ user: newUserData, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await fetch(`${API_URL}/logout`, { method: 'POST' });
            localStorage.removeItem('user');
            set({ user: null, isLoading: false });
        } catch (err) {
            console.error('Logout error:', err);
            localStorage.removeItem('user');
            set({ user: null, isLoading: false });
        }
    },

    checkAuth: () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData: User = JSON.parse(storedUser);
                set({ user: userData });
            } catch (err) {
                console.error("Invalid user data in local storage:", err);
                localStorage.removeItem('user');
            }
        }
    }
}));
