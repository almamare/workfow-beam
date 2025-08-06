import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { ClientsResponse, Client } from '@/stores/types/clients';
import type { RootState } from '@/stores/store';

interface ClientsState {
    clients: Client[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
    lastKey?: string; // لمنع إعادة نفس الطلب أثناء التحميل
}

const initialState: ClientsState = {
    clients: [],
    total: 0,
    pages: 0,
    loading: false,
    error: null,
    lastKey: undefined,
};

export interface FetchClientsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const fetchClients = createAsyncThunk<
    ClientsResponse,
    FetchClientsParams | void,
    { rejectValue: string; state: RootState }
>(
    'clients/fetchClients',
    async (params, { rejectWithValue, signal }) => {
        try {
            const { page = 1, limit = 10, search = '' } = params || {};
            const res = await api.get<ClientsResponse>('/clients/fetch', {
                params: { page, limit, search },
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
            });
            if (st.loading && st.lastKey === key) return false;
            return true;
        },
    }
);

const clientsSlice = createSlice({
    name: 'clients',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchClients.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                const { page = 1, limit = 10, search = '' } = (action.meta.arg || {}) as FetchClientsParams;
                state.lastKey = JSON.stringify({ page, limit, search });
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
                // لا نعرض رسالة إلغاء كخطأ للمستخدم
                const msg = (action.payload as string) || action.error.message || 'حدث خطأ أثناء جلب بيانات العملاء';
                state.error = msg === 'Request canceled' ? null : msg;
            });
    },
});

export default clientsSlice.reducer;

// Selectors
export const selectClients = (state: RootState) => state.clients.clients;
export const selectClientsLoading = (state: RootState) => state.clients.loading;
export const selectClientsTotal = (state: RootState) => state.clients.total;
export const selectClientsPages = (state: RootState) => state.clients.pages;
export const selectClientsError = (state: RootState) => state.clients.error;
