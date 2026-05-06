export interface Loan {
    loan_id: string;
    loan_no: string;
    borrower_type: 'Employee' | 'Contractor' | 'Client' | 'Other';
    borrower_id: string;
    project_id?: string;
    project_name?: string;
    loan_type: 'Personal' | 'Business' | 'Emergency' | 'Advance';
    currency: string;
    principal_amount: number;
    exchange_rate: number;
    amount_local: number;
    interest_rate: number;
    term_months: number;
    start_date: string;
    end_date?: string;
    purpose: string;
    collateral?: string;
    guarantor?: string;
    paid_amount: number;
    status: 'Draft' | 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';
    notes?: string;
    created_id?: string;
    deleted_at?: string | null;
    created_at: string;
    updated_at: string;
}

interface LegacyHeader {
    requestId: string;
    status?: number;
    success: boolean;
    responseTime: string;
    message?: string;
    messages?: { code: number; type: string; message: string }[];
}

export interface LoansResponse {
    header: LegacyHeader;
    body?: {
        loans: {
            total: number;
            pages: number;
            items: Loan[];
        };
    };
}

export interface SingleLoanResponse {
    header: LegacyHeader;
    body?: {
        loan: Loan;
    };
}

export interface CreateLoanPayload {
    borrower_type: 'Employee' | 'Contractor' | 'Client' | 'Other';
    borrower_id: string;
    project_id?: string;
    loan_type?: 'Personal' | 'Business' | 'Emergency' | 'Advance';
    currency?: string;
    principal_amount: number;
    exchange_rate?: number;
    interest_rate?: number;
    term_months?: number;
    start_date: string;
    end_date?: string;
    purpose: string;
    collateral?: string;
    guarantor?: string;
    status?: 'Draft' | 'Active';
    notes?: string;
}

export interface UpdateLoanPayload {
    borrower_type?: 'Employee' | 'Contractor' | 'Client' | 'Other';
    borrower_id?: string;
    project_id?: string;
    loan_type?: 'Personal' | 'Business' | 'Emergency' | 'Advance';
    currency?: string;
    principal_amount?: number;
    exchange_rate?: number;
    interest_rate?: number;
    term_months?: number;
    start_date?: string;
    end_date?: string;
    purpose?: string;
    collateral?: string;
    guarantor?: string;
    paid_amount?: number;
    status?: 'Draft' | 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';
    notes?: string;
}
