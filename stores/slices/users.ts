import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { User, UsersResponse } from '@/stores/types/users';

// ================== State Interface ==================
/**
 * UserState
 * Defines the shape of the Redux state for users
 */
interface UserState {
    loading: boolean;          // Indicates if data is being fetched
    error: string | null;      // Stores error messages if requests fail
    users: User[];             // List of users fetched from the server
    selectedUser: User | null; // Single user details (if fetched)
    total: number;             // Total number of users
    pages: number;             // Total number of pages
}

// ================== Initial State ==================
const initialState: UserState = {
    loading: false,
    error: null,
    users: [],
    selectedUser: null,
    total: 0,
    pages: 0,
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

// ================== Slice ==================
/**
 * User Slice - manages users state in Redux store
 */
const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        /**
         * Clear selected user details from state
         */
        clearSelectedUser(state) {
            state.selectedUser = null;
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
            });
    },
});

// ================== Exports ==================
export const { clearSelectedUser } = userSlice.actions;
export default userSlice.reducer;

// ================== Selectors ==================
export const selectUsers = (state: { users: UserState }) => state.users.users;
export const selectLoading = (state: { users: UserState }) => state.users.loading;
export const selectTotalPages = (state: { users: UserState }) => state.users.pages;
export const selectTotalItems = (state: { users: UserState }) => state.users.total;
export const selectSelectedUser = (state: { users: UserState }) => state.users.selectedUser;
export const selectError = (state: { users: UserState }) => state.users.error;
