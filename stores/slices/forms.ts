import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Form, FormsResponse, CreateFormPayload, UpdateFormPayload } from '@/stores/types/forms';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface FormsState {
    loading: boolean;
    error: string | null;
    forms: Form[];
    selectedForm: Form | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: FormsState = {
    loading: false,
    error: null,
    forms: [],
    selectedForm: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
interface FetchFormsParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

// ================== API Endpoints ==================
const API_ENDPOINTS = {
    FETCH: '/forms/fetch',
    FETCH_ONE: (id: string) => `/forms/fetch/form/${id}`,
    CREATE: '/forms/create',
    UPDATE: (id: string) => `/forms/update/${id}`,
    DELETE: (id: string) => `/forms/delete/${id}`,
    DOWNLOAD: (id: string) => `/forms/download/form/${id}`,
} as const;

// ================== Async Thunks ==================
/**
 * Fetch list of forms with optional filters
 */
export const fetchForms = createAsyncThunk<
    FormsResponse,
    FetchFormsParams,
    { rejectValue: string }
>('forms/fetchForms', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<FormsResponse>(API_ENDPOINTS.FETCH, { params });
        const { header, body } = response.data;

        if (!header.success || !body?.forms) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch forms list';
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
 * Fetch a single form by ID
 */
export const fetchForm = createAsyncThunk<
    FormsResponse,
    { id: string },
    { rejectValue: string }
>('forms/fetchForm', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<FormsResponse>(API_ENDPOINTS.FETCH_ONE(id));
        const { header, body } = response.data;

        if (!header.success || !body?.form) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch form details';
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
 * Create a new form
 */
export const createForm = createAsyncThunk<
    FormsResponse,
    CreateFormPayload,
    { rejectValue: string }
>('forms/createForm', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post<FormsResponse>(API_ENDPOINTS.CREATE, {params: payload});
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to create form';
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
 * Update an existing form
 */
export const updateForm = createAsyncThunk<
    FormsResponse,
    UpdateFormPayload,
    { rejectValue: string }
>('forms/updateForm', async (payload, { rejectWithValue }) => {
    try {
        const { id, ...data } = payload;
        const response = await api.put<FormsResponse>(API_ENDPOINTS.UPDATE(id), data);
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to update form';
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
 * Delete a form
 */
export const deleteForm = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('forms/deleteForm', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(API_ENDPOINTS.DELETE(id));
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to delete form';
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

/**
 * Download form PDF
 * Note: This thunk returns a Blob which is non-serializable.
 * The action is ignored in the store's serializableCheck middleware.
 */
export const downloadFormPDF = createAsyncThunk<
    Blob,
    string,
    { rejectValue: string }
>('forms/downloadFormPDF', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(API_ENDPOINTS.DOWNLOAD(id), {
            responseType: 'blob',
        });
        return response.data;
    } catch (error: any) {
        const serverError = error.response?.data?.header;
        const message =
            serverError?.messages?.[0]?.message ||
            serverError?.message ||
            'Failed to download form PDF';
        return rejectWithValue(message);
    }
});

// ================== Slice ==================
const formsSlice = createSlice({
    name: 'forms',
    initialState,
    reducers: {
        clearSelectedForm: (state) => {
            state.selectedForm = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch forms list
            .addCase(fetchForms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchForms.fulfilled, (state, action: PayloadAction<FormsResponse>) => {
                state.loading = false;
                const forms = action.payload.body?.forms;
                if (forms) {
                    state.forms = forms.items || [];
                    state.total = forms.total || 0;
                    state.pages = forms.pages || 0;
                }
            })
            .addCase(fetchForms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch forms';
            })
            // Fetch single form
            .addCase(fetchForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchForm.fulfilled, (state, action: PayloadAction<FormsResponse>) => {
                state.loading = false;
                const form = action.payload.body?.form;
                if (form) {
                    state.selectedForm = form;
                }
            })
            .addCase(fetchForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch form';
            })
            // Create form
            .addCase(createForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createForm.fulfilled, (state, action: PayloadAction<FormsResponse>) => {
                state.loading = false;
                const form = action.payload.body?.form;
                if (form) {
                    state.forms = [form, ...state.forms];
                    state.total += 1;
                }
            })
            .addCase(createForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create form';
            })
            // Update form
            .addCase(updateForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateForm.fulfilled, (state, action: PayloadAction<FormsResponse>) => {
                state.loading = false;
                const form = action.payload.body?.form;
                if (form) {
                    state.forms = state.forms.map((f) => (f.id === form.id ? form : f));
                    if (state.selectedForm?.id === form.id) {
                        state.selectedForm = form;
                    }
                }
            })
            .addCase(updateForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update form';
            })
            // Delete form
            .addCase(deleteForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteForm.fulfilled, (state, action) => {
                state.loading = false;
                state.forms = state.forms.filter((f) => f.id !== action.payload.id);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedForm?.id === action.payload.id) {
                    state.selectedForm = null;
                }
            })
            .addCase(deleteForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete form';
            });
    },
});

export default formsSlice.reducer;
export const { clearSelectedForm } = formsSlice.actions;

// ================== Selectors ==================
export const selectForms = (state: RootState) => state.forms.forms;
export const selectSelectedForm = (state: RootState) => state.forms.selectedForm;
export const selectFormsLoading = (state: RootState) => state.forms.loading;
export const selectFormsError = (state: RootState) => state.forms.error;
export const selectFormsTotal = (state: RootState) => state.forms.total;
export const selectFormsPages = (state: RootState) => state.forms.pages;

