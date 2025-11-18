
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Project, ProjectResponse, SingleProjectResponse, Budget } from '@/stores/types/projects';

interface ProjectState {
    loading: boolean;
    error: string | null;
    projects: Project[];
    selectedProject: Project | null;
    selectedProjectBudget: Budget | null;
    total: number;
    pages: number;
}

const initialState: ProjectState = {
    loading: false,
    error: null,
    projects: [],
    selectedProject: null,
    selectedProjectBudget: null,
    total: 0,
    pages: 0,
};

interface FetchProjectsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
}

export const fetchProject = createAsyncThunk<
    SingleProjectResponse,
    { id: string },
    { rejectValue: string }
>('projects/fetchProject', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<SingleProjectResponse>(`/projects/fetch/project/${id}`);
        const { header, body } = response.data;

        if (!header.success || !body?.project) {
            const message = header?.messages?.[0]?.message || header?.message || 'فشل في جلب بيانات المشروع';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message = 
            serverError?.messages?.[0]?.message || 
            serverError?.message || 
            'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

export const fetchProjects = createAsyncThunk<
    ProjectResponse,
    FetchProjectsParams,
    { rejectValue: string }
>('projects/fetchProjects', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<ProjectResponse>('/projects/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.projects) {
            const message = header?.messages?.[0]?.message || header?.message || 'فشل في جلب قائمة المشاريع';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message = 
            serverError?.messages?.[0]?.message || 
            serverError?.message || 
            'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        clearSelectedProject(state) {
            state.selectedProject = null;
            state.selectedProjectBudget = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Projects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<ProjectResponse>) => {
                state.loading = false;
                if (action.payload.body?.projects) {
                    state.projects = action.payload.body.projects.items;
                    state.total = action.payload.body.projects.total;
                    state.pages = action.payload.body.projects.pages;
                }
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ غير متوقع';
                state.projects = [];
                state.total = 0;
                state.pages = 0;
            })
            
            // Fetch Single Project
            .addCase(fetchProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedProject = null;
                state.selectedProjectBudget = null;
            })
            .addCase(fetchProject.fulfilled, (state, action: PayloadAction<SingleProjectResponse>) => {
                state.loading = false;
                if (action.payload.body) {
                    state.selectedProject = action.payload.body.project;
                    state.selectedProjectBudget = action.payload.body.budget;
                }
            })
            .addCase(fetchProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'فشل في تحميل بيانات المشروع';
                state.selectedProject = null;
                state.selectedProjectBudget = null;
            });
    },
});

export const { clearSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;

// Selectors
export const selectProjects = (state: { projects: ProjectState }) => state.projects.projects;
export const selectLoading = (state: { projects: ProjectState }) => state.projects.loading;
export const selectTotalPages = (state: { projects: ProjectState }) => state.projects.pages;
export const selectTotalItems = (state: { projects: ProjectState }) => state.projects.total;
export const selectSelectedProject = (state: { projects: ProjectState }) => state.projects.selectedProject;
export const selectSelectedProjectBudget = (state: { projects: ProjectState }) => state.projects.selectedProjectBudget;
export const selectError = (state: { projects: ProjectState }) => state.projects.error;