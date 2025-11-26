// Base notification item from API
export interface NotificationItem {
    id: string;
    title?: string;
    message: string;
    notification_type?: string;
    is_read: 0 | 1 | boolean;
    created_at: string;
    // Optional fields that might come from API
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: 'system' | 'project' | 'financial' | 'inventory' | 'employee' | 'contractor' | 'other';
    target_users?: string[];
    target_roles?: string[];
    is_active?: boolean;
    scheduled_date?: string;
    expiry_date?: string;
    created_by?: string;
    read_by?: string[];
    read_at?: string[];
    attachments?: string[];
    actions?: string[];
    metadata?: Record<string, any>;
}

// Extended notification for UI (normalized)
export interface Notification extends NotificationItem {
    title: string; // Required in UI
    isRead: boolean; // Normalized from is_read
    createdAt: string; // Normalized from created_at
    type?: 'info' | 'warning' | 'error' | 'success' | 'urgent'; // Mapped from notification_type
    // Support both camelCase and snake_case for compatibility
    targetUsers?: string[];
    targetRoles?: string[];
    scheduledDate?: string;
    expiryDate?: string;
    isActive?: boolean;
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
            // For paginated responses
            total?: number;
            pages?: number;
            items?: NotificationItem[];
        };
    };
}

export interface CreateNotificationPayload {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'system' | 'project' | 'financial' | 'inventory' | 'employee' | 'contractor' | 'other';
    targetUsers?: string[];
    targetRoles?: string[];
    scheduledDate?: string;
    expiryDate?: string;
    attachments?: string[];
    actions?: string[];
    metadata?: Record<string, any>;
}

export interface UpdateNotificationPayload extends Partial<CreateNotificationPayload> {
    id: string;
    isActive?: boolean;
}

