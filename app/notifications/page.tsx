'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Plus, Search, Eye, Edit, Trash2, Send, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
    recipients: string[];
    recipientType: 'all' | 'department' | 'role' | 'specific';
    department?: string;
    role?: string;
    scheduledDate?: string;
    sentDate?: string;
    createdBy: string;
    createdAt: string;
    readBy: string[];
    attachments?: string[];
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'System Maintenance Notice',
        message: 'The system will be under maintenance from 2:00 AM to 4:00 AM tomorrow. Please save your work and log out before this time.',
        type: 'info',
        priority: 'medium',
        status: 'sent',
        recipients: ['all'],
        recipientType: 'all',
        sentDate: '2024-01-15 10:30:00',
        createdBy: 'System Administrator',
        createdAt: '2024-01-15 10:00:00',
        readBy: ['user1', 'user2', 'user3']
    },
    {
        id: '2',
        title: 'Budget Approval Required',
        message: 'The IT department budget for Q1 2024 is pending your approval. Please review and approve within 48 hours.',
        type: 'warning',
        priority: 'high',
        status: 'delivered',
        recipients: ['manager1', 'manager2'],
        recipientType: 'role',
        role: 'Manager',
        sentDate: '2024-01-14 14:20:00',
        createdBy: 'Financial Manager',
        createdAt: '2024-01-14 14:00:00',
        readBy: ['manager1']
    },
    {
        id: '3',
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected from an unknown IP address. Please change your password immediately if you notice any suspicious activity.',
        type: 'error',
        priority: 'urgent',
        status: 'sent',
        recipients: ['all'],
        recipientType: 'all',
        sentDate: '2024-01-16 09:15:00',
        createdBy: 'Security Team',
        createdAt: '2024-01-16 09:00:00',
        readBy: []
    },
    {
        id: '4',
        title: 'Project Completion',
        message: 'Congratulations! The new website project has been completed successfully and is now live.',
        type: 'success',
        priority: 'low',
        status: 'read',
        recipients: ['dev1', 'dev2', 'manager1'],
        recipientType: 'specific',
        sentDate: '2024-01-13 16:45:00',
        createdBy: 'Project Manager',
        createdAt: '2024-01-13 16:30:00',
        readBy: ['dev1', 'dev2', 'manager1']
    }
];

const notificationTypes = {
    info: 'Information',
    warning: 'Warning',
    error: 'Error',
    success: 'Success'
};

const priorities = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
};

const statusLabels = {
    draft: 'Draft',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Failed'
};

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    read: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
};

const typeColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800'
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

