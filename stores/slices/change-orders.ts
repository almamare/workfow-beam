import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    ChangeOrder,
    ChangeOrdersResponse,
    ChangeOrderResponse,
    CreateChangeOrderPayload,
    UpdateChangeOrderPayload,
} from '@/stores/types/change-orders';

interface ChangeOrderState {
    loading: boolean;
    error: string | null;
    changeOrders: ChangeOrder[];
    selectedChangeOrder: ChangeOrder | null;
    total: number;
    pages: number;
}

const initialState: ChangeOrderState = {
    loading: false,
    error: null,
    changeOrders: [],
    selectedChangeOrder: null,
    total: 0,
    pages: 0,
};

interface FetchChangeOrdersParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export const fetchChangeOrders = createAsyncThunk<
    ChangeOrdersResponse,
    FetchChangeOrdersParams,
    { rejectValue: string }
>('changeOrders/fetchChangeOrders', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<ChangeOrdersResponse>('/change-orders/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.change_orders?.items) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch change orders';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        return rejectWithValue(
            serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to server'
        );
    }
});

export const fetchChangeOrder = createAsyncThunk<
    ChangeOrderResponse,
    { id: string | number },
    { rejectValue: string }
>('changeOrders/fetchChangeOrder', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<ChangeOrderResponse>(`/change-orders/fetch/${id}`);
        const { header, body } = response.data;

        if (!header.success || !body?.change_order) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch change order';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        return rejectWithValue(
            serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to server'
        );
    }
});

export const createChangeOrder = createAsyncThunk<
    { success: boolean; message: string },
    CreateChangeOrderPayload,
    { rejectValue: string }
>('changeOrders/createChangeOrder', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post('/change-orders/create', { params: payload });
        const { header } = response.data as any;

        if (!header?.success) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to create change order';
            return rejectWithValue(message);
        }

        return { success: true, message: header?.message || 'Change order created' };
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        return rejectWithValue(
            serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to server'
        );
    }
});

export const updateChangeOrder = createAsyncThunk<
    { success: boolean; message: string },
    UpdateChangeOrderPayload,
    { rejectValue: string }
>('changeOrders/updateChangeOrder', async (payload, { rejectWithValue }) => {
    try {
        const { id, ...rest } = payload;
        const response = await api.put(`/change-orders/update/${id}`, { params: rest });
        const { header } = response.data as any;

        if (!header?.success) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to update change order';
            return rejectWithValue(message);
        }

        return { success: true, message: header?.message || 'Change order updated' };
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        return rejectWithValue(
            serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to server'
        );
    }
});

export const deleteChangeOrder = createAsyncThunk<
    { success: boolean; message: string },
    { id: string | number },
    { rejectValue: string }
>('changeOrders/deleteChangeOrder', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/change-orders/delete/${id}`);
        const { header } = response.data as any;

        if (!header?.success) {
            const message = header?.messages?.[0]?.message || header?.message || 'Failed to delete change order';
            return rejectWithValue(message);
        }

        return { success: true, message: header?.message || 'Change order deleted' };
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        return rejectWithValue(
            serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to server'
        );
    }
});

const changeOrderSlice = createSlice({
    name: 'changeOrders',
    initialState,
    reducers: {
        clearSelectedChangeOrder: (state) => {
            state.selectedChangeOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChangeOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchChangeOrders.fulfilled, (state, action: PayloadAction<ChangeOrdersResponse>) => {
                state.loading = false;
                if (action.payload.body?.change_orders?.items) {
                    state.changeOrders = action.payload.body.change_orders.items;
                    state.total = action.payload.body.change_orders.total;
                    state.pages = action.payload.body.change_orders.pages;
                }
            })
            .addCase(fetchChangeOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.changeOrders = [];
                state.total = 0;
                state.pages = 0;
            });

        builder
            .addCase(fetchChangeOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedChangeOrder = null;
            })
            .addCase(fetchChangeOrder.fulfilled, (state, action: PayloadAction<ChangeOrderResponse>) => {
                state.loading = false;
                if (action.payload.body?.change_order) {
                    state.selectedChangeOrder = {
                        ...action.payload.body.change_order,
                        contractor_name: action.payload.body.contractor?.name || '',
                        project_name: action.payload.body.project?.name || '',
                    };
                }
            })
            .addCase(fetchChangeOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.selectedChangeOrder = null;
            });
    },
});

export const { clearSelectedChangeOrder } = changeOrderSlice.actions;
export default changeOrderSlice.reducer;

export const selectChangeOrders = (state: { changeOrders: ChangeOrderState }) => state.changeOrders.changeOrders;
export const selectChangeOrdersLoading = (state: { changeOrders: ChangeOrderState }) => state.changeOrders.loading;
export const selectChangeOrdersTotal = (state: { changeOrders: ChangeOrderState }) => state.changeOrders.total;
export const selectChangeOrdersPages = (state: { changeOrders: ChangeOrderState }) => state.changeOrders.pages;
export const selectChangeOrdersError = (state: { changeOrders: ChangeOrderState }) => state.changeOrders.error;
export const selectSelectedChangeOrder = (state: { changeOrders: ChangeOrderState }) => state.changeOrders.selectedChangeOrder;
