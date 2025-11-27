import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Invoice, InvoicesResponse, CreateInvoicePayload, UpdateInvoicePayload } from '@/stores/types/invoices';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface InvoicesState {
    loading: boolean;
    error: string | null;
    invoices: Invoice[];
    selectedInvoice: Invoice | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: InvoicesState = {
    loading: false,
    error: null,
    invoices: [],
    selectedInvoice: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
interface FetchInvoicesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

// ================== API Endpoints ==================
const API_ENDPOINTS = {
    FETCH: '/invoices/fetch',
    FETCH_ONE: (id: string) => `/invoices/fetch/invoice/${id}`,
    CREATE: '/invoices/create',
    UPDATE: (id: string) => `/invoices/update/${id}`,
    DELETE: (id: string) => `/invoices/delete/${id}`,
} as const;

// ================== Async Thunks ==================
/**
 * Fetch list of invoices with optional filters
 */
export const fetchInvoices = createAsyncThunk<
    InvoicesResponse,
    FetchInvoicesParams,
    { rejectValue: string }
>('invoices/fetchInvoices', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<InvoicesResponse>(API_ENDPOINTS.FETCH, { params });
        const { header, body } = response.data;

        if (!header.success || !body?.invoices) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch invoices list';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Fetch a single invoice by ID
 */
export const fetchInvoice = createAsyncThunk<
    InvoicesResponse,
    { id: string },
    { rejectValue: string }
>('invoices/fetchInvoice', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<InvoicesResponse>(API_ENDPOINTS.FETCH_ONE(id));
        const { header, body } = response.data;

        if (!header.success || !body?.invoice) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch invoice details';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Create a new invoice
 */
export const createInvoice = createAsyncThunk<
    InvoicesResponse,
    CreateInvoicePayload,
    { rejectValue: string }
>('invoices/createInvoice', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post<InvoicesResponse>(API_ENDPOINTS.CREATE, { params: payload });
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to create invoice';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Update an existing invoice
 */
export const updateInvoice = createAsyncThunk<
    InvoicesResponse,
    UpdateInvoicePayload,
    { rejectValue: string }
>('invoices/updateInvoice', async (payload, { rejectWithValue }) => {
    try {
        const { id, ...data } = payload;
        const response = await api.put<InvoicesResponse>(API_ENDPOINTS.UPDATE(id), data);
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to update invoice';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Delete an invoice
 */
export const deleteInvoice = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('invoices/deleteInvoice', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(API_ENDPOINTS.DELETE(id));
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to delete invoice';
            return rejectWithValue(message);
        }

        return { id };
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

// ================== Slice ==================
const invoicesSlice = createSlice({
    name: 'invoices',
    initialState,
    reducers: {
        clearSelectedInvoice: (state) => {
            state.selectedInvoice = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch invoices list
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoices.fulfilled, (state, action: PayloadAction<InvoicesResponse>) => {
                state.loading = false;
                const invoices = action.payload.body?.invoices;
                if (invoices) {
                    state.invoices = invoices.items || [];
                    state.total = invoices.total || 0;
                    state.pages = invoices.pages || 0;
                }
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch invoices';
            })
            // Fetch single invoice
            .addCase(fetchInvoice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInvoice.fulfilled, (state, action: PayloadAction<InvoicesResponse>) => {
                state.loading = false;
                const invoice = action.payload.body?.invoice;
                if (invoice) {
                    state.selectedInvoice = invoice;
                }
            })
            .addCase(fetchInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch invoice';
            })
            // Create invoice
            .addCase(createInvoice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createInvoice.fulfilled, (state, action: PayloadAction<InvoicesResponse>) => {
                state.loading = false;
                const invoice = action.payload.body?.invoice;
                if (invoice) {
                    state.invoices = [invoice, ...state.invoices];
                    state.total += 1;
                }
            })
            .addCase(createInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create invoice';
            })
            // Update invoice
            .addCase(updateInvoice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateInvoice.fulfilled, (state, action: PayloadAction<InvoicesResponse>) => {
                state.loading = false;
                const invoice = action.payload.body?.invoice;
                if (invoice) {
                    state.invoices = state.invoices.map((i) => (i.id === invoice.id ? invoice : i));
                    if (state.selectedInvoice?.id === invoice.id) {
                        state.selectedInvoice = invoice;
                    }
                }
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update invoice';
            })
            // Delete invoice
            .addCase(deleteInvoice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteInvoice.fulfilled, (state, action) => {
                state.loading = false;
                state.invoices = state.invoices.filter((i) => i.id !== action.payload.id);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedInvoice?.id === action.payload.id) {
                    state.selectedInvoice = null;
                }
            })
            .addCase(deleteInvoice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete invoice';
            });
    },
});

export default invoicesSlice.reducer;
export const { clearSelectedInvoice } = invoicesSlice.actions;

// ================== Selectors ==================
export const selectInvoices = (state: RootState) => state.invoices.invoices;
export const selectSelectedInvoice = (state: RootState) => state.invoices.selectedInvoice;
export const selectInvoicesLoading = (state: RootState) => state.invoices.loading;
export const selectInvoicesError = (state: RootState) => state.invoices.error;
export const selectInvoicesTotal = (state: RootState) => state.invoices.total;
export const selectInvoicesPages = (state: RootState) => state.invoices.pages;

