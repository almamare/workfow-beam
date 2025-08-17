export interface User {
    id: string;
    name: string;
    surname: string;
    number: string;
    email: string;
    phone: string;
    role: string;
    type: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface UsersResponse {
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
        users: {
            total: number;
            pages: number;
            items: User[];
        };
    };
}