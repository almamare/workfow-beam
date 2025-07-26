import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Budget, ProjectResponse } from '@/stores/types/budgets';

/* ─────────────────────────────────────────
   State shape
   ───────────────────────────────────────── */
interface BudgetState {
    loading: boolean;
    error: string | null;
    items: Budget[];      // renamed for clarity
    total: number;
    pages: number;
}

const initialState: BudgetState = {
    loading: false,
    error: null,
    items: [],
    total: 0,
    pages: 0,
};

/* ─────────────────────────────────────────
   Thunk
   ───────────────────────────────────────── */
interface FetchBudgetsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
}

export const fetchBudgets = createAsyncThunk<
    ProjectResponse,
    FetchBudgetsParams,
    { rejectValue: string }
>('budgets/fetchBudgets', async (params, { rejectWithValue }) => {
    try {
        const { data } = await api.get<ProjectResponse>('/projects/fetch/budgets', {
            params,
        });

        const { header, body } = data;

        // safer optional‑chaining checks
        if (!header.success || !body?.budgets?.items) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'فشل في جلب قائمة الميزانيات';
            return rejectWithValue(message);
        }

        return data;
    } catch (err: any) {
        const serverError = err.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

/* ─────────────────────────────────────────
   Slice
   ───────────────────────────────────────── */
const budgetSlice = createSlice({
    name: 'budgets',
    initialState,
    reducers: {
        clearBudgets(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBudgets.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.items = [];
                state.total = 0;
                state.pages = 0;
            })
            .addCase(
                fetchBudgets.fulfilled,
                (state, action: PayloadAction<ProjectResponse>) => {
                    state.loading = false;
                    state.items = action.payload.body!.budgets.items;
                    state.total = action.payload.body!.budgets.total;
                    state.pages = action.payload.body!.budgets.pages;
                }
            )
            .addCase(fetchBudgets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'فشل في جلب الميزانيات';
                state.items = [];
                state.total = 0;
                state.pages = 0;
            });
    },
});

export const { clearBudgets } = budgetSlice.actions;
export default budgetSlice.reducer;

/* ─────────────────────────────────────────
   Selectors
   ───────────────────────────────────────── */
export const selectBudgetItems = (state: { budgets: BudgetState }) =>
    state.budgets.items;
export const selectBudgetLoading = (state: { budgets: BudgetState }) =>
    state.budgets.loading;
export const selectBudgetError = (state: { budgets: BudgetState }) =>
    state.budgets.error;
export const selectBudgetMeta = (state: { budgets: BudgetState }) => ({
    total: state.budgets.total,
    pages: state.budgets.pages,
});
