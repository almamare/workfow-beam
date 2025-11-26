'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, AlertTriangle, Info, CheckCircle2, XCircle as XCircleIcon, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import {
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markNotificationAsRead,
    markNotificationAsUnread,
    toggleNotificationActive,
    selectNotifications,
    selectNotificationsLoading,
    selectNotificationsTotal,
    selectNotificationsPages,
    selectNotificationsError,
    type FetchNotificationsParams
} from '@/stores/slices/notifications';
import { fetchUsers, selectUsers, selectLoading as selectUsersLoading } from '@/stores/slices/users';
import type { Notification, CreateNotificationPayload } from '@/stores/types/notifications';

const notificationTypes = [
    { value: 'info', label: 'Information', icon: <Info className="h-4 w-4" /> },
    { value: 'warning', label: 'Warning', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'error', label: 'Error', icon: <XCircleIcon className="h-4 w-4" /> },
    { value: 'success', label: 'Success', icon: <CheckCircle2 className="h-4 w-4" /> },
    { value: 'urgent', label: 'Urgent', icon: <AlertTriangle className="h-4 w-4" /> }
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
];

const categories = [
    { value: 'system', label: 'System' },
    { value: 'project', label: 'Project' },
    { value: 'financial', label: 'Financial' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'employee', label: 'Employee' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'other', label: 'Other' }
];

const roles = ['admin', 'project_manager', 'finance_manager', 'hr_manager', 'inventory_manager', 'supervisor', 'accountant', 'purchaser', 'user'];

