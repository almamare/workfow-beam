import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { RootState } from '@/stores/store';

interface PendingCounts {
    Projects?: number;
    Financial?: number;
    Clients?: number;
    Tasks?: number;
    ProjectContracts?: number;
    [key: string]: number | undefined;
}

interface PendingCountsState {
    counts: PendingCounts;
    loading: boolean;
}

const initialState: PendingCountsState = {
    counts: {},
    loading: false,
};

export const fetchPendingCounts = createAsyncThunk<PendingCounts, void, { rejectValue: string }>(
    'pendingCounts/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/requests/tasks/pending-counts');
            return res.data?.body?.pending_counts ?? res.data?.data?.pending_counts ?? {};
        } catch {
            return rejectWithValue('Failed to fetch pending counts');
        }
    }
);

const pendingCountsSlice = createSlice({
    name: 'pendingCounts',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPendingCounts.pending, (state) => { state.loading = true; })
            .addCase(fetchPendingCounts.fulfilled, (state, action) => {
                state.loading = false;
                state.counts = action.payload;
            })
            .addCase(fetchPendingCounts.rejected, (state) => { state.loading = false; });
    },
});

export default pendingCountsSlice.reducer;

export const selectPendingCounts       = (state: RootState) => state.pendingCounts.counts;
export const selectProjectsPendingCount = (state: RootState) => state.pendingCounts.counts.Projects ?? 0;
export const selectFinancialPendingCount = (state: RootState) => state.pendingCounts.counts.Financial ?? 0;
export const selectClientsPendingCount  = (state: RootState) => state.pendingCounts.counts.Clients ?? 0;
export const selectTasksPendingCount    = (state: RootState) => state.pendingCounts.counts.Tasks ?? 0;
export const selectProjectContractsPendingCount = (state: RootState) => state.pendingCounts.counts.ProjectContracts ?? 0;
