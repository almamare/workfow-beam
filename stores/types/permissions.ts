export interface Permission {
    id: number;
    permission_key: string;
    name_en?: string;
    name_ar?: string;
    module?: string;
    created_at?: string;
    [key: string]: unknown;
}

export interface PermissionsListResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        permissions: Permission[] | { items?: Permission[]; total?: number; pages?: number };
    };
}

export interface PermissionSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        permission: Permission;
    };
}

export interface EffectivePermissionFlags {
    can_view: 0 | 1;
    can_create: 0 | 1;
    can_edit: 0 | 1;
    can_delete: 0 | 1;
    can_approve: 0 | 1;
}

export interface EffectivePermissionsResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        permissions: Record<string, EffectivePermissionFlags>;
    };
}

export interface CreatePermissionParams {
    permission_key: string;
    name_en: string;
    name_ar: string;
    module: string;
}

export interface UpdatePermissionParams {
    name_en?: string;
    name_ar?: string;
    module?: string;
}
