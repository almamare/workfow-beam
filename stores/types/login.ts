// utils/types/login.ts
// This file defines the types for the login response from the API (BEAM backend).

export interface LoginResponse {
    header: {
        requestId: string;
        status: number;
        success: boolean;
        responseTime: string;
        messages?: { code?: number; type?: string; message: string }[];
    };
    body: {
        token: string;
        user: {
            id: string;
            name: string;
            surname: string;
            username: string;
            role: string;
            role_id: number;
            department_id?: string | null;
            status: string;
            /** 0 = no change needed, 1 = must change before proceeding */
            must_change_password: 0 | 1;
            last_login?: string | null;
            email?: string;
            phone?: string;
            number?: string;
            role_key?: string | null;
        };
        employee?: {
            employee_id?: string;
            job_title?: string;
            hire_date?: string;
        };
    };
}

export interface User {
    id?: string;
    name: string;
    surname?: string;
    email?: string;
    phone?: string;
    role: string;
    type?: string;
    number?: string;
    username?: string;
    status: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
    department?: string;
    position?: string;
    employee_id?: string;
    hire_date?: string;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
    language?: string;
    timezone?: string;
    /** Role key e.g. CFO, COM_DIR — use for menus and feature flags */
    role_key?: string | null;
    /** Role display name e.g. مدير المالية, مدير العقود */
    role_name?: string | null;
    /** Department code */
    department_id?: string | null;
    /** Last successful login ISO datetime */
    last_login?: string | null;
    /** Employee job_title_id, department_id, status (from login data.employee) */
    job_title_id?: number | null;
    employee_department_id?: string | null;
    employee_status?: string | null;
    /** 0 = normal, 1 = must change password before proceeding */
    must_change_password?: 0 | 1;
}
