import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { NotificationsResponse, NotificationItem } from '@/stores/types/notifications';
import type { RootState } from '@/stores/store';

/* ========================= API Endpoints ========================= */
const API_ENDPOINTS = {
    FETCH: '/notifications/fetch',
    MARK_READ: (id: string) => `/notifications/mark-read/${id}`,
    MARK_UNREAD: (id: string) => `/notifications/mark-unread/${id}`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/delete/${id}`,
} as const;

/* ========================= Helper Functions ========================= */
const extractNotificationItems = (payload: NotificationsResponse['body']): NotificationItem[] => {
    if (!payload?.notifications) return [];
    
    const { unread, read } = payload.notifications;
    
    const unreadItems: NotificationItem[] = (unread && Array.isArray(unread.items)) ? unread.items : [];
    const readItems: NotificationItem[] = (read && Array.isArray(read.items)) ? read.items : [];
    
    return [...unreadItems, ...readItems];
};

const normalizeNotification = (item: NotificationItem): NotificationItem => {
    return {
        ...item,
        title: item.title ?? 'Notification',
        is_read: !!item.is_read,
    };
};

/* ========================= State Interface ========================= */
interface NotificationsState {
    items: NotificationItem[];
    counts: {
        read: number;
        unread: number;
    };
    loading: boolean;
    error: string | null;
}

const initialState: NotificationsState = {
    items: [],
    counts: {
        read: 0,
        unread: 0,
    },
    loading: false,
    error: null,
};

/* ========================= Async Thunks ========================= */

// Fetch notifications
export const fetchNotifications = createAsyncThunk<
    NotificationsResponse,
    void,
    { rejectValue: string; state: RootState }
>(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue, signal }) => {
        try {
            const res = await api.get<NotificationsResponse>(API_ENDPOINTS.FETCH, {
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
            const res = await api.put(API_ENDPOINTS.MARK_READ(id));
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
            const res = await api.put(API_ENDPOINTS.MARK_UNREAD(id));
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

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.put(API_ENDPOINTS.MARK_ALL_READ);
            const { header } = res.data;
            if (!header?.success) {
                const msg =
                    header?.messages?.[0]?.message ||
                    header?.message ||
                    'Failed to mark all notifications as read';
                return rejectWithValue(msg);
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.header?.message ||
                err?.message ||
                'Network error while marking all notifications as read';
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
            const res = await api.delete(API_ENDPOINTS.DELETE(id));
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

/* ========================= Slice ========================= */
const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<NotificationsResponse>) => {
                state.loading = false;
                
                // Extract notification items
                const items = extractNotificationItems(action.payload.body);
                const normalized = items.map(normalizeNotification);
                state.items = normalized;
                
                // Calculate counts from response
                const unreadNode = action.payload.body?.notifications?.unread;
                const readNode = action.payload.body?.notifications?.read;
                
                state.counts = {
                    unread: Number(unreadNode?.total) || normalized.filter(n => !n.is_read).length,
                    read: Number(readNode?.total) || normalized.filter(n => n.is_read).length,
                };
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                const msg = (action.payload as string) || action.error.message || 'Failed to fetch notifications';
                state.error = msg === 'Request canceled' ? null : msg;
            })
            
            // Mark as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.items = state.items.map((n) =>
                    n.id === action.payload.id ? { ...n, is_read: true } : n
                );
                state.counts = {
                    unread: Math.max(0, state.counts.unread - 1),
                    read: state.counts.read + 1,
                };
            })
            
            // Mark as unread
            .addCase(markNotificationAsUnread.fulfilled, (state, action) => {
                state.items = state.items.map((n) =>
                    n.id === action.payload.id ? { ...n, is_read: false } : n
                );
                state.counts = {
                    unread: state.counts.unread + 1,
                    read: Math.max(0, state.counts.read - 1),
                };
            })
            
            // Mark all as read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.items = state.items.map((n) => ({ ...n, is_read: true }));
                state.counts = {
                    read: state.counts.read + state.counts.unread,
                    unread: 0,
                };
            })
            
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const target = state.items.find((n) => n.id === action.payload.id);
                state.items = state.items.filter((n) => n.id !== action.payload.id);
                
                if (target) {
                    state.counts = {
                        unread: !target.is_read 
                            ? Math.max(0, state.counts.unread - 1) 
                            : state.counts.unread,
                        read: target.is_read 
                            ? Math.max(0, state.counts.read - 1) 
                            : state.counts.read,
                    };
                }
            });
    },
});

export default notificationsSlice.reducer;

/* ========================= Selectors ========================= */
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectNotificationsCounts = (state: RootState) => state.notifications.counts;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;
export const selectNotificationsError = (state: RootState) => state.notifications.error;
export const selectUnreadCount = (state: RootState) => state.notifications.counts.unread;
export const selectReadCount = (state: RootState) => state.notifications.counts.read;
export const selectTotalCount = (state: RootState) => 
    state.notifications.counts.read + state.notifications.counts.unread;

