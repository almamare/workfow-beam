import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { JobTitle, JobTitlesResponse } from '@/stores/types/job-titles';

interface JobTitlesState {
    loading: boolean;
    error: string | null;
    jobTitles: JobTitle[];
}

const initialState: JobTitlesState = {
    loading: false,
    error: null,
    jobTitles: [],
};

interface FetchJobTitlesParams {
    department_id?: string;
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
        const { header, body } = response.data;
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

const jobTitlesSlice = createSlice({
    name: 'jobTitles',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobTitles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobTitles.fulfilled, (state, action: PayloadAction<JobTitlesResponse>) => {
                state.loading = false;
                state.jobTitles = action.payload.body?.job_titles ?? [];
            })
            .addCase(fetchJobTitles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch job titles';
                state.jobTitles = [];
            });
    },
});

export default jobTitlesSlice.reducer;
export const selectJobTitles = (state: { jobTitles: JobTitlesState }) => state.jobTitles.jobTitles;
export const selectJobTitlesLoading = (state: { jobTitles: JobTitlesState }) => state.jobTitles.loading;
