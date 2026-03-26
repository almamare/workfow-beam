// Base notification item from API
export interface NotificationItem {
    id: string;
    user_id?: string;
    title?: string;
    message: string;
    /** SPA path from backend, or null for legacy rows */
    action_link?: string | null;
    notification_type?: string;
    /** API: Information | Warning | Alert | Success */
    role?: string;
    is_read: 0 | 1 | boolean;
    created_at: string;
}


export interface NotificationsResponse {
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
        notifications: {
            unread?: {
                total: number;
                items: NotificationItem[];
            };
            read?: {
                total: number;
                items: NotificationItem[];
            };
        };
    };
}

