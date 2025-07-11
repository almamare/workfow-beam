export interface Tender {
    id: string;
    project_id: string;
    sequence: number;
    name: string;
    price: string;
    quantity: string;
    amount: string;
    created_at: string;
}


export interface TendersResponse {
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
        tenders: {
            total: number;
            pages: number;
            items: Tender[];
        };
    };
}
