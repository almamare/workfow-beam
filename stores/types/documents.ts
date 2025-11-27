export interface Document {
    id: string;
    title: string;
    description?: string;
    file: string;
    path?: string;
    uploaded_by?: string;
    uploader_name?: string;
    uploaded_at?: string;
    created_at: string;
    updated_at?: string;
}

export interface DocumentsResponse {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: {
            code: number;
            type: string;
            message: string;
        }[];
    };
    body?: {
        documents: {
            total: number;
            pages: number;
            items: Document[];
        };
        document?: Document;
    };
}

export interface CreateDocumentPayload {
    title: string;
    description?: string;
    file: string; // Base64 encoded file with data URI prefix
}

export interface UpdateDocumentPayload {
    id: string;
    title?: string;
    description?: string;
    file?: string; // Base64 encoded file with data URI prefix (optional)
}

