import { useAuthStore } from '@/store/useAuthStore';

// Helper to make authenticated requests, automatically handling token refresh on 401
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const { user, refreshAuthToken } = useAuthStore.getState();

    const currentToken = user?.accessToken;

    if (currentToken) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${currentToken}`
        };
    } else {
        // if no user is found but we need auth, could optionally log out or throw here
    }

    // Must include credentials for the cookie to be sent during the refresh attempt!
    options.credentials = 'include';

    let res = await fetch(url, options);

    // If 401 Unauthorized, try to refresh the token
    if (res.status === 401 && refreshAuthToken) {
        try {
            const newToken = await refreshAuthToken();
            if (newToken) {
                // Retry request with new token
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`
                };
                res = await fetch(url, options);
            }
        } catch (err) {
            console.error('Refresh token failed', err);
            // refresh failed, user is logged out (handled inside refreshAuthToken)
        }
    }

    return res;
}
