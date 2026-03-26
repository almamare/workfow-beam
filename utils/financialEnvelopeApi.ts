/**
 * Client for financial APIs that return a flat envelope (not legacy header/body):
 * { success, message, data, errors }
 */
import api from '@/utils/axios';
import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface FlatEnvelope<T = unknown> {
    success: boolean;
    message?: string;
    data: T | null;
    errors?: unknown;
}

function redirectToLogin() {
    if (typeof window === 'undefined') return;
    try {
        Cookies.remove('token');
    } catch {
        /* ignore */
    }
    window.location.assign('/login');
}

/**
 * Runs an axios request and returns the parsed envelope.
 * On HTTP errors, throws an Error with message suitable for toast.
 * On 401, redirects to login.
 */
export async function financialRequest<T = unknown>(config: AxiosRequestConfig): Promise<FlatEnvelope<T>> {
    try {
        const res = await api.request<FlatEnvelope<T>>(config);
        const body = res.data;
        if (!body || typeof body !== 'object') {
            throw new Error('Invalid response');
        }
        if (body.success === false) {
            const msg =
                typeof body.message === 'string' && body.message
                    ? body.message
                    : 'Request failed';
            const err = new Error(msg) as Error & { errors?: unknown; status?: number };
            err.errors = body.errors;
            err.status = res.status;
            throw err;
        }
        return body;
    } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
            const status = e.response?.status;
            if (status === 401) {
                redirectToLogin();
                throw new Error('Session expired. Please sign in again.');
            }
            const payload = e.response?.data as Partial<FlatEnvelope> | undefined;
            const msg =
                (typeof payload?.message === 'string' && payload.message) ||
                e.message ||
                'Request failed';
            const err = new Error(msg) as Error & { errors?: unknown; status?: number };
            err.errors = payload?.errors;
            err.status = status;
            throw err;
        }
        throw e;
    }
}

/** Format field errors for inline form display (422). */
export function formatFinancialErrors(errors: unknown): string {
    if (errors == null) return '';
    if (typeof errors === 'string') return errors;
    if (Array.isArray(errors)) {
        return errors
            .map((x) => (typeof x === 'object' && x && 'message' in x ? String((x as { message: string }).message) : JSON.stringify(x)))
            .join('; ');
    }
    if (typeof errors === 'object') {
        return Object.entries(errors as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join('; ');
    }
    return String(errors);
}
