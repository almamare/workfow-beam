'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, Clock, UserCheck, UserX, RefreshCw, FileSpreadsheet, Search, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';

interface EmployeeRequest {
    id: string;
    requestNumber: string;
    employeeId: string;
    employeeName: string;
    requestType: 'leave' | 'overtime' | 'advance' | 'training' | 'equipment' | 'other';
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    amount?: number;
    currency?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    department: string;
    position: string;
    supervisor: string;
    submittedDate: string;
    reviewedDate: string;
    reviewedBy: string;
    comments: string;
    attachments: string[];
    metadata: Record<string, any>;
}

const mockRequests: EmployeeRequest[] = [
    {
        id: '1',
        requestNumber: 'REQ-EMP-001',
        employeeId: 'EMP-001',
        employeeName: 'Ahmed Ali',
        requestType: 'leave',
        title: 'Annual Leave Request',
        description: 'Request for annual leave from January 20-25, 2024 for personal reasons.',
        startDate: '2024-01-20',
        endDate: '2024-01-25',
        status: 'pending',
        priority: 'medium',
        department: 'Project Management',
        position: 'Project Manager',
        supervisor: 'Fatima Mohamed',
        submittedDate: '2024-01-15',
        reviewedDate: '',
        reviewedBy: '',
        comments: '',
        attachments: ['leave_application.pdf'],
        metadata: { leaveType: 'annual', days: 5 }
    },
    {
        id: '2',
        requestNumber: 'REQ-EMP-002',
        employeeId: 'EMP-002',
        employeeName: 'Sara Ahmed',
        requestType: 'overtime',
        title: 'Overtime Request',
        description: 'Request for overtime work on January 18, 2024 from 6:00 PM to 10:00 PM for project completion.',
        startDate: '2024-01-18',
        endDate: '2024-01-18',
        status: 'approved',
        priority: 'high',
        department: 'IT Department',
        position: 'Software Developer',
        supervisor: 'Omar Hassan',
        submittedDate: '2024-01-17',
        reviewedDate: '2024-01-17',
        reviewedBy: 'Omar Hassan',
        comments: 'Approved for project completion',
        attachments: [],
        metadata: { hours: 4, rate: 50 }
    },
    {
        id: '3',
        requestNumber: 'REQ-EMP-003',
        employeeId: 'EMP-003',
        employeeName: 'Mohammed Saleh',
        requestType: 'advance',
        title: 'Salary Advance Request',
        description: 'Request for salary advance of SAR 5,000 for emergency medical expenses.',
        startDate: '2024-01-19',
        endDate: '2024-01-19',
        amount: 5000,
        currency: 'USD',
        status: 'pending',
        priority: 'urgent',
        department: 'Finance',
        position: 'Accountant',
        supervisor: 'Ahmed Ali',
        submittedDate: '2024-01-18',
        reviewedDate: '',
        reviewedBy: '',
        comments: '',
        attachments: ['medical_bills.pdf'],
        metadata: { reason: 'medical', repaymentPlan: 'monthly' }
    },
    {
        id: '4',
        requestNumber: 'REQ-EMP-004',
        employeeId: 'EMP-004',
        employeeName: 'Fatima Mohamed',
        requestType: 'training',
        title: 'Training Course Request',
        description: 'Request to attend PMP certification course from February 1-5, 2024.',
        startDate: '2024-02-01',
        endDate: '2024-02-05',
        status: 'approved',
        priority: 'medium',
        department: 'Project Management',
        position: 'Senior Project Manager',
        supervisor: 'Ahmed Ali',
        submittedDate: '2024-01-10',
        reviewedDate: '2024-01-12',
        reviewedBy: 'Ahmed Ali',
        comments: 'Approved for professional development',
        attachments: ['course_brochure.pdf'],
        metadata: { courseName: 'PMP Certification', cost: 2500, currency: 'USD' }
    },
    {
        id: '5',
        requestNumber: 'REQ-EMP-005',
        employeeId: 'EMP-005',
        employeeName: 'Omar Hassan',
        requestType: 'equipment',
        title: 'Equipment Request',
        description: 'Request for new laptop computer for software development work.',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        status: 'rejected',
        priority: 'low',
        department: 'IT Department',
        position: 'IT Manager',
        supervisor: 'Ahmed Ali',
        submittedDate: '2024-01-15',
        reviewedDate: '2024-01-16',
        reviewedBy: 'Ahmed Ali',
        comments: 'Current laptop is sufficient for current workload',
        attachments: ['laptop_specs.pdf'],
        metadata: { equipmentType: 'laptop', estimatedCost: 3000, currency: 'USD' }
    }
];

