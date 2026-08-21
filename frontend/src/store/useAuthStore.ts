import { create } from 'zustand';
import {
    auth,
    googleProvider,
    getEmailLinkActionCodeSettings
} from '@/lib/firebase';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut
} from 'firebase/auth';

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
    login: (credentials: Record<string, string>) => Promise<User>;
    loginWithGoogle: () => Promise<User>;
    sendMagicLink: (email: string) => Promise<void>;
    completeMagicLinkSignIn: (url?: string) => Promise<User>;
    register: (userData: Record<string, string>) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => void;
    refreshAuthToken: () => Promise<string | null>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const getInitialUser = (): User | null => {
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('user');
            if (stored) return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: getInitialUser(),
    isLoading: false,
    error: null,

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            // Direct backend authentication for instant response and accurate role authorization
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Invalid email or password');
            }

            const userData: User = await res.json();
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });

            // Optional non-blocking Firebase sign-in sync
            signInWithEmailAndPassword(auth, credentials.email, credentials.password).catch(() => {});

            return userData;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const fbUser = result.user;

            const nameParts = (fbUser.displayName || 'Customer User').split(' ');
            const firstName = nameParts[0] || 'Customer';
            const lastName = nameParts.slice(1).join(' ') || 'User';

            // Google sign-in strictly creates/authenticates customer accounts
            const res = await fetch(`${API_URL}/auth/google-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: fbUser.email,
                    firstName,
                    lastName,
                    firebaseUid: fbUser.uid,
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Google authentication failed');
            }

            const userData: User = await res.json();
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });
            return userData;
        } catch (err: unknown) {
            const firebaseErr = err as { code?: string; message?: string };
            if (firebaseErr.code === 'auth/popup-closed-by-user') {
                set({ isLoading: false });
                throw new Error('Sign-in popup closed. Please try again.');
            }
            if (firebaseErr.code === 'auth/cancelled-popup-request') {
                set({ isLoading: false });
                throw new Error('Sign-in request was cancelled. Please try again.');
            }
            const message = err instanceof Error ? err.message : String(err);
            set({ error: message, isLoading: false });
            throw new Error(message);
        }
    },

    sendMagicLink: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            const actionCodeSettings = getEmailLinkActionCodeSettings();
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('emailForSignIn', email);
            }
            set({ isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    completeMagicLinkSignIn: async (url?: string) => {
        set({ isLoading: true, error: null });
        try {
            const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
            if (!isSignInWithEmailLink(auth, currentUrl)) {
                throw new Error('Invalid or expired sign-in link.');
            }

            let email = typeof window !== 'undefined' ? window.localStorage.getItem('emailForSignIn') : null;
            if (!email) {
                email = window.prompt('Please provide your email for confirmation');
            }

            if (!email) {
                throw new Error('Email is required to complete magic link sign-in.');
            }

            const result = await signInWithEmailLink(auth, email, currentUrl);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('emailForSignIn');
            }

            const fbUser = result.user;
            const res = await fetch(`${API_URL}/auth/firebase-sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: fbUser.email,
                    firebaseUid: fbUser.uid,
                    isEmailVerified: true,
                    firstName: fbUser.displayName?.split(' ')[0] || 'Customer',
                    lastName: fbUser.displayName?.split(' ').slice(1).join(' ') || 'User',
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to sync account profile.');
            }

            const userData: User = await res.json();
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });
            return userData;
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            let firebaseUid: string | undefined = undefined;

            // 1. Create in Firebase
            try {
                const userCred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
                firebaseUid = userCred.user.uid;
                // Dispatch Firebase email verification link
                await sendEmailVerification(userCred.user).catch(err => {
                    console.warn('Firebase email verification dispatch:', err);
                });
            } catch (fbErr) {
                console.warn('Firebase registration notice:', fbErr);
            }

            // 2. Register profile in MongoDB
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, firebaseUid }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to register');
            }

            set({ isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Verification failed');
            }

            const userData: User = await res.json();
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isLoading: false });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await signOut(auth).catch(() => {});
            await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
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
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!res.ok) throw new Error('Refresh failed');

            const data = await res.json();
            const newToken = data.accessToken;

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
            localStorage.removeItem('user');
            set({ user: null });
            window.location.href = '/login?timeout=true';
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
