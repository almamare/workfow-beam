import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    User,
    UsersResponse,
    UserPermissionsResponse,
    UserPermissionItem,
    SetUserPermissionItem,
} from '@/stores/types/users';

// ================== State Interface ==================
/**
 * UserState
 * Defines the shape of the Redux state for users
 */
interface UserState {
    loading: boolean;
    error: string | null;
    users: User[];
    selectedUser: User | null;
    total: number;
    pages: number;
    /** User permissions (overrides) from GET /users/permissions/{userId} */
    userPermissions: UserPermissionItem[] | null;
}

// ================== Initial State ==================
const initialState: UserState = {
    loading: false,
    error: null,
    users: [],
    selectedUser: null,
    total: 0,
    pages: 0,
    userPermissions: null,
};

// ================== Params Interface ==================
/**
 * Parameters for fetching user list
 */
interface FetchUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    role?: string;
}

// ================== Async Thunks ==================
/**
 * Fetch a single user by ID
 */
export const fetchUser = createAsyncThunk<
    UsersResponse,
    { id: string },
    { rejectValue: string }
>('users/fetchUser', async ({ id }, { rejectWithValue }) => {
    try {
        // Try endpoint 1: /users/fetch/${id} (used in update page)
        try {
            const response = await api.get<any>(`/users/fetch/${id}`);
            const { header, body } = response.data;

            if (header.success && body?.user) {
                // Transform response to match UsersResponse format
                return {
                    header,
                    body: {
                        users: {
                            items: [body.user],
                            total: 1,
                            pages: 1
                        }
                    }
                } as UsersResponse;
            }
        } catch (error1: any) {
            console.warn('Endpoint /users/fetch/ failed, trying /users/fetch/user/', error1.response?.data || error1.message);
        }

        // Try endpoint 2: /users/fetch/user/${id} (original)
        const response = await api.get<UsersResponse>(`/users/fetch/user/${id}`);
        const { header, body } = response.data;

        if (!header.success || !body?.users?.items?.[0]) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch user details';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Fetch list of users with optional filters
 */
export const fetchUsers = createAsyncThunk<
    UsersResponse,
    FetchUsersParams,
    { rejectValue: string }
>('users/fetchUsers', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<UsersResponse>('/users/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.users) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch users list';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Fetch permissions for a user (overrides only). GET /users/permissions/{userId}
 */
export const fetchUserPermissions = createAsyncThunk<
    UserPermissionsResponse,
    string,
    { rejectValue: string }
>('users/fetchUserPermissions', async (userId, { rejectWithValue }) => {
    try {
        const response = await api.get<UserPermissionsResponse>(`/users/permissions/${userId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to fetch user permissions';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to fetch user permissions';
        return rejectWithValue(msg);
    }
});

/**
 * Set (replace) user permissions. PUT /users/permissions/{userId}
 */
export const setUserPermissions = createAsyncThunk<
    UserPermissionsResponse,
    { userId: string; permissions: SetUserPermissionItem[] },
    { rejectValue: string }
>('users/setUserPermissions', async ({ userId, permissions }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/users/permissions/${userId}`, {
            params: { permissions },
        });
        const { header } = response.data;
        if (!header?.success) {
            const msg = (header?.messages as { message?: string }[])?.[0]?.message || 'Failed to set user permissions';
            return rejectWithValue(msg);
        }
        return response.data;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to set user permissions';
        return rejectWithValue(msg);
    }
});

/**
 * Delete a user by ID. DELETE /users/delete/{userId}
 */
export const deleteUser = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>('users/deleteUser', async (userId, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/users/delete/${userId}`);
        const { header } = response.data;
        if (!header?.success) {
            const msg = header?.messages?.[0]?.message || 'Failed to delete user';
            return rejectWithValue(msg);
        }
        return userId;
    } catch (error: any) {
        const msg =
            error.response?.data?.header?.messages?.[0]?.message ||
            error.message ||
            'Failed to delete user';
        return rejectWithValue(msg);
    }
});

// ================== Slice ==================
/**
 * User Slice - manages users state in Redux store
 */
const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser(state) {
            state.selectedUser = null;
        },
        clearUserPermissions(state) {
            state.userPermissions = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users List
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UsersResponse>) => {
                state.loading = false;
                if (action.payload.body?.users) {
                    state.users = action.payload.body.users.items;
                    state.total = action.payload.body.users.total;
                    state.pages = action.payload.body.users.pages;
                }
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.users = [];
                state.total = 0;
                state.pages = 0;
            })

            // Fetch Single User
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedUser = null;
            })
            .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UsersResponse>) => {
                state.loading = false;
                if (action.payload.body?.users?.items?.[0]) {
                    state.selectedUser = action.payload.body.users.items[0];
                }
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load user data';
                state.selectedUser = null;
            })
            .addCase(fetchUserPermissions.fulfilled, (state, action: PayloadAction<UserPermissionsResponse>) => {
                const list = action.payload.body?.permissions;
                state.userPermissions = Array.isArray(list) ? list : null;
            })
            .addCase(fetchUserPermissions.rejected, (state) => {
                state.userPermissions = null;
            })
            .addCase(setUserPermissions.fulfilled, (state, action: PayloadAction<UserPermissionsResponse>) => {
                const list = action.payload.body?.permissions;
                state.userPermissions = Array.isArray(list) ? list : null;
            })
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.users = state.users.filter((u) => u.id !== action.payload);
                state.total = Math.max(0, state.total - 1);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload || 'Failed to delete user';
            });
    },
});

// ================== Exports ==================
export const { clearSelectedUser, clearUserPermissions } = userSlice.actions;
export default userSlice.reducer;

// ================== Selectors ==================
export const selectUsers = (state: { users: UserState }) => state.users.users;
export const selectLoading = (state: { users: UserState }) => state.users.loading;
export const selectTotalPages = (state: { users: UserState }) => state.users.pages;
export const selectTotalItems = (state: { users: UserState }) => state.users.total;
export const selectSelectedUser = (state: { users: UserState }) => state.users.selectedUser;
export const selectError = (state: { users: UserState }) => state.users.error;
export const selectUserPermissions = (state: { users: UserState }) => state.users.userPermissions;
