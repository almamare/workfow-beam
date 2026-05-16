// ================= Employee Interface =================
export interface Employee {
    id: string;
    user_id?: string;
    name: string;
    surname: string;
    job_title: string;
    employee_code: string;
    hire_date: string;
    salary_grade: string;
    /** role_key from job_titles (e.g. CFO, HR_DIR, OPS_STAFF) */
    role_key?: string | null;
    /** 1=C-Level 2=Director 3=Manager 4=Senior 5=Staff */
    level?: number | null;
    notes?: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
    /** BEAM: FK to job_titles.id (numeric) */
    job_title_id?: number | null;
    /** BEAM: department code */
    department_id?: string | null;
    /** BEAM: direct manager's employee_id */
    manager_id?: string | null;
    /** BEAM: e.g. Active, Inactive, Suspended, Resigned */
    status?: string | null;
}

// ================= Employees Response =================
export interface EmployeesResponse {
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
        employees: {
            total: number;
            pages: number;
            items: Employee[];
        };
    };
}
