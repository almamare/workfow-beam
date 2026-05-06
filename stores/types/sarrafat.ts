export interface Sarraf {
    id: number;
    sarraf_id: string;
    sarraf_no?: string;
    sarraf_name: string;
    owner_name: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
    district?: string;
    address: string;
    status?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface SarrafatListBody {
    total: number;
    pages: number;
    items: Sarraf[];
}

export interface SarrafatListResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        sarrafat: SarrafatListBody;
    };
}

export interface SarrafSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        sarraf: Sarraf;
    };
}

export interface CreateSarrafParams {
    sarraf_name: string;
    owner_name: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
    district: string;
    address: string;
    status?: string;
    notes?: string;
}

export interface UpdateSarrafParams {
    sarraf_name?: string;
    owner_name?: string;
    phone?: string;
    email?: string;
    governorate?: string;
    city?: string;
    district?: string;
    address?: string;
    status?: string;
    notes?: string;
}
