// utils/types/login.ts
// This file defines the types for the login response from the API.

export interface LoginResponse {
    header: {
        requestId: string;
        status: number;
        success: boolean;
        responseTime: string;
        messages: string;
    };
    body: {
        expires: string;
        token: string;
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
            };
            department: {
                id: number;
                name: string;
                dept_code: string;
                created_at: string;
                updated_at: string;
            };
            employee: {
                job_title: string;
                employee_code: string;
                hire_date: string;
                salary_grade: string;
                notes: string;
                avatar: string;
                created_at: string;
                updated_at: string;
            };
        };
    };
}

export interface User {
    name: string;
    surname: string;
    email: string;
    phone: string;
    role: string;
    type: string;
    number: string;
    status: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
    // Additional optional fields from department and employee data
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
}