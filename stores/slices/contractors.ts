import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { ContractorsResponse, Contractor } from '@/stores/types/contractors';
import type { RootState } from '@/stores/store';

/* ---------- State ---------- */
interface ContractorsState {
    contractors: Contractor[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
    lastKey?: string; // لمنع التكرار أثناء التحميل
}

const initialState: ContractorsState = {
    contractors: [],
    total: 0,
    pages: 0,
    loading: false,
    error: null,
    lastKey: undefined,
};

/* ---------- Thunk (fetch) ---------- */
export interface FetchContractorsParams {
    page?: number;
    limit?: number;
    search?: string;
}

const endpoint = '/contractors/fetch'; // غيّر المسار لو لزم

export const fetchContractors = createAsyncThunk<
    ContractorsResponse,
    FetchContractorsParams | void,
    { rejectValue: string; state: RootState }
>(
    'contractors/fetchContractors',
    async (params, { rejectWithValue, signal }) => {
        try {
            const { page = 1, limit = 10, search = '' } = params || {};
            const res = await api.get<ContractorsResponse>(endpoint, {
                params: { page, limit, search },
                signal,
            });

            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to fetch contractors';
                return rejectWithValue(msg);
            }

            return res.data;
        } catch (err: any) {
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
                return rejectWithValue('Request canceled');
            }
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while fetching contractors';
            return rejectWithValue(msg);
        }
    },
    {
        // منع طلب مكرر بذات المفاتيح
        condition: (params, { getState }) => {
            const st = (getState() as RootState).contractors;
            const key = JSON.stringify({
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                search: params?.search ?? '',
            });
            // إذا نفس الطلب قيد التحميل → لا تطلقه
            if (st.loading && st.lastKey === key) return false;
            return true;
        },
    }
);

/* ---------- Slice ---------- */
const contractorsSlice = createSlice({
    name: 'contractors',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractors.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                const { page = 1, limit = 10, search = '' } =
                    (action.meta.arg || {}) as FetchContractorsParams;
                state.lastKey = JSON.stringify({ page, limit, search });
            })
            .addCase(
                fetchContractors.fulfilled,
                (state, action: PayloadAction<ContractorsResponse>) => {
                    state.loading = false;
                    const payload = action.payload.body?.contractors;
                    state.contractors = payload?.items ?? [];
                    state.total = payload?.total ?? 0;
                    state.pages = payload?.pages ?? 0;
                }
            )
            .addCase(fetchContractors.rejected, (state, action) => {
                state.loading = false;
                const msg =
                    (action.payload as string) ||
                    action.error.message ||
                    'حدث خطأ أثناء جلب بيانات المقاولين';
                state.error = msg === 'Request canceled' ? null : msg;
            });
    },
});

export default contractorsSlice.reducer;

/* ---------- Selectors ---------- */
export const selectContractors = (state: RootState) =>
    state.contractors.contractors;
export const selectContractorsLoading = (state: RootState) =>
    state.contractors.loading;
export const selectContractorsTotal = (state: RootState) =>
    state.contractors.total;
export const selectContractorsPages = (state: RootState) =>
    state.contractors.pages;
export const selectContractorsError = (state: RootState) =>
    state.contractors.error;
