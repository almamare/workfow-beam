export interface SarrafBalance {
    id: number;
    balance_id: string;
    sarraf_id: string;
    currency: string;
    balance: number;
    last_updated?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    sarraf_name?: string;
    sarraf_no?: string;
    sarraf?: { sarraf_id: string; sarraf_name?: string; sarraf_no?: string };
    [key: string]: unknown;
}

export interface SarrafBalancesListBody {
    total: number;
    pages: number;
    items: SarrafBalance[];
}

export interface SarrafBalancesListResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        balances: SarrafBalancesListBody;
    };
}

export interface SarrafBalanceSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        balance: SarrafBalance;
    };
}

export interface SarrafBalancesBySarrafResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        sarraf: { sarraf_id: string; sarraf_name?: string; sarraf_no?: string };
        balances: SarrafBalance[];
    };
}

export interface CreateSarrafBalanceParams {
    sarraf_id: string;
    currency: string;
    balance: number;
    notes?: string;
}

export interface UpdateSarrafBalanceParams {
    balance?: number;
    notes?: string;
}
