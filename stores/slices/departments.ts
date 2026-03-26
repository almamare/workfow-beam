import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Department,
    DepartmentsListResponse,
    DepartmentSingleResponse,
} from '@/stores/types/departments';

interface DepartmentsState {
    loading: boolean;
    error: string | null;
    departments: Department[];
    selectedDepartment: Department | null;
    total: number;
    pages: number;
}

const initialState: DepartmentsState = {
    loading: false,
    error: null,
    departments: [],
    selectedDepartment: null,
    total: 0,
    pages: 0,
};

export interface FetchDepartmentsParams {
    parent_id?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export const fetchDepartments = createAsyncThunk<
    DepartmentsListResponse,
    FetchDepartmentsParams | void,
    { rejectValue: string }
>('departments/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<DepartmentsListResponse>('/departments/fetch', {
            params: params || {},
        });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch departments';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch departments';
        return rejectWithValue(msg);
    }
});

export const fetchDepartment = createAsyncThunk<
    DepartmentSingleResponse,
    string,
    { rejectValue: string }
>('departments/fetchOne', async (departmentId, { rejectWithValue }) => {
    try {
        const response = await api.get<DepartmentSingleResponse>(
            `/departments/fetch/department/${departmentId}`
        );
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch department';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch department';
        return rejectWithValue(msg);
    }
});

export interface CreateDepartmentParams {
    name_en: string;
    name_ar?: string;
    dept_code?: string;
    level?: number;
    status?: string;
    department_id?: string;
    parent_id?: string | null;
}

export const createDepartment = createAsyncThunk<
    { header: { success: boolean }; body?: { department?: Department } },
    CreateDepartmentParams,
    { rejectValue: string }
>('departments/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post('/departments/create', { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to create department';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to create department';
        return rejectWithValue(msg);
    }
});

export interface UpdateDepartmentParams {
    departmentId: string;
    params: Partial<{
        name_en: string;
        name_ar: string;
        dept_code: string;
        parent_id: string | null;
        level: number;
        status: string;
    }>;
}

export const updateDepartment = createAsyncThunk<
    { header: { success: boolean }; body?: { department?: Department } },
    UpdateDepartmentParams,
    { rejectValue: string }
>('departments/update', async ({ departmentId, params }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/departments/update/${departmentId}`, { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to update department';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to update department';
        return rejectWithValue(msg);
    }
});

export const deleteDepartment = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>('departments/delete', async (departmentId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/departments/delete/${departmentId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to delete department';
            return rejectWithValue(msg);
        }
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to delete department';
        return rejectWithValue(msg);
    }
});

const departmentsSlice = createSlice({
    name: 'departments',
    initialState,
    reducers: {
        clearSelectedDepartment(state) {
            state.selectedDepartment = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartments.fulfilled, (state, action: PayloadAction<DepartmentsListResponse>) => {
                state.loading = false;
                const dept = action.payload.body?.departments;
                const items = dept?.items;
                state.departments = Array.isArray(items) ? items : [];
                state.total = dept?.total ?? state.departments.length;
                state.pages = dept?.pages ?? 1;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch departments';
                state.departments = [];
            })
            .addCase(fetchDepartment.pending, (state) => {
                state.error = null;
                state.selectedDepartment = null;
            })
            .addCase(fetchDepartment.fulfilled, (state, action: PayloadAction<DepartmentSingleResponse>) => {
                state.selectedDepartment = action.payload.body?.department ?? null;
            })
            .addCase(fetchDepartment.rejected, (state, action) => {
                state.error = action.payload || null;
                state.selectedDepartment = null;
            })
            .addCase(createDepartment.fulfilled, () => {})
            .addCase(updateDepartment.fulfilled, (state, action) => {
                const updated = action.payload.body?.department;
                if (updated && state.selectedDepartment?.id === updated.id) {
                    state.selectedDepartment = updated;
                }
            })
            .addCase(deleteDepartment.fulfilled, () => {});
    },
});

export const { clearSelectedDepartment } = departmentsSlice.actions;
export default departmentsSlice.reducer;

export const selectDepartments = (state: { departments: DepartmentsState }) => state.departments.departments;
export const selectDepartmentsLoading = (state: { departments: DepartmentsState }) => state.departments.loading;
export const selectDepartmentsError = (state: { departments: DepartmentsState }) => state.departments.error;
export const selectSelectedDepartment = (state: { departments: DepartmentsState }) => state.departments.selectedDepartment;
export const selectDepartmentsTotal = (state: { departments: DepartmentsState }) => state.departments.total;
export const selectDepartmentsPages = (state: { departments: DepartmentsState }) => state.departments.pages;
