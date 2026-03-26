import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Sarraf,
    SarrafatListResponse,
    SarrafSingleResponse,
    CreateSarrafParams,
    UpdateSarrafParams,
} from '@/stores/types/sarrafat';

interface SarrafatState {
    loading: boolean;
    error: string | null;
    sarrafat: Sarraf[];
    selectedSarraf: Sarraf | null;
    total: number;
    pages: number;
}

const initialState: SarrafatState = {
    loading: false,
    error: null,
    sarrafat: [],
    selectedSarraf: null,
    total: 0,
    pages: 0,
};

export interface FetchSarrafatParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

function normalizeList(body: SarrafatListResponse['body']): { items: Sarraf[]; total: number; pages: number } {
    const raw = body?.sarrafat;
    if (raw && typeof raw === 'object' && 'items' in raw) {
        const r = raw as { items?: Sarraf[]; total?: number; pages?: number };
        return {
            items: Array.isArray(r.items) ? r.items : [],
            total: r.total ?? 0,
            pages: r.pages ?? 1,
        };
    }
    const arr = Array.isArray(raw) ? raw : [];
    return { items: arr, total: arr.length, pages: 1 };
}

export const fetchSarrafat = createAsyncThunk<
    SarrafatListResponse,
    FetchSarrafatParams | void,
    { rejectValue: string }
>('sarrafat/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<SarrafatListResponse>('/sarrafat/fetch', { params: params || {} });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch sarrafat';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch sarrafat';
        return rejectWithValue(msg);
    }
});

export const fetchSarraf = createAsyncThunk<
    SarrafSingleResponse,
    string,
    { rejectValue: string }
>('sarrafat/fetchOne', async (sarrafId, { rejectWithValue }) => {
    try {
        const response = await api.get<SarrafSingleResponse>(`/sarrafat/fetch/sarraf/${sarrafId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch sarraf';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch sarraf';
        return rejectWithValue(msg);
    }
});

export const createSarraf = createAsyncThunk<
    SarrafSingleResponse,
    CreateSarrafParams,
    { rejectValue: string }
>('sarrafat/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post('/sarrafat/create', { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to create sarraf';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to create sarraf';
        return rejectWithValue(msg);
    }
});

export const updateSarraf = createAsyncThunk<
    SarrafSingleResponse,
    { sarrafId: string; params: UpdateSarrafParams },
    { rejectValue: string }
>('sarrafat/update', async ({ sarrafId, params }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/sarrafat/update/${sarrafId}`, { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to update sarraf';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to update sarraf';
        return rejectWithValue(msg);
    }
});

export const deleteSarraf = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>('sarrafat/delete', async (sarrafId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/sarrafat/delete/${sarrafId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to delete sarraf';
            return rejectWithValue(msg);
        }
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to delete sarraf';
        return rejectWithValue(msg);
    }
});

const sarrafatSlice = createSlice({
    name: 'sarrafat',
    initialState,
    reducers: {
        clearSelectedSarraf(state) {
            state.selectedSarraf = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSarrafat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSarrafat.fulfilled, (state, action: PayloadAction<SarrafatListResponse>) => {
                state.loading = false;
                const { items, total, pages } = normalizeList(action.payload.body);
                state.sarrafat = items;
                state.total = total;
                state.pages = pages;
            })
            .addCase(fetchSarrafat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch sarrafat';
                state.sarrafat = [];
                state.total = 0;
                state.pages = 0;
            })
            .addCase(fetchSarraf.pending, (state) => { state.error = null; })
            .addCase(fetchSarraf.fulfilled, (state, action: PayloadAction<SarrafSingleResponse>) => {
                state.selectedSarraf = action.payload.body?.sarraf ?? null;
            })
            .addCase(fetchSarraf.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch sarraf';
                state.selectedSarraf = null;
            })
            .addCase(createSarraf.fulfilled, (state, action: PayloadAction<SarrafSingleResponse>) => {
                state.selectedSarraf = action.payload.body?.sarraf ?? null;
            })
            .addCase(updateSarraf.fulfilled, (state, action: PayloadAction<SarrafSingleResponse>) => {
                state.selectedSarraf = action.payload.body?.sarraf ?? null;
            })
            .addCase(deleteSarraf.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete sarraf';
            });
    },
});

export const { clearSelectedSarraf } = sarrafatSlice.actions;
export default sarrafatSlice.reducer;

export const selectSarrafat = (state: { sarrafat: SarrafatState }) => state.sarrafat.sarrafat;
export const selectSarrafatLoading = (state: { sarrafat: SarrafatState }) => state.sarrafat.loading;
export const selectSarrafatTotal = (state: { sarrafat: SarrafatState }) => state.sarrafat.total;
export const selectSarrafatPages = (state: { sarrafat: SarrafatState }) => state.sarrafat.pages;
export const selectSelectedSarraf = (state: { sarrafat: SarrafatState }) => state.sarrafat.selectedSarraf;
