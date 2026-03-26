import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { financialRequest } from '@/utils/financialEnvelopeApi';
import type { LedgerEntry, Paginated } from '@/stores/types/financial-disbursements';
import type { RootState } from '@/stores/store';

const BASE = '/financial-ledger';

export interface LedgerListParams {
    page?: number;
    per_page?: number;
    project_id?: string;
    payment_source?: string;
    date_from?: string;
    date_to?: string;
}

interface FinancialLedgerApiState {
    loading: boolean;
    error: string | null;
    items: LedgerEntry[];
    pagination: Paginated<LedgerEntry>['pagination'] | null;
}

const initialState: FinancialLedgerApiState = {
    loading: false,
    error: null,
    items: [],
    pagination: null,
};

export const fetchFinancialLedger = createAsyncThunk<
    Paginated<LedgerEntry>,
    LedgerListParams | void,
    { rejectValue: string }
>('financialLedgerApi/fetch', async (params, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Paginated<LedgerEntry>>({
            method: 'GET',
            url: `${BASE}/`,
            params: params || {},
        });
        if (!res.data) return rejectWithValue('No data');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to load ledger');
    }
});

const slice = createSlice({
    name: 'financialLedgerApi',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFinancialLedger.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFinancialLedger.fulfilled, (state, action: PayloadAction<Paginated<LedgerEntry>>) => {
                state.loading = false;
                state.items = action.payload.items || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchFinancialLedger.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
                state.items = [];
            });
    },
});

export default slice.reducer;

export const selectFinancialLedgerItems = (state: RootState) => state.financialLedgerApi.items;
export const selectFinancialLedgerPagination = (state: RootState) => state.financialLedgerApi.pagination;
export const selectFinancialLedgerLoading = (state: RootState) => state.financialLedgerApi.loading;
