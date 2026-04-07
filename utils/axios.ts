// REFACTOR-PHASE-2: Updated to use environment variable for API base URL
// src/lib/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosHeaders, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Get API base URL from environment variable, fallback to default for development
const getApiBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        // Client-side: use environment variable
        return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.shuarano.com/api/v1';
    }
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.shuarano.com/api/v1';
};

const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach the JWT token (browser only) 
instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
        const token = Cookies.get('token');
        if (token) {
            try {
                config.headers = new AxiosHeaders({
                    ...config.headers,
                    Authorization: `Bearer ${token}`,
                });
            } catch (error) {
                console.warn('Failed to parse authentication token:', error);
            }
        }

    }

    return config;
});

// Response interceptor for error handling (global; slices may still handle specific cases)
instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        if (status === 401 && typeof window !== 'undefined') {
            const path = window.location.pathname || '';
            if (!path.startsWith('/login')) {
                try {
                    Cookies.remove('token');
                } catch {
                    /* ignore */
                }
                window.location.assign(`/login?redirect=${encodeURIComponent(path)}`);
            }
        } else if (status === 403) {
            toast.error('Access denied');
        } else if (status !== undefined && status >= 500) {
            toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
    }
);
  
export default instance;