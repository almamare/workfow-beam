'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Bell, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, AlertTriangle, Info, CheckCircle2, XCircle as XCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'system' | 'project' | 'financial' | 'inventory' | 'employee' | 'contractor' | 'other';
    targetUsers: string[];
    targetRoles: string[];
    isRead: boolean;
    isActive: boolean;
    scheduledDate: string;
    expiryDate: string;
    createdBy: string;
    createdAt: string;
    readBy: string[];
    readAt: string[];
    attachments: string[];
    actions: string[];
    metadata: Record<string, any>;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Project Deadline Approaching',
        message: 'The Office Building Construction project deadline is approaching in 3 days. Please ensure all tasks are completed on time.',
        type: 'warning',
        priority: 'high',
        category: 'project',
        targetUsers: ['Ahmed Ali', 'Fatima Mohamed', 'Omar Hassan'],
        targetRoles: ['project_manager', 'supervisor'],
        isRead: false,
        isActive: true,
        scheduledDate: '2024-01-15',
        expiryDate: '2024-01-25',
        createdBy: 'System',
        createdAt: '2024-01-15T10:00:00Z',
        readBy: [],
        readAt: [],
        attachments: [],
        actions: ['view_project', 'update_status'],
        metadata: { projectId: 'PRJ-001', deadline: '2024-01-18' }
    },
    {
        id: '2',
        title: 'Low Stock Alert',
        message: 'A4 Paper stock is running low. Current stock: 5 reams, minimum required: 20 reams. Please reorder soon.',
        type: 'warning',
        priority: 'medium',
        category: 'inventory',
        targetUsers: ['Sara Ahmed', 'Mohammed Saleh'],
        targetRoles: ['inventory_manager', 'purchaser'],
        isRead: true,
        isActive: true,
        scheduledDate: '2024-01-16',
        expiryDate: '2024-01-26',
        createdBy: 'Inventory System',
        createdAt: '2024-01-16T08:30:00Z',
        readBy: ['Sara Ahmed'],
        readAt: ['2024-01-16T09:15:00Z'],
        attachments: [],
        actions: ['view_item', 'create_order'],
        metadata: { itemId: 'ITM-002', currentStock: 5, minimumStock: 20 }
    },
    {
        id: '3',
        title: 'Payment Approved',
        message: 'Payment request PAY-002 for ABC Construction Ltd. has been approved and is ready for processing.',
        type: 'success',
        priority: 'medium',
        category: 'financial',
        targetUsers: ['Fatima Mohamed', 'Ahmed Ali'],
        targetRoles: ['finance_manager', 'accountant'],
        isRead: false,
        isActive: true,
        scheduledDate: '2024-01-17',
        expiryDate: '2024-01-27',
        createdBy: 'Omar Hassan',
        createdAt: '2024-01-17T14:20:00Z',
        readBy: [],
        readAt: [],
        attachments: ['payment_approval.pdf'],
        actions: ['view_payment', 'process_payment'],
        metadata: { paymentId: 'PAY-002', amount: 25000 }
    },
    {
        id: '4',
        title: 'System Maintenance Scheduled',
        message: 'System maintenance is scheduled for tomorrow (January 18, 2024) from 2:00 AM to 4:00 AM. The system will be temporarily unavailable.',
        type: 'info',
        priority: 'high',
        category: 'system',
        targetUsers: [],
        targetRoles: ['admin', 'user'],
        isRead: true,
        isActive: true,
        scheduledDate: '2024-01-17',
        expiryDate: '2024-01-19',
        createdBy: 'System Administrator',
        createdAt: '2024-01-17T16:00:00Z',
        readBy: ['Ahmed Ali', 'Fatima Mohamed', 'Omar Hassan', 'Sara Ahmed'],
        readAt: ['2024-01-17T16:05:00Z', '2024-01-17T16:10:00Z', '2024-01-17T16:15:00Z', '2024-01-17T16:20:00Z'],
        attachments: [],
        actions: [],
        metadata: { maintenanceStart: '2024-01-18T02:00:00Z', maintenanceEnd: '2024-01-18T04:00:00Z' }
    },
    {
        id: '5',
        title: 'Employee Leave Request',
        message: 'Sara Ahmed has submitted a leave request for January 20-22, 2024. Please review and approve.',
        type: 'info',
        priority: 'medium',
        category: 'employee',
        targetUsers: ['Ahmed Ali'],
        targetRoles: ['hr_manager', 'supervisor'],
        isRead: false,
        isActive: true,
        scheduledDate: '2024-01-17',
        expiryDate: '2024-01-19',
        createdBy: 'Sara Ahmed',
        createdAt: '2024-01-17T11:30:00Z',
        readBy: [],
        readAt: [],
        attachments: ['leave_request.pdf'],
        actions: ['view_request', 'approve_leave', 'reject_leave'],
        metadata: { employeeId: 'EMP-002', leaveStart: '2024-01-20', leaveEnd: '2024-01-22' }
    }
];

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

