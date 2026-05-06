import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { financialRequest } from '@/utils/financialEnvelopeApi';
import type {
    Disbursement,
    Paginated,
} from '@/stores/types/financial-disbursements';
import type { RootState } from '@/stores/store';

const BASE = '/disbursements';

export interface ListDisbursementsParams {
    page?: number;
    per_page?: number;
    project_id?: string;
    status?: string;
    payment_source?: string;
    date_from?: string;
    date_to?: string;
}

interface FinancialDisbursementsState {
    loading: boolean;
    detailLoading: boolean;
    pendingLoading: boolean;
    error: string | null;
    list: Disbursement[];
    pagination: Paginated<Disbursement>['pagination'] | null;
    selected: Disbursement | null;
    pendingList: Disbursement[];
    pendingPagination: Paginated<Disbursement>['pagination'] | null;
    approvalsOnly: unknown[] | null;
}

const initialState: FinancialDisbursementsState = {
    loading: false,
    detailLoading: false,
    pendingLoading: false,
    error: null,
    list: [],
    pagination: null,
    selected: null,
    pendingList: [],
    pendingPagination: null,
    approvalsOnly: null,
};

export const fetchDisbursements = createAsyncThunk<
    Paginated<Disbursement>,
    ListDisbursementsParams | void,
    { rejectValue: string }
>('financialDisbursements/list', async (params, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Paginated<Disbursement>>({
            method: 'GET',
            url: `${BASE}/`,
            params: params || {},
        });
        const data = res.data;
        if (!data) return rejectWithValue('No data');
        return data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to load disbursements');
    }
});

export const fetchPendingMyAction = createAsyncThunk<
    Paginated<Disbursement>,
    ListDisbursementsParams | void,
    { rejectValue: string }
>('financialDisbursements/pending', async (params, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Paginated<Disbursement>>({
            method: 'GET',
            url: `${BASE}/pending-my-action`,
            params: params || {},
        });
        const data = res.data;
        if (!data) return rejectWithValue('No data');
        return data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to load queue');
    }
});

export const fetchDisbursementDetail = createAsyncThunk<
    Disbursement,
    string,
    { rejectValue: string }
>('financialDisbursements/detail', async (id, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
            method: 'GET',
            url: `${BASE}/${encodeURIComponent(id)}`,
        });
        const data = res.data;
        if (!data) return rejectWithValue('Not found');
        return data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to load disbursement');
    }
});

export const fetchDisbursementApprovals = createAsyncThunk<
    unknown[],
    string,
    { rejectValue: string }
>('financialDisbursements/approvals', async (id, { rejectWithValue }) => {
    try {
        const res = await financialRequest<unknown[] | { items?: unknown[] }>({
            method: 'GET',
            url: `${BASE}/${encodeURIComponent(id)}/approvals`,
        });
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown[] }).items)) {
            return (data as { items: unknown[] }).items;
        }
        return [];
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to load approvals');
    }
});

export const createDisbursement = createAsyncThunk<
    Disbursement,
    Record<string, unknown>,
    { rejectValue: string }
>('financialDisbursements/create', async (body, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
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

export const updateDisbursement = createAsyncThunk<
    Disbursement,
    { id: string; body: Record<string, unknown> },
    { rejectValue: string }
>('financialDisbursements/update', async ({ id, body }, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
            method: 'PUT',
            url: `${BASE}/${encodeURIComponent(id)}`,
            data: body,
        });
        if (!res.data) return rejectWithValue('Update failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to update');
    }
});

export const deleteDisbursement = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>('financialDisbursements/delete', async (id, { rejectWithValue }) => {
    try {
        await financialRequest({
            method: 'DELETE',
            url: `${BASE}/${encodeURIComponent(id)}`,
        });
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to delete');
    }
});

export const submitDisbursement = createAsyncThunk<
    Disbursement,
    string,
    { rejectValue: string }
>('financialDisbursements/submit', async (id, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
            method: 'POST',
            url: `${BASE}/${encodeURIComponent(id)}/submit`,
        });
        if (!res.data) return rejectWithValue('Submit failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to submit');
    }
});

export const approveDisbursement = createAsyncThunk<
    Disbursement,
    { id: string; remarks?: string },
    { rejectValue: string }
