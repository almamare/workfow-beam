import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Project, ProjectResponse } from '@/stores/types/projects';

interface ProjectState {
    loading: boolean;
    error: string | null;
    projects: Project[];
    total: number;
    pages: number;
}

const initialState: ProjectState = {
    loading: false,
    error: null,
    projects: [],
    total: 0,
    pages: 0,
};

interface FetchProjectsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}

export const fetchProjects = createAsyncThunk<
    {
        items: Project[];
        total: number;
        pages: number;
    },
    FetchProjectsParams,
    { rejectValue: string }
>('projects/fetchProjects', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<ProjectResponse>('/projects/fetch', {
            params,
        });

        const { header, body } = response.data;

        if (!header.success) {
            const message = header?.messages?.length ? header.messages[0]?.message : 'فشل في جلب المشاريع';
            return rejectWithValue(message);
        }

        if (!body || !body.projects) {
            return rejectWithValue('فشل في جلب بيانات المشاريع');
        }

        return {
            items: body.projects.items,
            total: body.projects.total,
            pages: body.projects.pages,
        };
    } catch (error: any) {
        const message =
            error.response?.data?.header?.messages[0]?.message || 'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload.items;
                state.total = action.payload.total;
                state.pages = action.payload.pages;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ غير معروف';
            });
    },
});

export default projectSlice.reducer;
export const selectProjects = (state: { projects: ProjectState }) => state.projects.projects;
export const selectLoading = (state: { projects: ProjectState }) => state.projects.loading;
export const selectTotalPages = (state: { projects: ProjectState }) => state.projects.pages;
export const selectTotalItems = (state: { projects: ProjectState }) => state.projects.total;