export default function NotificationsPage() {
    const dispatch = useReduxDispatch<AppDispatch>();
    const notifications = useSelector(selectNotifications);
    const loading = useSelector(selectNotificationsLoading);
    const total = useSelector(selectNotificationsTotal);
    const pages = useSelector(selectNotificationsPages);
    const error = useSelector(selectNotificationsError);
    const users = useSelector(selectUsers);
    const usersLoading = useSelector(selectUsersLoading);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as Notification['type'],
        priority: 'medium' as Notification['priority'],
        category: 'other' as Notification['category'],
        targetUsers: [] as string[],
        targetRoles: [] as string[],
        scheduledDate: '',
        expiryDate: '',
        attachments: [] as string[],
        actions: [] as string[]
    });

    // Fetch notifications and users on mount
    useEffect(() => {
        dispatch(fetchUsers({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        const params: FetchNotificationsParams = {
            page,
            limit,
            search: searchTerm || undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        };
        dispatch(fetchNotifications(params));
    }, [dispatch, page, limit, searchTerm, typeFilter, priorityFilter, categoryFilter, statusFilter]);

    // Show error toast if there's an error
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Get users list for dropdown
    const usersList = useMemo(() => {
        return users.map(user => ({
            id: user.id,
            name: `${user.name} ${user.surname || ''}`.trim()
        }));
    }, [users]);

    // Filtering is now handled by the API, but we can still filter client-side if needed
    const filteredNotifications = useMemo(() => {
        return notifications;
    }, [notifications]);

    const handleCreate = async () => {
        if (!formData.title || !formData.message || !formData.scheduledDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const payload: CreateNotificationPayload = {
                title: formData.title,
                message: formData.message,
                type: formData.type || 'info',
                priority: formData.priority || 'medium',
                category: formData.category || 'other',
                targetUsers: formData.targetUsers.length > 0 ? formData.targetUsers : undefined,
                targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : undefined,
                scheduledDate: formData.scheduledDate,
                expiryDate: formData.expiryDate || undefined,
                attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
                actions: formData.actions.length > 0 ? formData.actions : undefined,
            };

            await dispatch(createNotification(payload)).unwrap();
            setIsCreateDialogOpen(false);
            setFormData({
                title: '',
                message: '',
                type: 'info',
                priority: 'medium',
                category: 'other',
                targetUsers: [],
                targetRoles: [],
                scheduledDate: '',
                expiryDate: '',
                attachments: [],
                actions: []
            });
            toast.success('Notification created successfully');
            // Refresh notifications with current filters
            const params: FetchNotificationsParams = {
                page,
                limit,
                search: searchTerm || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            dispatch(fetchNotifications(params));
        } catch (err: any) {
            toast.error(err || 'Failed to create notification');
        }
    };

    const handleEdit = (notification: Notification) => {
        setEditingNotification(notification);
        setFormData({
            title: notification.title || '',
            message: notification.message,
            type: (notification.type || notification.notification_type || 'info') as Notification['type'],
            priority: (notification.priority || 'medium') as Notification['priority'],
            category: (notification.category || 'other') as Notification['category'],
            targetUsers: notification.target_users || notification.targetUsers || [],
            targetRoles: notification.target_roles || notification.targetRoles || [],
            scheduledDate: notification.scheduled_date || notification.scheduledDate || '',
            expiryDate: notification.expiry_date || notification.expiryDate || '',
            attachments: notification.attachments || [],
            actions: notification.actions || []
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingNotification) return;

        try {
            const payload = {
                id: editingNotification.id,
                title: formData.title,
                message: formData.message,
                type: formData.type,
                priority: formData.priority,
                category: formData.category,
                targetUsers: formData.targetUsers.length > 0 ? formData.targetUsers : undefined,
                targetRoles: formData.targetRoles.length > 0 ? formData.targetRoles : undefined,
                scheduledDate: formData.scheduledDate,
                expiryDate: formData.expiryDate || undefined,
                attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
                actions: formData.actions.length > 0 ? formData.actions : undefined,
            };

            await dispatch(updateNotification(payload)).unwrap();
            setIsEditDialogOpen(false);
            setEditingNotification(null);
            setFormData({
                title: '',
                message: '',
                type: 'info',
                priority: 'medium',
                category: 'other',
                targetUsers: [],
                targetRoles: [],
                scheduledDate: '',
                expiryDate: '',
                attachments: [],
                actions: []
            });
            toast.success('Notification updated successfully');
            // Refresh notifications with current filters
            const params: FetchNotificationsParams = {
                page,
                limit,
                search: searchTerm || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            dispatch(fetchNotifications(params));
        } catch (err: any) {
            toast.error(err || 'Failed to update notification');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await dispatch(deleteNotification(id)).unwrap();
            toast.success('Notification deleted successfully');
            // Refresh notifications with current filters
            const params: FetchNotificationsParams = {
                page,
                limit,
                search: searchTerm || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            dispatch(fetchNotifications(params));
        } catch (err: any) {
            toast.error(err || 'Failed to delete notification');
        }
    };

    const handleToggleRead = async (notification: Notification) => {
        try {
            if (notification.isRead) {
                await dispatch(markNotificationAsUnread(notification.id)).unwrap();
            } else {
                await dispatch(markNotificationAsRead(notification.id)).unwrap();
            }
            toast.success('Notification status updated');
            // Refresh notifications with current filters
            const params: FetchNotificationsParams = {
                page,
                limit,
                search: searchTerm || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            dispatch(fetchNotifications(params));
        } catch (err: any) {
            toast.error(err || 'Failed to update notification status');
        }
    };

    const handleToggleActive = async (notification: Notification) => {
        try {
            const currentActive = notification.is_active !== false;
            await dispatch(toggleNotificationActive({
                id: notification.id,
                isActive: !currentActive
            })).unwrap();
            toast.success('Notification status updated');
            // Refresh notifications with current filters
            const params: FetchNotificationsParams = {
                page,
                limit,
                search: searchTerm || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            dispatch(fetchNotifications(params));
        } catch (err: any) {
            toast.error(err || 'Failed to update notification status');
        }
    };

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            const params: FetchNotificationsParams = {
                page,
                limit,
                search: searchTerm || undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            };
            await dispatch(fetchNotifications(params)).unwrap();
            toast.success('Notifications refreshed');
        } catch (err: any) {
            toast.error(err || 'Failed to refresh notifications');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            // TODO: Implement Excel export API call
            // const response = await axios.get('/notifications/export', {
            //     params: {
            //         search: searchTerm || undefined,
            //         type: typeFilter !== 'all' ? typeFilter : undefined,
            //         priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            //         category: categoryFilter !== 'all' ? categoryFilter : undefined,
            //         status: statusFilter !== 'all' ? statusFilter : undefined,
            //     },
            //     responseType: 'blob'
            // });
            // const url = window.URL.createObjectURL(new Blob([response.data]));
            // const link = document.createElement('a');
            // link.href = url;
            // link.setAttribute('download', `notifications-${new Date().toISOString()}.xlsx`);
            // document.body.appendChild(link);
            // link.click();
            // link.remove();
            toast.info('Export feature coming soon');
        } catch (err: any) {
            toast.error('Failed to export notifications');
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

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

    const totalNotifications = total;
    const unreadNotifications = filteredNotifications.filter(n => !n.isRead).length;
    const activeNotifications = filteredNotifications.filter(n => n.is_active !== false).length;
    const urgentNotifications = filteredNotifications.filter(n => {
        const priority = n.priority || 'medium';
        return priority === 'critical' || priority === 'high';
    }).length;

    const columns = [
        {
            key: 'title' as keyof Notification,
            header: 'Title',
            render: (value: any, notification: Notification) => (
                <div className="flex items-center space-x-2">
                    <div>
                        <div className={`font-semibold ${notification.isRead ? 'text-slate-600' : 'text-slate-800'}`}>
                            {notification.title}
                        </div>
                        <div className="text-sm text-slate-600 truncate max-w-xs">
                            {notification.message}
                        </div>
                    </div>
                    {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            key: 'type' as keyof Notification,
            header: 'Type',
            render: (value: any, notification: Notification) => {
                const notificationType = notification.type || notification.notification_type || 'info';
                const typeConfig = notificationTypes.find(t => t.value === notificationType);
                const typeColors = {
                    'info': 'bg-blue-50 text-blue-700 border-blue-200',
                    'warning': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    'error': 'bg-red-50 text-red-700 border-red-200',
                    'success': 'bg-green-50 text-green-700 border-green-200',
                    'urgent': 'bg-red-50 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${typeColors[notificationType as keyof typeof typeColors] || typeColors.info} font-medium`}>
                        {typeConfig?.icon}
                        <span className="ml-1">{typeConfig?.label || notificationType}</span>
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'priority' as keyof Notification,
            header: 'Priority',
            render: (value: any, notification: Notification) => {
                const priority = notification.priority || 'medium';
                const priorityColors = {
                    'low': 'bg-gray-50 text-gray-700 border-gray-200',
                    'medium': 'bg-blue-50 text-blue-700 border-blue-200',
                    'high': 'bg-orange-50 text-orange-700 border-orange-200',
                    'critical': 'bg-red-50 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium} font-medium`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'category' as keyof Notification,
            header: 'Category',
            render: (value: any, notification: Notification) => {
                const category = notification.category || 'other';
                return (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'targetUsers' as keyof Notification,
            header: 'Target Users',
            render: (value: any, notification: Notification) => {
                const targetUsers = notification.target_users || notification.targetUsers || [];
                return (
                    <div className="text-sm text-slate-700">
                        {targetUsers.length > 0 ? `${targetUsers.length} user(s)` : 'All users'}
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'createdAt' as keyof Notification,
            header: 'Created',
            render: (value: any, notification: Notification) => (
                <span className="text-slate-700" title={formatDate(value)}>
                    {timeAgo(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'isRead' as keyof Notification,
            header: 'Status',
            render: (value: any, notification: Notification) => (
                <div className="flex space-x-2">
                    <Badge variant="outline" className={`${notification.isRead ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'} font-medium`}>
                        {notification.isRead ? 'Read' : 'Unread'}
                    </Badge>
                    {notification.is_active !== undefined && (
                        <Badge variant="outline" className={`${notification.is_active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'} font-medium`}>
                            {notification.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    )}
                </div>
            ),
            sortable: true
        }
    ];

    const actions: Action<Notification>[] = [
        {
            label: 'View Details',
            onClick: (notification: Notification) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Notification',
            onClick: (notification: Notification) => handleEdit(notification),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Mark as Read',
            onClick: (notification: Notification) => handleToggleRead(notification),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => notification.isRead
        },
        {
            label: 'Mark as Unread',
            onClick: (notification: Notification) => handleToggleRead(notification),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => !notification.isRead
        },
        {
            label: 'Activate',
            onClick: (notification: Notification) => handleToggleActive(notification),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => notification.is_active !== false
        },
        {
            label: 'Deactivate',
            onClick: (notification: Notification) => handleToggleActive(notification),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => notification.is_active === false
        },
        {
            label: 'Delete Notification',
            onClick: (notification: Notification) => handleDelete(notification.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Notifications',
            value: totalNotifications,
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Unread',
            value: unreadNotifications,
            change: '-5%',
            trend: 'down' as const
        },
        {
            label: 'Active',
            value: activeNotifications,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Urgent',
            value: urgentNotifications,
            change: '+3%',
            trend: 'up' as const
        }
    ];

    const filterOptions = [
        {
            key: 'type',
            label: 'Type',
            value: typeFilter,
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                ...notificationTypes.map(type => ({ key: type.value, label: type.label, value: type.value }))
            ],
            onValueChange: setTypeFilter
        },
        {
            key: 'priority',
            label: 'Priority',
            value: priorityFilter,
            options: [
                { key: 'all', label: 'All Priorities', value: 'all' },
                ...priorities.map(priority => ({ key: priority.value, label: priority.label, value: priority.value }))
            ],
            onValueChange: setPriorityFilter
        },
        {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            options: [
                { key: 'all', label: 'All Categories', value: 'all' },
                ...categories.map(category => ({ key: category.value, label: category.label, value: category.value }))
            ],
            onValueChange: setCategoryFilter
        },
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'read', label: 'Read', value: 'read' },
                { key: 'unread', label: 'Unread', value: 'unread' },
                { key: 'active', label: 'Active', value: 'active' },
                { key: 'inactive', label: 'Inactive', value: 'inactive' }
            ],
            onValueChange: setStatusFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (typeFilter !== 'all') activeFilters.push(`Type: ${notificationTypes.find(t => t.value === typeFilter)?.label}`);
    if (priorityFilter !== 'all') activeFilters.push(`Priority: ${priorities.find(p => p.value === priorityFilter)?.label}`);
    if (categoryFilter !== 'all') activeFilters.push(`Category: ${categories.find(c => c.value === categoryFilter)?.label}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Page Header */}
            <PageHeader
                title="Notifications Management"
                description="Manage system notifications with comprehensive targeting and scheduling"
                stats={stats}
                breadcrumb={false}
                actions={{
                    primary: {
                        label: 'New Notification',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Refresh',
                            onClick: refreshTable,
                            icon: <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        },
                        {
                            label: 'Export Report',
                            onClick: exportToExcel,
                            icon: <FileSpreadsheet className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by title, message, or category..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setPriorityFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                }}
            />

            {/* Notifications Table */}
            <EnhancedCard
                title="Notifications Overview"
                description={`${filteredNotifications.length} notifications out of ${total} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: total,
                    badge: 'Total Notifications',
                    badgeColor: 'success'
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Items per page:</span>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 50, 100].map(n => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <EnhancedDataTable
                    data={filteredNotifications}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    noDataMessage="No notifications found matching your criteria"
                    searchPlaceholder="Search notifications..."
                    pagination={{
                        currentPage: page,
                        totalPages: pages,
                        pageSize: limit,
                        totalItems: total,
                        onPageChange: setPage
                    }}
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Notification</DialogTitle>
                        <DialogDescription>
                            Create a new notification with targeting and scheduling
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Notification title"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Notification message"
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Notification['type'] }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {notificationTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Notification['priority'] }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(priority => (
                                            <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Notification['category'] }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="targetUsers">Target Users</Label>
                            <Select 
                                value="" 
                                onValueChange={(value) => {
                                    if (value && !formData.targetUsers.includes(value)) {
                                        setFormData(prev => ({ ...prev, targetUsers: [...prev.targetUsers, value] }));
                                    }
                                }}
                                disabled={usersLoading}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={usersLoading ? "Loading users..." : "Select users"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {usersList.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.targetUsers.map(userId => {
                                    const user = usersList.find(u => u.id === userId);
                                    return user ? (
                                        <Badge key={userId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {user.name}
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, targetUsers: prev.targetUsers.filter(u => u !== userId) }))}
                                                className="ml-1 text-blue-500 hover:text-blue-700"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="targetRoles">Target Roles</Label>
                            <Select value="" onValueChange={(value) => {
                                if (value && !formData.targetRoles.includes(value)) {
                                    setFormData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, value] }));
                                }
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.targetRoles.map(role => (
                                    <Badge key={role} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        {role}
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(r => r !== role) }))}
                                            className="ml-1 text-green-500 hover:text-green-700"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                                <Input
                                    id="scheduledDate"
                                    type="datetime-local"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                    id="expiryDate"
                                    type="datetime-local"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <Bell className="h-4 w-4 mr-2" />
                                Create Notification
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Notification</DialogTitle>
                        <DialogDescription>
                            Update notification information and targeting
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-message">Message</Label>
                            <Textarea
                                id="edit-message"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Notification['type'] }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {notificationTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Notification['priority'] }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(priority => (
                                            <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-category">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Notification['category'] }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-targetUsers">Target Users</Label>
                            <Select 
                                value="" 
                                onValueChange={(value) => {
                                    if (value && !formData.targetUsers.includes(value)) {
                                        setFormData(prev => ({ ...prev, targetUsers: [...prev.targetUsers, value] }));
                                    }
                                }}
                                disabled={usersLoading}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder={usersLoading ? "Loading users..." : "Select users"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {usersList.map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.targetUsers.map(userId => {
                                    const user = usersList.find(u => u.id === userId);
                                    return user ? (
                                        <Badge key={userId} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {user.name}
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, targetUsers: prev.targetUsers.filter(u => u !== userId) }))}
                                                className="ml-1 text-blue-500 hover:text-blue-700"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-targetRoles">Target Roles</Label>
                            <Select value="" onValueChange={(value) => {
                                if (value && !formData.targetRoles.includes(value)) {
                                    setFormData(prev => ({ ...prev, targetRoles: [...prev.targetRoles, value] }));
                                }
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(role => (
                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.targetRoles.map(role => (
                                    <Badge key={role} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        {role}
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, targetRoles: prev.targetRoles.filter(r => r !== role) }))}
                                            className="ml-1 text-green-500 hover:text-green-700"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-scheduledDate">Scheduled Date</Label>
                                <Input
                                    id="edit-scheduledDate"
                                    type="datetime-local"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                                <Input
                                    id="edit-expiryDate"
                                    type="datetime-local"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <Bell className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}