// Redux slice for task requests pending approval
// Endpoint: GET /requests/tasks/fetch/for-approval

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { extractErrorMessage, isSuccessResponse, normalizeApiResponse } from '@/utils/apiResponse';
import type { TaskRequest } from '@/stores/types/tasks_requests';

// Response interface for the for-approval endpoint
interface TasksRequestsForApprovalResponse {
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
        tasks_requests: {
            total: number;
            pages: number;
            items: TaskRequest[];
        };
    };
}

interface TasksRequestsForApprovalState {
    items: TaskRequest[];
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

const initialState: TasksRequestsForApprovalState = {
    items: [],
    total: 0,
    pages: 0,
    currentPage: 1,
    loading: false,
    error: null,
    filters: {},
};

interface FetchTasksRequestsForApprovalParams {
    page?: number;
    limit?: number;
    search?: string;
    request_type?: string;
    from_date?: string;
    to_date?: string;
}

/**
 * Fetch task requests pending approval for current user
 */
export const fetchTasksRequestsForApproval = createAsyncThunk<
    TasksRequestsForApprovalResponse,
    FetchTasksRequestsForApprovalParams,
    { rejectValue: string }
>('tasksRequestsForApproval/fetch', async (params, { rejectWithValue }) => {
    try {
        const { page = 1, limit = 10, search, request_type, from_date, to_date } = params;
        
        const response = await api.get<TasksRequestsForApprovalResponse>('/requests/tasks/fetch/for-approval', {
            params: {
                page,
                limit,
                search: search || undefined,
                request_type: request_type || undefined,
                from_date: from_date || undefined,
                to_date: to_date || undefined,
            },
        });

        if (!isSuccessResponse(response.data)) {
            const errorMsg = extractErrorMessage(response.data, 'Failed to fetch pending approval requests');
            return rejectWithValue(errorMsg);
        }

        return response.data;
    } catch (error: any) {
        const message = extractErrorMessage(error, 'Failed to fetch pending approval requests');
        return rejectWithValue(message);
    }
});

const tasksRequestsForApprovalSlice = createSlice({
    name: 'tasksRequestsForApproval',
    initialState,
    reducers: {
        setFilters(state, action: PayloadAction<Partial<TasksRequestsForApprovalState['filters']>>) {
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
            .addCase(fetchTasksRequestsForApproval.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasksRequestsForApproval.fulfilled, (state, action) => {
                state.loading = false;
                // Handle response structure - API returns data.tasks_requests
                const tasksRequests = action.payload.data?.tasks_requests;
                if (tasksRequests) {
                    state.items = tasksRequests.items || [];
                    state.total = tasksRequests.total || 0;
                    state.pages = tasksRequests.pages || 0;
                } else {
                    state.items = [];
                    state.total = 0;
                    state.pages = 0;
                }
            })
            .addCase(fetchTasksRequestsForApproval.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch pending approval requests';
                state.items = [];
                state.total = 0;
                state.pages = 0;
            });
    },
});

export const { setFilters, setPage, resetFilters, clearError } = tasksRequestsForApprovalSlice.actions;
export default tasksRequestsForApprovalSlice.reducer;

// Selectors
export const selectTasksRequestsForApproval = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.items;
export const selectTasksRequestsForApprovalTotal = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.total;
export const selectTasksRequestsForApprovalPages = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.pages;
export const selectTasksRequestsForApprovalCurrentPage = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.currentPage;
export const selectTasksRequestsForApprovalLoading = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.loading;
export const selectTasksRequestsForApprovalError = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.error;
export const selectTasksRequestsForApprovalFilters = (state: { tasksRequestsForApproval: TasksRequestsForApprovalState }) => 
    state.tasksRequestsForApproval.filters;

