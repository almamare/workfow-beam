export interface Client {
    id: string;
    name: string;
    client_no: string;
    sequence: number;
    state: string;
    city: string;
    budget: string;
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
