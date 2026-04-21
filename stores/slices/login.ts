import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import api from '@/utils/axios';
import { LoginResponse, User } from '@/stores/types/login';

// Define the shape of the login state
interface LoginState {
    loading: boolean;
    user: User | null;
    token: string | null;
    error: string | null;
    /** When true, user must be redirected to change-password (BEAM backend) */
    mustChangePassword: boolean;
}

// Try to load user and token from localStorage and cookies on app start
const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
const storedToken = typeof window !== 'undefined' ? Cookies.get('token') : null;

const MUST_CHANGE_PASSWORD_KEY = 'auth_must_change_password';
const storedMustChange = typeof window !== 'undefined' ? localStorage.getItem(MUST_CHANGE_PASSWORD_KEY) : null;

const initialState: LoginState = {
    loading: false,
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    error: null,
    mustChangePassword: storedMustChange === 'true',
};

// Async thunk to perform login request
const REMEMBER_ME_KEY       = 'beam_remember_me';
const REMEMBER_USERNAME_KEY = 'beam_remember_username';

export const authentication = createAsyncThunk<
    User & { token: string; mustChangePassword: boolean },
    { username: string; password: string; rememberMe?: boolean },
    { rejectValue: string }
>(
    'login/authentication',
    async (
        credentials: { username: string; password: string; rememberMe?: boolean },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post<LoginResponse>('/authentication/login', {
                params: credentials,
            });

            const responseData = response.data as any;
            const header = responseData?.header;
            const body = responseData?.body;

            // Handle failed login with detailed message
            if (!header?.success) {
                const errorMessage =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Login failed';
                return rejectWithValue(errorMessage);
            }

            // Support new format: body.user + body.employee
            // Support old format: body.data.userInfo
            const token: string = body?.token;
            const newFormatUser = body?.user;
            const oldFormatUser = body?.data?.userInfo;
            const employee = body?.employee || body?.data?.employee;

            if (!token) {
                return rejectWithValue('Authentication token missing from response');
            }

            const rawUser = newFormatUser || oldFormatUser;
            if (!rawUser) {
                return rejectWithValue('User data missing from response');
            }

            const mustChangePassword =
                rawUser.must_change_password === 1 ||
                rawUser.must_change_password === true ||
                Boolean(body?.must_change_password);

            const rememberMe = credentials.rememberMe ?? false;
            const useSecureCookie =
                typeof window !== 'undefined' && window.location.protocol === 'https:';

            Cookies.set('token', token, {
                expires: rememberMe ? 30 : undefined,
                secure: useSecureCookie,
                sameSite: 'Strict',
                path: '/',
            });

            if (rememberMe) {
                localStorage.setItem(REMEMBER_ME_KEY, 'true');
                localStorage.setItem(REMEMBER_USERNAME_KEY, credentials.username);
            } else {
                localStorage.removeItem(REMEMBER_ME_KEY);
                localStorage.removeItem(REMEMBER_USERNAME_KEY);
            }

            if (mustChangePassword) {
                localStorage.setItem(MUST_CHANGE_PASSWORD_KEY, 'true');
            }

            const userInfo = {
                id: rawUser.id,
                name: rawUser.name,
                surname: rawUser.surname,
                username: rawUser.username,
                role: rawUser.role,
                role_id: rawUser.role_id,
                department_id: rawUser.department_id,
                status: rawUser.status,
                last_login: rawUser.last_login,
                email: rawUser.email,
                phone: rawUser.phone,
                number: rawUser.number,
                role_key: rawUser.role_key,
                employee_id: employee?.employee_id,
                hire_date: employee?.hire_date,
                must_change_password: rawUser.must_change_password,
            };

            localStorage.setItem('user_data', JSON.stringify(userInfo));

            return {
                ...userInfo,
                token,
                mustChangePassword,
            };
        } catch (error: any) {
            const message =
                error?.response?.data?.header?.messages?.[0]?.message ||
                error?.response?.data?.header?.message ||
                error?.response?.data?.message ||
                error?.message ||
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
            state.mustChangePassword = false;
            Cookies.remove('token');
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user_data');
                localStorage.removeItem('auth_must_change_password');
                localStorage.removeItem(REMEMBER_ME_KEY);
                localStorage.removeItem(REMEMBER_USERNAME_KEY);
            }
        },
        clearMustChangePassword: (state) => {
            state.mustChangePassword = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_must_change_password');
            }
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
            .addCase(authentication.fulfilled, (state, action) => {
                state.loading = false;
                const { token, mustChangePassword, ...user } = action.payload;
                state.user = user as User;
                state.token = token;
                state.mustChangePassword = mustChangePassword;
            })
            // Handle failed login and store error message
            .addCase(authentication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

// Export actions and reducer
export const { logout, clearMustChangePassword } = loginSlice.actions;
export default loginSlice.reducer;

// REFACTOR-PHASE-1: Selectors for easier access to auth state
export const selectUser = (state: { login: LoginState }) => state.login.user;
export const selectIsAuthenticated = (state: { login: LoginState }) => !!state.login.user;
export const selectAuthLoading = (state: { login: LoginState }) => state.login.loading;
export const selectAuthError = (state: { login: LoginState }) => state.login.error;
export const selectMustChangePassword = (state: { login: LoginState }) => state.login.mustChangePassword;
