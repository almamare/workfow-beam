import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type {
    ContractorPaymentsResponse,
    SingleContractorPaymentResponse,
    ContractorPayment,
    CreateContractorPaymentPayload,
    UpdateContractorPaymentPayload,
} from '@/stores/types/contractor-payments';
import type { RootState } from '@/stores/store';

interface ContractorPaymentsState {
    payments: ContractorPayment[];
    selectedPayment: ContractorPayment | null;
    total: number;
    pages: number;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: ContractorPaymentsState = {
    payments: [],
    selectedPayment: null,
    total: 0,
    pages: 0,
    loading: false,
    submitting: false,
    error: null,
};

export interface FetchContractorPaymentsParams {
    page?: number;
    limit?: number;
    search?: string;
    contractor_id?: string;
    project_id?: string;
    status?: string;
    payment_method?: string;
    from_date?: string;
    to_date?: string;
}

// ── Fetch list ─────────────────────────────────────────────────────────────
export const fetchContractorPayments = createAsyncThunk<
    ContractorPaymentsResponse,
    FetchContractorPaymentsParams | void,
    { rejectValue: string }
>('contractorPayments/fetch', async (params, { rejectWithValue }) => {
    try {
        const res = await api.get<ContractorPaymentsResponse>('/contractor-payments/fetch', {
            params: params || {},
        });
        const data = res.data as any;
        // Support both legacy header/body and new success/data envelope
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(
                data?.header?.messages?.[0]?.message ||
                data?.message ||
                'Failed to fetch contractor payments'
            );
        }
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Network error');
    }
});

// ── Fetch single ───────────────────────────────────────────────────────────
export const fetchContractorPayment = createAsyncThunk<
    SingleContractorPaymentResponse,
    string,
    { rejectValue: string }
>('contractorPayments/fetchOne', async (paymentId, { rejectWithValue }) => {
    try {
        const res = await api.get<SingleContractorPaymentResponse>(`/contractor-payments/fetch/${paymentId}`);
        const data = res.data as any;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Not found');
        }
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err?.message || 'Network error');
    }
});

// ── Create ─────────────────────────────────────────────────────────────────
export const createContractorPayment = createAsyncThunk<
    ContractorPayment,
    CreateContractorPaymentPayload,
    { rejectValue: string }
>('contractorPayments/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await api.post<any>('/contractor-payments/create', payload);
        const data = res.data;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Create failed');
        }
        return (data?.body?.contractor_payment ?? data?.data?.contractor_payment) as ContractorPayment;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Create failed');
    }
});

// ── Update ─────────────────────────────────────────────────────────────────
export const updateContractorPayment = createAsyncThunk<
    ContractorPayment,
    { paymentId: string; payload: UpdateContractorPaymentPayload },
    { rejectValue: string }
>('contractorPayments/update', async ({ paymentId, payload }, { rejectWithValue }) => {
    try {
        const res = await api.put<any>(`/contractor-payments/update/${paymentId}`, payload);
        const data = res.data;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Update failed');
        }
        return (data?.body?.contractor_payment ?? data?.data?.contractor_payment) as ContractorPayment;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Update failed');
    }
});

// ── Delete ─────────────────────────────────────────────────────────────────
export const deleteContractorPayment = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>('contractorPayments/delete', async (paymentId, { rejectWithValue }) => {
    try {
        const res = await api.delete<any>(`/contractor-payments/delete/${paymentId}`);
        const data = res.data;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Delete failed');
        }
        return paymentId;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Delete failed');
    }
});

// ── Slice ──────────────────────────────────────────────────────────────────
const contractorPaymentsSlice = createSlice({
    name: 'contractorPayments',
    initialState,
    reducers: {
        clearSelectedPayment(state) {
            state.selectedPayment = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch list
            .addCase(fetchContractorPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContractorPayments.fulfilled, (state, action: PayloadAction<ContractorPaymentsResponse>) => {
                state.loading = false;
                const cp = (action.payload as any)?.body?.contractor_payments
                    ?? (action.payload as any)?.data?.contractor_payments;
                if (cp) {
                    state.payments = cp.items ?? [];
                    state.total    = cp.total ?? 0;
                    state.pages    = cp.pages ?? 0;
                }
            })
            .addCase(fetchContractorPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
                state.payments = [];
            })
            // Fetch single
            .addCase(fetchContractorPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContractorPayment.fulfilled, (state, action: PayloadAction<SingleContractorPaymentResponse>) => {
                state.loading = false;
                const cp = (action.payload as any)?.body?.contractor_payment
                    ?? (action.payload as any)?.data?.contractor_payment;
                state.selectedPayment = cp ?? null;
            })
            .addCase(fetchContractorPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
            })
            // Create
            .addCase(createContractorPayment.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(createContractorPayment.fulfilled, (state, action) => {
                state.submitting = false;
                if (action.payload) state.payments.unshift(action.payload);
            })
            .addCase(createContractorPayment.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Create failed';
            })
            // Update
            .addCase(updateContractorPayment.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(updateContractorPayment.fulfilled, (state, action) => {
                state.submitting = false;
                const updated = action.payload;
                if (updated) {
                    state.payments = state.payments.map(p =>
                        p.payment_id === updated.payment_id ? updated : p
                    );
                    if (state.selectedPayment?.payment_id === updated.payment_id) {
                        state.selectedPayment = updated;
                    }
                }
            })
            .addCase(updateContractorPayment.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Update failed';
            })
            // Delete
            .addCase(deleteContractorPayment.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(deleteContractorPayment.fulfilled, (state, action) => {
                state.submitting = false;
                state.payments = state.payments.filter(p => p.payment_id !== action.payload);
            })
            .addCase(deleteContractorPayment.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Delete failed';
            });
    },
});

export const { clearSelectedPayment, clearError } = contractorPaymentsSlice.actions;
export default contractorPaymentsSlice.reducer;

export const selectContractorPayments        = (state: RootState) => state.contractorPayments.payments;
export const selectContractorPaymentsLoading = (state: RootState) => state.contractorPayments.loading;
export const selectContractorPaymentsSubmitting = (state: RootState) => state.contractorPayments.submitting;
export const selectContractorPaymentsTotal   = (state: RootState) => state.contractorPayments.total;
export const selectContractorPaymentsPages   = (state: RootState) => state.contractorPayments.pages;
export const selectContractorPaymentsError   = (state: RootState) => state.contractorPayments.error;
export const selectSelectedContractorPayment = (state: RootState) => state.contractorPayments.selectedPayment;
