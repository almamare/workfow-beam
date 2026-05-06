export interface User {
    id: string;
    username?: string;
    name: string;
    surname: string;
    number: string;
    email: string;
    phone: string;
    role: string;
    type: string;
    status: string;
    created_at: string;
    updated_at: string;
    /** BEAM: role id from roles table */
    role_id?: number | null;
    /** BEAM: department code */
    department_id?: string | null;
    /** BEAM: role key e.g. CFO, COM_DIR */
    role_key?: string | null;
    /** BEAM: last login ISO datetime */
    last_login?: string | null;
    /** 0 = normal, 1 = must change password before proceeding */
    must_change_password?: 0 | 1 | null;
}

export interface UsersResponse {
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
        users: {
            total: number;
            pages: number;
            items: User[];
        };
    };
}

/** BEAM: user_id is the same as User.id (e.g. a3f5b6e81d1c4b23) */

/** Item returned by GET /users/permissions/{userId} (user overrides only) */
export interface UserPermissionItem {
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

export interface UserPermissionsResponse {
    header: { success: boolean; message?: string; messages?: { message: string }[] };
    body?: {
        permissions: UserPermissionItem[];
    };
}

/** Single item in params.permissions for PUT /users/permissions/{userId} */
export interface SetUserPermissionItem {
    permission_id: number;
    can_view?: 0 | 1;
    can_create?: 0 | 1;
    can_edit?: 0 | 1;
    can_delete?: 0 | 1;
    can_approve?: 0 | 1;
}