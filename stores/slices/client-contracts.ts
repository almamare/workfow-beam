import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    ClientContract,
    ClientContractsResponse,
    ClientContractsResponseLegacy,
    ClientContractResponse,
    ClientContractResponseLegacy,
    CreateContractRequest,
    UpdateContractRequest,
    CreateContractResponse,
    UpdateContractResponse,
    DeleteContractResponse,
} from '@/stores/types/client-contracts';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface ClientContractsState {
    loading: boolean;
    error: string | null;
    contracts: ClientContract[];
    selectedContract: ClientContract | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: ClientContractsState = {
    loading: false,
    error: null,
    contracts: [],
    selectedContract: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
interface FetchContractsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    client_id?: string;
}

// ================== Async Thunks ==================
/**
 * Fetch list of all client contracts with optional filters
 */
export const fetchContracts = createAsyncThunk<
    ClientContractsResponse | ClientContractsResponseLegacy,
    FetchContractsParams,
    { rejectValue: string }
>('clientContracts/fetchContracts', async (params, { rejectWithValue }) => {
    try {
        const { page, limit, search, status, client_id } = params;
        const response = await api.get('/client-contracts/fetch', {
            params: {
                page: page || 1,
                limit: limit || 10,
                search: search || undefined,
                status: status || undefined,
                client_id: client_id || undefined,
            },
        });

        // Handle new API response structure { success, data }
        if ('success' in response.data && response.data.success) {
            return response.data as ClientContractsResponse;
        }

        // Handle legacy API response structure { header, body }
        if ('header' in response.data && response.data.header?.success) {
            return response.data as ClientContractsResponseLegacy;
        }

        // Handle error response
        const errorMsg =
            (response.data as ClientContractsResponse)?.errors?.[0]?.message ||
            (response.data as ClientContractsResponse)?.message ||
            (response.data as ClientContractsResponseLegacy)?.header?.messages?.[0]?.message ||
            (response.data as ClientContractsResponseLegacy)?.header?.message ||
            'Failed to fetch contracts';

        return rejectWithValue(errorMsg);
    } catch (error: any) {
        const serverError = error.response?.data;
        const message =
            serverError?.errors?.[0]?.message ||
            serverError?.message ||
            serverError?.header?.messages?.[0]?.message ||
            serverError?.header?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Fetch a single contract by ID
 */
export const fetchContract = createAsyncThunk<
    ClientContractResponse | ClientContractResponseLegacy,
    string,
    { rejectValue: string }
>('clientContracts/fetchContract', async (contractId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/client-contracts/fetch/contract/${contractId}`);

        // Handle new API response structure
        if ('success' in response.data && response.data.success) {
            return response.data as ClientContractResponse;
        }

        // Handle legacy API response structure
        if ('header' in response.data && response.data.header?.success) {
            return response.data as ClientContractResponseLegacy;
        }

        const errorMsg =
            (response.data as ClientContractResponse)?.errors?.[0]?.message ||
            (response.data as ClientContractResponse)?.message ||
            (response.data as ClientContractResponseLegacy)?.header?.messages?.[0]?.message ||
            (response.data as ClientContractResponseLegacy)?.header?.message ||
            'Failed to fetch contract';

        return rejectWithValue(errorMsg);
    } catch (error: any) {
        const serverError = error.response?.data;
        const message =
            serverError?.errors?.[0]?.message ||
            serverError?.message ||
            serverError?.header?.messages?.[0]?.message ||
            serverError?.header?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Create a new contract 
 */
export const createContract = createAsyncThunk<
    CreateContractResponse,
    CreateContractRequest,
    { rejectValue: string }
>('clientContracts/createContract', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post<CreateContractResponse>('/client-contracts/create', {params: data});

        if (!response.data.success) {
            const errorMsg =
                response.data.errors?.[0]?.message || response.data.message || 'Failed to create contract';
            return rejectWithValue(errorMsg);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data;
        const message =
            serverError?.errors?.[0]?.message ||
            serverError?.message ||
            serverError?.header?.messages?.[0]?.message ||
            serverError?.header?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Update an existing contract
 */
export const updateContract = createAsyncThunk<
    UpdateContractResponse,
    { id: string; data: UpdateContractRequest },
    { rejectValue: string }
>('clientContracts/updateContract', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put<UpdateContractResponse>(`/client-contracts/update/${id}`, data);

        if (!response.data.success) {
            const errorMsg =
                response.data.errors?.[0]?.message || response.data.message || 'Failed to update contract';
            return rejectWithValue(errorMsg);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data;
        const message =
            serverError?.errors?.[0]?.message ||
            serverError?.message ||
            serverError?.header?.messages?.[0]?.message ||
            serverError?.header?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

/**
 * Delete a contract
 */
export const deleteContract = createAsyncThunk<
    DeleteContractResponse,
    string,
    { rejectValue: string }
>('clientContracts/deleteContract', async (contractId, { rejectWithValue }) => {
    try {
        const response = await api.delete<DeleteContractResponse>(`/client-contracts/delete/${contractId}`);

        if (!response.data.success) {
            const errorMsg = response.data.errors?.[0]?.message || response.data.message || 'Failed to delete contract';
            return rejectWithValue(errorMsg);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data;
        const message =
            serverError?.errors?.[0]?.message ||
            serverError?.message ||
            serverError?.header?.messages?.[0]?.message ||
            serverError?.header?.message ||
            'Server connection failed';
        return rejectWithValue(message);
    }
});

// ================== Slice ==================
const clientContractsSlice = createSlice({
    name: 'clientContracts',
    initialState,
    reducers: {
        /**
         * Clear selected contract details from state
         */
        clearSelectedContract(state) {
            state.selectedContract = null;
        },
        /**
         * Clear contracts list
         */
        clearContracts(state) {
            state.contracts = [];
            state.total = 0;
            state.pages = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Contracts List
            .addCase(fetchContracts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContracts.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;

                // Handle new API response structure
                if ('data' in payload && payload.data?.contracts) {
                    const { total, pages, items } = payload.data.contracts;
                    state.contracts = items || [];
                    state.total = total || 0;
                    state.pages = pages || 0;
                }
                // Handle legacy API response structure
                else if ('body' in payload && payload.body?.contracts) {
                    const { total, pages, items } = payload.body.contracts;
                    state.contracts = items || [];
                    state.total = total || 0;
                    state.pages = pages || 0;
                }
            })
            .addCase(fetchContracts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.contracts = [];
                state.total = 0;
                state.pages = 0;
            })
            // Fetch Single Contract
            .addCase(fetchContract.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedContract = null;
            })
            .addCase(fetchContract.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;

                // Handle new API response structure
                if ('data' in payload && payload.data?.contract) {
                    state.selectedContract = payload.data.contract;
                }
                // Handle legacy API response structure
                else if ('body' in payload && payload.body?.contract) {
                    state.selectedContract = payload.body.contract;
                }
            })
            .addCase(fetchContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load contract details';
                state.selectedContract = null;
            })
            // Create Contract
            .addCase(createContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createContract.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create contract';
            })
            // Update Contract
            .addCase(updateContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateContract.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update contract';
            })
            // Delete Contract
            .addCase(deleteContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteContract.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete contract';
            });
    },
});

// ================== Exports ==================
export const { clearSelectedContract, clearContracts } = clientContractsSlice.actions;
export default clientContractsSlice.reducer;

// ================== Selectors ==================
export const selectContracts = (state: RootState) => state.clientContracts.contracts;
export const selectContractsLoading = (state: RootState) => state.clientContracts.loading;
export const selectContractsError = (state: RootState) => state.clientContracts.error;
export const selectContractsTotal = (state: RootState) => state.clientContracts.total;
export const selectContractsPages = (state: RootState) => state.clientContracts.pages;
export const selectSelectedContract = (state: RootState) => state.clientContracts.selectedContract;

