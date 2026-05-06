import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { TendersResponse, Tender } from '@/stores/types/tenders';

interface TendersState {
    tenders: Tender[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
}

const initialState: TendersState = {
    tenders: [],
    total: 0,
    pages: 0,
    loading: false,
    error: null,
};

export const fetchTenders = createAsyncThunk<TendersResponse, { 
    projectId: string; 
    page: number; 
    limit: number; 
    search: string 
}>(
    'tenders/fetchTenders',
    async ({ projectId, page, limit, search }) => {
        const response = await api.get<TendersResponse>(
            `/projects/tenders/fetch/${projectId}`,
            {
                params: {
                    page,
                    limit,
                    search
                }
            }
        );
        return response.data;
    }
);

const tendersSlice = createSlice({
    name: 'tenders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTenders.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.tenders = [];
                state.total = 0;
                state.pages = 0;
            })
            .addCase(fetchTenders.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.body && action.payload.body.tenders) {
                    state.tenders = action.payload.body.tenders.items;
                    state.total = action.payload.body.tenders.total;
                    state.pages = action.payload.body.tenders.pages;
                }
            })
            .addCase(fetchTenders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'حدث خطأ أثناء جلب البيانات';
                state.tenders = [];
                state.total = 0;
                state.pages = 0;
            });
    },
});

export default tendersSlice.reducer;
export const selectTenders = (state: { tenders: TendersState }) => state.tenders.tenders;
export const selectTendersLoading = (state: { tenders: TendersState }) =>
    state.tenders.loading;
export const selectTendersTotal = (state: { tenders: TendersState }) => 
    state.tenders.total;
export const selectTendersPages = (state: { tenders: TendersState }) => 
    state.tenders.pages;
export const selectTendersError = (state: { tenders: TendersState }) => 
    state.tenders.error;
