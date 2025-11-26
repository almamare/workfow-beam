import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { NotificationsResponse, Notification, NotificationItem, CreateNotificationPayload, UpdateNotificationPayload } from '@/stores/types/notifications';
import type { RootState } from '@/stores/store';

// Helper function to normalize notification item
const normalizeNotification = (item: NotificationItem): Notification => {
    return {
        ...item,
        title: item.title || 'Notification',
        isRead: !!item.is_read,
        createdAt: item.created_at,
        type: item.notification_type as Notification['type'] || 'info',
    };
};

interface NotificationsState {
    notifications: Notification[];
    total: number;
    pages: number;
    loading: boolean;
    error: string | null;
    lastKey?: string;
}

const initialState: NotificationsState = {
    notifications: [],
    total: 0,
    pages: 0,
    loading: false,
    error: null,
    lastKey: undefined,
};

export interface FetchNotificationsParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    priority?: string;
    category?: string;
    status?: string;
}

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
    NotificationsResponse,
    FetchNotificationsParams | void,
    { rejectValue: string; state: RootState }
>(
    'notifications/fetchNotifications',
    async (params, { rejectWithValue, signal }) => {
        try {
            const { page = 1, limit = 10, search = '', type, priority, category, status } = params || {};
            const res = await api.get<NotificationsResponse>('/notifications/fetch', {
                params: { page, limit, search, type, priority, category, status },
                signal,
            });

            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to fetch notifications';
                return rejectWithValue(msg);
            }

            return res.data;
        } catch (err: any) {
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
                return rejectWithValue('Request canceled');
            }
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while fetching notifications';
            return rejectWithValue(msg);
        }
    },
    {
        condition: (params, { getState }) => {
            const st = (getState() as RootState).notifications;
            const key = JSON.stringify({
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                search: params?.search ?? '',
                type: params?.type ?? '',
                priority: params?.priority ?? '',
                category: params?.category ?? '',
                status: params?.status ?? '',
            });
            if (st.loading && st.lastKey === key) return false;
            return true;
        },
    }
);

// Create notification
export const createNotification = createAsyncThunk<
    NotificationsResponse,
    CreateNotificationPayload,
    { rejectValue: string }
>(
    'notifications/createNotification',
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post<NotificationsResponse>('/notifications/create', payload);
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to create notification';
                return rejectWithValue(msg);
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while creating notification';
            return rejectWithValue(msg);
        }
    }
);

// Update notification
export const updateNotification = createAsyncThunk<
    NotificationsResponse,
    UpdateNotificationPayload,
    { rejectValue: string }
