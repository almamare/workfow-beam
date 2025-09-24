'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchTaskRequests,
    selectTaskRequests,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/tasks_requests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

export default function TaskRequestsPage() {
    const taskRequests = useSelector(selectTaskRequests);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<TaskRequest | null>(null);
    const [formData, setFormData] = useState({
        request_type: '',
        contractor_name: '',
        project_name: '',
        priority: 'medium',
        description: '',
        notes: '',
        due_date: '',
        estimated_hours: '',
        assigned_to: ''
    });

    useEffect(() => {
        dispatch(fetchTaskRequests({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    const requestTypes = [
        { value: 'maintenance', label: 'Maintenance', icon: <ClipboardList className="h-4 w-4" /> },
        { value: 'repair', label: 'Repair', icon: <AlertTriangle className="h-4 w-4" /> },
        { value: 'installation', label: 'Installation', icon: <UserCheck className="h-4 w-4" /> },
        { value: 'inspection', label: 'Inspection', icon: <Eye className="h-4 w-4" /> },
        { value: 'other', label: 'Other', icon: <ClipboardList className="h-4 w-4" /> }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const contractors = ['ABC Construction', 'XYZ Electrical', 'Green Landscaping', 'Modern Plumbing', 'Quality Painters'];
    const projects = ['Office Building Construction', 'Residential Complex', 'Shopping Mall', 'Hospital', 'School'];
    const assignees = ['Ahmed Ali', 'Sara Ahmed', 'Mohammed Saleh', 'Fatima Mohamed', 'Omar Hassan'];

    const filteredRequests = taskRequests.filter(request => {
        const matchesSearch = request.request_code?.toLowerCase().includes(search.toLowerCase()) ||
                            request.contractor_name?.toLowerCase().includes(search.toLowerCase()) ||
                            request.project_name?.toLowerCase().includes(search.toLowerCase()) ||
                            request.notes?.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || request.request_type === typeFilter;
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleCreate = () => {
        if (!formData.request_type || !formData.contractor_name || !formData.project_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        toast.success('Task request created successfully');
        setIsCreateDialogOpen(false);
        setFormData({
            request_type: '',
            contractor_name: '',
            project_name: '',
            priority: 'medium',
            description: '',
            notes: '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
    };

    const handleEdit = (request: TaskRequest) => {
        setEditingRequest(request);
        setFormData({
            request_type: request.request_type || '',
            contractor_name: request.contractor_name || '',
            project_name: request.project_name || '',
            priority: 'medium',
            description: (request as any).description || '',
            notes: request.notes || '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        toast.success('Task request updated successfully');
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({
            request_type: '',
            contractor_name: '',
            project_name: '',
            priority: 'medium',
            description: '',
            notes: '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
    };

    const handleDelete = (id: string) => {
        toast.success('Task request deleted successfully');
    };

    const handleStatusChange = (id: string, status: string) => {
        toast.success(`Request ${status} successfully`);
    };

    const totalRequests = filteredRequests.length;
    const pendingRequests = filteredRequests.filter(r => r.status === 'Pending').length;
    const approvedRequests = filteredRequests.filter(r => r.status === 'Approved').length;
    const completedRequests = filteredRequests.filter(r => r.status === 'Complete').length;

    const columns = [
        {
            key: 'request_code' as keyof TaskRequest,
            header: 'Request Code',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '140px'
        },
        {
            key: 'request_type' as keyof TaskRequest,
            header: 'Request Type',
            render: (value: any) => {
                const typeConfig = requestTypes.find(t => t.value === value);
                const typeColors = {
                    'maintenance': 'bg-blue-50 text-blue-700 border-blue-200',
                    'repair': 'bg-red-50 text-red-700 border-red-200',
                    'installation': 'bg-green-50 text-green-700 border-green-200',
                    'inspection': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    'other': 'bg-gray-50 text-gray-700 border-gray-200'
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
            key: 'contractor_name' as keyof TaskRequest,
            header: 'Contractor',
            render: (value: any) => <span className="font-semibold text-slate-800">{value}</span>,
            sortable: true
        },
        {
            key: 'project_name' as keyof TaskRequest,
            header: 'Project',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'notes' as keyof TaskRequest,
            header: 'Description',
            render: (value: any) => (
                <div className="max-w-xs">
                    <div className="text-sm text-slate-800 truncate">{value}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof TaskRequest,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'Approved': 'bg-green-100 text-green-700 border-green-200',
                    'Rejected': 'bg-red-100 text-red-700 border-red-200',
                    'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
                    'Complete': 'bg-blue-100 text-blue-700 border-blue-200'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors]} font-medium`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'created_by_name' as keyof TaskRequest,
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'created_at' as keyof TaskRequest,
            header: 'Created At',
            render: (value: any) => <span className="text-slate-700">{new Date(value).toLocaleDateString()}</span>,
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'View Details',
            onClick: (request: TaskRequest) => {
                router.push(`/requests/tasks/details?id=${request.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Request',
            onClick: (request: TaskRequest) => handleEdit(request),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Request',
            onClick: (request: TaskRequest) => handleStatusChange(request.id, 'approved'),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (request: TaskRequest) => request.status !== 'Pending'
        },
        {
            label: 'Reject Request',
            onClick: (request: TaskRequest) => handleStatusChange(request.id, 'rejected'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (request: TaskRequest) => request.status === 'Approved' || request.status === 'Rejected' || request.status === 'Complete'
        },
        {
            label: 'Mark as Complete',
            onClick: (request: TaskRequest) => handleStatusChange(request.id, 'completed'),
            icon: <UserCheck className="h-4 w-4" />,
            hidden: (request: TaskRequest) => request.status !== 'Approved'
        },
        {
            label: 'Delete Request',
            onClick: (request: TaskRequest) => handleDelete(request.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Requests',
            value: totalRequests,
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Pending',
            value: pendingRequests,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Approved',
            value: approvedRequests,
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Completed',
            value: completedRequests,
            change: '+6%',
            trend: 'up' as const
        }
    ];

    const filterOptions = [
        {
            key: 'type',
            label: 'Request Type',
            value: typeFilter,
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                ...requestTypes.map(type => ({ key: type.value, label: type.label, value: type.value }))
            ],
            onValueChange: setTypeFilter
        },
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'Pending', label: 'Pending', value: 'Pending' },
                { key: 'Approved', label: 'Approved', value: 'Approved' },
                { key: 'Rejected', label: 'Rejected', value: 'Rejected' },
                { key: 'Complete', label: 'Complete', value: 'Complete' },
                { key: 'Closed', label: 'Closed', value: 'Closed' }
            ],
            onValueChange: setStatusFilter
        }
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (typeFilter !== 'all') activeFilters.push(`Type: ${requestTypes.find(t => t.value === typeFilter)?.label}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Task Requests"
                description="Manage task requests with comprehensive tracking and approval workflow"
                stats={stats}
                actions={{
                    primary: {
                        label: 'New Request',
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
                            label: 'Request Analytics',
                            onClick: () => toast.info('Analytics feature coming soon'),
                            icon: <Filter className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by request code, contractor, project, or notes..."
                searchValue={search}
                onSearchChange={setSearch}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                }}
            />

            {/* Requests Table */}
            <EnhancedCard
                title="Task Requests Overview"
                description={`${filteredRequests.length} requests out of ${taskRequests.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: taskRequests.length,
                    badge: 'Active Requests',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredRequests}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    noDataMessage="No task requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Task Request</DialogTitle>
                        <DialogDescription>
                            Add a new task request with comprehensive details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="request_type">Request Type</Label>
                            <Select value={formData.request_type} onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Request Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="contractor_name">Contractor</Label>
                            <Select value={formData.contractor_name} onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_name: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Contractor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contractors.map(contractor => (
                                        <SelectItem key={contractor} value={contractor}>{contractor}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="project_name">Project</Label>
                            <Select value={formData.project_name} onValueChange={(value) => setFormData(prev => ({ ...prev, project_name: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(project => (
                                        <SelectItem key={project} value={project}>{project}</SelectItem>
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
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Task description"
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                                <Input
                                    id="estimated_hours"
                                    type="number"
                                    value={formData.estimated_hours}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="assigned_to">Assigned To</Label>
                            <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignees.map(assignee => (
                                        <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Create Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Task Request</DialogTitle>
                        <DialogDescription>
                            Update task request information and details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-request_type">Request Type</Label>
                            <Select value={formData.request_type} onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-contractor_name">Contractor</Label>
                            <Select value={formData.contractor_name} onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_name: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {contractors.map(contractor => (
                                        <SelectItem key={contractor} value={contractor}>{contractor}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-project_name">Project</Label>
                            <Select value={formData.project_name} onValueChange={(value) => setFormData(prev => ({ ...prev, project_name: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(project => (
                                        <SelectItem key={project} value={project}>{project}</SelectItem>
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
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-due_date">Due Date</Label>
                                <Input
                                    id="edit-due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-estimated_hours">Estimated Hours</Label>
                                <Input
                                    id="edit-estimated_hours"
                                    type="number"
                                    value={formData.estimated_hours}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-assigned_to">Assigned To</Label>
                            <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {assignees.map(assignee => (
                                        <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
