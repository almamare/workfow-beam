'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

interface FinancialRequest {
    id: string;
    requestNumber: string;
    requesterId: string;
    requesterName: string;
    requestType: 'budget' | 'expense' | 'payment' | 'advance' | 'refund' | 'other';
    title: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    projectId: string;
    projectName: string;
    department: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'paid';
    submittedDate: string;
    reviewedDate: string;
    reviewedBy: string;
    approvedDate: string;
    approvedBy: string;
    paymentDate: string;
    paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'card';
    reference: string;
    attachments: string[];
    comments: string;
    metadata: Record<string, any>;
}

const mockRequests: FinancialRequest[] = [
    {
        id: '1',
        requestNumber: 'REQ-FIN-001',
        requesterId: 'EMP-001',
        requesterName: 'Ahmed Ali',
        requestType: 'expense',
        title: 'Office Supplies Purchase',
        description: 'Request for office supplies including paper, pens, and stationery for the project team.',
        amount: 2500,
        currency: 'USD',
        category: 'Office Supplies',
        projectId: 'PRJ-001',
        projectName: 'Office Building Construction',
        department: 'Project Management',
        priority: 'medium',
        status: 'approved',
        submittedDate: '2024-01-15',
        reviewedDate: '2024-01-16',
        reviewedBy: 'Fatima Mohamed',
        approvedDate: '2024-01-17',
        approvedBy: 'Omar Hassan',
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        reference: 'PO-2024-001',
        attachments: ['quotation.pdf', 'budget_justification.pdf'],
        comments: 'Approved for project needs',
        metadata: { vendor: 'Office Supplies Co.', items: ['Paper', 'Pens', 'Stationery'] }
    },
    {
        id: '2',
        requestNumber: 'REQ-FIN-002',
        requesterId: 'EMP-002',
        requesterName: 'Sara Ahmed',
        requestType: 'budget',
        title: 'Marketing Budget Request',
        description: 'Request for additional marketing budget to promote the new project launch.',
        amount: 15000,
        currency: 'USD',
        category: 'Marketing',
        projectId: 'PRJ-002',
        projectName: 'Residential Complex',
        department: 'Marketing',
        priority: 'high',
        status: 'pending',
        submittedDate: '2024-01-18',
        reviewedDate: '',
        reviewedBy: '',
        approvedDate: '',
        approvedBy: '',
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        reference: 'BUD-2024-002',
        attachments: ['marketing_plan.pdf'],
        comments: '',
        metadata: { campaign: 'Project Launch', duration: '3 months' }
    },
    {
        id: '3',
        requestNumber: 'REQ-FIN-003',
        requesterId: 'EMP-003',
        requesterName: 'Mohammed Saleh',
        requestType: 'payment',
        title: 'Contractor Payment Request',
        description: 'Request for payment to ABC Construction for completed foundation work.',
        amount: 50000,
        currency: 'USD',
        category: 'Contractor Payment',
        projectId: 'PRJ-001',
        projectName: 'Office Building Construction',
        department: 'Project Management',
        priority: 'urgent',
        status: 'paid',
        submittedDate: '2024-01-10',
        reviewedDate: '2024-01-11',
        reviewedBy: 'Ahmed Ali',
        approvedDate: '2024-01-12',
        approvedBy: 'Fatima Mohamed',
        paymentDate: '2024-01-15',
        paymentMethod: 'check',
        reference: 'PAY-2024-001',
        attachments: ['invoice.pdf', 'work_completion_certificate.pdf'],
        comments: 'Payment processed successfully',
        metadata: { contractor: 'ABC Construction', workType: 'Foundation' }
    },
    {
        id: '4',
        requestNumber: 'REQ-FIN-004',
        requesterId: 'EMP-004',
        requesterName: 'Fatima Mohamed',
        requestType: 'advance',
        title: 'Travel Advance Request',
        description: 'Request for travel advance for business trip to Dubai for project meeting.',
        amount: 8000,
        currency: 'USD',
        category: 'Travel',
        projectId: 'PRJ-003',
        projectName: 'Shopping Mall',
        department: 'Project Management',
        priority: 'medium',
        status: 'rejected',
        submittedDate: '2024-01-20',
        reviewedDate: '2024-01-21',
        reviewedBy: 'Omar Hassan',
        approvedDate: '',
        approvedBy: '',
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        reference: 'ADV-2024-001',
        attachments: ['travel_itinerary.pdf'],
        comments: 'Travel not approved due to budget constraints',
        metadata: { destination: 'Dubai', duration: '3 days', purpose: 'Project Meeting' }
    },
    {
        id: '5',
        requestNumber: 'REQ-FIN-005',
        requesterId: 'EMP-005',
        requesterName: 'Omar Hassan',
        requestType: 'refund',
        title: 'Equipment Refund Request',
        description: 'Request for refund of overpaid equipment purchase from Tech Solutions Inc.',
        amount: 2500,
        currency: 'USD',
        category: 'Equipment',
        projectId: 'PRJ-002',
        projectName: 'Residential Complex',
        department: 'IT Department',
        priority: 'low',
        status: 'pending',
        submittedDate: '2024-01-22',
        reviewedDate: '',
        reviewedBy: '',
        approvedDate: '',
        approvedBy: '',
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        reference: 'REF-2024-001',
        attachments: ['invoice.pdf', 'overpayment_proof.pdf'],
        comments: '',
        metadata: { vendor: 'Tech Solutions Inc.', equipment: 'Laptop', reason: 'Overpayment' }
    }
];

