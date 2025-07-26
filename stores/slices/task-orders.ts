import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'; // Importing necessary functions from Redux Toolkit
import api from '@/utils/axios'; // Importing the axios instance for API calls
import { TaskOrder, TaskOrdersResponse } from '@/stores/types/task-orders'; // Importing types for TaskOrder and TaskOrdersResponse


interface TaskOrderState {
    loading: boolean;
    error: string | null;
    taskOrders: TaskOrder[];
    total: number;
    pages: number;
}

const initialState: TaskOrderState = {
    loading: false,
    error: null,
    taskOrders: [],
    total: 0,
    pages: 0,
};

interface FetchTaskOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const fetchTaskOrders = createAsyncThunk<
    TaskOrdersResponse,
    FetchTaskOrdersParams,
    { rejectValue: string }
>('taskOrders/fetchTaskOrders', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<TaskOrdersResponse>('/task-orders/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.task_orders?.items) {
            const message = header?.messages?.[0]?.message || header?.message || 'فشل في جلب قائمة أوامر العمل';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

const taskOrderSlice = createSlice({
    name: 'taskOrders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
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
                state.error = action.payload || 'حدث خطأ غير متوقع';
                state.taskOrders = [];
                state.total = 0;
                state.pages = 0;
            });
    },
});

export default taskOrderSlice.reducer;

// Selectors
export const selectTaskOrders        = (state: { taskOrders: TaskOrderState }) => state.taskOrders.taskOrders;
export const selectTaskOrdersLoading = (state: { taskOrders: TaskOrderState }) => state.taskOrders.loading;
export const selectTaskOrdersTotal   = (state: { taskOrders: TaskOrderState }) => state.taskOrders.total;
export const selectTaskOrdersPages   = (state: { taskOrders: TaskOrderState }) => state.taskOrders.pages;
export const selectTaskOrdersError   = (state: { taskOrders: TaskOrderState }) => state.taskOrders.error;