const departments = ['IT', 'Finance', 'HR', 'Marketing', 'Operations', 'Administration'];
const roles = ['Manager', 'Employee', 'Admin', 'Supervisor', 'Director'];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        type: 'info' as Notification['type'],
        priority: 'medium' as Notification['priority'],
        recipientType: 'all' as Notification['recipientType'],
        department: '',
        role: '',
        recipients: '',
        scheduledDate: ''
    });

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || notification.type === typeFilter;
        const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
        const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
        
        return matchesSearch && matchesType && matchesPriority && matchesStatus;
    });

    const handleCreate = () => {
        if (!formData.title || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        let recipients: string[] = [];
        if (formData.recipientType === 'specific') {
            recipients = formData.recipients.split(',').map(r => r.trim()).filter(r => r);
        } else {
            recipients = [formData.recipientType];
        }

        const newNotification: Notification = {
            id: Date.now().toString(),
            title: formData.title,
            message: formData.message,
            type: formData.type,
            priority: formData.priority,
            status: 'draft',
            recipients: recipients,
            recipientType: formData.recipientType,
            department: formData.department || undefined,
            role: formData.role || undefined,
            scheduledDate: formData.scheduledDate || undefined,
            createdBy: 'Current User',
            createdAt: new Date().toISOString(),
            readBy: []
        };

        setNotifications([...notifications, newNotification]);
        setIsCreateDialogOpen(false);
        setFormData({
            title: '',
            message: '',
            type: 'info',
            priority: 'medium',
            recipientType: 'all',
            department: '',
            role: '',
            recipients: '',
            scheduledDate: ''
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
            recipientType: notification.recipientType,
            department: notification.department || '',
            role: notification.role || '',
            recipients: notification.recipientType === 'specific' ? notification.recipients.join(', ') : '',
            scheduledDate: notification.scheduledDate || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingNotification) return;

        let recipients: string[] = [];
        if (formData.recipientType === 'specific') {
            recipients = formData.recipients.split(',').map(r => r.trim()).filter(r => r);
        } else {
            recipients = [formData.recipientType];
        }

        const updatedNotifications = notifications.map(n =>
            n.id === editingNotification.id ? { 
                ...n, 
                title: formData.title,
                message: formData.message,
                type: formData.type,
                priority: formData.priority,
                recipientType: formData.recipientType,
                recipients: recipients,
                department: formData.department || undefined,
                role: formData.role || undefined,
                scheduledDate: formData.scheduledDate || undefined
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
            recipientType: 'all',
            department: '',
            role: '',
            recipients: '',
            scheduledDate: ''
        });
        toast.success('Notification updated successfully');
    };

    const handleDelete = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notification deleted successfully');
    };

    const handleSend = (id: string) => {
        setNotifications(prev => prev.map(notification => 
            notification.id === id 
                ? { 
                    ...notification, 
                    status: 'sent' as const,
                    sentDate: new Date().toISOString()
                }
                : notification
        ));
        toast.success('Notification sent successfully');
    };

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(notification => 
            notification.id === id 
                ? { 
                    ...notification, 
                    status: 'read' as const,
                    readBy: [...notification.readBy, 'current-user']
                }
                : notification
        ));
        toast.success('Notification marked as read');
    };

    const getTypeIcon = (type: Notification['type']) => {
        switch (type) {
            case 'info':
                return <Info className="h-4 w-4" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4" />;
            case 'error':
                return <AlertCircle className="h-4 w-4" />;
            case 'success':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const totalNotifications = filteredNotifications.length;
    const unreadNotifications = filteredNotifications.filter(n => n.status !== 'read').length;
    const urgentNotifications = filteredNotifications.filter(n => n.priority === 'urgent').length;
    const sentNotifications = filteredNotifications.filter(n => n.status === 'sent' || n.status === 'delivered' || n.status === 'read').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">Manage system notifications and alerts</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Notification
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Notification</DialogTitle>
                            <DialogDescription>
                                Send a notification to users
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
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value: Notification['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(notificationTypes).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value: Notification['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(priorities).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="recipientType">Recipient Type</Label>
                                <Select value={formData.recipientType} onValueChange={(value: Notification['recipientType']) => setFormData(prev => ({ ...prev, recipientType: value, department: '', role: '', recipients: '' }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="department">Department</SelectItem>
                                        <SelectItem value="role">Role</SelectItem>
                                        <SelectItem value="specific">Specific Users</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.recipientType === 'department' && (
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {formData.recipientType === 'role' && (
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {formData.recipientType === 'specific' && (
                                <div>
                                    <Label htmlFor="recipients">Recipients</Label>
                                    <Input
                                        id="recipients"
                                        value={formData.recipients}
                                        onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                                        placeholder="Enter usernames separated by commas"
                                    />
                                </div>
                            )}
                            <div>
                                <Label htmlFor="scheduledDate">Schedule Date (Optional)</Label>
                                <Input
                                    id="scheduledDate"
                                    type="datetime-local"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <Bell className="h-4 w-4 mr-2" />
                                    Create Notification
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalNotifications}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unread</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{unreadNotifications}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Urgent</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{urgentNotifications}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{sentNotifications}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(notificationTypes).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {Object.entries(priorities).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Notifications Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications List
                    </CardTitle>
                    <CardDescription>
                        {filteredNotifications.length} notifications out of {notifications.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Recipients</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Sent</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNotifications.map((notification) => (
                                    <TableRow key={notification.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(notification.type)}
                                                <Badge className={`${typeColors[notification.type]} w-fit`}>
                                                    {notificationTypes[notification.type]}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">{notification.title}</TableCell>
                                        <TableCell className="max-w-xs truncate">{notification.message}</TableCell>
                                        <TableCell>
                                            <Badge className={`${priorityColors[notification.priority]} w-fit`}>
                                                {priorities[notification.priority]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {notification.recipientType === 'all' ? 'All Users' :
                                             notification.recipientType === 'department' ? notification.department :
                                             notification.recipientType === 'role' ? notification.role :
                                             `${notification.recipients.length} users`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[notification.status]} w-fit`}>
                                                {statusLabels[notification.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{notification.createdAt.split('T')[0]}</TableCell>
                                        <TableCell className="text-sm">{notification.sentDate ? notification.sentDate.split('T')[0] : '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(notification)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {notification.status === 'draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSend(notification.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {notification.status === 'sent' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        Mark as Read
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Notification</DialogTitle>
                        <DialogDescription>
                            Update notification data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-message">Message</Label>
                            <Textarea
                                id="edit-message"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value: Notification['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(notificationTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value: Notification['priority']) => setFormData(prev => ({ ...prev, priority: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(priorities).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-recipientType">Recipient Type</Label>
                            <Select value={formData.recipientType} onValueChange={(value: Notification['recipientType']) => setFormData(prev => ({ ...prev, recipientType: value, department: '', role: '', recipients: '' }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="department">Department</SelectItem>
                                    <SelectItem value="role">Role</SelectItem>
                                    <SelectItem value="specific">Specific Users</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formData.recipientType === 'department' && (
                            <div>
                                <Label htmlFor="edit-department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {formData.recipientType === 'role' && (
                            <div>
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => (
                                            <SelectItem key={role} value={role}>{role}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {formData.recipientType === 'specific' && (
                            <div>
                                <Label htmlFor="edit-recipients">Recipients</Label>
                                <Input
                                    id="edit-recipients"
                                    value={formData.recipients}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                                />
                            </div>
                        )}
                        <div>
                            <Label htmlFor="edit-scheduledDate">Schedule Date (Optional)</Label>
                            <Input
                                id="edit-scheduledDate"
                                type="datetime-local"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
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