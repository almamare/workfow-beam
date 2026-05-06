
export interface Budget {
    id: string;
    project_id: string;
    fiscal_year: string;
    original_budget: string;
    revised_budget: string;
    committed_cost: string;
    actual_cost: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectResponse {
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
        budgets: {
            total: number;
            pages: number;
            items: Budget[];
        };
    };
}