export interface Bank {
    id: string;
    bank_no?: string;
    name: string;
    account_number?: string;
    iban?: string;
    swift_code?: string;
    branch_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: string;
    created_at: string;
    updated_at?: string;
}

export interface BanksResponse {
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
        banks: {
            total: number;
            pages: number;
            items: Bank[];
        };
        bank?: Bank;
    };
}

export interface CreateBankPayload {
    name: string;
    account_number?: string;
    iban?: string;
    swift_code?: string;
    branch_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: string;
}

export interface UpdateBankPayload {
    id: string;
    name?: string;
    account_number?: string;
    iban?: string;
    swift_code?: string;
    branch_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    status?: string;
}

