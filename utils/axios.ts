// REFACTOR-PHASE-2: Updated to use environment variable for API base URL
// src/lib/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosHeaders, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// Get API base URL from environment variable, fallback to default for development
const getApiBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        // Client-side: use environment variable
        return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.yallajayak.com/api/v1';
    }
    // Server-side: use environment variable
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.yallajayak.com/api/v1';
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

// Response interceptor for error handling
instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 403) {
            toast.error('Access denied');
        }
        return Promise.reject(error);
    }
);
  
export default instance;