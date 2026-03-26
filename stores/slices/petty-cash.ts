import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { financialRequest } from '@/utils/financialEnvelopeApi';
import type { Paginated, PettyCashBox } from '@/stores/types/financial-disbursements';
import type { RootState } from '@/stores/store';

const BASE = '/petty-cash';

interface PettyCashState {
    loading: boolean;
    error: string | null;
    list: PettyCashBox[];
    pagination: Paginated<PettyCashBox>['pagination'] | null;
}

const initialState: PettyCashState = {
    loading: false,
    error: null,
    list: [],
    pagination: null,
};

export const fetchPettyCashBoxes = createAsyncThunk<
    Paginated<PettyCashBox>,
    { page?: number; per_page?: number } | void,
    { rejectValue: string }
>('pettyCash/list', async (params, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Paginated<PettyCashBox>>({
            method: 'GET',
            url: `${BASE}/`,
            params: params || {},
        });
        if (!res.data) return rejectWithValue('No data');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to load petty cash');
    }
});

export const createPettyCashBox = createAsyncThunk<
    PettyCashBox,
    { name: string; project_id: string; currency: string },
    { rejectValue: string }
>('pettyCash/create', async (body, { rejectWithValue }) => {
    try {
        const res = await financialRequest<PettyCashBox>({
            method: 'POST',
            url: `${BASE}/`,
            data: body,
        });
        if (!res.data) return rejectWithValue('Create failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to create');
    }
});

export const topUpPettyCash = createAsyncThunk<
    PettyCashBox,
    { id: string; amount: number },
    { rejectValue: string }
>('pettyCash/topup', async ({ id, amount }, { rejectWithValue }) => {
    try {
        const res = await financialRequest<PettyCashBox>({
            method: 'PUT',
            url: `${BASE}/${encodeURIComponent(id)}/topup`,
            data: { amount },
        });
        if (!res.data) return rejectWithValue('Top-up failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to top up');
    }
});

const slice = createSlice({
    name: 'pettyCash',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPettyCashBoxes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPettyCashBoxes.fulfilled, (state, action: PayloadAction<Paginated<PettyCashBox>>) => {
                state.loading = false;
                state.list = action.payload.items || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchPettyCashBoxes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
            })
            .addCase(createPettyCashBox.fulfilled, (state) => {
                /* list refresh from page */
            })
            .addCase(topUpPettyCash.fulfilled, (state) => {
                /* list refresh from page */
            });
    },
});

export default slice.reducer;

export const selectPettyCashList = (state: RootState) => state.pettyCash.list;
export const selectPettyCashPagination = (state: RootState) => state.pettyCash.pagination;
export const selectPettyCashLoading = (state: RootState) => state.pettyCash.loading;
