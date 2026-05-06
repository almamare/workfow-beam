export interface Department {
    id: number;
    department_id: string;
    name_en?: string;
    name_ar?: string;
    dept_code?: string;
    parent_id?: string | null;
    level?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface DepartmentsListBody {
    total: number;
    pages: number;
    items: Department[];
}

export interface DepartmentsListResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        departments: DepartmentsListBody;
    };
}

export interface DepartmentSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: { department: Department };
}

/** Legacy alias */
export type DepartmentsResponse = DepartmentsListResponse;
  