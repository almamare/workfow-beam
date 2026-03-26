export type PaymentSource = 'Bank' | 'Sarraf' | 'Petty_Cash';
export type BeneficiaryType = 'Contractor' | 'Supplier' | 'Employee' | 'Other';
export type CostCategory = 'Labor' | 'Materials' | 'Equipment' | 'Services' | 'Admin' | 'Other';
export type DisbursementStatus =
    | 'Draft'
    | 'Submitted'
    | 'Under_Review'
    | 'Approved'
    | 'Rejected'
    | 'Paid'
    | 'Cancelled';

export interface DisbursementLineItem {
    id?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    unit_price?: number;
    total?: number;
    [key: string]: unknown;
}

export interface DisbursementApprovalStep {
    id?: string;
    step?: number;
    role?: string;
    status?: string;
    remarks?: string;
    decided_at?: string;
    [key: string]: unknown;
}

export interface Disbursement {
    id: string;
    project_id?: string;
    budget_id?: string;
    payment_source: PaymentSource;
    source_ref_id: string;
    currency: string;
    amount: number;
    exchange_rate?: number;
    beneficiary_type?: BeneficiaryType;
    beneficiary_name?: string;
    beneficiary_ref?: string;
    cost_category?: CostCategory;
    purpose?: string;
    status: DisbursementStatus;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
    line_items?: DisbursementLineItem[];
    approvals?: DisbursementApprovalStep[];
    attachments?: unknown[];
    [key: string]: unknown;
}

export interface Paginated<T> {
    items: T[];
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export interface PettyCashBox {
    id: string;
    name: string;
    project_id?: string;
    currency: string;
    balance?: number;
    [key: string]: unknown;
}

export interface LedgerEntry {
    id: string;
    [key: string]: unknown;
}
