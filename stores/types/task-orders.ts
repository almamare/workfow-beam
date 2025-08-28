// ==========================================================
// types/task-orders.ts
// Interfaces for Task Orders and related entities
// ==========================================================

export interface TaskOrder {
    id: string;
    contractor_name: string;
    project_name: string;
    task_order_no: string;
    sequence: number;
    title: string;
    description: string;
    issue_date: string;
    est_cost: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface TaskOrdersResponse {
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
        task_orders: {
            total: number;
            pages: number;
            items: TaskOrder[];
        };
    };
}

export interface Contractor {
    id: string;
    number: string;
    name: string;
    bank_name: string;
    bank_account: string;
    email: string;
    phone: string;
    address: string;
    province: string;
    status: string;
    note: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    project_code: string;
    number: string;
    sequence: number;
    name: string;
    client_name: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    type: string;
    created_at: string;
    updated_at: string;
}

export interface Documents {
    id: string;
    title: string;
    file: string;
    created_at: string;
}

export interface ContractTerms {
    id: string;
    titel: string;
    description: string;
    created_at: string;
}

export interface TaskOrderResponse {
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
        task_order: TaskOrder;
        contractor: Contractor;
        project: Project;
        documents: Documents[];
        contract_terms: ContractTerms[];
    };
}
