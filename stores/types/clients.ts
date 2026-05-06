export interface Client {
    id: string;
    name: string;
    client_no: string;
    sequence: number;
    state: string;
    city: string;
    budget: string;
    client_type?: 'Government' | 'Private';
    status?: 'Draft' | 'Active' | 'Suspended' ;
    notes?: string;
    created_at: string;
    updated_at: string;
    projects?: ClientProject[];
    contracts?: ClientContract[];
    task_orders?: ClientTaskOrder[];
    contractors?: ClientContractor[];
}

export interface ClientProject {
    id: string;
    project_code: string;
    number: string;
    sequence: number;
    name: string;
    description?: string;
    status: string;
    type: string;
    created_at: string;
    updated_at: string;
}

export interface ClientContract {
    id: string;
    contract_no: string;
    title: string;
    description?: string;
    contract_date: string;
    start_date?: string;
    end_date?: string;
    contract_value: string;
    currency: 'IQD' | 'USD' | 'EUR';
    guarantee_percent: string;
    retention_percent: string;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientTaskOrder {
    id: string;
    project_id: string;
    contractor_id: string;
    task_order_no: string;
    sequence: number;
    title: string;
    description?: string;
    issue_date: string;
    est_cost: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ClientContractor {
    id: string;
    number: string;
    name: string;
    bank_name?: string;
    bank_account?: string;
    email?: string;
    phone?: string;
    province?: string;
    address?: string;
    status: string;
    note?: string;
    created_at: string;
    updated_at: string;
}

export interface ClientsResponse {
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
        clients: {
            total: number;
            pages: number;
            items: Client[];
        };
    };
}

export interface SingleClientResponse {
    success: boolean;
    message?: string;
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
    data?: {
        client: Client;
    };
}
