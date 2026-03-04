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
    refreshAuthToken: () => Promise<string | null>;
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
            await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
            localStorage.removeItem('user');
            set({ user: null, isLoading: false });
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout error:', err);
            localStorage.removeItem('user');
            set({ user: null, isLoading: false });
            window.location.href = '/login';
        }
    },

    refreshAuthToken: async () => {
        try {
            const res = await fetch(`${API_URL}/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Refresh failed');

            const data = await res.json();
            const newToken = data.accessToken;

            // Need to get current state manually since set() updater doesn't return value easily
            let updatedToken = newToken;
            set(state => {
                if (state.user) {
                    const updatedUser = { ...state.user, accessToken: newToken };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    return { user: updatedUser };
                }
                return state;
            });

            return newToken;
        } catch (err) {
            console.error('Failed to refresh token:', err);
            // Don't call get().logout() here directly if we want to avoid circular dep or loop,
            // but since we redirect in logout, it's fine. Let's just remove local storage.
            localStorage.removeItem('user');
            set({ user: null });
            window.location.href = '/login';
            return null;
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
