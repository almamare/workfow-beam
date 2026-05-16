export interface Approval {
    id: string;
    request_id: string;
    approver_id?: string | null;
    /** Name resolved from approver_id join */
    approver_name?: string | null;
    /** Role key of the approver (for backend logic) */
    approver_role?: string | null;
    /** Role display name of the approver (for display) */
    approver_role_name?: string | null;
    approver_type?: string | null;
    /** Role key required by the workflow step */
    required_role?: string | null;
    created_id?: string;
    created_name?: string;
    sequence: number;
    step_no?: string | number;
    step_name?: string;
    /** step_name with role_key replaced by role_name for display */
    step_name_display?: string | null;
    title?: string;
    remarks?: string | null;
    status: string;
    created_at: string;
    updated_at?: string | null;
    /** When the approval action was taken */
    action_date?: string | null;
    step_level?: number | null;
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
