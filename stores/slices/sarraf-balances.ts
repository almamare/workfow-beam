import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    SarrafBalance,
    SarrafBalancesListResponse,
    SarrafBalanceSingleResponse,
    SarrafBalancesBySarrafResponse,
    CreateSarrafBalanceParams,
    UpdateSarrafBalanceParams,
} from '@/stores/types/sarraf-balances';

interface SarrafBalancesState {
    loading: boolean;
    error: string | null;
    balances: SarrafBalance[];
    selectedBalance: SarrafBalance | null;
    balancesBySarraf: SarrafBalance[];
    selectedSarrafInfo: { sarraf_id: string; sarraf_name?: string; sarraf_no?: string } | null;
    total: number;
    pages: number;
}

const initialState: SarrafBalancesState = {
    loading: false,
    error: null,
    balances: [],
    selectedBalance: null,
    balancesBySarraf: [],
    selectedSarrafInfo: null,
    total: 0,
    pages: 0,
};

export interface FetchSarrafBalancesParams {
    page?: number;
    limit?: number;
    sarraf_id?: string;
    currency?: string;
}

function normalizeList(body: SarrafBalancesListResponse['body']): { items: SarrafBalance[]; total: number; pages: number } {
    const raw = body?.balances;
    if (raw && typeof raw === 'object' && 'items' in raw) {
        const r = raw as { items?: SarrafBalance[]; total?: number; pages?: number };
        return {
            items: Array.isArray(r.items) ? r.items : [],
            total: r.total ?? 0,
            pages: r.pages ?? 1,
        };
    }
    const arr = Array.isArray(raw) ? raw : [];
    return { items: arr, total: arr.length, pages: 1 };
}

export const fetchSarrafBalances = createAsyncThunk<
    SarrafBalancesListResponse,
    FetchSarrafBalancesParams | void,
    { rejectValue: string }
>('sarrafBalances/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<SarrafBalancesListResponse>('/sarraf-balances/fetch', { params: params || {} });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch sarraf balances';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch sarraf balances';
        return rejectWithValue(msg);
    }
});

export const fetchSarrafBalancesBySarraf = createAsyncThunk<
    SarrafBalancesBySarrafResponse,
    string,
    { rejectValue: string }
>('sarrafBalances/fetchBySarraf', async (sarrafId, { rejectWithValue }) => {
    try {
        const response = await api.get<SarrafBalancesBySarrafResponse>(`/sarraf-balances/fetch/sarraf/${sarrafId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch sarraf balances';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch sarraf balances';
        return rejectWithValue(msg);
    }
});

export const fetchSarrafBalance = createAsyncThunk<
    SarrafBalanceSingleResponse,
    string,
    { rejectValue: string }
>('sarrafBalances/fetchOne', async (balanceId, { rejectWithValue }) => {
    try {
        const response = await api.get<SarrafBalanceSingleResponse>(`/sarraf-balances/fetch/balance/${balanceId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch balance';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch balance';
        return rejectWithValue(msg);
    }
});

export const createSarrafBalance = createAsyncThunk<
    SarrafBalanceSingleResponse,
    CreateSarrafBalanceParams,
    { rejectValue: string }
>('sarrafBalances/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post('/sarraf-balances/create', { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to create balance';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to create balance';
        return rejectWithValue(msg);
    }
});

export const updateSarrafBalance = createAsyncThunk<
    SarrafBalanceSingleResponse,
    { balanceId: string; params: UpdateSarrafBalanceParams },
    { rejectValue: string }
>('sarrafBalances/update', async ({ balanceId, params }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/sarraf-balances/update/${balanceId}`, { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to update balance';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to update balance';
        return rejectWithValue(msg);
    }
});

export const deleteSarrafBalance = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>('sarrafBalances/delete', async (balanceId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/sarraf-balances/delete/${balanceId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to delete balance';
            return rejectWithValue(msg);
        }
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to delete balance';
        return rejectWithValue(msg);
    }
});

const sarrafBalancesSlice = createSlice({
    name: 'sarrafBalances',
    initialState,
    reducers: {
        clearSelectedBalance(state) {
            state.selectedBalance = null;
        },
        clearBalancesBySarraf(state) {
            state.balancesBySarraf = [];
            state.selectedSarrafInfo = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSarrafBalances.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSarrafBalances.fulfilled, (state, action: PayloadAction<SarrafBalancesListResponse>) => {
                state.loading = false;
                const { items, total, pages } = normalizeList(action.payload.body);
                state.balances = items;
                state.total = total;
                state.pages = pages;
            })
            .addCase(fetchSarrafBalances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch sarraf balances';
                state.balances = [];
                state.total = 0;
                state.pages = 0;
            })
            .addCase(fetchSarrafBalancesBySarraf.fulfilled, (state, action: PayloadAction<SarrafBalancesBySarrafResponse>) => {
                const body = action.payload.body;
                if (body) {
                    state.balancesBySarraf = Array.isArray(body.balances) ? body.balances : [];
                    state.selectedSarrafInfo = body.sarraf ? { sarraf_id: body.sarraf.sarraf_id, sarraf_name: body.sarraf.sarraf_name, sarraf_no: body.sarraf.sarraf_no } : null;
                }
            })
            .addCase(fetchSarrafBalancesBySarraf.rejected, (state, action) => {
                state.error = action.payload || null;
                state.balancesBySarraf = [];
                state.selectedSarrafInfo = null;
            })
            .addCase(fetchSarrafBalance.fulfilled, (state, action: PayloadAction<SarrafBalanceSingleResponse>) => {
                state.selectedBalance = action.payload.body?.balance ?? null;
            })
            .addCase(fetchSarrafBalance.rejected, (state, action) => {
                state.error = action.payload || null;
                state.selectedBalance = null;
            })
            .addCase(createSarrafBalance.fulfilled, (state, action: PayloadAction<SarrafBalanceSingleResponse>) => {
                state.selectedBalance = action.payload.body?.balance ?? null;
            })
            .addCase(updateSarrafBalance.fulfilled, (state, action: PayloadAction<SarrafBalanceSingleResponse>) => {
                state.selectedBalance = action.payload.body?.balance ?? null;
            })
            .addCase(deleteSarrafBalance.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete balance';
            });
    },
});

export const { clearSelectedBalance, clearBalancesBySarraf } = sarrafBalancesSlice.actions;
export default sarrafBalancesSlice.reducer;

export const selectSarrafBalances = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.balances;
export const selectSarrafBalancesLoading = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.loading;
export const selectSarrafBalancesTotal = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.total;
export const selectSarrafBalancesPages = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.pages;
export const selectSelectedSarrafBalance = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.selectedBalance;
export const selectBalancesBySarraf = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.balancesBySarraf;
export const selectSelectedSarrafInfo = (state: { sarrafBalances: SarrafBalancesState }) => state.sarrafBalances.selectedSarrafInfo;
