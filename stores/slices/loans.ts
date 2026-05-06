import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type {
    LoansResponse,
    SingleLoanResponse,
    Loan,
    CreateLoanPayload,
    UpdateLoanPayload,
} from '@/stores/types/loans';
import type { RootState } from '@/stores/store';

interface LoansState {
    loans: Loan[];
    selectedLoan: Loan | null;
    total: number;
    pages: number;
    loading: boolean;
    submitting: boolean;
    error: string | null;
}

const initialState: LoansState = {
    loans: [],
    selectedLoan: null,
    total: 0,
    pages: 0,
    loading: false,
    submitting: false,
    error: null,
};

export interface FetchLoansParams {
    page?: number;
    limit?: number;
    search?: string;
    borrower_type?: string;
    borrower_id?: string;
    status?: string;
}

// ── Fetch list ─────────────────────────────────────────────────────────────
export const fetchLoans = createAsyncThunk<
    LoansResponse,
    FetchLoansParams | void,
    { rejectValue: string }
>('loans/fetch', async (params, { rejectWithValue }) => {
    try {
        const res = await api.get<LoansResponse>('/loans/fetch', { params: params || {} });
        const data = res.data as any;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Failed to fetch loans');
        }
        return res.data;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Network error');
    }
});

// ── Fetch single ───────────────────────────────────────────────────────────
export const fetchLoan = createAsyncThunk<
    SingleLoanResponse,
    string,
    { rejectValue: string }
>('loans/fetchOne', async (loanId, { rejectWithValue }) => {
    try {
        const res = await api.get<SingleLoanResponse>(`/loans/fetch/${loanId}`);
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
export const createLoan = createAsyncThunk<
    Loan,
    CreateLoanPayload,
    { rejectValue: string }
>('loans/create', async (payload, { rejectWithValue }) => {
    try {
        const res = await api.post<any>('/loans/create', payload);
        const data = res.data;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Create failed');
        }
        return (data?.body?.loan ?? data?.data?.loan) as Loan;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Create failed');
    }
});

// ── Update ─────────────────────────────────────────────────────────────────
export const updateLoan = createAsyncThunk<
    Loan,
    { loanId: string; payload: UpdateLoanPayload },
    { rejectValue: string }
>('loans/update', async ({ loanId, payload }, { rejectWithValue }) => {
    try {
        const res = await api.put<any>(`/loans/update/${loanId}`, payload);
        const data = res.data;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Update failed');
        }
        return (data?.body?.loan ?? data?.data?.loan) as Loan;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Update failed');
    }
});

// ── Delete ─────────────────────────────────────────────────────────────────
export const deleteLoan = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>('loans/delete', async (loanId, { rejectWithValue }) => {
    try {
        const res = await api.delete<any>(`/loans/delete/${loanId}`);
        const data = res.data;
        const success = data?.header?.success ?? data?.success ?? false;
        if (!success) {
            return rejectWithValue(data?.header?.messages?.[0]?.message || data?.message || 'Delete failed');
        }
        return loanId;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.header?.messages?.[0]?.message || err?.message || 'Delete failed');
    }
});

// ── Slice ──────────────────────────────────────────────────────────────────
const loansSlice = createSlice({
    name: 'loans',
    initialState,
    reducers: {
        clearSelectedLoan(state) {
            state.selectedLoan = null;
        },
        clearLoansError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLoans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLoans.fulfilled, (state, action: PayloadAction<LoansResponse>) => {
                state.loading = false;
                const l = (action.payload as any)?.body?.loans ?? (action.payload as any)?.data?.loans;
                if (l) {
                    state.loans = l.items ?? [];
                    state.total = l.total ?? 0;
                    state.pages = l.pages ?? 0;
                }
            })
            .addCase(fetchLoans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
                state.loans = [];
            })
            .addCase(fetchLoan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLoan.fulfilled, (state, action: PayloadAction<SingleLoanResponse>) => {
                state.loading = false;
                const l = (action.payload as any)?.body?.loan ?? (action.payload as any)?.data?.loan;
                state.selectedLoan = l ?? null;
            })
            .addCase(fetchLoan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'Unknown error';
            })
            .addCase(createLoan.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(createLoan.fulfilled, (state, action) => {
                state.submitting = false;
                if (action.payload) state.loans.unshift(action.payload);
            })
            .addCase(createLoan.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Create failed';
            })
            .addCase(updateLoan.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(updateLoan.fulfilled, (state, action) => {
                state.submitting = false;
                const updated = action.payload;
                if (updated) {
                    state.loans = state.loans.map(l => l.loan_id === updated.loan_id ? updated : l);
                    if (state.selectedLoan?.loan_id === updated.loan_id) state.selectedLoan = updated;
                }
            })
            .addCase(updateLoan.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Update failed';
            })
            .addCase(deleteLoan.pending, (state) => { state.submitting = true; state.error = null; })
            .addCase(deleteLoan.fulfilled, (state, action) => {
                state.submitting = false;
                state.loans = state.loans.filter(l => l.loan_id !== action.payload);
            })
            .addCase(deleteLoan.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload ?? 'Delete failed';
            });
    },
});

export const { clearSelectedLoan, clearLoansError } = loansSlice.actions;
export default loansSlice.reducer;

export const selectLoans          = (state: RootState) => state.loans.loans;
export const selectLoansLoading   = (state: RootState) => state.loans.loading;
export const selectLoansSubmitting = (state: RootState) => state.loans.submitting;
export const selectLoansTotal     = (state: RootState) => state.loans.total;
export const selectLoansPages     = (state: RootState) => state.loans.pages;
export const selectLoansError     = (state: RootState) => state.loans.error;
export const selectSelectedLoan   = (state: RootState) => state.loans.selectedLoan;
