export interface JobTitle {
    id: number;
    title_en?: string;
    title_ar?: string;
    department_id?: string | null;
    role?: string;
    level?: number;
    [key: string]: unknown;
}

export interface JobTitlesResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: { job_titles: JobTitle[] };
}
