'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    deleteNotification,
    selectNotifications,
    selectNotificationsCounts,
    selectNotificationsLoading,
    selectTotalCount,
    selectUnreadCount,
    selectReadCount,
} from '@/stores/slices/notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Bell, Check, X, Trash2, RefreshCw, FileSpreadsheet, AlertTriangle, Info, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import type { NotificationItem } from '@/stores/types/notifications';

const notificationTypes = [
    { value: 'info', label: 'Information', icon: <Info className="h-4 w-4" /> },
    { value: 'warning', label: 'Warning', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'error', label: 'Error', icon: <XCircleIcon className="h-4 w-4" /> },
    { value: 'success', label: 'Success', icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: 'urgent', label: 'Urgent', icon: <AlertTriangle className="h-4 w-4" /> }
];

export default function NotificationsPage() {
    const notifications = useSelector(selectNotifications);
    const counts = useSelector(selectNotificationsCounts);
    const loading = useSelector(selectNotificationsLoading);
    const totalItems = useSelector(selectTotalCount);
    const unreadCount = useSelector(selectUnreadCount);
    const readCount = useSelector(selectReadCount);

    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [type, setType] = useState<'All' | 'info' | 'warning' | 'error' | 'success' | 'urgent'>('All');
    const [status, setStatus] = useState<'All' | 'Read' | 'Unread'>('All');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    // Filter notifications client-side
    const filteredNotifications = useMemo(() => {
        let filtered = notifications;

        // Filter by search term
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(n => 
                (n.title || '').toLowerCase().includes(searchLower) ||
                (n.message || '').toLowerCase().includes(searchLower) ||
                (n.notification_type || '').toLowerCase().includes(searchLower)
            );
        }

        // Filter by type
        if (type !== 'All') {
            filtered = filtered.filter(n => (n.notification_type || 'info') === type);
        }

        // Filter by status
        if (status === 'Read') {
            filtered = filtered.filter(n => !!n.is_read);
        } else if (status === 'Unread') {
            filtered = filtered.filter(n => !n.is_read);
        }

        return filtered;
    }, [notifications, search, type, status]);

    const columns: Column<NotificationItem>[] = [
        { 
            key: 'title', 
            header: 'Title', 
            sortable: true,
            render: (value: any, notification: NotificationItem) => (
                <div className="flex items-center space-x-2">
                    <div className="flex-1">
                        <div className={`font-semibold ${notification.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {notification.title || 'Notification'}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                            {notification.message}
                        </div>
                    </div>
                    {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                </div>
            )
        },
        { 
            key: 'notification_type', 
            header: 'Type', 
            sortable: true,
            render: (value: any, notification: NotificationItem) => {
                const notificationType = notification.notification_type || 'info';
                const typeConfig = notificationTypes.find(t => t.value === notificationType);
                const typeColors: Record<string, string> = {
                    'info': 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    'warning': 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                    'error': 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                    'success': 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'urgent': 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                };
                
                return (
                    <Badge variant="outline" className={`${typeColors[notificationType] || typeColors.info} font-medium`}>
                        {typeConfig?.icon}
                        <span className="ml-1">{typeConfig?.label || notificationType}</span>
                    </Badge>
                );
            }
        },
        { 
            key: 'created_at', 
            header: 'Created At', 
            sortable: true,
            render: (value: any, notification: NotificationItem) => {
                const timeAgo = (dateString: string) => {
                    try {
                        const d = new Date(dateString);
                        const s = Math.floor((Date.now() - d.getTime()) / 1000);
                        if (s < 60) return `${s}s ago`;
                        const m = Math.floor(s / 60);
                        if (m < 60) return `${m}m ago`;
                        const h = Math.floor(m / 60);
                        if (h < 24) return `${h}h ago`;
                        const days = Math.floor(h / 24);
                        if (days < 30) return `${days}d ago`;
                        return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                    } catch {
                        return dateString;
                    }
                };
                return (
                    <span className="text-slate-600 dark:text-slate-400" title={new Date(notification.created_at).toLocaleString()}>
                        {timeAgo(notification.created_at)}
                    </span>
                );
            }
        },
        {
            key: 'is_read',
            header: 'Status',
            render: (value: any, notification: NotificationItem) => {
                const statusColors: Record<string, string> = {
                    'Read': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Unread': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                };
                const status = notification.is_read ? 'Read' : 'Unread';
                return (
                    <Badge variant="outline" className={`${statusColors[status]} font-medium`}>
                        {status}
                    </Badge>
                );
            },
            sortable: true
        }
    ];

    const actions: Action<NotificationItem>[] = [
        {
            label: 'Mark as Read',
            onClick: async (notification: NotificationItem) => {
                try {
                    await dispatch(markNotificationAsRead(notification.id)).unwrap();
                    toast.success('Notification marked as read');
                } catch (err: any) {
                    toast.error(err || 'Failed to mark notification as read');
                }
            },
            icon: <Check className="h-4 w-4" />,
            hidden: (notification: NotificationItem) => !!notification.is_read,
            variant: 'info' as const
        },
        {
            label: 'Mark as Unread',
            onClick: async (notification: NotificationItem) => {
                try {
                    await dispatch(markNotificationAsUnread(notification.id)).unwrap();
                    toast.success('Notification marked as unread');
                } catch (err: any) {
                    toast.error(err || 'Failed to mark notification as unread');
                }
            },
            icon: <X className="h-4 w-4" />,
            hidden: (notification: NotificationItem) => !notification.is_read,
            variant: 'warning' as const
        },
        {
            label: 'Delete Notification',
            onClick: async (notification: NotificationItem) => {
                if (confirm('Are you sure you want to delete this notification?')) {
                    try {
                        await dispatch(deleteNotification(notification.id)).unwrap();
                        toast.success('Notification deleted successfully');
                    } catch (err: any) {
                        toast.error(err || 'Failed to delete notification');
                    }
                }
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (type !== 'All') arr.push(`Type: ${type}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        return arr;
    }, [search, type, status]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchNotifications()).unwrap();
            toast.success('Notifications refreshed successfully');
        } catch (err: any) {
            toast.error(err || 'Failed to refresh notifications');
        } finally {
            setIsRefreshing(false);
        }
    };

    const markAllRead = async () => {
        try {
            await dispatch(markAllNotificationsAsRead()).unwrap();
            toast.success('All notifications marked as read');
        } catch (err: any) {
            toast.error(err || 'Failed to mark all notifications as read');
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/notifications/fetch');

            const headers = ['Title', 'Message', 'Type', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = filteredNotifications.map((n: NotificationItem) => {
                return [
                    escapeCsv(n.title || 'Notification'),
                    escapeCsv(n.message),
                    escapeCsv(n.notification_type || 'info'),
                    n.is_read ? 'Read' : 'Unread',
                    n.created_at ? new Date(n.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notifications_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Notifications</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Browse and manage all system notifications</p>
                </div>
                <Button 
                    onClick={markAllRead}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Bell className="h-4 w-4 mr-2" /> Mark All as Read
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Notifications"
                    description="All notifications in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalItems,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Unread Notifications"
                    description="Currently unread notifications"
                    variant="default"
                    size="sm"
                    stats={{
                        total: unreadCount,
                        badge: 'Unread',
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Read Notifications"
                    description="Read notifications"
                    variant="default"
                    size="sm"
                    stats={{
                        total: readCount,
                        badge: 'Read',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Filtered Results"
                    description="Current filter results"
                    variant="default"
                    size="sm"
                    stats={{
                        total: filteredNotifications.length,
                        badge: 'Filtered',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by title, message, or type..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                }}
                filters={[
                    {
                        key: 'type',
                        label: 'Type',
                        value: type,
                        options: [
                            { key: 'All', value: 'All', label: 'All Types' },
                            { key: 'info', value: 'info', label: 'Information' },
                            { key: 'warning', value: 'warning', label: 'Warning' },
                            { key: 'error', value: 'error', label: 'Error' },
                            { key: 'success', value: 'success', label: 'Success' },
                            { key: 'urgent', value: 'urgent', label: 'Urgent' },
                        ],
                        onValueChange: (v) => { setType(v as any); }
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        value: status,
                        options: [
                            { key: 'All', value: 'All', label: 'All Statuses' },
                            { key: 'Read', value: 'Read', label: 'Read' },
                            { key: 'Unread', value: 'Unread', label: 'Unread' },
                        ],
                        onValueChange: (v) => { setStatus(v as any); }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setType('All');
                    setStatus('All');
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Notifications Table */}
            <EnhancedCard
                title="Notifications List"
                description={`${filteredNotifications.length} notifications matching your filters`}
                variant="default"
                size="sm"
            >
                <EnhancedDataTable
                    data={filteredNotifications}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    noDataMessage="No notifications found matching your search criteria"
                    searchPlaceholder="Search notifications..."
                />
            </EnhancedCard>
        </div>
    );
}

function escapeCsv(val: any) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}