const requestTypes = [
    { value: 'budget', label: 'Budget Request', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'expense', label: 'Expense Request', icon: <CreditCard className="h-4 w-4" /> },
    { value: 'payment', label: 'Payment Request', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'advance', label: 'Advance Request', icon: <Calendar className="h-4 w-4" /> },
    { value: 'refund', label: 'Refund Request', icon: <DollarSign className="h-4 w-4" /> },
    { value: 'other', label: 'Other Request', icon: <DollarSign className="h-4 w-4" /> }
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

const categories = ['Office Supplies', 'Marketing', 'Contractor Payment', 'Travel', 'Equipment', 'Utilities', 'Rent', 'Insurance', 'Training', 'Other'];
const departments = ['Project Management', 'IT Department', 'Finance', 'HR', 'Operations', 'Sales', 'Marketing'];
const projects = ['Office Building Construction', 'Residential Complex', 'Shopping Mall', 'Hospital', 'School'];
const requesters = ['Ahmed Ali', 'Sara Ahmed', 'Mohammed Saleh', 'Fatima Mohamed', 'Omar Hassan'];
const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'card', label: 'Credit Card' }
];

export default function FinancialRequestsPage() {
    const [requests, setRequests] = useState<FinancialRequest[]>(mockRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<FinancialRequest | null>(null);
    const [formData, setFormData] = useState({
        requesterId: '',
        requesterName: '',
        requestType: 'expense',
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        category: '',
        projectId: '',
        department: '',
        priority: 'medium',
        paymentMethod: 'bank_transfer',
        reference: '',
        comments: ''
    });

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
        
        return matchesSearch && matchesType && matchesStatus && matchesPriority;
    });

    const handleCreate = () => {
        if (!formData.requesterName || !formData.title || !formData.description || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newRequest: FinancialRequest = {
            id: Date.now().toString(),
            requestNumber: `REQ-FIN-${String(requests.length + 1).padStart(3, '0')}`,
            requesterId: formData.requesterId,
            requesterName: formData.requesterName,
            requestType: formData.requestType as FinancialRequest['requestType'],
            title: formData.title,
            description: formData.description,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            category: formData.category,
            projectId: formData.projectId,
            projectName: projects.find(p => p === formData.projectId) || '',
            department: formData.department,
            priority: formData.priority as FinancialRequest['priority'],
            status: 'pending',
            submittedDate: new Date().toISOString().split('T')[0],
            reviewedDate: '',
            reviewedBy: '',
            approvedDate: '',
            approvedBy: '',
            paymentDate: '',
            paymentMethod: formData.paymentMethod as FinancialRequest['paymentMethod'],
            reference: formData.reference,
            attachments: [],
            comments: formData.comments,
            metadata: {}
        };

        setRequests([...requests, newRequest]);
        setIsCreateDialogOpen(false);
        setFormData({
            requesterId: '',
            requesterName: '',
            requestType: 'expense',
            title: '',
            description: '',
            amount: '',
            currency: 'USD',
            category: '',
            projectId: '',
            department: '',
            priority: 'medium',
            paymentMethod: 'bank_transfer',
            reference: '',
            comments: ''
        });
        toast.success('Financial request created successfully');
    };

    const handleEdit = (request: FinancialRequest) => {
        setEditingRequest(request);
        setFormData({
            requesterId: request.requesterId,
            requesterName: request.requesterName,
            requestType: request.requestType,
            title: request.title,
            description: request.description,
            amount: request.amount.toString(),
            currency: request.currency,
            category: request.category,
            projectId: request.projectId,
            department: request.department,
            priority: request.priority,
            paymentMethod: request.paymentMethod,
            reference: request.reference,
            comments: request.comments
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        const updatedRequests = requests.map(r =>
            r.id === editingRequest.id ? { 
                ...r, 
                requesterId: formData.requesterId,
                requesterName: formData.requesterName,
                requestType: formData.requestType as FinancialRequest['requestType'],
                title: formData.title,
                description: formData.description,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                category: formData.category,
                projectId: formData.projectId,
                projectName: projects.find(p => p === formData.projectId) || '',
                department: formData.department,
                priority: formData.priority as FinancialRequest['priority'],
                paymentMethod: formData.paymentMethod as FinancialRequest['paymentMethod'],
                reference: formData.reference,
                comments: formData.comments
            } : r
        );

        setRequests(updatedRequests);
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({
            requesterId: '',
            requesterName: '',
            requestType: 'expense',
            title: '',
            description: '',
            amount: '',
            currency: 'USD',
            category: '',
            projectId: '',
            department: '',
            priority: 'medium',
            paymentMethod: 'bank_transfer',
            reference: '',
            comments: ''
        });
        toast.success('Financial request updated successfully');
    };

    const handleDelete = (id: string) => {
        setRequests(requests.filter(r => r.id !== id));
        toast.success('Financial request deleted successfully');
    };

    const handleStatusChange = (id: string, status: FinancialRequest['status']) => {
        setRequests(prev => prev.map(request => 
            request.id === id 
                ? { 
                    ...request, 
                    status: status,
                    reviewedDate: status === 'approved' || status === 'rejected' ? new Date().toISOString().split('T')[0] : request.reviewedDate,
                    reviewedBy: status === 'approved' || status === 'rejected' ? 'Current User' : request.reviewedBy,
                    approvedDate: status === 'approved' ? new Date().toISOString().split('T')[0] : request.approvedDate,
                    approvedBy: status === 'approved' ? 'Current User' : request.approvedBy,
                    paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : request.paymentDate
                }
                : request
        ));
        toast.success(`Request ${status} successfully`);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalRequests = filteredRequests.length;
    const totalAmount = filteredRequests.reduce((sum, request) => sum + request.amount, 0);
    const pendingAmount = filteredRequests.filter(r => r.status === 'pending').reduce((sum, request) => sum + request.amount, 0);
    const approvedAmount = filteredRequests.filter(r => r.status === 'approved').reduce((sum, request) => sum + request.amount, 0);

    const columns = [
        {
            key: 'requestNumber' as keyof FinancialRequest,
            header: 'Request Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '140px'
        },
        {
            key: 'requesterName' as keyof FinancialRequest,
            header: 'Requester',
            render: (value: any, request: FinancialRequest) => (
                <div>
                    <div className="font-semibold text-slate-800">{request.requesterName}</div>
                    <div className="text-sm text-slate-600">{request.requesterId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'requestType' as keyof FinancialRequest,
            header: 'Request Type',
            render: (value: any) => {
                const typeConfig = requestTypes.find(t => t.value === value);
                const typeColors = {
                    'budget': 'bg-blue-50 text-blue-700 border-blue-200',
                    'expense': 'bg-green-50 text-green-700 border-green-200',
                    'payment': 'bg-purple-50 text-purple-700 border-purple-200',
                    'advance': 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    'refund': 'bg-orange-50 text-orange-700 border-orange-200',
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
            key: 'title' as keyof FinancialRequest,
            header: 'Title',
            render: (value: any, request: FinancialRequest) => (
                <div>
                    <div className="font-semibold text-slate-800">{request.title}</div>
                    <div className="text-sm text-slate-600 truncate max-w-xs">{request.description}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'amount' as keyof FinancialRequest,
            header: 'Amount',
            render: (value: any, request: FinancialRequest) => (
                <span className="font-semibold text-slate-800">
                    {formatCurrency(value, request.currency)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'category' as keyof FinancialRequest,
            header: 'Category',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'projectName' as keyof FinancialRequest,
            header: 'Project',
            render: (value: any, request: FinancialRequest) => (
                <div>
                    <div className="font-semibold text-slate-800">{request.projectName}</div>
                    <div className="text-sm text-slate-600">{request.projectId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'priority' as keyof FinancialRequest,
            header: 'Priority',
            render: (value: any) => {
                const priorityColors = {
                    'low': 'bg-gray-50 text-gray-700 border-gray-200',
                    'medium': 'bg-blue-50 text-blue-700 border-blue-200',
                    'high': 'bg-orange-50 text-orange-700 border-orange-200',
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
            key: 'status' as keyof FinancialRequest,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'approved': 'bg-green-100 text-green-700 border-green-200',
                    'rejected': 'bg-red-100 text-red-700 border-red-200',
                    'cancelled': 'bg-gray-100 text-gray-700 border-gray-200',
                    'paid': 'bg-blue-100 text-blue-700 border-blue-200'
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
            onClick: (request: FinancialRequest) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Request',
            onClick: (request: FinancialRequest) => handleEdit(request),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Request',
            onClick: (request: FinancialRequest) => handleStatusChange(request.id, 'approved'),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (request: FinancialRequest) => request.status !== 'pending'
        },
        {
            label: 'Reject Request',
            onClick: (request: FinancialRequest) => handleStatusChange(request.id, 'rejected'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (request: FinancialRequest) => request.status === 'approved' || request.status === 'rejected' || request.status === 'paid'
        },
        {
            label: 'Mark as Paid',
            onClick: (request: FinancialRequest) => handleStatusChange(request.id, 'paid'),
            icon: <DollarSign className="h-4 w-4" />,
            hidden: (request: FinancialRequest) => request.status !== 'approved'
        },
        {
            label: 'Cancel Request',
            onClick: (request: FinancialRequest) => handleStatusChange(request.id, 'cancelled'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (request: FinancialRequest) => request.status === 'approved' || request.status === 'rejected' || request.status === 'paid'
        },
        {
            label: 'Delete Request',
            onClick: (request: FinancialRequest) => handleDelete(request.id),
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
            label: 'Total Amount',
            value: formatCurrency(totalAmount, 'USD'),
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Pending Amount',
            value: formatCurrency(pendingAmount, 'USD'),
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Approved Amount',
            value: formatCurrency(approvedAmount, 'USD'),
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
                { key: 'pending', label: 'Pending', value: 'pending' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' },
                { key: 'cancelled', label: 'Cancelled', value: 'cancelled' },
                { key: 'paid', label: 'Paid', value: 'paid' }
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Financial Requests"
                description="Manage financial requests with comprehensive approval workflow and payment tracking"
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
                            label: 'Financial Analytics',
                            onClick: () => toast.info('Analytics feature coming soon'),
                            icon: <TrendingUp className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by request number, requester name, or title..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                }}
            />

            {/* Requests Table */}
            <EnhancedCard
                title="Financial Requests Overview"
                description={`${filteredRequests.length} requests out of ${requests.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: requests.length,
                    badge: 'Active Requests',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredRequests}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Financial Request</DialogTitle>
                        <DialogDescription>
                            Add a new financial request with comprehensive details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="requesterName">Requester Name</Label>
                            <Select value={formData.requesterName} onValueChange={(value) => setFormData(prev => ({ ...prev, requesterName: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Requester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {requesters.map(requester => (
                                        <SelectItem key={requester} value={requester}>{requester}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="requesterId">Requester ID</Label>
                            <Input
                                id="requesterId"
                                value={formData.requesterId}
                                onChange={(e) => setFormData(prev => ({ ...prev, requesterId: e.target.value }))}
                                placeholder="Requester ID"
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
                                        <SelectItem value="USD">US Dollar</SelectItem>
                                        <SelectItem value="EUR">Euro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="projectId">Project</Label>
                            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
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
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map(method => (
                                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="reference">Reference</Label>
                            <Input
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                placeholder="Reference number or code"
                                className="mt-1"
                            />
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
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <DollarSign className="h-4 w-4 mr-2" />
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
                        <DialogTitle>Edit Financial Request</DialogTitle>
                        <DialogDescription>
                            Update financial request information and details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-requesterName">Requester Name</Label>
                            <Select value={formData.requesterName} onValueChange={(value) => setFormData(prev => ({ ...prev, requesterName: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {requesters.map(requester => (
                                        <SelectItem key={requester} value={requester}>{requester}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-requesterId">Requester ID</Label>
                            <Input
                                id="edit-requesterId"
                                value={formData.requesterId}
                                onChange={(e) => setFormData(prev => ({ ...prev, requesterId: e.target.value }))}
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
                                        <SelectItem value="USD">US Dollar</SelectItem>
                                        <SelectItem value="EUR">Euro</SelectItem>
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
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-projectId">Project</Label>
                            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
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
                                <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map(method => (
                                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-reference">Reference</Label>
                            <Input
                                id="edit-reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                className="mt-1"
                            />
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
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}