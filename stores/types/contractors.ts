export interface Contractor {
    id: string;
    number: string;
    name: string;
    bank_name: string;
    bank_account: number;
    email: string;
    phone: string;
    province: string;
    address: string;
    status: string;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface ContractorsResponse {
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
        contractors: {
            total: number;
            pages: number;
            items: Contractor[];
        };
    };
}
