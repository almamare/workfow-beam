import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { BankBalance, BankBalancesResponse, BankBalancesByBankResponse, CreateBankBalancePayload, UpdateBankBalancePayload } from '@/stores/types/bank-balances';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface BankBalancesState {
    loading: boolean;
    error: string | null;
    balances: BankBalance[];
    selectedBalance: BankBalance | null;
    bankBalances: BankBalance[]; // For bank-specific balances view
    selectedBank: { bank_id: string; name: string; bank_no?: string } | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: BankBalancesState = {
    loading: false,
    error: null,
    balances: [],
    selectedBalance: null,
    bankBalances: [],
    selectedBank: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
interface FetchBankBalancesParams {
    page?: number;
    limit?: number;
    search?: string;
    bank_id?: string;
    currency?: string;
}

// ================== API Endpoints ==================
const API_ENDPOINTS = {
    FETCH: '/bank-balances/fetch',
    FETCH_BY_BANK: (bankId: string) => `/bank-balances/fetch/bank/${bankId}`,
    FETCH_ONE: (id: string) => `/bank-balances/fetch/balance/${id}`,
    CREATE: '/bank-balances/create',
    UPDATE: (id: string) => `/bank-balances/update/${id}`,
    DELETE: (id: string) => `/bank-balances/delete/${id}`,
} as const;

// ================== Async Thunks ==================
/**
 * Fetch list of bank balances with optional filters
 */
export const fetchBankBalances = createAsyncThunk<
    BankBalancesResponse,
    FetchBankBalancesParams,
    { rejectValue: string }
>('bankBalances/fetchBankBalances', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<BankBalancesResponse>(API_ENDPOINTS.FETCH, { params });
        const { header, body } = response.data;

        if (!header.success || !body?.balances) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch bank balances list';
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
 * Fetch balances for a specific bank
 */
export const fetchBankBalancesByBank = createAsyncThunk<
    BankBalancesByBankResponse,
    { bankId: string },
    { rejectValue: string }
>('bankBalances/fetchBankBalancesByBank', async ({ bankId }, { rejectWithValue }) => {
    try {
        const response = await api.get<BankBalancesByBankResponse>(API_ENDPOINTS.FETCH_BY_BANK(bankId));
        const { header, body } = response.data;

        if (!header.success || !body) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch bank balances';
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
 * Fetch a single balance by ID
 */
export const fetchBankBalance = createAsyncThunk<
    BankBalancesResponse,
    { id: string },
    { rejectValue: string }
>('bankBalances/fetchBankBalance', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<BankBalancesResponse>(API_ENDPOINTS.FETCH_ONE(id));
        const { header, body } = response.data;

        if (!header.success || !body?.balance) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch balance details';
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
 * Create a new bank balance
 */
export const createBankBalance = createAsyncThunk<
    BankBalancesResponse,
    CreateBankBalancePayload,
    { rejectValue: string }
>('bankBalances/createBankBalance', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post<BankBalancesResponse>(API_ENDPOINTS.CREATE, { params: payload });
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to create bank balance';
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
 * Update an existing bank balance
 */
export const updateBankBalance = createAsyncThunk<
    BankBalancesResponse,
    UpdateBankBalancePayload,
    { rejectValue: string }
>('bankBalances/updateBankBalance', async (payload, { rejectWithValue }) => {
    try {
        const { id, ...data } = payload;
        const response = await api.put<BankBalancesResponse>(API_ENDPOINTS.UPDATE(id), data);
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to update bank balance';
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
 * Delete a bank balance
 */
export const deleteBankBalance = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('bankBalances/deleteBankBalance', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(API_ENDPOINTS.DELETE(id));
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to delete bank balance';
            return rejectWithValue(message);
        }

        return { id };
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
const bankBalancesSlice = createSlice({
    name: 'bankBalances',
    initialState,
    reducers: {
        clearSelectedBalance: (state) => {
            state.selectedBalance = null;
        },
        clearBankBalances: (state) => {
            state.bankBalances = [];
            state.selectedBank = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch balances list
            .addCase(fetchBankBalances.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBankBalances.fulfilled, (state, action: PayloadAction<BankBalancesResponse>) => {
                state.loading = false;
                const balances = action.payload.body?.balances;
                if (balances) {
                    state.balances = balances.items || [];
                    state.total = balances.total || 0;
                    state.pages = balances.pages || 0;
                }
            })
            .addCase(fetchBankBalances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch bank balances';
            })
            // Fetch balances by bank
            .addCase(fetchBankBalancesByBank.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBankBalancesByBank.fulfilled, (state, action: PayloadAction<BankBalancesByBankResponse>) => {
                state.loading = false;
                const body = action.payload.body;
                if (body) {
                    state.bankBalances = body.balances || [];
                    state.selectedBank = body.bank || null;
                }
            })
            .addCase(fetchBankBalancesByBank.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch bank balances';
            })
            // Fetch single balance
            .addCase(fetchBankBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBankBalance.fulfilled, (state, action: PayloadAction<BankBalancesResponse>) => {
                state.loading = false;
                const balance = action.payload.body?.balance;
                if (balance) {
                    state.selectedBalance = balance;
                }
            })
            .addCase(fetchBankBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch balance';
            })
            // Create balance
            .addCase(createBankBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBankBalance.fulfilled, (state, action: PayloadAction<BankBalancesResponse>) => {
                state.loading = false;
                const balance = action.payload.body?.balance;
                if (balance) {
                    state.balances = [balance, ...state.balances];
                    state.total += 1;
                }
            })
            .addCase(createBankBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create bank balance';
            })
            // Update balance
            .addCase(updateBankBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBankBalance.fulfilled, (state, action: PayloadAction<BankBalancesResponse>) => {
                state.loading = false;
                const balance = action.payload.body?.balance;
                if (balance) {
                    state.balances = state.balances.map((b) => (b.id === balance.id ? balance : b));
                    if (state.selectedBalance?.id === balance.id) {
                        state.selectedBalance = balance;
                    }
                    // Update in bankBalances if exists
                    state.bankBalances = state.bankBalances.map((b) => (b.id === balance.id ? balance : b));
                }
            })
            .addCase(updateBankBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update bank balance';
            })
            // Delete balance
            .addCase(deleteBankBalance.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBankBalance.fulfilled, (state, action) => {
                state.loading = false;
                state.balances = state.balances.filter((b) => b.id !== action.payload.id);
                state.bankBalances = state.bankBalances.filter((b) => b.id !== action.payload.id);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedBalance?.id === action.payload.id) {
                    state.selectedBalance = null;
                }
            })
            .addCase(deleteBankBalance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete bank balance';
            });
    },
});

export default bankBalancesSlice.reducer;
export const { clearSelectedBalance, clearBankBalances } = bankBalancesSlice.actions;

// ================== Selectors ==================
export const selectBankBalances = (state: RootState) => state.bankBalances.balances;
export const selectSelectedBalance = (state: RootState) => state.bankBalances.selectedBalance;
export const selectBankBalancesLoading = (state: RootState) => state.bankBalances.loading;
export const selectBankBalancesError = (state: RootState) => state.bankBalances.error;
export const selectBankBalancesTotal = (state: RootState) => state.bankBalances.total;
export const selectBankBalancesPages = (state: RootState) => state.bankBalances.pages;
export const selectBankBalancesByBank = (state: RootState) => state.bankBalances.bankBalances;
export const selectSelectedBank = (state: RootState) => state.bankBalances.selectedBank;

