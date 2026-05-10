import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type {
    WorkflowStep,
    WorkflowListResponse,
    WorkflowStepSingleResponse,
    CreateWorkflowStepParams,
    UpdateWorkflowStepParams,
} from '@/stores/types/workflow';

interface WorkflowState {
    loading: boolean;
    error: string | null;
    steps: WorkflowStep[];
}

const initialState: WorkflowState = {
    loading: false,
    error: null,
    steps: [],
};

function extractMsg(error: any): string {
    return (
        error?.response?.data?.header?.messages?.[0]?.message ||
        error?.message ||
        'An error occurred'
    );
}

export const fetchWorkflowSteps = createAsyncThunk<
    WorkflowListResponse,
    { request_type?: string } | void,
    { rejectValue: string }
>('workflow/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<WorkflowListResponse>('/workflow/fetch', {
            params: params || {},
        });
        if (!response.data.header?.success) {
            return rejectWithValue(
                (response.data.header?.messages as any)?.[0]?.message || 'Failed to fetch workflow'
            );
        }
        return response.data;
    } catch (error: any) {
        return rejectWithValue(extractMsg(error));
    }
});

export const createWorkflowStep = createAsyncThunk<
    WorkflowStepSingleResponse,
    CreateWorkflowStepParams,
    { rejectValue: string }
>('workflow/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post<WorkflowStepSingleResponse>('/workflow/create', { params });
        if (!response.data.header?.success) {
            return rejectWithValue(
                (response.data.header?.messages as any)?.[0]?.message || 'Failed to create step'
            );
        }
        return response.data;
    } catch (error: any) {
        return rejectWithValue(extractMsg(error));
    }
});

export const updateWorkflowStep = createAsyncThunk<
    WorkflowStepSingleResponse,
    { id: number; params: UpdateWorkflowStepParams },
    { rejectValue: string }
>('workflow/update', async ({ id, params }, { rejectWithValue }) => {
    try {
        const response = await api.put<WorkflowStepSingleResponse>(`/workflow/update/${id}`, { params });
        if (!response.data.header?.success) {
            return rejectWithValue(
                (response.data.header?.messages as any)?.[0]?.message || 'Failed to update step'
            );
        }
        return response.data;
    } catch (error: any) {
        return rejectWithValue(extractMsg(error));
    }
});

export const deleteWorkflowStep = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>('workflow/delete', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/workflow/delete/${id}`);
        if (!response.data.header?.success) {
            return rejectWithValue(
                (response.data.header?.messages as any)?.[0]?.message || 'Failed to delete step'
            );
        }
        return id;
    } catch (error: any) {
        return rejectWithValue(extractMsg(error));
    }
});

const workflowSlice = createSlice({
    name: 'workflow',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkflowSteps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkflowSteps.fulfilled, (state, action: PayloadAction<WorkflowListResponse>) => {
                state.loading = false;
                state.steps = action.payload.body?.workflow_steps ?? [];
            })
            .addCase(fetchWorkflowSteps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch workflow steps';
                state.steps = [];
            })
            .addCase(createWorkflowStep.fulfilled, (state, action: PayloadAction<WorkflowStepSingleResponse>) => {
                const step = action.payload.body?.success?.workflow_step;
                if (step) {
                    state.steps.push(step);
                    state.steps.sort((a, b) =>
                        a.request_type.localeCompare(b.request_type) || a.step_level - b.step_level
                    );
                }
            })
            .addCase(updateWorkflowStep.fulfilled, (state, action: PayloadAction<WorkflowStepSingleResponse>) => {
                const step = action.payload.body?.success?.workflow_step;
                if (step) {
                    const idx = state.steps.findIndex((s) => s.id === step.id);
                    if (idx >= 0) state.steps[idx] = step;
                    state.steps.sort((a, b) =>
                        a.request_type.localeCompare(b.request_type) || a.step_level - b.step_level
                    );
                }
            })
            .addCase(deleteWorkflowStep.fulfilled, (state, action: PayloadAction<number>) => {
                state.steps = state.steps.filter((s) => s.id !== action.payload);
            });
    },
});

export default workflowSlice.reducer;

export const selectWorkflowSteps = (state: { workflow?: WorkflowState }) => state.workflow?.steps ?? [];
export const selectWorkflowLoading = (state: { workflow?: WorkflowState }) => state.workflow?.loading ?? false;
export const selectWorkflowError = (state: { workflow?: WorkflowState }) => state.workflow?.error ?? null;