const requestTypes = [
    { value: 'leave', label: 'Leave Request', icon: <Calendar className="h-4 w-4" /> },
    { value: 'overtime', label: 'Overtime Request', icon: <Clock className="h-4 w-4" /> },
    { value: 'advance', label: 'Salary Advance', icon: <Users className="h-4 w-4" /> },
    { value: 'training', label: 'Training Request', icon: <UserCheck className="h-4 w-4" /> },
    { value: 'equipment', label: 'Equipment Request', icon: <Users className="h-4 w-4" /> },
    { value: 'other', label: 'Other Request', icon: <Users className="h-4 w-4" /> }
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

const departments = ['Project Management', 'IT Department', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing'];
const employees = ['Ahmed Ali', 'Sara Ahmed', 'Mohammed Saleh', 'Fatima Mohamed', 'Omar Hassan'];
const supervisors = ['Ahmed Ali', 'Fatima Mohamed', 'Omar Hassan'];

export default function EmployeeRequestsPage() {
    const [requests, setRequests] = useState<EmployeeRequest[]>(mockRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<EmployeeRequest | null>(null);
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        requestType: 'leave',
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        amount: '',
        currency: 'USD',
        priority: 'medium',
        department: '',
        position: '',
        supervisor: '',
        comments: ''
    });

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
        
        return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });

    const handleCreate = () => {
        if (!formData.employeeName || !formData.title || !formData.description || !formData.startDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newRequest: EmployeeRequest = {
            id: Date.now().toString(),
            requestNumber: `REQ-EMP-${String(requests.length + 1).padStart(3, '0')}`,
            employeeId: formData.employeeId,
            employeeName: formData.employeeName,
            requestType: formData.requestType as EmployeeRequest['requestType'],
            title: formData.title,
            description: formData.description,
            startDate: formData.startDate,
            endDate: formData.endDate,
            amount: formData.amount ? parseFloat(formData.amount) : undefined,
            currency: formData.currency,
            status: 'pending',
            priority: formData.priority as EmployeeRequest['priority'],
            department: formData.department,
            position: formData.position,
            supervisor: formData.supervisor,
            submittedDate: new Date().toISOString().split('T')[0],
            reviewedDate: '',
            reviewedBy: '',
            comments: formData.comments,
            attachments: [],
            metadata: {}
        };

        setRequests([...requests, newRequest]);
        setIsCreateDialogOpen(false);
        setFormData({
            employeeId: '',
            employeeName: '',
            requestType: 'leave',
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            amount: '',
            currency: 'USD',
            priority: 'medium',
            department: '',
            position: '',
            supervisor: '',
            comments: ''
        });
        toast.success('Employee request created successfully');
    };

    const handleEdit = (request: EmployeeRequest) => {
        setEditingRequest(request);
        setFormData({
            employeeId: request.employeeId,
            employeeName: request.employeeName,
            requestType: request.requestType,
            title: request.title,
            description: request.description,
            startDate: request.startDate,
            endDate: request.endDate,
            amount: request.amount?.toString() || '',
            currency: request.currency || 'USD',
            priority: request.priority,
            department: request.department,
            position: request.position,
            supervisor: request.supervisor,
            comments: request.comments
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        const updatedRequests = requests.map(r =>
            r.id === editingRequest.id ? { 
                ...r, 
                employeeId: formData.employeeId,
                employeeName: formData.employeeName,
                requestType: formData.requestType as EmployeeRequest['requestType'],
                title: formData.title,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                amount: formData.amount ? parseFloat(formData.amount) : undefined,
                currency: formData.currency,
                priority: formData.priority as EmployeeRequest['priority'],
                department: formData.department,
                position: formData.position,
                supervisor: formData.supervisor,
                comments: formData.comments
            } : r
        );

        setRequests(updatedRequests);
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({
            employeeId: '',
            employeeName: '',
            requestType: 'leave',
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            amount: '',
            currency: 'USD',
            priority: 'medium',
            department: '',
            position: '',
            supervisor: '',
            comments: ''
        });
        toast.success('Employee request updated successfully');
    };

    const handleDelete = (id: string) => {
        setRequests(requests.filter(r => r.id !== id));
        toast.success('Employee request deleted successfully');
    };

    const handleStatusChange = (id: string, status: EmployeeRequest['status']) => {
        setRequests(prev => prev.map(request => 
            request.id === id 
                ? { 
                    ...request, 
                    status: status,
                    reviewedDate: status === 'approved' || status === 'rejected' ? new Date().toISOString().split('T')[0] : '',
                    reviewedBy: status === 'approved' || status === 'rejected' ? 'Current User' : ''
                }
                : request
        ));
        toast.success(`Request ${status} successfully`);
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalRequests = filteredRequests.length;
    const pendingRequests = filteredRequests.filter(r => r.status === 'pending').length;
    const approvedRequests = filteredRequests.filter(r => r.status === 'approved').length;
    const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected').length;

    const columns = [
        {
            key: 'requestNumber' as keyof EmployeeRequest,
            header: 'Request Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '140px'
        },
        {
            key: 'employeeName' as keyof EmployeeRequest,
            header: 'Employee',
            render: (value: any, request: EmployeeRequest) => (
                <div>
                    <div className="font-semibold text-slate-800">{request.employeeName}</div>
                    <div className="text-sm text-slate-600">{request.employeeId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'requestType' as keyof EmployeeRequest,
            header: 'Request Type',
            render: (value: any) => {
                const typeConfig = requestTypes.find(t => t.value === value);
                const typeColors = {
                    'leave': 'bg-blue-50 text-blue-700 border-blue-200',
                    'overtime': 'bg-green-50 text-green-700 border-green-200',
                    'advance': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    'training': 'bg-purple-50 text-purple-700 border-purple-200',
                    'equipment': 'bg-sky-50 text-sky-700 border-sky-200',
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
            key: 'title' as keyof EmployeeRequest,
            header: 'Title',
            render: (value: any, request: EmployeeRequest) => (
                <div>
                    <div className="font-semibold text-slate-800">{request.title}</div>
                    <div className="text-sm text-slate-600 truncate max-w-xs">{request.description}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'amount' as keyof EmployeeRequest,
            header: 'Amount',
            render: (value: any, request: EmployeeRequest) => (
                <span className="font-semibold text-slate-800">
                    {value ? formatNumber(value) : '-'}
                </span>
            ),
            sortable: true
        },
        {
            key: 'startDate' as keyof EmployeeRequest,
            header: 'Date Range',
            render: (value: any, request: EmployeeRequest) => (
                <div>
                    <div className="text-sm text-slate-700">{request.startDate}</div>
                    <div className="text-xs text-slate-500">to {request.endDate}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'priority' as keyof EmployeeRequest,
            header: 'Priority',
            render: (value: any) => {
                const priorityColors = {
                    'low': 'bg-gray-50 text-gray-700 border-gray-200',
                    'medium': 'bg-blue-50 text-blue-700 border-blue-200',
                    'high': 'bg-sky-50 text-sky-700 border-sky-200',
                    'urgent': 'bg-red-50 text-red-700 border-red-200'
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
            key: 'department' as keyof EmployeeRequest,
            header: 'Department',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'status' as keyof EmployeeRequest,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'approved': 'bg-green-100 text-green-700 border-green-200',
                    'rejected': 'bg-red-100 text-red-700 border-red-200',
                    'cancelled': 'bg-gray-100 text-gray-700 border-gray-200'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors]} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'View Details',
            onClick: (request: EmployeeRequest) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Request',
            onClick: (request: EmployeeRequest) => handleEdit(request),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Request',
            onClick: (request: EmployeeRequest) => handleStatusChange(request.id, 'approved'),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (request: EmployeeRequest) => request.status !== 'pending'
        },
        {
            label: 'Reject Request',
            onClick: (request: EmployeeRequest) => handleStatusChange(request.id, 'rejected'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (request: EmployeeRequest) => request.status === 'approved' || request.status === 'rejected'
        },
        {
            label: 'Cancel Request',
            onClick: (request: EmployeeRequest) => handleStatusChange(request.id, 'cancelled'),
            icon: <UserX className="h-4 w-4" />,
            hidden: (request: EmployeeRequest) => request.status === 'approved' || request.status === 'rejected'
        },
        {
            label: 'Delete Request',
            onClick: (request: EmployeeRequest) => handleDelete(request.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Requests',
            value: totalRequests,
            change: '+15%',
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
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Rejected',
            value: rejectedRequests,
            change: '-5%',
            trend: 'down' as const
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
                { key: 'pending', label: 'Pending', value: 'pending' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' },
                { key: 'cancelled', label: 'Cancelled', value: 'cancelled' }
            ],
            onValueChange: setStatusFilter
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
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (typeFilter !== 'all') activeFilters.push(`Type: ${requestTypes.find(t => t.value === typeFilter)?.label}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
    if (priorityFilter !== 'all') activeFilters.push(`Priority: ${priorities.find(p => p.value === priorityFilter)?.label}`);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            // Simulate refresh
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Employee Requests</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage employee requests with comprehensive tracking and approval workflow
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Requests"
                    description="All employee requests"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {totalRequests}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Pending"
                    description="Requests awaiting review"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {pendingRequests}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Approved"
                    description="Successfully approved requests"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {approvedRequests}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Rejected"
                    description="Rejected requests"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {rejectedRequests}
                    </div>
                </EnhancedCard>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter employee requests by various criteria"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by request number, employee name, or title..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                }}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToExcel}
                                disabled={isExporting}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshTable}
                                disabled={isRefreshing}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Request Type Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-700 dark:text-slate-300 font-medium">
                                Request Type
                            </Label>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Types</SelectItem>
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                Status
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Statuses</SelectItem>
                                    <SelectItem value="pending" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Pending</SelectItem>
                                    <SelectItem value="approved" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Approved</SelectItem>
                                    <SelectItem value="rejected" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Rejected</SelectItem>
                                    <SelectItem value="cancelled" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300 font-medium">
                                Priority
                            </Label>
                            <Select
                                value={priorityFilter}
                                onValueChange={(value) => {
                                    setPriorityFilter(value);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Priorities" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Priorities</SelectItem>
                                    {priorities.map(priority => (
                                        <SelectItem key={priority.value} value={priority.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{priority.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters & Clear Button */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                {activeFilters.map((filter, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
                                    >
                                        {filter}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setTypeFilter('all');
                                    setStatusFilter('all');
                                    setPriorityFilter('all');
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <XIcon className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Requests Table */}
            <EnhancedCard
                title="Employee Requests List"
                description={`${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: filteredRequests.length,
                    badge: 'Total Requests',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredRequests}
                    columns={columns as Column<EmployeeRequest>[]}
                    actions={actions as Action<EmployeeRequest>[]}
                    loading={false}
                    noDataMessage="No requests found matching your search criteria"
                    searchPlaceholder="Search requests..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Employee Request</DialogTitle>
                        <DialogDescription>
                            Add a new employee request with comprehensive details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="employeeName">Employee Name</Label>
                            <Select value={formData.employeeName} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeName: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(employee => (
                                        <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                value={formData.employeeId}
                                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                                placeholder="Employee ID"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="requestType">Request Type</Label>
                            <Select value={formData.requestType} onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}>
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
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Request title"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Request description"
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        {(formData.requestType === 'advance' || formData.requestType === 'equipment') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0.00"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">US Dollar</SelectItem>
                                            <SelectItem value="EUR">Euro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
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
                                <Label htmlFor="department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(department => (
                                            <SelectItem key={department} value={department}>{department}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="position">Position</Label>
                                <Input
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                    placeholder="Employee position"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="supervisor">Supervisor</Label>
                                <Select value={formData.supervisor} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Supervisor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supervisors.map(supervisor => (
                                            <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="comments">Comments</Label>
                            <Textarea
                                id="comments"
                                value={formData.comments}
                                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                                placeholder="Additional comments"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                                <Users className="h-4 w-4 mr-2" />
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
                        <DialogTitle>Edit Employee Request</DialogTitle>
                        <DialogDescription>
                            Update employee request information and details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-employeeName">Employee Name</Label>
                            <Select value={formData.employeeName} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeName: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(employee => (
                                        <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-employeeId">Employee ID</Label>
                            <Input
                                id="edit-employeeId"
                                value={formData.employeeId}
                                onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-requestType">Request Type</Label>
                            <Select value={formData.requestType} onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}>
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
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="mt-1"
                            />
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-startDate">Start Date</Label>
                                <Input
                                    id="edit-startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-endDate">End Date</Label>
                                <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        {(formData.requestType === 'advance' || formData.requestType === 'equipment') && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <Input
                                        id="edit-amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-currency">Currency</Label>
                                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">US Dollar</SelectItem>
                                            <SelectItem value="EUR">Euro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
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
                                <Label htmlFor="edit-department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(department => (
                                            <SelectItem key={department} value={department}>{department}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-position">Position</Label>
                                <Input
                                    id="edit-position"
                                    value={formData.position}
                                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-supervisor">Supervisor</Label>
                                <Select value={formData.supervisor} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {supervisors.map(supervisor => (
                                            <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-comments">Comments</Label>
                            <Textarea
                                id="edit-comments"
                                value={formData.comments}
                                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
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