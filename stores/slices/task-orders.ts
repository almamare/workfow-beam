// ==========================================================
// stores/slices/task-orders.ts
// Redux slice for managing Task Orders
// ==========================================================

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { TaskOrder, TaskOrdersResponse, TaskOrderResponse, Contractor, Project, Documents, ContractTerms } from '@/stores/types/task-orders';

// State interface
interface TaskOrderState {
    loading: boolean;
    error: string | null;
    taskOrders: TaskOrder[];
    selectedTaskOrder: TaskOrder | null;
    contractor: Contractor | null;
    project: Project | null;
    documents: Documents[];
    contractTerms: ContractTerms[];
    total: number;
    pages: number;
}

// Initial state
const initialState: TaskOrderState = {
    loading: false,
    error: null,
    taskOrders: [],
    selectedTaskOrder: null,
    contractor: null,
    project: null,
    documents: [],
    contractTerms: [],
    total: 0,
    pages: 0,
};

// Parameters for fetch all request
interface FetchTaskOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
}

// ==========================================================
// Async thunk: Fetch all task orders
// ==========================================================
export const fetchTaskOrders = createAsyncThunk<
    TaskOrdersResponse,
    FetchTaskOrdersParams,
    { rejectValue: string }
>('taskOrders/fetchTaskOrders', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<TaskOrdersResponse>('/task-orders/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.task_orders?.items) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch task orders';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Failed to connect to server';
        return rejectWithValue(message);
    }
});

// ==========================================================
// Async thunk: Fetch single task order by ID
// ==========================================================
export const fetchTaskOrder = createAsyncThunk<
    TaskOrderResponse,
    { id: string | number },
    { rejectValue: string }
>('taskOrders/fetchTaskOrder', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<TaskOrderResponse>(`/task-orders/fetch/${id}`);
        const { header, body } = response.data;

        if (!header.success || !body?.task_order) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch task order';
            return rejectWithValue(message);
        }

        return response.data; // return full response including contractor, project, documents, etc.
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Failed to connect to server';
        return rejectWithValue(message);
    }
});

// ==========================================================
// Slice definition
// ==========================================================
const taskOrderSlice = createSlice({
    name: 'taskOrders',
    initialState,
    reducers: {
        // Clear selected task order and its related entities
        clearSelectedTaskOrder: (state) => {
            state.selectedTaskOrder = null;
            state.contractor = null;
            state.project = null;
            state.documents = [];
            state.contractTerms = [];
        },
    },
    extraReducers: (builder) => {
        // -----------------------------
        // Fetch all task orders
        // -----------------------------
        builder
            .addCase(fetchTaskOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTaskOrders.fulfilled, (state, action: PayloadAction<TaskOrdersResponse>) => {
                state.loading = false;
                if (action.payload.body?.task_orders?.items) {
                    state.taskOrders = action.payload.body.task_orders.items;
                    state.total = action.payload.body.task_orders.total;
                    state.pages = action.payload.body.task_orders.pages;
                }
            })
            .addCase(fetchTaskOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.taskOrders = [];
                state.total = 0;
                state.pages = 0;
            });

        // -----------------------------
        // Fetch single task order
        // -----------------------------
        builder
            .addCase(fetchTaskOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedTaskOrder = null;
                state.contractor = null;
                state.project = null;
                state.documents = [];
                state.contractTerms = [];
            })
            .addCase(fetchTaskOrder.fulfilled, (state, action: PayloadAction<TaskOrderResponse>) => {
                state.loading = false;
                if (action.payload.body) {
                    // Save main task order with contractor & project names injected
                    state.selectedTaskOrder = {
                        ...action.payload.body.task_order,
                        contractor_name: action.payload.body.contractor?.name || '',
                        project_name: action.payload.body.project?.name || ''
                    };
                    // Save related entities
                    state.contractor = action.payload.body.contractor || null;
                    state.project = action.payload.body.project || null;
                    state.documents = action.payload.body.documents || [];
                    state.contractTerms = action.payload.body.contract_terms || [];
                }
            })
            .addCase(fetchTaskOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.selectedTaskOrder = null;
                state.contractor = null;
                state.project = null;
                state.documents = [];
                state.contractTerms = [];
            });
    },
});

export const { clearSelectedTaskOrder } = taskOrderSlice.actions;
export default taskOrderSlice.reducer;

// ==========================================================
// Selectors
// ==========================================================
export const selectTaskOrders = (state: { taskOrders: TaskOrderState }) => state.taskOrders.taskOrders;
export const selectTaskOrdersLoading = (state: { taskOrders: TaskOrderState }) => state.taskOrders.loading;
export const selectTaskOrdersTotal = (state: { taskOrders: TaskOrderState }) => state.taskOrders.total;
export const selectTaskOrdersPages = (state: { taskOrders: TaskOrderState }) => state.taskOrders.pages;
export const selectTaskOrdersError = (state: { taskOrders: TaskOrderState }) => state.taskOrders.error;

export const selectSelectedTaskOrder = (state: { taskOrders: TaskOrderState }) => state.taskOrders.selectedTaskOrder;
export const selectSelectedContractor = (state: { taskOrders: TaskOrderState }) => state.taskOrders.contractor;
export const selectSelectedProject = (state: { taskOrders: TaskOrderState }) => state.taskOrders.project;
export const selectSelectedDocuments = (state: { taskOrders: TaskOrderState }) => state.taskOrders.documents;
export const selectSelectedContractTerms = (state: { taskOrders: TaskOrderState }) => state.taskOrders.contractTerms;
