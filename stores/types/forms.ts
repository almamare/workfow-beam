export interface Form {
    id: string;
    form_no: string;
    name: string;
    description?: string;
    sequence?: number;
    status: string;
    date_issue?: string;
    created_at: string;
    updated_at?: string;
}

export interface FormsResponse {
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
        forms: {
            total: number;
            pages: number;
            items: Form[];
        };
        form?: Form;
    };
}

export interface CreateFormPayload {
    name: string;
    description?: string;
    status?: string;
    date_issue?: string;
}

export interface UpdateFormPayload extends CreateFormPayload {
    id: string;
}

