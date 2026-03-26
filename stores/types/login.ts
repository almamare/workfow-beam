// utils/types/login.ts
// This file defines the types for the login response from the API (BEAM backend).

export interface LoginResponse {
    header: {
        requestId: string;
        status: number;
        success: boolean;
        responseTime: string;
        messages: string;
    };
    /** When true, frontend must redirect to change-password; backend clears after next successful login */
    must_change_password?: boolean;
    body: {
        expires: string;
        token: string;
        /** Root-level flag (alternative to top-level); prefer body.must_change_password if present */
        must_change_password?: boolean;
        data: {
            userInfo: {
                name: string;
                email: string;
                phone: string;
                role: string;
                type: string;
                number: string;
                status: string;
                created_at: string;
                updated_at: string;
                /** Role key e.g. CFO, COM_DIR, SYSADMIN — use for role-based UI */
                role_key?: string | null;
                /** Department code e.g. FINANCE, COMMERCIAL */
                department_id?: string | null;
                /** ISO datetime of last successful login */
                last_login?: string | null;
            };
            department?: {
                id: number;
                name: string;
                dept_code: string;
                created_at: string;
                updated_at: string;
            };
            employee?: {
                job_title?: string;
                employee_code?: string;
                hire_date?: string;
                salary_grade?: string;
                notes?: string;
                avatar?: string;
                created_at?: string;
                updated_at?: string;
                /** FK to job title (numeric) */
                job_title_id?: number | null;
                /** Department code */
                department_id?: string | null;
                /** e.g. Active, Inactive, Suspended, Resigned */
                status?: string | null;
            };
        };
    };
}

export interface User {
    name: string;
    surname?: string;
    email: string;
    phone: string;
    role: string;
    type: string;
    number: string;
    status: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
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
    /** Department code */
    department_id?: string | null;
    /** Last successful login ISO datetime */
    last_login?: string | null;
    /** Employee job_title_id, department_id, status (from login data.employee) */
    job_title_id?: number | null;
    employee_department_id?: string | null;
    employee_status?: string | null;
}