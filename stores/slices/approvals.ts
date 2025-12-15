import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Approval, ApprovalsResponse, ApprovalsResponseLegacy } from '@/stores/types/approvals';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface ApprovalsState {
    loading: boolean;
    error: string | null;
    approvals: Approval[];
    selectedApproval: Approval | null;
    total: number;
    pages: number;
    currentRequestId: string | null;
}

// ================== Initial State ==================
const initialState: ApprovalsState = {
    loading: false,
    error: null,
    approvals: [],
    selectedApproval: null,
    total: 0,
    pages: 0,
    currentRequestId: null,
};

// ================== Params Interface ==================
interface FetchApprovalsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    request_id?: string; // Optional filter by request ID
}

// ================== Async Thunks ==================
/**
 * Fetch list of all approvals with optional filters
 */
export const fetchApprovals = createAsyncThunk<
    ApprovalsResponse | ApprovalsResponseLegacy,
    FetchApprovalsParams,
    { rejectValue: string }
>('approvals/fetchApprovals', async (params, { rejectWithValue }) => {
    try {
        const { page, limit, search, type, status, request_id } = params;
        const response = await api.get('/approvals/fetch', {
            params: {
                page: page || 1,
                limit: limit || 10,
                search: search || undefined,
                type: type || undefined,
                status: status || undefined,
                request_id: request_id || undefined,
            },
        });

        // Handle new API response structure { success, data }
        if ('success' in response.data && response.data.success) {
            return response.data as ApprovalsResponse;
        }

        // Handle legacy API response structure { header, body }
        if ('header' in response.data && response.data.header?.success) {
            return response.data as ApprovalsResponseLegacy;
        }

        // Handle error response
        const errorMsg = 
            (response.data as ApprovalsResponse)?.errors?.[0]?.message ||
            (response.data as ApprovalsResponse)?.message ||
            (response.data as ApprovalsResponseLegacy)?.header?.messages?.[0]?.message ||
            (response.data as ApprovalsResponseLegacy)?.header?.message ||
            'Failed to fetch approvals';
        
        return rejectWithValue(errorMsg);
    } catch (error: any) {
        const serverError = error.response?.data;
        const message =
            serverError?.errors?.[0]?.message ||
            serverError?.message ||
            serverError?.header?.messages?.[0]?.message ||
            serverError?.header?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

// ================== Slice ==================
const approvalsSlice = createSlice({
    name: 'approvals',
    initialState,
    reducers: {
        /**
         * Clear selected approval details from state
         */
        clearSelectedApproval(state) {
            state.selectedApproval = null;
        },
        /**
         * Clear approvals list
         */
        clearApprovals(state) {
            state.approvals = [];
            state.total = 0;
            state.pages = 0;
            state.currentRequestId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Approvals List
            .addCase(fetchApprovals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApprovals.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                
                // Handle new API response structure
                if ('data' in payload && payload.data?.approvals) {
                    const { total, pages, items } = payload.data.approvals;
                    state.approvals = items || [];
                    state.total = total || 0;
                    state.pages = pages || 0;
                }
                // Handle legacy API response structure
                else if ('body' in payload && payload.body?.approvals) {
                    const { total, pages, items } = payload.body.approvals;
                    state.approvals = items || [];
                    state.total = total || 0;
                    state.pages = pages || 0;
                }
                
                // Store current request ID from the action meta (if provided as filter)
                const meta = (action as any).meta;
                if (meta?.arg?.request_id) {
                    state.currentRequestId = meta.arg.request_id;
                } else {
                    state.currentRequestId = null;
                }
            })
            .addCase(fetchApprovals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.approvals = [];
                state.total = 0;
                state.pages = 0;
            });
    },
});

// ================== Exports ==================
export const { clearSelectedApproval, clearApprovals } = approvalsSlice.actions;
export default approvalsSlice.reducer;

// ================== Selectors ==================
export const selectApprovals = (state: RootState) => state.approvals.approvals;
export const selectApprovalsLoading = (state: RootState) => state.approvals.loading;
export const selectApprovalsError = (state: RootState) => state.approvals.error;
export const selectApprovalsTotal = (state: RootState) => state.approvals.total;
export const selectApprovalsPages = (state: RootState) => state.approvals.pages;
export const selectSelectedApproval = (state: RootState) => state.approvals.selectedApproval;
export const selectCurrentRequestId = (state: RootState) => state.approvals.currentRequestId;

