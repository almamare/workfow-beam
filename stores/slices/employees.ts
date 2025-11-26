import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Employee, EmployeesResponse } from '@/stores/types/employees';

// ================== State Interface ==================
/**
 * EmployeeState
 * Defines the shape of the Redux state for employees
 */
interface EmployeeState {
    loading: boolean;             // Indicates if data is being fetched
    error: string | null;         // Stores error messages if requests fail
    employees: Employee[];        // List of employees fetched from the server
    selectedEmployee: Employee | null; // Single employee details (if fetched)
    total: number;                // Total number of employees
    pages: number;                // Total number of pages
}

// ================== Initial State ==================
const initialState: EmployeeState = {
    loading: false,
    error: null,
    employees: [],
    selectedEmployee: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
/**
 * Parameters for fetching employees list
 */
interface FetchEmployeesParams {
    page?: number;
    limit?: number;
    search?: string;
    job_title?: string;
    role?: string;
}

// ================== Async Thunks ==================
/**
 * Fetch a single employee by ID
 */
export const fetchEmployee = createAsyncThunk<
    EmployeesResponse,
    { id: string },
    { rejectValue: string }
>('employees/fetchEmployee', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<EmployeesResponse>(`/employees/fetch/employee/${id}`);
        const { header, body } = response.data;

        if (!header.success || !body?.employees?.items?.[0]) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch employee details';
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
 * Fetch list of employees with optional filters
 */
export const fetchEmployees = createAsyncThunk<
    EmployeesResponse,
    FetchEmployeesParams,
    { rejectValue: string }
>('employees/fetchEmployees', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<EmployeesResponse>('/employees/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.employees) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch employees list';
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
 * Employee Slice - manages employees state in Redux store
 */
const employeeSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        /**
         * Clear selected employee details from state
         */
        clearSelectedEmployee(state) {
            state.selectedEmployee = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Employees List
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action: PayloadAction<EmployeesResponse>) => {
                state.loading = false;
                if (action.payload.body?.employees) {
                    state.employees = action.payload.body.employees.items;
                    state.total = action.payload.body.employees.total;
                    state.pages = action.payload.body.employees.pages;
                }
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.employees = [];
                state.total = 0;
                state.pages = 0;
            })

            // Fetch Single Employee
            .addCase(fetchEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedEmployee = null;
            })
            .addCase(fetchEmployee.fulfilled, (state, action: PayloadAction<EmployeesResponse>) => {
                state.loading = false;
                if (action.payload.body?.employees?.items?.[0]) {
                    state.selectedEmployee = action.payload.body.employees.items[0];
                }
            })
            .addCase(fetchEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load employee data';
                state.selectedEmployee = null;
            });
    },
});

// ================== Exports ==================
export const { clearSelectedEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;

// ================== Selectors ==================
export const selectEmployees = (state: { employees: EmployeeState }) => state.employees.employees;
export const selectLoading = (state: { employees: EmployeeState }) => state.employees.loading;
export const selectTotalPages = (state: { employees: EmployeeState }) => state.employees.pages;
export const selectTotalItems = (state: { employees: EmployeeState }) => state.employees.total;
export const selectSelectedEmployee = (state: { employees: EmployeeState }) =>
    state.employees.selectedEmployee;
export const selectError = (state: { employees: EmployeeState }) => state.employees.error;
