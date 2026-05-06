import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Role,
    RolePermissionItem,
    RolesListResponse,
    RoleSingleResponse,
    CreateRoleParams,
    UpdateRoleParams,
    RolePermissionsResponse,
    SetRolePermissionItem,
} from '@/stores/types/roles';

interface RolesState {
    loading: boolean;
    error: string | null;
    roles: Role[];
    selectedRole: Role | null;
    rolePermissions: RolePermissionItem[] | null;
    total: number;
    pages: number;
}

const initialState: RolesState = {
    loading: false,
    error: null,
    roles: [],
    selectedRole: null,
    rolePermissions: null,
    total: 0,
    pages: 0,
};

export interface FetchRolesParams {
    page?: number;
    limit?: number;
    search?: string;
    department_id?: string;
}

export const fetchRoles = createAsyncThunk<
    RolesListResponse,
    FetchRolesParams | void,
    { rejectValue: string }
>('roles/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<RolesListResponse>('/roles/fetch', {
            params: params || {},
        });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch roles';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch roles';
        return rejectWithValue(msg);
    }
});

export const fetchRole = createAsyncThunk<
    RoleSingleResponse,
    number,
    { rejectValue: string }
>('roles/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get<RoleSingleResponse>(`/roles/fetch/role/${id}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch role';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch role';
        return rejectWithValue(msg);
    }
});

export const createRole = createAsyncThunk<
    RoleSingleResponse,
    CreateRoleParams,
    { rejectValue: string }
>('roles/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post('/roles/create', { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to create role';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to create role';
        return rejectWithValue(msg);
    }
});

export const updateRole = createAsyncThunk<
    RoleSingleResponse,
    { id: number; params: UpdateRoleParams },
    { rejectValue: string }
>('roles/update', async ({ id, params }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/roles/update/${id}`, { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to update role';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to update role';
        return rejectWithValue(msg);
    }
});

export const deleteRole = createAsyncThunk<
    void,
    number,
    { rejectValue: string }
>('roles/delete', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/roles/delete/${id}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to delete role';
            return rejectWithValue(msg);
        }
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to delete role';
        return rejectWithValue(msg);
    }
});

export const fetchRolePermissions = createAsyncThunk<
    RolePermissionsResponse,
    number,
    { rejectValue: string }
>('roles/fetchPermissions', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get<RolePermissionsResponse>(`/roles/permissions/${id}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch role permissions';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch role permissions';
        return rejectWithValue(msg);
    }
});

export const setRolePermissions = createAsyncThunk<
    RolePermissionsResponse,
    { id: number; permissions: SetRolePermissionItem[] },
    { rejectValue: string }
>('roles/setPermissions', async ({ id, permissions }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/roles/permissions/${id}`, {
            params: { permissions },
        });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to set role permissions';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to set role permissions';
        return rejectWithValue(msg);
    }
});

function normalizeRolesList(body: RolesListResponse['body']): { items: Role[]; total: number; pages: number } {
    const raw = body?.roles;
    if (raw && typeof raw === 'object' && 'items' in raw) {
        const r = raw as { items?: Role[]; total?: number; pages?: number };
        return {
            items: Array.isArray(r.items) ? r.items : [],
            total: r.total ?? 0,
            pages: r.pages ?? 1,
        };
    }
    const arr = Array.isArray(raw) ? raw : [];
    return { items: arr, total: arr.length, pages: 1 };
}

const rolesSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearSelectedRole(state) {
            state.selectedRole = null;
        },
        clearRolePermissions(state) {
            state.rolePermissions = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<RolesListResponse>) => {
                state.loading = false;
                const { items, total, pages } = normalizeRolesList(action.payload.body);
                state.roles = items;
                state.total = total;
                state.pages = pages;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch roles';
                state.roles = [];
                state.total = 0;
                state.pages = 0;
            })
            .addCase(fetchRole.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchRole.fulfilled, (state, action: PayloadAction<RoleSingleResponse>) => {
                state.selectedRole = action.payload.body?.role ?? null;
            })
            .addCase(fetchRole.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch role';
                state.selectedRole = null;
            })
            .addCase(createRole.fulfilled, (state, action: PayloadAction<RoleSingleResponse>) => {
                state.selectedRole = action.payload.body?.role ?? null;
            })
            .addCase(updateRole.fulfilled, (state, action: PayloadAction<RoleSingleResponse>) => {
                state.selectedRole = action.payload.body?.role ?? null;
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete role';
            })
            .addCase(fetchRolePermissions.fulfilled, (state, action: PayloadAction<RolePermissionsResponse>) => {
                const list = action.payload.body?.permissions;
                state.rolePermissions = Array.isArray(list) ? list : null;
            })
            .addCase(fetchRolePermissions.rejected, (state) => {
                state.rolePermissions = null;
            })
            .addCase(setRolePermissions.fulfilled, (state, action: PayloadAction<RolePermissionsResponse>) => {
                const list = action.payload.body?.permissions;
                state.rolePermissions = Array.isArray(list) ? list : null;
            });
    },
});

export const { clearSelectedRole, clearRolePermissions } = rolesSlice.actions;
export default rolesSlice.reducer;

export const selectRoles = (state: { roles: RolesState }) => state.roles.roles;
export const selectRolesLoading = (state: { roles: RolesState }) => state.roles.loading;
export const selectRolesTotal = (state: { roles: RolesState }) => state.roles.total;
export const selectRolesPages = (state: { roles: RolesState }) => state.roles.pages;
export const selectSelectedRole = (state: { roles: RolesState }) => state.roles.selectedRole;
export const selectRolePermissions = (state: { roles: RolesState }) => state.roles.rolePermissions;
