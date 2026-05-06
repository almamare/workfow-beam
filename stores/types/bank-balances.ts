export interface BankBalance {
    id: string;
    bank_id: string;
    bank_name?: string;
    bank_no?: string;
    currency: string;
    balance: number;
    last_updated?: string;
    notes?: string;
    bank?: {
        bank_id: string;
        name: string;
        bank_no?: string;
        account_number?: string;
        iban?: string;
        status?: string;
    };
    created_at: string;
    updated_at?: string;
}

export interface BankBalancesResponse {
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
        balances: {
            total: number;
            pages: number;
            items: BankBalance[];
        };
        balance?: BankBalance;
        bank?: {
            bank_id: string;
            name: string;
            bank_no?: string;
        };
    };
}

export interface BankBalancesByBankResponse {
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
        bank: {
            bank_id: string;
            name: string;
            bank_no?: string;
        };
        balances: BankBalance[];
    };
}

export interface CreateBankBalancePayload {
    bank_id: string;
    currency: string;
    balance: number;
    notes?: string;
}

export interface UpdateBankBalancePayload {
    id: string;
    balance?: number;
    notes?: string;
}

