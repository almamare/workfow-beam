// src/lib/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
    baseURL: 'http://localhost/beam/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach the JWT token (browser only)
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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
 
export default instance;
