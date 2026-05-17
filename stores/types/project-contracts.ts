export interface ProjectContract {
    id: string;
    project_id: string;
    client_id?: string | null;
    contractor_id?: string | null;
    contract_no: string;
    title: string;
    contract_type: 'Main' | 'Subcontract' | 'Amendment' | 'Framework' | 'Other';
    description?: string;
    scope?: string;
    payment_terms?: string;
    contract_date: string;
    start_date?: string | null;
    end_date?: string | null;
    status: 'Draft' | 'Active' | 'Expired' | 'Cancelled' | 'Suspended';
    approval_status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
    notes?: string;
    created_at: string;
    updated_at?: string;
    project_name?: string;
    project_number?: string;
    client_name?: string;
    client_no?: string;
    contractor_name?: string;
    contractor_number?: string;
    project?: Record<string, unknown>;
    client?: Record<string, unknown>;
    contractor?: Record<string, unknown>;
}

export interface ProjectContractsData {
    total: number;
    pages: number;
    items: ProjectContract[];
}

export interface ProjectContractsResponseLegacy {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: { code: number; type: string; message: string }[];
    };
    body?: { contracts: ProjectContractsData };
}

export interface ProjectContractResponseLegacy {
    header: {
        requestId: string;
        status?: number;
        success: boolean;
        responseTime: string;
        message?: string;
        messages?: { code: number; type: string; message: string }[];
    };
    body?: { contract: ProjectContract };
}

export interface CreateProjectContractRequest {
    project_id: string;
    contractor_id?: string;
    client_id?: string;
    title: string;
    contract_type?: ProjectContract['contract_type'];
    description?: string;
    scope?: string;
    payment_terms?: string;
    contract_date: string;
    start_date?: string;
    end_date?: string;
    notes?: string;
    attachments?: { title: string; file: string; status: string; version: string }[];
}

export interface UpdateProjectContractRequest {
    project_id?: string;
    client_id?: string;
    title?: string;
    contract_type?: ProjectContract['contract_type'];
    description?: string;
    scope?: string;
    payment_terms?: string;
    contract_date?: string;
    start_date?: string;
    end_date?: string;
    status?: ProjectContract['status'];
    notes?: string;
}

export function firstMessage(legacy: ProjectContractsResponseLegacy | ProjectContractResponseLegacy): string {
    return legacy.header?.messages?.[0]?.message || legacy.header?.message || 'Request failed';
}

function legacyHeaderOk(header: ProjectContractsResponseLegacy['header'] | undefined): boolean {
    if (!header || header.success !== true) {
        return false;
    }
    return true;
}

export function isProjectContractsListSuccess(
    data: unknown
): data is ProjectContractsResponseLegacy {
    if (typeof data !== 'object' || data === null || !('header' in data)) {
        return false;
    }
    const legacy = data as ProjectContractsResponseLegacy;
    if (!legacyHeaderOk(legacy.header)) {
        return false;
    }
    const c = legacy.body?.contracts;
    return c != null && typeof c === 'object' && 'items' in c;
}

export function isProjectContractDetailSuccess(data: unknown): data is ProjectContractResponseLegacy {
    if (typeof data !== 'object' || data === null || !('header' in data)) {
        return false;
    }
    const legacy = data as ProjectContractResponseLegacy;
    if (!legacyHeaderOk(legacy.header)) {
        return false;
    }
    return legacy.body?.contract != null && typeof legacy.body.contract === 'object';
}

