// REFACTOR-PHASE-2: Updated to use centralized API response normalization
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Approval, ApprovalsResponse, ApprovalsResponseLegacy } from '@/stores/types/approvals';
import type { RootState } from '@/stores/store';
import { normalizeApiResponse, extractErrorMessage, isSuccessResponse } from '@/utils/apiResponse';

// ================== State Interface ==================
interface ApprovalsState {
    loading: boolean;
    error: string | null;
    approvals: Approval[];
    selectedApproval: Approval | null;
    total: number;
    pages: number;
    currentRequestId: string | null;
    // REFACTOR-PHASE-2: State for approval timeline
    timelineApprovals: Approval[];
    timelineLoading: boolean;
    timelineError: string | null;
    // State for approval update
    updateLoading: boolean;
    updateError: string | null;
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
    // REFACTOR-PHASE-2: Initialize new state
    timelineApprovals: [],
    timelineLoading: false,
    timelineError: null,
    updateLoading: false,
    updateError: null,
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

        // REFACTOR-PHASE-2: Use centralized response normalization
        if (!isSuccessResponse(response.data)) {
            const errorMsg = extractErrorMessage(response.data, 'Failed to fetch approvals');
            return rejectWithValue(errorMsg);
        }

        return response.data as ApprovalsResponse | ApprovalsResponseLegacy;
    } catch (error: any) {
        const message = extractErrorMessage(error, 'Server connection failed');
        return rejectWithValue(message);
    }
});

/**
 * REFACTOR-PHASE-2: Update approval status (approve/reject)
 * Centralized API call to replace direct axios calls in ApprovalModal
 */
interface UpdateApprovalParams {
    approvalId: string;
    status: 'Approved' | 'Rejected';
    remarks: string;
}

export const updateApproval = createAsyncThunk<
    { success: boolean; approval?: Approval },
    UpdateApprovalParams,
    { rejectValue: string }
>('approvals/updateApproval', async (params, { rejectWithValue }) => {
    try {
        const { approvalId, status, remarks } = params;
        const response = await api.put(`/approvals/update/${approvalId}`, {
            params: {
                status,
                remarks: remarks.trim() || (status === 'Approved' ? 'تمت الموافقة' : ''),
            },
        });

        // REFACTOR-PHASE-2: Use centralized response normalization
        if (!isSuccessResponse(response.data)) {
            const errorMsg = extractErrorMessage(response.data, 'Failed to update approval');
            return rejectWithValue(errorMsg);
        }

        // Extract approval data if available
        const normalized = normalizeApiResponse(response.data);
        return {
            success: normalized.success,
            approval: normalized.data as Approval,
        };
    } catch (error: any) {
        const message = extractErrorMessage(error, 'Failed to update approval');
        return rejectWithValue(message);
    }
});

/**
 * REFACTOR-PHASE-2: Fetch approvals for a specific request (for timeline)
 * Centralized API call to replace direct axios calls in ApprovalTimeline
 */
export const fetchApprovalsByRequestId = createAsyncThunk<
    Approval[],
    string,
    { rejectValue: string }
>('approvals/fetchByRequestId', async (requestId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/approvals/fetch/${requestId}`);

        // REFACTOR-PHASE-2: Use centralized response normalization
        if (!isSuccessResponse(response.data)) {
            const errorMsg = extractErrorMessage(response.data, 'Failed to fetch approval timeline');
            return rejectWithValue(errorMsg);
        }

        const normalized = normalizeApiResponse(response.data);
        // Handle different response structures
        const approvalsData = normalized.data as any;
        const approvals = approvalsData?.approvals?.items || approvalsData?.items || approvalsData || [];
        
        return Array.isArray(approvals) ? approvals : [];
    } catch (error: any) {
        const message = extractErrorMessage(error, 'Failed to fetch approval timeline');
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
            })
            // REFACTOR-PHASE-2: Handle update approval
            .addCase(updateApproval.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateApproval.fulfilled, (state, action) => {
                state.updateLoading = false;
                // Remove from approvals list if it was pending
                if (action.payload.approval) {
                    state.approvals = state.approvals.filter(
                        a => a.id !== action.payload.approval?.id
                    );
                }
            })
            .addCase(updateApproval.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = action.payload || 'Failed to update approval';
            })
            // REFACTOR-PHASE-2: Handle fetch approvals by request ID
            .addCase(fetchApprovalsByRequestId.pending, (state) => {
                state.timelineLoading = true;
                state.timelineError = null;
            })
            .addCase(fetchApprovalsByRequestId.fulfilled, (state, action) => {
                state.timelineLoading = false;
                state.timelineApprovals = action.payload;
            })
            .addCase(fetchApprovalsByRequestId.rejected, (state, action) => {
                state.timelineLoading = false;
                state.timelineError = action.payload || 'Failed to fetch approval timeline';
                state.timelineApprovals = [];
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
// REFACTOR-PHASE-2: New selectors for timeline and update
export const selectTimelineApprovals = (state: RootState) => state.approvals.timelineApprovals;
export const selectTimelineLoading = (state: RootState) => state.approvals.timelineLoading;
export const selectTimelineError = (state: RootState) => state.approvals.timelineError;
export const selectUpdateLoading = (state: RootState) => state.approvals.updateLoading;
export const selectUpdateError = (state: RootState) => state.approvals.updateError;

