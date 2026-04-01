import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Permission,
    PermissionsListResponse,
    PermissionSingleResponse,
    EffectivePermissionsResponse,
    EffectivePermissionFlags,
    CreatePermissionParams,
    UpdatePermissionParams,
} from '@/stores/types/permissions';

interface PermissionsState {
    loading: boolean;
    error: string | null;
    permissions: Permission[];
    selectedPermission: Permission | null;
    effectivePermissions: Record<string, EffectivePermissionFlags> | null;
}

const initialState: PermissionsState = {
    loading: false,
    error: null,
    permissions: [],
    selectedPermission: null,
    effectivePermissions: null,
};

export interface FetchPermissionsParams {
    module?: string;
}

export const fetchPermissions = createAsyncThunk<
    PermissionsListResponse,
    FetchPermissionsParams | void,
    { rejectValue: string }
>('permissions/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<PermissionsListResponse>('/permissions/fetch', {
            params: params || {},
        });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch permissions';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch permissions';
        return rejectWithValue(msg);
    }
});

export const fetchPermission = createAsyncThunk<
    PermissionSingleResponse,
    number,
    { rejectValue: string }
>('permissions/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get<PermissionSingleResponse>(
            `/permissions/fetch/permission/${id}`
        );
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch permission';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch permission';
        return rejectWithValue(msg);
    }
});

export const fetchEffectivePermissions = createAsyncThunk<
    EffectivePermissionsResponse,
    void,
    { rejectValue: string }
>('permissions/effective', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get<EffectivePermissionsResponse>('/permissions/effective');
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch effective permissions';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch effective permissions';
        return rejectWithValue(msg);
    }
});

export const createPermission = createAsyncThunk<
    PermissionSingleResponse,
    CreatePermissionParams,
    { rejectValue: string }
>('permissions/create', async (params, { rejectWithValue }) => {
    try {
        const response = await api.post<PermissionSingleResponse>('/permissions/create', { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to create permission';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to create permission';
        return rejectWithValue(msg);
    }
});

export const updatePermission = createAsyncThunk<
    PermissionSingleResponse,
    { id: number; params: UpdatePermissionParams },
    { rejectValue: string }
>('permissions/update', async ({ id, params }, { rejectWithValue }) => {
    try {
        const response = await api.put<PermissionSingleResponse>(`/permissions/update/${id}`, { params });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to update permission';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to update permission';
        return rejectWithValue(msg);
    }
});

export const deletePermission = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>('permissions/delete', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/permissions/delete/${id}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to delete permission';
            return rejectWithValue(msg);
        }
        return id;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to delete permission';
        return rejectWithValue(msg);
    }
});

function normalizeListPayload(body: PermissionsListResponse['body']): Permission[] {
    const raw = body?.permissions;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: Permission[] }).items)) {
        return (raw as { items: Permission[] }).items;
    }
    return [];
}

const permissionsSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        clearSelectedPermission(state) {
            state.selectedPermission = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action: PayloadAction<PermissionsListResponse>) => {
                state.loading = false;
                state.permissions = normalizeListPayload(action.payload.body);
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch permissions';
                state.permissions = [];
            })
            .addCase(fetchPermission.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchPermission.fulfilled, (state, action: PayloadAction<PermissionSingleResponse>) => {
                state.selectedPermission = action.payload.body?.permission ?? null;
            })
            .addCase(fetchPermission.rejected, (state, action) => {
                state.error = action.payload || 'Failed to fetch permission';
                state.selectedPermission = null;
            })
            .addCase(fetchEffectivePermissions.fulfilled, (state, action: PayloadAction<EffectivePermissionsResponse>) => {
                state.effectivePermissions = action.payload.body?.permissions ?? null;
            })
            .addCase(createPermission.fulfilled, (state, action: PayloadAction<PermissionSingleResponse>) => {
                const p = action.payload.body?.permission;
                if (p) state.permissions.push(p);
            })
            .addCase(updatePermission.fulfilled, (state, action: PayloadAction<PermissionSingleResponse>) => {
                const p = action.payload.body?.permission;
                if (p) {
                    const idx = state.permissions.findIndex((x) => x.id === p.id);
                    if (idx !== -1) state.permissions[idx] = p;
                    if (state.selectedPermission?.id === p.id) state.selectedPermission = p;
                }
            })
            .addCase(deletePermission.fulfilled, (state, action: PayloadAction<number>) => {
                state.permissions = state.permissions.filter((p) => p.id !== action.payload);
                if (state.selectedPermission?.id === action.payload) state.selectedPermission = null;
            })
            .addCase(deletePermission.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete permission';
            });
    },
});

export const { clearSelectedPermission } = permissionsSlice.actions;
export default permissionsSlice.reducer;

export const selectPermissions = (state: { permissions: PermissionsState }) => state.permissions.permissions;
export const selectPermissionsLoading = (state: { permissions: PermissionsState }) => state.permissions.loading;
export const selectSelectedPermission = (state: { permissions: PermissionsState }) => state.permissions.selectedPermission;
export const selectEffectivePermissions = (state: { permissions: PermissionsState }) => state.permissions.effectivePermissions;
