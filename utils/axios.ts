// REFACTOR-PHASE-2: Updated to use environment variable for API base URL
// src/lib/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosHeaders, AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

// API base URL — browser and server call the API directly (no Next.js /api-proxy rewrite).
const getApiBaseUrl = (): string =>
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost/beam/api/v1';

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

/**
 * Strict auth/session failure codes (Constants.php):
 * 123 ACCESS_TOKEN_INVALID, 124 ACCESS_TOKEN_EXPIRED, 302 ACCESS_TOKEN_ERRORS, 303 ACCESS_TOKEN_NOT_FOUND.
 * Excludes 300 (JWT_PROCESSING_ERROR) — reused risk / non-session errors must not force logout.
 */
const SESSION_AUTH_FAILURE_CODES = new Set([123, 124, 302, 303]);

function isSessionAuthFailurePayload(data: unknown): boolean {
    const header = (data as { header?: { success?: boolean; messages?: { code?: number | string }[] } })?.header;
    if (!header || header.success !== false || !Array.isArray(header.messages)) {
        return false;
    }
    return header.messages.some((m) => SESSION_AUTH_FAILURE_CODES.has(Number(m?.code)));
}

function redirectToLoginClearingSession(): void {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname || '';
    if (path.startsWith('/login')) return;
    try {
        Cookies.remove('token');
    } catch {
        /* ignore */
    }
    try {
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_must_change_password');
    } catch {
        /* ignore */
    }
    window.location.assign(`/login?redirect=${encodeURIComponent(path)}`);
}

// Response interceptor: do NOT redirect on HTTP 2xx — many endpoints return 200 + header.success:false
// for validation/business errors; treating those as logout caused immediate session loss on navigation.
instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        const data = error.response?.data;
        if (typeof window !== 'undefined' && (status === 401 || isSessionAuthFailurePayload(data))) {
            redirectToLoginClearingSession();
        } else if (status === 403) {
            toast.error('Access denied');
        } else if (status !== undefined && status >= 500) {
            toast.error('Server error. Please try again later.');
        }
        return Promise.reject(error);
    }
);
  
export default instance;