>(
    'notifications/updateNotification',
    async (payload, { rejectWithValue }) => {
        try {
            const { id, ...data } = payload;
            const res = await api.put<NotificationsResponse>(`/notifications/update/${id}`, data);
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to update notification';
                return rejectWithValue(msg);
            }
            return res.data;
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while updating notification';
            return rejectWithValue(msg);
        }
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>(
    'notifications/deleteNotification',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/notifications/delete/${id}`);
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to delete notification';
                return rejectWithValue(msg);
            }
            return { id };
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while deleting notification';
            return rejectWithValue(msg);
        }
    }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.put(`/notifications/mark-read/${id}`);
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to mark notification as read';
                return rejectWithValue(msg);
            }
            return { id };
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while marking notification as read';
            return rejectWithValue(msg);
        }
    }
);

// Mark notification as unread
export const markNotificationAsUnread = createAsyncThunk<
    { id: string },
    string,
    { rejectValue: string }
>(
    'notifications/markAsUnread',
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.put(`/notifications/mark-unread/${id}`);
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to mark notification as unread';
            return rejectWithValue(msg);
            }
            return { id };
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while marking notification as unread';
            return rejectWithValue(msg);
        }
    }
);

// Toggle notification active status
export const toggleNotificationActive = createAsyncThunk<
    { id: string; isActive: boolean },
    { id: string; isActive: boolean },
    { rejectValue: string }
>(
    'notifications/toggleActive',
    async ({ id, isActive }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/notifications/toggle-active/${id}`, { isActive });
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to toggle notification status';
                return rejectWithValue(msg);
            }
            return { id, isActive };
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while toggling notification status';
            return rejectWithValue(msg);
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                const { page = 1, limit = 10, search = '', type = '', priority = '', category = '', status = '' } = (action.meta.arg || {}) as FetchNotificationsParams;
                state.lastKey = JSON.stringify({ page, limit, search, type, priority, category, status });
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationsResponse>) => {
                state.loading = false;
                const payload = action.payload.body?.notifications;
                
                // Handle both formats: unread/read structure or paginated items
                if (payload?.unread || payload?.read) {
                    // Format from components/notifications.tsx
                    const unreadItems: NotificationItem[] = Array.isArray(payload.unread?.items) ? payload.unread.items : [];
                    const readItems: NotificationItem[] = Array.isArray(payload.read?.items) ? payload.read.items : [];
                    const allItems = [...unreadItems, ...readItems];
                    state.notifications = allItems.map(normalizeNotification);
                    state.total = (payload.unread?.total || 0) + (payload.read?.total || 0);
                    state.pages = 1; // Not paginated in this format
                } else if (payload?.items) {
                    // Paginated format
                    state.notifications = payload.items.map(normalizeNotification);
                    state.total = payload.total ?? payload.items.length;
                    state.pages = payload.pages ?? 1;
                } else {
                    state.notifications = [];
                    state.total = 0;
                    state.pages = 0;
                }
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                const msg = (action.payload as string) || action.error.message || 'حدث خطأ أثناء جلب بيانات الإشعارات';
                state.error = msg === 'Request canceled' ? null : msg;
            })
            // Create notification
            .addCase(createNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNotification.fulfilled, (state, action: PayloadAction<NotificationsResponse>) => {
                state.loading = false;
                const payload = action.payload.body?.notifications;
                let newNotification: NotificationItem | undefined;
                
                if (payload?.unread?.items?.[0]) {
                    newNotification = payload.unread.items[0];
                } else if (payload?.read?.items?.[0]) {
                    newNotification = payload.read.items[0];
                } else if (payload?.items?.[0]) {
                    newNotification = payload.items[0];
                }
                
                if (newNotification) {
                    state.notifications = [normalizeNotification(newNotification), ...state.notifications];
                    state.total += 1;
                }
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ أثناء إنشاء الإشعار';
            })
            // Update notification
            .addCase(updateNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateNotification.fulfilled, (state, action: PayloadAction<NotificationsResponse>) => {
                state.loading = false;
                const payload = action.payload.body?.notifications;
                let updatedNotification: NotificationItem | undefined;
                
                if (payload?.unread?.items?.[0]) {
                    updatedNotification = payload.unread.items[0];
                } else if (payload?.read?.items?.[0]) {
                    updatedNotification = payload.read.items[0];
                } else if (payload?.items?.[0]) {
                    updatedNotification = payload.items[0];
                }
                
                if (updatedNotification) {
                    const normalized = normalizeNotification(updatedNotification);
                    state.notifications = state.notifications.map(n =>
                        n.id === normalized.id ? normalized : n
                    );
                }
            })
            .addCase(updateNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ أثناء تحديث الإشعار';
            })
            // Delete notification
            .addCase(deleteNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = state.notifications.filter(n => n.id !== action.payload.id);
                state.total = Math.max(0, state.total - 1);
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'حدث خطأ أثناء حذف الإشعار';
            })
            // Mark as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.notifications = state.notifications.map(n =>
                    n.id === action.payload.id ? { ...n, isRead: true } : n
                );
            })
            // Mark as unread
            .addCase(markNotificationAsUnread.fulfilled, (state, action) => {
                state.notifications = state.notifications.map(n =>
                    n.id === action.payload.id ? { ...n, isRead: false } : n
                );
            })
            // Toggle active
            .addCase(toggleNotificationActive.fulfilled, (state, action) => {
                state.notifications = state.notifications.map(n =>
                    n.id === action.payload.id ? { ...n, isActive: action.payload.isActive } : n
                );
            });
    },
});

export default notificationsSlice.reducer;

// Selectors
export const selectNotifications = (state: RootState) => state.notifications.notifications;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;
export const selectNotificationsTotal = (state: RootState) => state.notifications.total;
export const selectNotificationsPages = (state: RootState) => state.notifications.pages;
export const selectNotificationsError = (state: RootState) => state.notifications.error;

