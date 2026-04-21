export interface ChangeOrder {
    id: string;
    contractor_id: string;
    project_id: string;
    change_order_no: string;
    sequence: number;
    title: string;
    description: string;
    issue_date: string;
    est_cost: string;
    status: string;
    notes: string;
    created_at: string;
    updated_at: string;
    contractor_name: string;
    project_name: string;
}

export interface ChangeOrdersResponse {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: { code: number; type: string; message: string }[];
    };
    body?: {
        change_orders: {
            total: number;
            pages: number;
            items: ChangeOrder[];
        };
    };
}

export interface ChangeOrderResponse {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: { code: number; type: string; message: string }[];
    };
    body?: {
        change_order: ChangeOrder;
        contractor?: { id: string; name: string };
        project?: { id: string; name: string };
        documents?: { id: string; title: string; file: string; created_at: string }[];
        contract_terms?: { id: string; titel: string; description: string; created_at: string }[];
    };
}

export interface CreateChangeOrderPayload {
    contractor_id: string;
    project_id: string;
    title: string;
    description?: string;
    issue_date: string;
    est_cost?: string | number;
    notes?: string;
    contract_terms?: { titel: string; description: string }[];
}

export interface UpdateChangeOrderPayload {
    id: string;
    contractor_id?: string;
    project_id?: string;
    title?: string;
    description?: string;
    issue_date?: string;
    est_cost?: string | number;
    status?: string;
    notes?: string;
}