>('financialDisbursements/approve', async ({ id, remarks }, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
            method: 'POST',
            url: `${BASE}/${encodeURIComponent(id)}/approve`,
            data: { remarks: remarks ?? '' },
        });
        if (!res.data) return rejectWithValue('Approve failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to approve');
    }
});

export const rejectDisbursement = createAsyncThunk<
    Disbursement,
    { id: string; reason: string },
    { rejectValue: string }
>('financialDisbursements/reject', async ({ id, reason }, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
            method: 'POST',
            url: `${BASE}/${encodeURIComponent(id)}/reject`,
            data: { reason },
        });
        if (!res.data) return rejectWithValue('Reject failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to reject');
    }
});

export const payDisbursement = createAsyncThunk<
    Disbursement,
    { id: string; payment_ref: string; payment_date: string },
    { rejectValue: string }
>('financialDisbursements/pay', async ({ id, payment_ref, payment_date }, { rejectWithValue }) => {
    try {
        const res = await financialRequest<Disbursement>({
            method: 'POST',
            url: `${BASE}/${encodeURIComponent(id)}/pay`,
            data: { payment_ref, payment_date },
        });
        if (!res.data) return rejectWithValue('Pay failed');
        return res.data;
    } catch (e: any) {
        return rejectWithValue(e?.message || 'Failed to record payment');
    }
});

const slice = createSlice({
    name: 'financialDisbursements',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
            state.approvalsOnly = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDisbursements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDisbursements.fulfilled, (state, action: PayloadAction<Paginated<Disbursement>>) => {
                state.loading = false;
                state.list = action.payload.items || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchDisbursements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || null;
                state.list = [];
            })
            .addCase(fetchPendingMyAction.pending, (state) => {
                state.pendingLoading = true;
            })
            .addCase(fetchPendingMyAction.fulfilled, (state, action: PayloadAction<Paginated<Disbursement>>) => {
                state.pendingLoading = false;
                state.pendingList = action.payload.items || [];
                state.pendingPagination = action.payload.pagination || null;
            })
            .addCase(fetchPendingMyAction.rejected, (state, action) => {
                state.pendingLoading = false;
                state.error = action.payload || null;
                state.pendingList = [];
            })
            .addCase(fetchDisbursementDetail.pending, (state) => {
                state.detailLoading = true;
            })
            .addCase(fetchDisbursementDetail.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.detailLoading = false;
                state.selected = action.payload;
            })
            .addCase(fetchDisbursementDetail.rejected, (state, action) => {
                state.detailLoading = false;
                state.error = action.payload || null;
                state.selected = null;
            })
            .addCase(fetchDisbursementApprovals.fulfilled, (state, action: PayloadAction<unknown[]>) => {
                state.approvalsOnly = action.payload;
            })
            .addCase(createDisbursement.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.selected = action.payload;
            })
            .addCase(updateDisbursement.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.selected = action.payload;
            })
            .addCase(submitDisbursement.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.selected = action.payload;
            })
            .addCase(approveDisbursement.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.selected = action.payload;
            })
            .addCase(rejectDisbursement.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.selected = action.payload;
            })
            .addCase(payDisbursement.fulfilled, (state, action: PayloadAction<Disbursement>) => {
                state.selected = action.payload;
            })
            .addCase(deleteDisbursement.fulfilled, (state) => {
                state.selected = null;
            });
    },
});

export const { clearSelected } = slice.actions;
export default slice.reducer;

export const selectDisbursementsList = (state: RootState) => state.financialDisbursements.list;
export const selectDisbursementsPagination = (state: RootState) => state.financialDisbursements.pagination;
export const selectDisbursementDetail = (state: RootState) => state.financialDisbursements.selected;
export const selectDisbursementsLoading = (state: RootState) => state.financialDisbursements.loading;
export const selectDisbursementDetailLoading = (state: RootState) => state.financialDisbursements.detailLoading;
export const selectDisbursementsError = (state: RootState) => state.financialDisbursements.error;
export const selectPendingDisbursements = (state: RootState) => state.financialDisbursements.pendingList;
export const selectPendingDisbursementsPagination = (state: RootState) => state.financialDisbursements.pendingPagination;
export const selectPendingDisbursementsLoading = (state: RootState) => state.financialDisbursements.pendingLoading;