const users = ['Ahmed Ali', 'Fatima Mohamed', 'Omar Hassan', 'Sara Ahmed', 'Mohammed Saleh'];
const roles = ['admin', 'project_manager', 'finance_manager', 'hr_manager', 'inventory_manager', 'supervisor', 'accountant', 'purchaser', 'user'];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        category: 'other',
        targetUsers: [] as string[],
        targetRoles: [] as string[],
        scheduledDate: '',
        expiryDate: '',
        attachments: [] as string[],
        actions: [] as string[]
    });

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notification.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || notification.type === typeFilter;
        const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
        const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'read' && notification.isRead) ||
                             (statusFilter === 'unread' && !notification.isRead) ||
                             (statusFilter === 'active' && notification.isActive) ||
                             (statusFilter === 'inactive' && !notification.isActive);
        
        return matchesSearch && matchesType && matchesPriority && matchesCategory && matchesStatus;
    });

    const handleCreate = () => {
        if (!formData.title || !formData.message || !formData.scheduledDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newNotification: Notification = {
            id: Date.now().toString(),
            title: formData.title,
            message: formData.message,
            type: formData.type as Notification['type'],
            priority: formData.priority as Notification['priority'],
            category: formData.category as Notification['category'],
            targetUsers: formData.targetUsers,
            targetRoles: formData.targetRoles,
            isRead: false,
            isActive: true,
            scheduledDate: formData.scheduledDate,
            expiryDate: formData.expiryDate,
            createdBy: 'Current User',
            createdAt: new Date().toISOString(),
            readBy: [],
            readAt: [],
            attachments: formData.attachments,
            actions: formData.actions,
            metadata: {}
        };

        setNotifications([...notifications, newNotification]);
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
    };

    const handleEdit = (notification: Notification) => {
        setEditingNotification(notification);
        setFormData({
            title: notification.title,
            message: notification.message,
            type: notification.type,
            priority: notification.priority,
            category: notification.category,
            targetUsers: notification.targetUsers,
            targetRoles: notification.targetRoles,
            scheduledDate: notification.scheduledDate,
            expiryDate: notification.expiryDate,
            attachments: notification.attachments,
            actions: notification.actions
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingNotification) return;

        const updatedNotifications = notifications.map(n =>
            n.id === editingNotification.id ? { 
                ...n, 
                title: formData.title,
                message: formData.message,
                type: formData.type as Notification['type'],
                priority: formData.priority as Notification['priority'],
                category: formData.category as Notification['category'],
                targetUsers: formData.targetUsers,
                targetRoles: formData.targetRoles,
                scheduledDate: formData.scheduledDate,
                expiryDate: formData.expiryDate,
                attachments: formData.attachments,
                actions: formData.actions
            } : n
        );

        setNotifications(updatedNotifications);
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
    };

    const handleDelete = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted successfully');
    };

    const handleToggleRead = (id: string) => {
        setNotifications(prev => prev.map(notification => 
            notification.id === id 
                ? { 
                    ...notification, 
                    isRead: !notification.isRead,
                    readBy: !notification.isRead ? [...notification.readBy, 'Current User'] : notification.readBy.filter(user => user !== 'Current User'),
                    readAt: !notification.isRead ? [...notification.readAt, new Date().toISOString()] : notification.readAt.slice(0, -1)
                }
                : notification
        ));
        toast.success('Notification status updated');
    };

    const handleToggleActive = (id: string) => {
        setNotifications(prev => prev.map(notification => 
            notification.id === id 
                ? { ...notification, isActive: !notification.isActive }
                : notification
        ));
        toast.success('Notification status updated');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalNotifications = filteredNotifications.length;
    const unreadNotifications = filteredNotifications.filter(n => !n.isRead).length;
    const activeNotifications = filteredNotifications.filter(n => n.isActive).length;
    const urgentNotifications = filteredNotifications.filter(n => n.priority === 'critical' || n.priority === 'high').length;

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
            render: (value: any) => {
                const typeConfig = notificationTypes.find(t => t.value === value);
                const typeColors = {
                    'info': 'bg-blue-50 text-blue-700 border-blue-200',
                    'warning': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    'error': 'bg-red-50 text-red-700 border-red-200',
                    'success': 'bg-green-50 text-green-700 border-green-200',
                    'urgent': 'bg-red-50 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${typeColors[value as keyof typeof typeColors]} font-medium`}>
                        {typeConfig?.icon}
                        <span className="ml-1">{typeConfig?.label}</span>
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'priority' as keyof Notification,
            header: 'Priority',
            render: (value: any) => {
                const priorityColors = {
                    'low': 'bg-gray-50 text-gray-700 border-gray-200',
                    'medium': 'bg-blue-50 text-blue-700 border-blue-200',
                    'high': 'bg-orange-50 text-orange-700 border-orange-200',
                    'critical': 'bg-red-50 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${priorityColors[value as keyof typeof priorityColors]} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'category' as keyof Notification,
            header: 'Category',
            render: (value: any) => (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'targetUsers' as keyof Notification,
            header: 'Target Users',
            render: (value: any) => (
                <div className="text-sm text-slate-700">
                    {value.length > 0 ? `${value.length} user(s)` : 'All users'}
                </div>
            ),
            sortable: true
        },
        {
            key: 'scheduledDate' as keyof Notification,
            header: 'Scheduled',
            render: (value: any) => <span className="text-slate-700">{formatDate(value)}</span>,
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
                    <Badge variant="outline" className={`${notification.isActive ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'} font-medium`}>
                        {notification.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            ),
            sortable: true
        }
    ];

    const actions = [
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
            onClick: (notification: Notification) => handleToggleRead(notification.id),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => notification.isRead
        },
        {
            label: 'Mark as Unread',
            onClick: (notification: Notification) => handleToggleRead(notification.id),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => !notification.isRead
        },
        {
            label: 'Activate',
            onClick: (notification: Notification) => handleToggleActive(notification.id),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => notification.isActive
        },
        {
            label: 'Deactivate',
            onClick: (notification: Notification) => handleToggleActive(notification.id),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (notification: Notification) => !notification.isActive
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
            {/* Page Header */}
            <PageHeader
                title="Notifications Management"
                description="Manage system notifications with comprehensive targeting and scheduling"
                stats={stats}
                actions={{
                    primary: {
                        label: 'New Notification',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Export Report',
                            onClick: () => toast.info('Export feature coming soon'),
                            icon: <Download className="h-4 w-4" />
                        },
                        {
                            label: 'Notification Analytics',
                            onClick: () => toast.info('Analytics feature coming soon'),
                            icon: <Filter className="h-4 w-4" />
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
                description={`${filteredNotifications.length} notifications out of ${notifications.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: notifications.length,
                    badge: 'Active Notifications',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredNotifications}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No notifications found matching your criteria"
                    searchPlaceholder="Search notifications..."
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
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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
                                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
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
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                            <Select value="" onValueChange={(value) => {
                                if (value && !formData.targetUsers.includes(value)) {
                                    setFormData(prev => ({ ...prev, targetUsers: [...prev.targetUsers, value] }));
                                }
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select users" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user} value={user}>{user}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.targetUsers.map(user => (
                                    <Badge key={user} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {user}
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, targetUsers: prev.targetUsers.filter(u => u !== user) }))}
                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
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
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
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
                                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
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
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                            <Select value="" onValueChange={(value) => {
                                if (value && !formData.targetUsers.includes(value)) {
                                    setFormData(prev => ({ ...prev, targetUsers: [...prev.targetUsers, value] }));
                                }
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select users" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user} value={user}>{user}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.targetUsers.map(user => (
                                    <Badge key={user} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {user}
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, targetUsers: prev.targetUsers.filter(u => u !== user) }))}
                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
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