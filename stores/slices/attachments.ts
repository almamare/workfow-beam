import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import {
    Attachment,
    AttachmentsResponse,
    AttachmentsResponseLegacy,
    AttachmentResponse,
    AttachmentResponseLegacy,
    CreateAttachmentPayload,
    UpdateAttachmentPayload,
} from '@/stores/types/attachments';
import type { RootState } from '@/stores/store';

// ================== State Interface ==================
interface AttachmentsState {
    attachments: Attachment[];
    currentRequestId: string | null;
    loading: boolean;
    error: string | null;
    uploading: boolean;
    uploadProgress: number;
    selectedAttachment: Attachment | null;
}

// ================== Initial State ==================
const initialState: AttachmentsState = {
    attachments: [],
    currentRequestId: null,
    loading: false,
    error: null,
    uploading: false,
    uploadProgress: 0,
    selectedAttachment: null,
};

// ================== Async Thunks ==================

/**
 * Fetch attachments for a specific request
 */
export const fetchAttachments = createAsyncThunk<
    AttachmentsResponse | AttachmentsResponseLegacy,
    string, // requestId
    { rejectValue: string }
>('attachments/fetchAttachments', async (requestId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/attachments/fetch/${requestId}`);

        // Handle new API response structure { success, data }
        if ('success' in response.data && response.data.success) {
            return response.data as AttachmentsResponse;
        }

        // Handle legacy API response structure { header, body }
        if ('header' in response.data && response.data.header?.success) {
            return response.data as AttachmentsResponseLegacy;
        }

        // Handle error response
        const errorMsg =
            (response.data as AttachmentsResponse)?.errors?.[0]?.message ||
            (response.data as AttachmentsResponse)?.message ||
            (response.data as AttachmentsResponseLegacy)?.header?.messages?.[0]?.message ||
            (response.data as AttachmentsResponseLegacy)?.header?.message ||
            'Failed to fetch attachments';

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
 * Create a new attachment
 */
export const createAttachment = createAsyncThunk<
    AttachmentResponse | AttachmentResponseLegacy,
    CreateAttachmentPayload,
    { rejectValue: string }
>('attachments/createAttachment', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.post('/attachments/create', {params: payload});

        // Handle new API response structure
        if ('success' in response.data && response.data.success) {
            return response.data as AttachmentResponse;
        }

        // Handle legacy API response structure
        if ('header' in response.data && response.data.header?.success) {
            return response.data as AttachmentResponseLegacy;
        }

        // Handle error response
        const errorMsg =
            (response.data as AttachmentResponse)?.errors?.[0]?.message ||
            (response.data as AttachmentResponse)?.message ||
            (response.data as AttachmentResponseLegacy)?.header?.messages?.[0]?.message ||
            (response.data as AttachmentResponseLegacy)?.header?.message ||
            'Failed to create attachment';

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
 * Update an existing attachment
 */
export const updateAttachment = createAsyncThunk<
    AttachmentResponse | AttachmentResponseLegacy,
    UpdateAttachmentPayload,
    { rejectValue: string }
>('attachments/updateAttachment', async (payload, { rejectWithValue }) => {
    try {
        const response = await api.put('/attachments', payload);

        // Handle new API response structure
        if ('success' in response.data && response.data.success) {
            return response.data as AttachmentResponse;
        }

        // Handle legacy API response structure
        if ('header' in response.data && response.data.header?.success) {
            return response.data as AttachmentResponseLegacy;
        }

        // Handle error response
        const errorMsg =
            (response.data as AttachmentResponse)?.errors?.[0]?.message ||
            (response.data as AttachmentResponse)?.message ||
            (response.data as AttachmentResponseLegacy)?.header?.messages?.[0]?.message ||
            (response.data as AttachmentResponseLegacy)?.header?.message ||
            'Failed to update attachment';

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

// ================== Slice ==================
const attachmentsSlice = createSlice({
    name: 'attachments',
    initialState,
    reducers: {
        /**
         * Clear attachments list
         */
        clearAttachments(state) {
            state.attachments = [];
            state.currentRequestId = null;
            state.error = null;
        },
        /**
         * Set current request ID
         */
        setCurrentRequestId(state, action: PayloadAction<string | null>) {
            state.currentRequestId = action.payload;
        },
        /**
         * Set upload progress
         */
        setUploadProgress(state, action: PayloadAction<number>) {
            state.uploadProgress = action.payload;
        },
        /**
         * Clear selected attachment
         */
        clearSelectedAttachment(state) {
            state.selectedAttachment = null;
        },
        /**
         * Set selected attachment
         */
        setSelectedAttachment(state, action: PayloadAction<Attachment | null>) {
            state.selectedAttachment = action.payload;
        },
        /**
         * Remove attachment from list
         */
        removeAttachment(state, action: PayloadAction<string>) {
            state.attachments = state.attachments.filter(
                (att) => att.id !== action.payload
            );
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Attachments
            .addCase(fetchAttachments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAttachments.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;

                // Handle new API response structure
                if ('data' in payload && payload.data?.attachments) {
                    state.attachments = payload.data.attachments || [];
                }
                // Handle legacy API response structure
                else if ('body' in payload && payload.body?.attachments) {
                    state.attachments = payload.body.attachments || [];
                }

                // Store current request ID from the action meta
                const meta = (action as any).meta;
                if (meta?.arg) {
                    state.currentRequestId = meta.arg;
                }
            })
            .addCase(fetchAttachments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unexpected error occurred';
                state.attachments = [];
            })
            // Create Attachment
            .addCase(createAttachment.pending, (state) => {
                state.uploading = true;
                state.uploadProgress = 0;
                state.error = null;
            })
            .addCase(createAttachment.fulfilled, (state, action) => {
                state.uploading = false;
                state.uploadProgress = 100;
                const payload = action.payload;

                let newAttachment: Attachment | null = null;

                // Handle new API response structure
                if ('data' in payload && payload.data?.attachment) {
                    newAttachment = payload.data.attachment;
                }
                // Handle legacy API response structure
                else if ('body' in payload && payload.body?.attachment) {
                    newAttachment = payload.body.attachment;
                }

                if (newAttachment) {
                    state.attachments.push(newAttachment);
                }
            })
            .addCase(createAttachment.rejected, (state, action) => {
                state.uploading = false;
                state.uploadProgress = 0;
                state.error = action.payload || 'Failed to create attachment';
            })
            // Update Attachment
            .addCase(updateAttachment.pending, (state) => {
                state.uploading = true;
                state.uploadProgress = 0;
                state.error = null;
            })
            .addCase(updateAttachment.fulfilled, (state, action) => {
                state.uploading = false;
                state.uploadProgress = 100;
                const payload = action.payload;

                let updatedAttachment: Attachment | null = null;

                // Handle new API response structure
                if ('data' in payload && payload.data?.attachment) {
                    updatedAttachment = payload.data.attachment;
                }
                // Handle legacy API response structure
                else if ('body' in payload && payload.body?.attachment) {
                    updatedAttachment = payload.body.attachment;
                }

                if (updatedAttachment) {
                    const index = state.attachments.findIndex(
                        (att) => att.id === updatedAttachment!.id
                    );
                    if (index !== -1) {
                        state.attachments[index] = updatedAttachment;
                    }
                }
            })
            .addCase(updateAttachment.rejected, (state, action) => {
                state.uploading = false;
                state.uploadProgress = 0;
                state.error = action.payload || 'Failed to update attachment';
            });
    },
});

// ================== Exports ==================
export const {
    clearAttachments,
    setCurrentRequestId,
    setUploadProgress,
    clearSelectedAttachment,
    setSelectedAttachment,
    removeAttachment,
} = attachmentsSlice.actions;

// ================== Selectors ==================
export const selectAttachments = (state: RootState) => state.attachments.attachments;
export const selectAttachmentsLoading = (state: RootState) => state.attachments.loading;
export const selectAttachmentsError = (state: RootState) => state.attachments.error;
export const selectAttachmentsUploading = (state: RootState) => state.attachments.uploading;
export const selectAttachmentsUploadProgress = (state: RootState) => state.attachments.uploadProgress;
export const selectCurrentRequestId = (state: RootState) => state.attachments.currentRequestId;
export const selectSelectedAttachment = (state: RootState) => state.attachments.selectedAttachment;

export default attachmentsSlice.reducer;

