// Contractor Payment types — aligned with contractor_payments DB table

export interface ContractorPayment {
    payment_id: string;
    payment_no: string;
    contractor_id: string;
    contractor_name?: string;
    contractor_phone?: string;
    contractor_email?: string;
    project_id?: string;
    project_name?: string;
    currency: string;
    amount: number;
    exchange_rate: number;
    amount_local: number;
    payment_date: string;
    payment_method: 'Bank' | 'Cash' | 'Check' | 'Other';
    payment_ref?: string;
    bank_id?: string;
    purpose: string;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Cancelled';
    notes?: string;
    created_id?: string;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}

// Legacy envelope helpers
interface LegacyHeader {
    requestId: string;
    status?: number;
    success: boolean;
    responseTime: string;
    message?: string;
    messages?: { code: number; type: string; message: string }[];
}

export interface ContractorPaymentsResponse {
    header: LegacyHeader;
    body?: {
        contractor_payments: {
            total: number;
            pages: number;
            items: ContractorPayment[];
        };
    };
}

export interface SingleContractorPaymentResponse {
    header: LegacyHeader;
    body?: {
        contractor_payment: ContractorPayment;
    };
}

export interface CreateContractorPaymentPayload {
    contractor_id: string;
    project_id?: string;
    currency: string;
    amount: number;
    exchange_rate?: number;
    payment_date: string;
    payment_method?: 'Bank' | 'Cash' | 'Check' | 'Other';
    payment_ref?: string;
    bank_id?: string;
    purpose: string;
    status?: 'Draft' | 'Submitted';
    notes?: string;
}

export interface UpdateContractorPaymentPayload {
    contractor_id?: string;
    project_id?: string;
    currency?: string;
    amount?: number;
    exchange_rate?: number;
    payment_date?: string;
    payment_method?: 'Bank' | 'Cash' | 'Check' | 'Other';
    payment_ref?: string;
    bank_id?: string;
    purpose?: string;
    status?: 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Cancelled';
    notes?: string;
}
