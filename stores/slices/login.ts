import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import api from '@/utils/axios';
import { LoginResponse, User } from '@/stores/types/login';

// Define the shape of the login state
interface LoginState {
    loading: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
}

// Try to load user and token from localStorage and cookies on app start
const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
const storedToken = typeof window !== 'undefined' ? Cookies.get('token') : null;

const initialState: LoginState = {
    loading: false,
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    error: null,
};

// Async thunk to perform login request
export const authentication = createAsyncThunk<
    User & { token: string },
    { username: string; password: string },
    { rejectValue: string }
>(
    'login/authentication',
    async (
        credentials: { username: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post<LoginResponse>('/authentication/login', {
                login: credentials,
            });

            const { header, body } = response.data;

            // Handle failed login with detailed message
            if (!header.success) {
                const errorMessage =
                    (header.messages?.[0] as { message?: string })?.message || 'Login failed';
                return rejectWithValue(errorMessage);
            }

            const { token, expires, data } = body;

            const expiryDate = expires ? new Date(expires) : undefined;
            if (token && expiryDate) {
                Cookies.set('token', token, {
                    expires: expiryDate,
                    secure: true,
                    sameSite: 'Strict',
                    path: '/',
                });
            }

            const userInfo = data.userInfo;
            localStorage.setItem('user_data', JSON.stringify(userInfo));

            return { ...userInfo, token } as User & { token: string };
        } catch (error: any) {
            // Fallback if request itself failed
            const message =
                error.response?.data?.header?.messages?.[0]?.message ||
                'Login failed';
            return rejectWithValue(message);
        }
    }
);


// Create login slice with reducers and extra reducers for async actions
const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        // Logout action clears Redux state, cookies, and localStorage
        logout: (state) => {
            state.user = null;
            state.token = null;
            Cookies.remove('token');
            localStorage.removeItem('user_data');
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle loading state when loginAsync is pending
            .addCase(authentication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            // Handle success response and store user and token
            .addCase(
                authentication.fulfilled,
                (state, action: PayloadAction<User & { token: string }>) => {
                    state.loading = false;
                    state.user = action.payload;
                    state.token = action.payload.token;
                }
            )
            // Handle failed login and store error message
            .addCase(authentication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and reducer
export const { logout } = loginSlice.actions;
export default loginSlice.reducer;

// REFACTOR-PHASE-1: Selectors for easier access to auth state
export const selectUser = (state: { login: LoginState }) => state.login.user;
export const selectIsAuthenticated = (state: { login: LoginState }) => !!state.login.user;
export const selectAuthLoading = (state: { login: LoginState }) => state.login.loading;
export const selectAuthError = (state: { login: LoginState }) => state.login.error;
