import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { ClientsResponse, SingleClientResponse, Client } from '@/stores/types/clients';
import type { RootState } from '@/stores/store';

interface ClientsState {
    clients: Client[];
    selectedClient: Client | null;
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
    lastKey?: string; // لمنع إعادة نفس الطلب أثناء التحميل
}

const initialState: ClientsState = {
    clients: [],
    selectedClient: null,
    total: 0,
    pages: 0,
    loading: false,
    error: null,
    lastKey: undefined,
};

export interface FetchClientsParams {
    page?: number;
    limit?: number;
    search?: string;  // Smart search in: client_no, name, state, city, budget, sequence
    client_type?: string;
    status?: string;
    from_date?: string;  // Date range: from date (YYYY-MM-DD) - filters by created_at
    to_date?: string;    // Date range: to date (YYYY-MM-DD) - filters by created_at
}

export const fetchClients = createAsyncThunk<
    ClientsResponse,
    FetchClientsParams | void,
    { rejectValue: string; state: RootState }
>(
    'clients/fetchClients',
    async (params, { rejectWithValue, signal }) => {
        try {
            const { page = 1, limit = 10, search = '', client_type, status, from_date, to_date } = params || {};
            const requestParams: any = { page, limit, search, client_type, status };
            // Add date filters only if provided (search in created_at field)
            if (from_date) requestParams.from_date = from_date;
            if (to_date) requestParams.to_date = to_date;
            
            const res = await api.get<ClientsResponse>('/clients/fetch', {
                params: requestParams,
                signal, // يدعم إلغاء الطلب
            });

            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to fetch clients';
                return rejectWithValue(msg);
            }

            return res.data;
        } catch (err: any) {
            // عند الإلغاء بواسطة AbortController
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
                return rejectWithValue('Request canceled');
            }
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while fetching clients';
            return rejectWithValue(msg);
        }
    },
    {
        // امنع إطلاق thunk إن كان نفس المفتاح قيد التحميل
        condition: (params, { getState }) => {
            const st = (getState() as RootState).clients;
            const key = JSON.stringify({
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                search: params?.search ?? '',
                client_type: params?.client_type,
                status: params?.status,
            });
            if (st.loading && st.lastKey === key) return false;
            return true;
        },
    }
);

export const fetchClient = createAsyncThunk<
    SingleClientResponse,
    string,
    { rejectValue: string }
>(
    'clients/fetchClient',
    async (clientId, { rejectWithValue }) => {
        try {
            const res = await api.get(`/clients/fetch/client/${clientId}`);
            
            let clientData = null;
            let success = false;
            let message = '';
            
            if (res.data?.body?.client) {
                clientData = res.data.body.client;
                success = res.data?.header?.success ?? true;
                message = res.data?.header?.message || res.data?.body?.message || '';
            } else if (res.data?.data?.client) {
                clientData = res.data.data.client;
                success = res.data.success ?? true;
                message = res.data.message || '';
            } else if (res.data?.client) {
                clientData = res.data.client;
                success = true;
            } else if (res.data?.success && res.data?.client) {
                clientData = res.data.client;
                success = res.data.success;
                message = res.data.message || '';
            }
            
            if (!clientData) {
                return rejectWithValue(message || 'Client data not found in response');
            }
            
            return {
                success,
                message,
                data: {
                    client: clientData
                }
            } as SingleClientResponse;
        } catch (err: any) {
            console.error('Error in fetchClient:', err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Network error while fetching client';
            return rejectWithValue(msg);
        }
    }
);

const clientsSlice = createSlice({
    name: 'clients',
    initialState,
    reducers: {
        clearSelectedClient(state) {
            state.selectedClient = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                const { page = 1, limit = 10, search = '', client_type, status } = (action.meta.arg || {}) as FetchClientsParams;
                state.lastKey = JSON.stringify({ page, limit, search, client_type, status });
            })
            .addCase(fetchClients.fulfilled, (state, action: PayloadAction<ClientsResponse>) => {
                state.loading = false;
                const payload = action.payload.body?.clients;
                state.clients = payload?.items ?? [];
                state.total = payload?.total ?? 0;
                state.pages = payload?.pages ?? 0;
            })
            .addCase(fetchClients.rejected, (state, action) => {
                state.loading = false;
                state.clients = [];
                state.total = 0;
                state.pages = 0;
                const msg = (action.payload as string) || action.error.message || 'An error occurred while fetching client data';
                state.error = msg === 'Request canceled' ? null : msg;
            })
            // Fetch Single Client
            .addCase(fetchClient.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedClient = null;
            })
            .addCase(fetchClient.fulfilled, (state, action: PayloadAction<SingleClientResponse>) => {
                state.loading = false;
                const client = action.payload.data?.client;
                if (client) {
                    state.selectedClient = client;
                }
            })
            .addCase(fetchClient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch client';
                state.selectedClient = null;
            });
    },
});

export const { clearSelectedClient } = clientsSlice.actions;

export default clientsSlice.reducer;

// Selectors
export const selectClients = (state: RootState) => state.clients.clients;
export const selectSelectedClient = (state: RootState) => state.clients.selectedClient;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsTotal = (state: RootState) => state.clients.total;
export const selectClientsPages = (state: RootState) => state.clients.pages;
export const selectClientsError = (state: RootState) => state.clients.error;
