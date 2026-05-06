// Client Contract Types
export interface ClientContract {
    id: string;
    client_id: string;
    contract_no: string;
    title: string;
    description?: string;
    contract_date: string;
    start_date?: string;
    end_date?: string;
    contract_value: string | number;
    currency: 'IQD' | 'USD' | 'EUR';
    guarantee_percent: number;
    retention_percent: number;
    status: 'Active' | 'Expired' | 'Cancelled';
    notes?: string;
    created_at: string;
    updated_at?: string;
    // Joined data from client
    client_name?: string;
    client_no?: string;
    client?: {
        client_id: string;
        name: string;
        client_no: string;
        client_type?: string;
        status?: string;
    };
}

export interface ClientContractsData {
    total: number;
    pages: number;
    items: ClientContract[];
}

export interface ClientContractsResponse {
    success: boolean;
    message?: string;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
    data?: {
        contracts: ClientContractsData;
    };
}

export interface ClientContractsResponseLegacy {
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
        contracts: ClientContractsData;
    };
}

export interface ClientContractResponse {
    success: boolean;
    message?: string;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
    data?: {
        contract: ClientContract;
    };
}

export interface ClientContractResponseLegacy {
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
        contract: ClientContract;
    };
}

export interface CreateContractRequest {
    client_id: string;
    contract_no: string;
    title: string;
    description?: string;
    contract_date: string;
    start_date?: string;
    end_date?: string;
    contract_value: number;
    currency: 'IQD' | 'USD' | 'EUR';
    guarantee_percent?: number;
    retention_percent?: number;
    status?: 'Active' | 'Expired' | 'Cancelled';
    notes?: string;
}

export interface UpdateContractRequest {
    contract_no?: string;
    title?: string;
    description?: string;
    contract_date?: string;
    start_date?: string;
    end_date?: string;
    contract_value?: number;
    currency?: 'IQD' | 'USD' | 'EUR';
    guarantee_percent?: number;
    retention_percent?: number;
    status?: 'Active' | 'Expired' | 'Cancelled';
    notes?: string;
}

export interface CreateContractResponse {
    success: boolean;
    message?: string;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
    data?: {
        success: {
            contract_id: string;
            contract_no: string;
            message: string;
        };
    };
}

export interface UpdateContractResponse {
    success: boolean;
    message?: string;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
    data?: {
        success: {
            contract_id: string;
            message: string;
        };
    };
}

export interface DeleteContractResponse {
    success: boolean;
    message?: string;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
    data?: {
        success: {
            contract_id: string;
            message: string;
        };
    };
}

