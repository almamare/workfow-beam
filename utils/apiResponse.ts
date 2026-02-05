// REFACTOR-PHASE-2: Centralized API response normalization
// Handles both new and legacy API response formats
// Eliminates duplicate response handling logic across slices

/**
 * New API response format
 */
export interface ApiResponseNew<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
}

/**
 * Legacy API response format
 */
export interface ApiResponseLegacy<T = any> {
    header: {
        requestId?: string;
        status?: number;
        success: boolean;
        responseTime?: string;
        message?: string;
        messages?: {
            code: number;
            type: string;
            message: string;
        }[];
    };
    body?: T;
}

/**
 * Normalized response structure
 */
export interface NormalizedResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Array<{ code: string | number; type: string; message: string }>;
}

/**
 * Normalize API response from either new or legacy format
 * @param response - API response that could be either format
 * @returns Normalized response structure
 */
export function normalizeApiResponse<T = any>(
    response: ApiResponseNew<T> | ApiResponseLegacy<T>
): NormalizedResponse<T> {
    // Check for new format
    if ('success' in response && typeof response.success === 'boolean') {
        const newResponse = response as ApiResponseNew<T>;
        return {
            success: newResponse.success,
            data: newResponse.data,
            message: newResponse.message,
            errors: newResponse.errors?.map(err => ({
                code: err.code,
                type: err.type,
                message: err.message,
            })),
        };
    }

    // Check for legacy format
    if ('header' in response && response.header) {
        const legacyResponse = response as ApiResponseLegacy<T>;
        return {
            success: legacyResponse.header.success,
            data: legacyResponse.body,
            message: legacyResponse.header.message,
            errors: legacyResponse.header.messages?.map(msg => ({
                code: msg.code,
                type: msg.type,
                message: msg.message,
            })),
        };
    }

    // Fallback: assume success if structure is unknown
    return {
        success: false,
        message: 'Unknown response format',
    };
}

/**
 * Extract error message from API response
 * @param response - API response or error object
 * @param defaultMessage - Default message if no error found
 * @returns Error message string
 */
export function extractErrorMessage(
    response: any,
    defaultMessage: string = 'An error occurred'
): string {
    // Try new format
    if (response?.errors?.[0]?.message) {
        return response.errors[0].message;
    }
    if (response?.message) {
        return response.message;
    }

    // Try legacy format
    if (response?.header?.messages?.[0]?.message) {
        return response.header.messages[0].message;
    }
    if (response?.header?.message) {
        return response.header.message;
    }

    // Try error response structure
    if (response?.response?.data) {
        return extractErrorMessage(response.response.data, defaultMessage);
    }

    return defaultMessage;
}

/**
 * Check if response indicates success
 * @param response - API response
 * @returns True if response indicates success
 */
export function isSuccessResponse(response: any): boolean {
    if ('success' in response && typeof response.success === 'boolean') {
        return response.success;
    }
    if (response?.header?.success === true) {
        return true;
    }
    return false;
}

