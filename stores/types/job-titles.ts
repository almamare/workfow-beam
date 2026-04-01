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
    body?: {
        total: number;
        pages: number;
        job_titles: JobTitle[];
    };
}

export interface JobTitleSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: { job_title: JobTitle };
}

export interface CreateJobTitleParams {
    title_en: string;
    title_ar: string;
    department_id: string;
}

export interface UpdateJobTitleParams {
    title_en?: string;
    title_ar?: string;
    department_id?: string;
}
