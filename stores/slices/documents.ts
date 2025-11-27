import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import { Document, DocumentsResponse, CreateDocumentPayload, UpdateDocumentPayload } from '@/stores/types/documents';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface DocumentsState {
    loading: boolean;
    error: string | null;
    documents: Document[];
    selectedDocument: Document | null;
    total: number;
    pages: number;
}

// ================== Initial State ==================
const initialState: DocumentsState = {
    loading: false,
    error: null,
    documents: [],
    selectedDocument: null,
    total: 0,
    pages: 0,
};

// ================== Params Interface ==================
interface FetchDocumentsParams {
    page?: number;
    limit?: number;
    search?: string;
}

// ================== API Endpoints ==================
const API_ENDPOINTS = {
    FETCH: '/documents/fetch',
    FETCH_ONE: (id: string) => `/documents/fetch/document/${id}`,
    CREATE: '/documents/create',
    UPDATE: (id: string) => `/documents/update/${id}`,
    DELETE: (id: string) => `/documents/delete/${id}`,
} as const;

// ================== Async Thunks ==================
/**
 * Fetch list of documents with optional filters
 */
export const fetchDocuments = createAsyncThunk<
    DocumentsResponse,
    FetchDocumentsParams,
    { rejectValue: string }
>('documents/fetchDocuments', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get<DocumentsResponse>(API_ENDPOINTS.FETCH, { params });
        const { header, body } = response.data;

        if (!header.success || !body?.documents) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch documents list';
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
 * Fetch a single document by ID
 */
export const fetchDocument = createAsyncThunk<
    DocumentsResponse,
    { id: string },
    { rejectValue: string }
>('documents/fetchDocument', async ({ id }, { rejectWithValue }) => {
    try {
        const response = await api.get<DocumentsResponse>(API_ENDPOINTS.FETCH_ONE(id));
        const { header, body } = response.data;

        if (!header.success || !body?.document) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to fetch document details';
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
 * Create a new document
 */
export const createDocument = createAsyncThunk<
    DocumentsResponse,
    CreateDocumentPayload,
    { rejectValue: string }
>('documents/createDocument', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post<DocumentsResponse>(API_ENDPOINTS.CREATE, { params: payload });
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to create document';
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
 * Update an existing document
 */
export const updateDocument = createAsyncThunk<
    DocumentsResponse,
    UpdateDocumentPayload,
    { rejectValue: string }
>('documents/updateDocument', async (payload, { rejectWithValue }) => {
    try {
        const { id, ...data } = payload;
        const response = await api.put<DocumentsResponse>(API_ENDPOINTS.UPDATE(id), data);
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to update document';
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
 * Delete a document
 */
export const deleteDocument = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>('documents/deleteDocument', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(API_ENDPOINTS.DELETE(id));
        const { header } = response.data;

        if (!header.success) {
            const message =
                header?.messages?.[0]?.message ||
                header?.message ||
                'Failed to delete document';
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
const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        clearSelectedDocument: (state) => {
            state.selectedDocument = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch documents list
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action: PayloadAction<DocumentsResponse>) => {
                state.loading = false;
                const documents = action.payload.body?.documents;
                if (documents) {
                    state.documents = documents.items || [];
                    state.total = documents.total || 0;
                    state.pages = documents.pages || 0;
                }
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch documents';
            })
            // Fetch single document
            .addCase(fetchDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDocument.fulfilled, (state, action: PayloadAction<DocumentsResponse>) => {
                state.loading = false;
                const document = action.payload.body?.document;
                if (document) {
                    state.selectedDocument = document;
                }
            })
            .addCase(fetchDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch document';
            })
            // Create document
            .addCase(createDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDocument.fulfilled, (state, action: PayloadAction<DocumentsResponse>) => {
                state.loading = false;
                const document = action.payload.body?.document;
                if (document) {
                    state.documents = [document, ...state.documents];
                    state.total += 1;
                }
            })
            .addCase(createDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create document';
            })
            // Update document
            .addCase(updateDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDocument.fulfilled, (state, action: PayloadAction<DocumentsResponse>) => {
                state.loading = false;
                const document = action.payload.body?.document;
                if (document) {
                    state.documents = state.documents.map((d) => (d.id === document.id ? document : d));
                    if (state.selectedDocument?.id === document.id) {
                        state.selectedDocument = document;
                    }
                }
            })
            .addCase(updateDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update document';
            })
            // Delete document
            .addCase(deleteDocument.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.loading = false;
                state.documents = state.documents.filter((d) => d.id !== action.payload.id);
                state.total = Math.max(0, state.total - 1);
                if (state.selectedDocument?.id === action.payload.id) {
                    state.selectedDocument = null;
                }
            })
            .addCase(deleteDocument.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to delete document';
            });
    },
});

export default documentsSlice.reducer;
export const { clearSelectedDocument } = documentsSlice.actions;

// ================== Selectors ==================
export const selectDocuments = (state: RootState) => state.documents.documents;
export const selectSelectedDocument = (state: RootState) => state.documents.selectedDocument;
export const selectDocumentsLoading = (state: RootState) => state.documents.loading;
export const selectDocumentsError = (state: RootState) => state.documents.error;
export const selectDocumentsTotal = (state: RootState) => state.documents.total;
export const selectDocumentsPages = (state: RootState) => state.documents.pages;

