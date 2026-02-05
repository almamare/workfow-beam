// Redux slice for client requests pending approval
// Endpoint: GET /requests/clients/fetch/for-approval

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { extractErrorMessage, isSuccessResponse } from '@/utils/apiResponse';
import type { ClientRequest } from '@/stores/types/clients_requests';
import type { RootState } from '@/stores/store';

// Response interface for the for-approval endpoint
interface ClientsRequestsForApprovalResponse {
    header: {
        requestId: string;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: {
            code: number;
            type: string;
            message: string;
        }[];
    };
    data: {
        clients_requests: {
            total: number;
            pages: number;
            items: ClientRequest[];
        };
    };
}

interface ClientsRequestsForApprovalState {
    items: ClientRequest[];
    total: number;
    pages: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
    filters: {
        search?: string;
        request_type?: string;
        from_date?: string;
        to_date?: string;
    };
}

const initialState: ClientsRequestsForApprovalState = {
    items: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    loading: false,
    error: null,
    filters: {},
};

interface FetchClientsRequestsForApprovalParams {
    page?: number;
    limit?: number;
    search?: string;
    request_type?: string;
    from_date?: string;
    to_date?: string;
    countOnly?: boolean; // Flag to indicate this is a count-only fetch
}

/**
 * Fetch client requests pending approval for current user
 * Uses the same endpoint as tasks but filters by request_type: 'Clients'
 */
export const fetchClientsRequestsForApproval = createAsyncThunk<
    ClientsRequestsForApprovalResponse,
    FetchClientsRequestsForApprovalParams,
    { rejectValue: string }
>('clientsRequestsForApproval/fetch', async (params, { rejectWithValue }) => {
    try {
        const { page = 1, limit = 10, search, request_type, from_date, to_date, countOnly } = params;
        
        // Use the tasks endpoint but filter by request_type: 'Clients'
        const response = await api.get('/requests/tasks/fetch/for-approval', {
            params: {
                page,
                limit,
                search: search || undefined,
                request_type: 'Clients', // Always filter for Clients type
                from_date: from_date || undefined,
                to_date: to_date || undefined,
            },
        });

        if (!isSuccessResponse(response.data)) {
            const errorMsg = extractErrorMessage(response.data, 'Failed to fetch pending approval requests');
            return rejectWithValue(errorMsg);
        }

        // Transform the response to match ClientsRequestsForApprovalResponse format
        // The API returns tasks_requests but we need clients_requests structure
        // Handle both response formats (new format with 'data' and legacy format with 'body')
        let tasksRequests: any = null;
        
        if ('data' in response.data && response.data.data?.tasks_requests) {
            tasksRequests = response.data.data.tasks_requests;
        } else if ('body' in response.data && response.data.body?.tasks_requests) {
            tasksRequests = response.data.body.tasks_requests;
        }

        const transformedData: ClientsRequestsForApprovalResponse = {
            header: response.data.header || (response.data as any).header || {
                requestId: '',
                success: true,
                responseTime: '',
            },
            data: {
                clients_requests: {
                    total: tasksRequests?.total || 0,
                    pages: tasksRequests?.pages || 0,
                    items: (tasksRequests?.items || []) as any, // Cast to ClientRequest[]
                }
            }
        };

        return transformedData;
    } catch (error: any) {
        const message = extractErrorMessage(error, 'Failed to fetch pending approval requests');
        return rejectWithValue(message);
    }
});

const clientsRequestsForApprovalSlice = createSlice({
    name: 'clientsRequestsForApproval',
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<Partial<ClientsRequestsForApprovalState['filters']>>) {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPage(state, action: PayloadAction<number>) {
            state.currentPage = action.payload;
        },
        resetFilters(state) {
            state.filters = {};
            state.currentPage = 1;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClientsRequestsForApproval.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientsRequestsForApproval.fulfilled, (state, action) => {
                state.loading = false;
                // Handle response structure - API returns data.clients_requests
                const clientsRequests = action.payload.data?.clients_requests;
                
                // Check if this was a count-only fetch by checking the meta or params
                // We can check if limit was 1 and we have existing items, or use a flag
                const isCountOnlyFetch = action.meta.arg?.countOnly || 
                                       (action.meta.arg?.limit === 1 && state.items.length > 0);
                
                if (clientsRequests) {
                    if (isCountOnlyFetch) {
                        // Count-only fetch: only update total and pages, preserve existing items
                        state.total = clientsRequests.total || 0;
                        state.pages = clientsRequests.pages || 0;
                    } else {
                        // Normal fetch: update everything
                        state.items = clientsRequests.items || [];
                        state.total = clientsRequests.total || 0;
                        state.pages = clientsRequests.pages || 0;
                    }
                } else {
                    // Only clear if this is not a count-only fetch
                    if (!isCountOnlyFetch) {
                        state.items = [];
                        state.total = 0;
                        state.pages = 0;
                    } else {
                        // Preserve existing items for count-only fetch
                        state.total = 0;
                        state.pages = 0;
                    }
                }
            })
            .addCase(fetchClientsRequestsForApproval.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch pending approval requests';
                state.items = [];
                state.total = 0;
                state.pages = 0;
            });
    },
});

export const { setFilters, setPage, resetFilters, clearError } = clientsRequestsForApprovalSlice.actions;
export default clientsRequestsForApprovalSlice.reducer;

// Selectors with proper RootState typing
export const selectClientsRequestsForApproval = (state: RootState) => 
    state.clientsRequestsForApproval.items;
export const selectClientsRequestsForApprovalTotal = (state: RootState) => 
    state.clientsRequestsForApproval.total;
export const selectClientsRequestsForApprovalPages = (state: RootState) => 
    state.clientsRequestsForApproval.pages;
export const selectClientsRequestsForApprovalCurrentPage = (state: RootState) => 
    state.clientsRequestsForApproval.currentPage;
export const selectClientsRequestsForApprovalLoading = (state: RootState) => 
    state.clientsRequestsForApproval.loading;
export const selectClientsRequestsForApprovalError = (state: RootState) => 
    state.clientsRequestsForApproval.error;
export const selectClientsRequestsForApprovalFilters = (state: RootState) => 
    state.clientsRequestsForApproval.filters;

