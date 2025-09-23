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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users, Plus, Search, Eye, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EmployeeRequest {
    id: string;
    requestNumber: string;
    type: 'vacation' | 'sick_leave' | 'overtime' | 'training' | 'transfer' | 'resignation';
    title: string;
    description: string;
    employee: string;
    department: string;
    startDate: string;
    endDate?: string;
    days?: number;
    status: 'pending' | 'approved' | 'rejected' | 'processing';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    approvedAt?: string;
    approver?: string;
    comments?: string;
}

const mockRequests: EmployeeRequest[] = [
    {
        id: '1',
        requestNumber: 'EMP-001',
        type: 'vacation',
        title: 'Annual Leave Request',
        description: 'Request for annual leave for 15 days',
        employee: 'Ahmed Mohamed',
        department: 'Sales',
        startDate: '2024-02-01',
        endDate: '2024-02-15',
        days: 15,
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        requestNumber: 'EMP-002',
        type: 'sick_leave',
        title: 'Sick Leave Request',
        description: 'Request for sick leave for 3 days',
        employee: 'Sara Ahmed',
        department: 'Accounting',
        startDate: '2024-01-20',
        endDate: '2024-01-22',
        days: 3,
        status: 'approved',
        priority: 'high',
        createdAt: '2024-01-19',
        approvedAt: '2024-01-20',
        approver: 'Mohamed Ali',
        comments: 'Request approved'
    },
    {
        id: '3',
        requestNumber: 'EMP-003',
        type: 'training',
        title: 'Training Course Request',
        description: 'Request to participate in project management training course',
        employee: 'Khalid Hassan',
        department: 'Development',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        days: 5,
        status: 'rejected',
        priority: 'low',
        createdAt: '2024-01-18',
        approvedAt: '2024-01-19',
        approver: 'Fatima Mohamed',
        comments: 'Budget not available at the moment'
    }
];

const requestTypes = {
    vacation: 'Annual Leave',
    sick_leave: 'Sick Leave',
    overtime: 'Overtime',
    training: 'Training Course',
    transfer: 'Transfer',
    resignation: 'Resignation'
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    processing: 'Processing'
};

const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800'
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800'
};

const departments = ['Sales', 'Accounting', 'Development', 'Human Resources', 'Marketing', 'Production'];

export default function EmployeeRequestsPage() {
    const [requests, setRequests] = useState<EmployeeRequest[]>(mockRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<EmployeeRequest | null>(null);
    const [formData, setFormData] = useState({
        type: 'vacation' as EmployeeRequest['type'],
        title: '',
        description: '',
        department: '',
        startDate: '',
        endDate: '',
        days: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesType = typeFilter === 'all' || request.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    const handleCreate = () => {
        if (!formData.title || !formData.startDate || !formData.department) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newRequest: EmployeeRequest = {
            id: Date.now().toString(),
            requestNumber: `EMP-${String(requests.length + 1).padStart(3, '0')}`,
            type: formData.type,
            title: formData.title,
            description: formData.description,
            employee: 'Current User',
            department: formData.department,
            startDate: formData.startDate,
            endDate: formData.endDate || undefined,
            days: formData.days ? parseInt(formData.days) : undefined,
            status: 'pending',
            priority: formData.priority,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setRequests([...requests, newRequest]);
        setIsCreateDialogOpen(false);
        setFormData({
            type: 'vacation',
            title: '',
            description: '',
            department: '',
            startDate: '',
            endDate: '',
            days: '',
            priority: 'medium'
        });
        toast.success('Employee request created successfully');
    };

    const handleEdit = (request: EmployeeRequest) => {
        setEditingRequest(request);
        setFormData({
            type: request.type,
            title: request.title,
            description: request.description,
            department: request.department,
            startDate: request.startDate,
            endDate: request.endDate || '',
            days: request.days?.toString() || '',
            priority: request.priority
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        const updatedRequests = requests.map(r =>
            r.id === editingRequest.id ? { 
                ...r, 
                type: formData.type,
                title: formData.title,
                description: formData.description,
                department: formData.department,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                days: formData.days ? parseInt(formData.days) : undefined,
                priority: formData.priority
            } : r
        );

        setRequests(updatedRequests);
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({
            type: 'vacation',
            title: '',
            description: '',
            department: '',
            startDate: '',
            endDate: '',
            days: '',
            priority: 'medium'
        });
        toast.success('Employee request updated successfully');
    };

    const handleDelete = (id: string) => {
        setRequests(requests.filter(r => r.id !== id));
        toast.success('Employee request deleted successfully');
    };

    const calculateDays = (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Employee Requests</h1>
                    <p className="text-muted-foreground">Manage employee requests and leaves</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Employee Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Employee Request</DialogTitle>
                            <DialogDescription>
                                Create a new employee request with details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="type">Request Type</Label>
                                <Select value={formData.type} onValueChange={(value: EmployeeRequest['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(requestTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="title">Request Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Annual Leave Request"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Detailed description of the request"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(department => (
                                            <SelectItem key={department} value={department}>{department}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="days">Number of Days</Label>
                                    <Input
                                        id="days"
                                        type="number"
                                        value={formData.days}
                                        onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <Users className="h-4 w-4 mr-2" />
                                    Create Request
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search employee requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Request Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Request Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(requestTypes).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Employee Requests List
                    </CardTitle>
                    <CardDescription>
                        {filteredRequests.length} requests out of {requests.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request Number</TableHead>
                                    <TableHead>Request Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.requestNumber}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {requestTypes[request.type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{request.title}</TableCell>
                                        <TableCell>{request.employee}</TableCell>
                                        <TableCell>{request.department}</TableCell>
                                        <TableCell>
                                            {request.days ? `${request.days} days` : 'Not specified'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[request.status]} w-fit`}>
                                                {statusLabels[request.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${priorityColors[request.priority]} w-fit`}>
                                                {priorityLabels[request.priority]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{request.createdAt}</TableCell>
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
                                                    onClick={() => handleEdit(request)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(request.id)}
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
                        <DialogTitle>Edit Employee Request</DialogTitle>
                        <DialogDescription>
                            Update employee request data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-type">Request Type</Label>
                            <Select value={formData.type} onValueChange={(value: EmployeeRequest['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(requestTypes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-title">Request Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-department">Department</Label>
                            <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(department => (
                                        <SelectItem key={department} value={department}>{department}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-startDate">Start Date</Label>
                                <Input
                                    id="edit-startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-endDate">End Date</Label>
                                <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-days">Number of Days</Label>
                                <Input
                                    id="edit-days"
                                    type="number"
                                    value={formData.days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, days: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
                                <Users className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}