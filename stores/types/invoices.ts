export interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoice_no?: string;
    invoice_date: string;
    due_date?: string;
    client_id?: string;
    client_name?: string;
    client?: {
        client_id: string;
        name: string;
        client_no?: string;
    };
    bank_id?: string;
    bank_name?: string;
    bank?: {
        bank_id: string;
        name: string;
        account_number?: string;
        iban?: string;
        swift_code?: string;
    };
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status?: string;
    notes?: string;
    items_count?: number;
    items?: InvoiceItem[];
    created_at: string;
    updated_at?: string;
}

export interface InvoicesResponse {
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
        invoices: {
            total: number;
            pages: number;
            items: Invoice[];
        };
        invoice?: Invoice;
    };
}

export interface CreateInvoiceItemPayload {
    description: string;
    quantity: number;
    unit_price: number;
}

export interface CreateInvoicePayload {
    invoice_date: string;
    due_date?: string;
    client_id?: string;
    bank_id?: string;
    tax?: number;
    discount?: number;
    status?: string;
    notes?: string;
    items: CreateInvoiceItemPayload[];
}

export interface UpdateInvoicePayload {
    id: string;
    invoice_date?: string;
    due_date?: string;
    client_id?: string;
    bank_id?: string;
    tax?: number;
    discount?: number;
    status?: string;
    notes?: string;
    items?: CreateInvoiceItemPayload[];
}

