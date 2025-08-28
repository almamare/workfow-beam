import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { TaskRequest, TaskRequestsResponse, TaskRequestResponse } from '@/stores/types/tasks_requests';

interface TaskRequestState {
    loading: boolean;
    error: string | null;
    taskRequests: TaskRequest[];
    selectedTaskRequest: TaskRequest | null;
    total: number;
    pages: number;
}

const initialState: TaskRequestState = {
    loading: false,
    error: null,
    taskRequests: [],
    selectedTaskRequest: null,
    total: 0,
    pages: 0,
};

interface FetchTaskRequestsParams {
    page?: number;
    limit?: number;
    search?: string;
}

// Fetch a single Task Request by ID
export const fetchTaskRequest = createAsyncThunk<TaskRequest, { id: string }, { rejectValue: string }>(
    'taskRequests/fetchTaskRequest',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.get<TaskRequestResponse>(`/requests/tasks/fetch/${id}`);
            const { header, body } = response.data;

            if (!header.success || !body?.tasks_request) {  // Changed to tasks_request
                const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch task request details';
                return rejectWithValue(message);
            }

            return body.tasks_request;  // Changed to tasks_request
        } catch (error: any) {
            const serverError = error.response?.data?.header;
            const message = serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to the server';
            return rejectWithValue(message);
        }
    }
);
// Fetch list of Task Requests
export const fetchTaskRequests = createAsyncThunk<TaskRequestsResponse, FetchTaskRequestsParams, { rejectValue: string }>(
    'taskRequests/fetchTaskRequests',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get<TaskRequestsResponse>('/requests/tasks/fetch', { params });
            const { header, body } = response.data;

            if (!header.success || !body?.tasks_requests) {
                const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch task requests list';
                return rejectWithValue(message);
            }

            return response.data;
        } catch (error: any) {
            const serverError = error.response?.data?.header;
            const message = serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to the server';
            return rejectWithValue(message);
        }
    }
);

const taskRequestSlice = createSlice({
    name: 'taskRequests',
    initialState,
    reducers: {
        clearSelectedTaskRequest(state) {
            state.selectedTaskRequest = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Task Requests
            .addCase(fetchTaskRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTaskRequests.fulfilled, (state, action: PayloadAction<TaskRequestsResponse>) => {
                state.loading = false;
                if (action.payload.body?.tasks_requests) {
                    state.taskRequests = action.payload.body.tasks_requests.items;
                    state.total = action.payload.body.tasks_requests.total;
                    state.pages = action.payload.body.tasks_requests.pages;
                }
            })
            .addCase(fetchTaskRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.taskRequests = [];
                state.total = 0;
                state.pages = 0;
            })
            // Fetch Single Task Request
            .addCase(fetchTaskRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedTaskRequest = null;
            })
            .addCase(fetchTaskRequest.fulfilled, (state, action: PayloadAction<TaskRequest>) => {
                state.loading = false;
                state.selectedTaskRequest = action.payload;
            })
            .addCase(fetchTaskRequest.rejected, (state, action) => {
                state.loading = false;
                state.error =  'Failed to load task request details';
                state.selectedTaskRequest = null;
            });
    },
});

export const { clearSelectedTaskRequest } = taskRequestSlice.actions;
export default taskRequestSlice.reducer;

// Selectors
export const selectTaskRequests = (state: { taskRequests: TaskRequestState }) => state.taskRequests.taskRequests;
export const selectLoading = (state: { taskRequests: TaskRequestState }) => state.taskRequests.loading;
export const selectTotalPages = (state: { taskRequests: TaskRequestState }) => state.taskRequests.pages;
export const selectTotalItems = (state: { taskRequests: TaskRequestState }) => state.taskRequests.total;
export const selectSelectedTaskRequest = (state: { taskRequests: TaskRequestState }) => state.taskRequests.selectedTaskRequest;
export const selectError = (state: { taskRequests: TaskRequestState }) => state.taskRequests.error;