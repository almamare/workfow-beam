// Contractor Payment types
export interface ContractorPayment {
    id: string;
    payment_number: string;
    contractor_id: string;
    contractor_name?: string;
    project_id: string;
    project_name?: string;
    amount: string;
    currency: string;
    payment_method: 'bank_transfer' | 'cash' | 'check' | 'card';
    payment_date: string;
    description?: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
    invoice_number?: string;
    invoice_date?: string;
    approval_date?: string;
    approved_by?: string;
    approved_by_name?: string;
    payment_reference?: string;
    created_by?: string;
    created_by_name?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ContractorPaymentsResponse {
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
        contractor_payments: {
            total: number;
            pages: number;
            items: ContractorPayment[];
        };
    };
}

export interface SingleContractorPaymentResponse {
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
        contractor_payment: ContractorPayment;
    };
}

