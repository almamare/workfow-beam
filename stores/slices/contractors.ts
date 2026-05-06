import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Contractor, ContractorsResponse, SingleContractorResponse } from '@/stores/types/contractors';

interface ContractorsState {
    loading: boolean;
    error: string | null;
    contractors: Contractor[];
    selectedContractor: Contractor | null;
    total: number;
    pages: number;
}

const initialState: ContractorsState = {
    loading: false,
    error: null,
    contractors: [],
    selectedContractor: null,
    total: 0,
    pages: 0,
};

interface FetchContractorsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export const fetchContractor = createAsyncThunk<
    SingleContractorResponse,
    { id: string },
    { rejectValue: string }
>('contractors/fetchContractor', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<SingleContractorResponse>(`/contractors/fetch/contractor/${id}`);
        const { header, body } = response.data;

        if (!header.success || !body?.contractor) {
            const message = header?.messages?.[0]?.message || header?.message || 'فشل في جلب بيانات المقاول';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message = 
            serverError?.messages?.[0]?.message || 
            serverError?.message || 
            'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

export const fetchContractors = createAsyncThunk<
    ContractorsResponse,
    FetchContractorsParams,
    { rejectValue: string }
>('contractors/fetchContractors', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<ContractorsResponse>('/contractors/fetch', { params });
        const { header, body } = response.data;

        if (!header.success || !body?.contractors) {
            const message = header?.messages?.[0]?.message || header?.message || 'فشل في جلب قائمة المقاولين';
            return rejectWithValue(message);
        }

        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message = 
            serverError?.messages?.[0]?.message || 
            serverError?.message || 
            'فشل في الاتصال بالخادم';
        return rejectWithValue(message);
    }
});

const contractorsSlice = createSlice({
    name: 'contractors',
    initialState,
    reducers: {
        clearSelectedContractor(state) {
            state.selectedContractor = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Contractors
            .addCase(fetchContractors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContractors.fulfilled, (state, action: PayloadAction<ContractorsResponse>) => {
                state.loading = false;
                if (action.payload.body?.contractors) {
                    state.contractors = action.payload.body.contractors.items;
                    state.total = action.payload.body.contractors.total;
                    state.pages = action.payload.body.contractors.pages;
                }
            })
            .addCase(fetchContractors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ غير متوقع';
                state.contractors = [];
                state.total = 0;
                state.pages = 0;
            })
            
            // Fetch Single Contractor
            .addCase(fetchContractor.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedContractor = null;
            })
            .addCase(fetchContractor.fulfilled, (state, action: PayloadAction<SingleContractorResponse>) => {
                state.loading = false;
                if (action.payload.body) {
                    state.selectedContractor = action.payload.body.contractor;
                }
            })
            .addCase(fetchContractor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'فشل في تحميل بيانات المقاول';
                state.selectedContractor = null;
            });
    },
});

export const { clearSelectedContractor } = contractorsSlice.actions;
export default contractorsSlice.reducer;

// Selectors
export const selectContractors = (state: { contractors: ContractorsState }) => state.contractors.contractors;
export const selectLoading = (state: { contractors: ContractorsState }) => state.contractors.loading;
export const selectTotalPages = (state: { contractors: ContractorsState }) => state.contractors.pages;
export const selectTotalItems = (state: { contractors: ContractorsState }) => state.contractors.total;
export const selectSelectedContractor = (state: { contractors: ContractorsState }) => state.contractors.selectedContractor;
export const selectError = (state: { contractors: ContractorsState }) => state.contractors.error;
