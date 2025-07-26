export interface TaskOrder {
    id: string;
    contractor_id: string;
    project_id: string;
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
