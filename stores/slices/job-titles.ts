import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    JobTitle,
    JobTitlesResponse,
    JobTitleSingleResponse,
    CreateJobTitleParams,
    UpdateJobTitleParams,
} from '@/stores/types/job-titles';

interface JobTitlesState {
    loading: boolean;
    error: string | null;
    jobTitles: JobTitle[];
    selectedJobTitle: JobTitle | null;
    total: number;
    pages: number;
}

const initialState: JobTitlesState = {
    loading: false,
    error: null,
    jobTitles: [],
    selectedJobTitle: null,
    total: 0,
    pages: 0,
};

interface FetchJobTitlesParams {
    department_id?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const fetchJobTitles = createAsyncThunk<
    JobTitlesResponse,
    FetchJobTitlesParams | void,
    { rejectValue: string }
>('jobTitles/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<JobTitlesResponse>('/job-titles/fetch', {
            params: params || {},
        });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch job titles';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch job titles';
        return rejectWithValue(msg);
    }
});

export const fetchJobTitle = createAsyncThunk<
    JobTitleSingleResponse,
    number,
    { rejectValue: string }
>('jobTitles/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get<JobTitleSingleResponse>(`/job-titles/fetch/${id}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch job title';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to fetch job title';
        return rejectWithValue(msg);
    }
});

export const createJobTitle = createAsyncThunk<
    JobTitleSingleResponse,
    CreateJobTitleParams,
    { rejectValue: string }
>('jobTitles/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post<JobTitleSingleResponse>('/job-titles/create', { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to create job title';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to create job title';
        return rejectWithValue(msg);
    }
});

export const updateJobTitle = createAsyncThunk<
    JobTitleSingleResponse,
    { id: number; params: UpdateJobTitleParams },
    { rejectValue: string }
>('jobTitles/update', async ({ id, params }, { rejectWithValue }) => {
    try {
        const response = await api.put<JobTitleSingleResponse>(`/job-titles/update/${id}`, { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to update job title';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to update job title';
        return rejectWithValue(msg);
    }
});

export const deleteJobTitle = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>('jobTitles/delete', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/job-titles/delete/${id}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to delete job title';
            return rejectWithValue(msg);
        }
        return id;
    } catch (error: any) {
        const msg = error.response?.data?.header?.messages?.[0]?.message || error.message || 'Failed to delete job title';
        return rejectWithValue(msg);
    }
});

const jobTitlesSlice = createSlice({
    name: 'jobTitles',
    initialState,
    reducers: {
        clearSelectedJobTitle(state) {
            state.selectedJobTitle = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobTitles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobTitles.fulfilled, (state, action: PayloadAction<JobTitlesResponse>) => {
                state.loading = false;
                const raw = action.payload.body?.job_titles ?? [];
                // API may return numeric ids as strings; normalize so UI comparisons work on server builds.
                state.jobTitles = raw.map((jt) => {
                    const id = typeof jt.id === 'string' ? parseInt(jt.id, 10) : Number(jt.id);
                    return {
                        ...jt,
                        id: Number.isFinite(id) ? id : (jt.id as number),
                    };
                });
                state.total = action.payload.body?.total ?? 0;
                state.pages = action.payload.body?.pages ?? 0;
            })
            .addCase(fetchJobTitles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch job titles';
                state.jobTitles = [];
            })
            .addCase(fetchJobTitle.fulfilled, (state, action: PayloadAction<JobTitleSingleResponse>) => {
                state.selectedJobTitle = action.payload.body?.job_title ?? null;
            })
            .addCase(fetchJobTitle.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch job title';
                state.selectedJobTitle = null;
            })
            .addCase(createJobTitle.fulfilled, (state, action: PayloadAction<JobTitleSingleResponse>) => {
                const jt = action.payload.body?.job_title;
                if (jt) {
                    state.jobTitles.push(jt);
                    state.total += 1;
                }
            })
            .addCase(updateJobTitle.fulfilled, (state, action: PayloadAction<JobTitleSingleResponse>) => {
                const jt = action.payload.body?.job_title;
                if (jt) {
                    const idx = state.jobTitles.findIndex((x) => x.id === jt.id);
                    if (idx !== -1) state.jobTitles[idx] = jt;
                    if (state.selectedJobTitle?.id === jt.id) state.selectedJobTitle = jt;
                }
            })
            .addCase(deleteJobTitle.fulfilled, (state, action: PayloadAction<number>) => {
                state.jobTitles = state.jobTitles.filter((jt) => jt.id !== action.payload);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedJobTitle?.id === action.payload) state.selectedJobTitle = null;
            })
            .addCase(deleteJobTitle.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete job title';
            });
    },
});

export const { clearSelectedJobTitle } = jobTitlesSlice.actions;
export default jobTitlesSlice.reducer;
export const selectJobTitles = (state: { jobTitles: JobTitlesState }) => state.jobTitles.jobTitles;
export const selectJobTitlesLoading = (state: { jobTitles: JobTitlesState }) => state.jobTitles.loading;
export const selectJobTitlesTotal = (state: { jobTitles: JobTitlesState }) => state.jobTitles.total;
export const selectJobTitlesPages = (state: { jobTitles: JobTitlesState }) => state.jobTitles.pages;
export const selectSelectedJobTitle = (state: { jobTitles: JobTitlesState }) => state.jobTitles.selectedJobTitle;
