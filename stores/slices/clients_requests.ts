import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { ClientRequest, ClientRequestsResponse, ClientRequestResponse } from '@/stores/types/clients_requests';

interface ClientRequestState {
    loading: boolean;
    error: string | null;
    clientRequests: ClientRequest[];
    selectedClientRequest: ClientRequest | null;
    total: number;
    pages: number;
}

const initialState: ClientRequestState = {
    loading: false,
    error: null,
    clientRequests: [],
    selectedClientRequest: null,
    total: 0,
    pages: 0,
};

interface FetchClientRequestsParams {
    page?: number;
    limit?: number;
    search?: string;
}

// Fetch a single Client Request by ID
export const fetchClientRequest = createAsyncThunk<ClientRequest, { id: string }, { rejectValue: string }>(
    'clientRequests/fetchClientRequest',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await api.get<ClientRequestResponse>(`/requests/clients/fetch/${id}`);
            const { header, body } = response.data;

            if (!header.success || !body?.clients_request) {
                const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch client request details';
                return rejectWithValue(message);
            }

            return body.clients_request;
        } catch (error: any) {
            const serverError = error.response?.data?.header;
            const message = serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to the server';
            return rejectWithValue(message);
        }
    }
);

// Fetch list of Client Requests
export const fetchClientRequests = createAsyncThunk<ClientRequestsResponse, FetchClientRequestsParams, { rejectValue: string }>(
    'clientRequests/fetchClientRequests',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get<ClientRequestsResponse>('/requests/clients/fetch', { params });
            const { header, body } = response.data;

            if (!header.success || !body?.clients_requests) {
                const message = header?.messages?.[0]?.message || header?.message || 'Failed to fetch client requests list';
                return rejectWithValue(message);
            }

            return response.data;
        } catch (error: any) {
            const serverError = error.response?.data?.header;
            const message = serverError?.messages?.[0]?.message || serverError?.message || 'Failed to connect to the server';
            return rejectWithValue(message);
        }
    }
);

const clientRequestSlice = createSlice({
    name: 'clientRequests',
    initialState,
    reducers: {
        clearSelectedClientRequest(state) {
            state.selectedClientRequest = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Client Requests
            .addCase(fetchClientRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchClientRequests.fulfilled, (state, action: PayloadAction<ClientRequestsResponse>) => {
                state.loading = false;
                if (action.payload.body?.clients_requests) {
                    state.clientRequests = action.payload.body.clients_requests.items;
                    state.total = action.payload.body.clients_requests.total;
                    state.pages = action.payload.body.clients_requests.pages;
                }
            })
            .addCase(fetchClientRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.clientRequests = [];
                state.total = 0;
                state.pages = 0;
            })
            // Fetch Single Client Request
            .addCase(fetchClientRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedClientRequest = null;
            })
            .addCase(fetchClientRequest.fulfilled, (state, action: PayloadAction<ClientRequest>) => {
                state.loading = false;
                state.selectedClientRequest = action.payload;
            })
            .addCase(fetchClientRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load client request details';
                state.selectedClientRequest = null;
            });
    },
});

export const { clearSelectedClientRequest } = clientRequestSlice.actions;
export default clientRequestSlice.reducer;

// Selectors
export const selectClientRequests = (state: { clientRequests: ClientRequestState }) => state.clientRequests.clientRequests;
export const selectLoading = (state: { clientRequests: ClientRequestState }) => state.clientRequests.loading;
export const selectTotalPages = (state: { clientRequests: ClientRequestState }) => state.clientRequests.pages;
export const selectTotalItems = (state: { clientRequests: ClientRequestState }) => state.clientRequests.total;
export const selectSelectedClientRequest = (state: { clientRequests: ClientRequestState }) => state.clientRequests.selectedClientRequest;
export const selectError = (state: { clientRequests: ClientRequestState }) => state.clientRequests.error;

