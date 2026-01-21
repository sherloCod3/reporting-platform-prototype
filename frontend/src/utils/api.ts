import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request interceptor
 * Automatically attaches the authentication token to every outgoing request.
 * This ensures that protected routes are accessible without manually adding headers.
 */
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('@qreports:token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Response interceptor
 * centralized error handling for authentication failures.
 * If the API returns a 401 Unauthorized, we clear the session and redirect the user to the login page.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('@qreports:token');
                localStorage.removeItem('@qreports:user');

                // Prevent infinite redirect loops if already on the login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);


