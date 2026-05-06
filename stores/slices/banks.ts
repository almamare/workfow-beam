import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Bank, BanksResponse, CreateBankPayload, UpdateBankPayload } from '@/stores/types/banks';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface BanksState {
    loading: boolean;
    error: string | null;
    banks: Bank[];
    selectedBank: Bank | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: BanksState = {
    loading: false,
    error: null,
    banks: [],
    selectedBank: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
interface FetchBanksParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

// ================== API Endpoints ==================
const API_ENDPOINTS = {
    FETCH: '/banks/fetch',
    FETCH_ONE: (id: string) => `/banks/fetch/bank/${id}`,
    CREATE: '/banks/create',
    UPDATE: (id: string) => `/banks/update/${id}`,
    DELETE: (id: string) => `/banks/delete/${id}`,
} as const;

// ================== Async Thunks ==================
/**
 * Fetch list of banks with optional filters
 */
export const fetchBanks = createAsyncThunk<
    BanksResponse,
    FetchBanksParams,
    { rejectValue: string }
>('banks/fetchBanks', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<BanksResponse>(API_ENDPOINTS.FETCH, { params });
        const { header, body } = response.data;

        if (!header.success || !body?.banks) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch banks list';
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
 * Fetch a single bank by ID
 */
export const fetchBank = createAsyncThunk<
    BanksResponse,
    { id: string },
    { rejectValue: string }
>('banks/fetchBank', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<BanksResponse>(API_ENDPOINTS.FETCH_ONE(id));
        const { header, body } = response.data;

        if (!header.success || !body?.bank) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch bank details';
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
 * Create a new bank
 */
export const createBank = createAsyncThunk<
    BanksResponse,
    CreateBankPayload,
    { rejectValue: string }
>('banks/createBank', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post<BanksResponse>(API_ENDPOINTS.CREATE, { params: payload });
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to create bank';
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
 * Update an existing bank
 */
export const updateBank = createAsyncThunk<
    BanksResponse,
    UpdateBankPayload,
    { rejectValue: string }
>('banks/updateBank', async (payload, { rejectWithValue }) => {
    try {
        const { id, ...data } = payload;
        const response = await api.put<BanksResponse>(API_ENDPOINTS.UPDATE(id), data);
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to update bank';
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
 * Delete a bank
 */
export const deleteBank = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('banks/deleteBank', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(API_ENDPOINTS.DELETE(id));
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to delete bank';
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
const banksSlice = createSlice({
    name: 'banks',
    initialState,
    reducers: {
        clearSelectedBank: (state) => {
            state.selectedBank = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch banks list
            .addCase(fetchBanks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBanks.fulfilled, (state, action: PayloadAction<BanksResponse>) => {
                state.loading = false;
                const banks = action.payload.body?.banks;
                if (banks) {
                    state.banks = banks.items || [];
                    state.total = banks.total || 0;
                    state.pages = banks.pages || 0;
                }
            })
            .addCase(fetchBanks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch banks';
            })
            // Fetch single bank
            .addCase(fetchBank.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBank.fulfilled, (state, action: PayloadAction<BanksResponse>) => {
                state.loading = false;
                const bank = action.payload.body?.bank;
                if (bank) {
                    state.selectedBank = bank;
                }
            })
            .addCase(fetchBank.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch bank';
            })
            // Create bank
            .addCase(createBank.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBank.fulfilled, (state, action: PayloadAction<BanksResponse>) => {
                state.loading = false;
                const bank = action.payload.body?.bank;
                if (bank) {
                    state.banks = [bank, ...state.banks];
                    state.total += 1;
                }
            })
            .addCase(createBank.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create bank';
            })
            // Update bank
            .addCase(updateBank.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBank.fulfilled, (state, action: PayloadAction<BanksResponse>) => {
                state.loading = false;
                const bank = action.payload.body?.bank;
                if (bank) {
                    state.banks = state.banks.map((b) => (b.id === bank.id ? bank : b));
                    if (state.selectedBank?.id === bank.id) {
                        state.selectedBank = bank;
                    }
                }
            })
            .addCase(updateBank.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update bank';
            })
            // Delete bank
            .addCase(deleteBank.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBank.fulfilled, (state, action) => {
                state.loading = false;
                state.banks = state.banks.filter((b) => b.id !== action.payload.id);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedBank?.id === action.payload.id) {
                    state.selectedBank = null;
                }
            })
            .addCase(deleteBank.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete bank';
            });
    },
});

export default banksSlice.reducer;
export const { clearSelectedBank } = banksSlice.actions;

// ================== Selectors ==================
export const selectBanks = (state: RootState) => state.banks.banks;
export const selectSelectedBank = (state: RootState) => state.banks.selectedBank;
export const selectBanksLoading = (state: RootState) => state.banks.loading;
export const selectBanksError = (state: RootState) => state.banks.error;
export const selectBanksTotal = (state: RootState) => state.banks.total;
export const selectBanksPages = (state: RootState) => state.banks.pages;

