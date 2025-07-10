export interface Project {
    id: string;
    project_code: string;
    number: string;
    sequence: number;
    name: string;
    client_name: string;
    start_date: string;
    end_date: string;
    type: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectResponse {
    header: {
        requestId: string;
        status?: number; // status may be missing in error
        success: boolean;
        responseTime: string;
        message?: string; // old single message
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
