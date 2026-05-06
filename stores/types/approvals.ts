export interface Approval {
    id: string;
    request_id: string;
    created_id: string;
    created_name: string;
    sequence: number;
    title: string;
    step_no: string;
    step_name: string;
    remarks: string;
    status: string; // 'موافق', 'مرفوض', 'قيد المراجعة', etc.
    created_at: string;
}

// API Response Structure (new format)
export interface ApprovalsResponse {
    success: boolean;
    message?: string;
    data?: {
        approvals: {
            total: number;
            pages: number;
            items: Approval[];
        };
    };
    errors?: {
        code: string;
        type: string;
        message: string;
    }[];
}

// Legacy API Response Structure (if backend uses header/body format)
export interface ApprovalsResponseLegacy {
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
        approvals: {
            total: number;
            pages: number;
            items: Approval[];
        };
    };
}

