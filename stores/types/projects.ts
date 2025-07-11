// types/projects.ts
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
        projects: {
            total: number;
            pages: number;
            items: Project[];
        };
    };
}

export interface SingleProjectResponse {
    header: ProjectResponse['header'];
    body?: {
        project: Project;
        budget: Budget;
    };
}