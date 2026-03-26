import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Permission,
    PermissionsListResponse,
    PermissionSingleResponse,
    EffectivePermissionsResponse,
    EffectivePermissionFlags,
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
            });
    },
});

export const { clearSelectedPermission } = permissionsSlice.actions;
export default permissionsSlice.reducer;

export const selectPermissions = (state: { permissions: PermissionsState }) => state.permissions.permissions;
export const selectPermissionsLoading = (state: { permissions: PermissionsState }) => state.permissions.loading;
export const selectSelectedPermission = (state: { permissions: PermissionsState }) => state.permissions.selectedPermission;
export const selectEffectivePermissions = (state: { permissions: PermissionsState }) => state.permissions.effectivePermissions;
