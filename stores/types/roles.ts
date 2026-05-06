export interface Role {
    id: number;
    role_key: string;
    role_name?: string;
    department_id?: string | null;
    description?: string | null;
    created_at?: string;
    [key: string]: unknown;
}

export interface RolesListBody {
    total: number;
    pages: number;
    items: Role[];
}

export interface RolesListResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        roles: RolesListBody;
    };
}

export interface RoleSingleResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        role: Role;
    };
}

export interface CreateRoleParams {
    role_key: string;
    role_name: string;
    department_id?: string | null;
    description?: string | null;
}

export interface UpdateRoleParams {
    role_key?: string;
    role_name?: string;
    department_id?: string | null;
    description?: string | null;
}

/** Item returned by GET /roles/permissions/{id} */
export interface RolePermissionItem {
    permission_id: number;
    permission_key: string;
    name_en?: string;
    name_ar?: string;
    module?: string;
    can_view: 0 | 1;
    can_create: 0 | 1;
    can_edit: 0 | 1;
    can_delete: 0 | 1;
    can_approve: 0 | 1;
    [key: string]: unknown;
}

export interface RolePermissionsResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        permissions: RolePermissionItem[];
    };
}

/** Single item in params.permissions for PUT /roles/permissions/{id} */
export interface SetRolePermissionItem {
    permission_id: number;
    can_view?: 0 | 1;
    can_create?: 0 | 1;
    can_edit?: 0 | 1;
    can_delete?: 0 | 1;
    can_approve?: 0 | 1;
}

/** Legacy alias */
export type RolesResponse = RolesListResponse;
