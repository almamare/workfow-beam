// ================= Employee Interface =================
export interface Employee {
    id: string;             // Employee ID
    user_id: string;        // Related user ID
    name: string;
    surname: string;
    job_title: string;      // Job position
    employee_code: string;  // Employee number/code
    hire_date: string;      // Hiring date
    salary_grade: string;   // Salary grade
    role: string;           // Role in the company
    notes?: string;         // Additional notes (optional)
    avatar?: string;        // Profile picture (optional)
    created_at: string;     // Record creation timestamp
    updated_at: string;     // Record update timestamp
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
