import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { ContractorPaymentsResponse, SingleContractorPaymentResponse, ContractorPayment } from '@/stores/types/contractor-payments';
import type { RootState } from '@/stores/store';

interface ContractorPaymentsState {
    payments: ContractorPayment[];
    selectedPayment: ContractorPayment | null;
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
    lastKey?: string;
}

const initialState: ContractorPaymentsState = {
    payments: [],
    selectedPayment: null,
    total: 0,
    pages: 0,
    loading: false,
    error: null,
    lastKey: undefined,
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

export const fetchContractorPayments = createAsyncThunk<
    ContractorPaymentsResponse,
    FetchContractorPaymentsParams | void,
    { rejectValue: string; state: RootState }
>(
    'contractorPayments/fetchContractorPayments',
    async (params, { rejectWithValue, signal }) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                contractor_id, 
                project_id, 
                status, 
                payment_method, 
                from_date, 
                to_date 
            } = params || {};
            
            const requestParams: any = { 
                page, 
                limit, 
                search, 
                contractor_id, 
                project_id, 
                status, 
                payment_method 
            };
            
            if (from_date) requestParams.from_date = from_date;
            if (to_date) requestParams.to_date = to_date;
            
            const res = await api.get<ContractorPaymentsResponse>('/contractor-payments/fetch', {
                params: requestParams,
                signal,
            });

            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to fetch contractor payments';
                return rejectWithValue(msg);
            }

            return res.data;
        } catch (err: any) {
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
                return rejectWithValue('Request canceled');
            }
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while fetching contractor payments';
            return rejectWithValue(msg);
        }
    },
    {
        condition: (params, { getState }) => {
            const st = (getState() as RootState).contractorPayments;
            const key = JSON.stringify({
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                search: params?.search ?? '',
                contractor_id: params?.contractor_id,
                project_id: params?.project_id,
                status: params?.status,
                payment_method: params?.payment_method,
            });
            if (st.loading && st.lastKey === key) return false;
            return true;
        },
    }
);

export const fetchContractorPayment = createAsyncThunk<
    SingleContractorPaymentResponse,
    string,
    { rejectValue: string }
>(
    'contractorPayments/fetchContractorPayment',
    async (paymentId, { rejectWithValue }) => {
        try {
            const res = await api.get<SingleContractorPaymentResponse>(`/contractor-payments/fetch/${paymentId}`);
            const { header } = res.data;
            
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to fetch contractor payment';
                return rejectWithValue(msg);
            }

            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while fetching contractor payment';
            return rejectWithValue(msg);
        }
    }
);

const contractorPaymentsSlice = createSlice({
    name: 'contractorPayments',
    initialState,
    reducers: {
        clearSelectedPayment(state) {
            state.selectedPayment = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Contractor Payments
            .addCase(fetchContractorPayments.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                const key = JSON.stringify({
                    page: action.meta.arg?.page ?? 1,
                    limit: action.meta.arg?.limit ?? 10,
                    search: action.meta.arg?.search ?? '',
                    contractor_id: action.meta.arg?.contractor_id,
                    project_id: action.meta.arg?.project_id,
                    status: action.meta.arg?.status,
                    payment_method: action.meta.arg?.payment_method,
                });
                state.lastKey = key;
            })
            .addCase(fetchContractorPayments.fulfilled, (state, action: PayloadAction<ContractorPaymentsResponse>) => {
                state.loading = false;
                if (action.payload.body?.contractor_payments) {
                    state.payments = action.payload.body.contractor_payments.items;
                    state.total = action.payload.body.contractor_payments.total;
                    state.pages = action.payload.body.contractor_payments.pages;
                }
            })
            .addCase(fetchContractorPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.payments = [];
                state.total = 0;
                state.pages = 0;
            })
            // Fetch Single Contractor Payment
            .addCase(fetchContractorPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedPayment = null;
            })
            .addCase(fetchContractorPayment.fulfilled, (state, action: PayloadAction<SingleContractorPaymentResponse>) => {
                state.loading = false;
                if (action.payload.body?.contractor_payment) {
                    state.selectedPayment = action.payload.body.contractor_payment;
                }
            })
            .addCase(fetchContractorPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load contractor payment details';
                state.selectedPayment = null;
            });
    },
});

export const { clearSelectedPayment } = contractorPaymentsSlice.actions;
export default contractorPaymentsSlice.reducer;

// Selectors
export const selectContractorPayments = (state: RootState) => state.contractorPayments.payments;
export const selectContractorPaymentsLoading = (state: RootState) => state.contractorPayments.loading;
export const selectContractorPaymentsTotal = (state: RootState) => state.contractorPayments.total;
export const selectContractorPaymentsPages = (state: RootState) => state.contractorPayments.pages;
export const selectContractorPaymentsError = (state: RootState) => state.contractorPayments.error;
export const selectSelectedContractorPayment = (state: RootState) => state.contractorPayments.selectedPayment;

