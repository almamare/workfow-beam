'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, Building2, CreditCard, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

interface ContractorPayment {
    id: string;
    paymentNumber: string;
    contractorName: string;
    contractorId: string;
    projectName: string;
    projectId: string;
    amount: number;
    currency: string;
    paymentMethod: 'bank_transfer' | 'cash' | 'check' | 'card';
    paymentDate: string;
    description: string;
    status: 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled';
    invoiceNumber: string;
    invoiceDate: string;
    approvalDate: string;
    approvedBy: string;
    paymentReference: string;
    createdBy: string;
    notes: string;
}

const mockPayments: ContractorPayment[] = [
    {
        id: '1',
        paymentNumber: 'PAY-001',
        contractorName: 'ABC Construction Ltd.',
        contractorId: 'CTR-001',
        projectName: 'Office Building Construction',
        projectId: 'PRJ-001',
        amount: 50000,
        currency: '',
        paymentMethod: 'bank_transfer',
        paymentDate: '2024-01-15',
        description: 'Monthly progress payment for foundation work',
        status: 'paid',
        invoiceNumber: 'INV-2024-001',
        invoiceDate: '2024-01-10',
        approvalDate: '2024-01-12',
        approvedBy: 'Ahmed Ali',
        paymentReference: 'TXN-123456789',
        createdBy: 'Fatima Mohamed',
        notes: 'Payment processed successfully'
    },
    {
        id: '2',
        paymentNumber: 'PAY-002',
        contractorName: 'XYZ Electrical Co.',
        contractorId: 'CTR-002',
        projectName: 'Electrical Installation',
        projectId: 'PRJ-002',
        amount: 25000,
        currency: '',
        paymentMethod: 'check',
        paymentDate: '2024-01-20',
        description: 'Electrical materials and installation',
        status: 'approved',
        invoiceNumber: 'INV-2024-002',
        invoiceDate: '2024-01-18',
        approvalDate: '2024-01-19',
        approvedBy: 'Omar Hassan',
        paymentReference: '',
        createdBy: 'Sara Ahmed',
        notes: 'Awaiting payment processing'
    },
    {
        id: '3',
        paymentNumber: 'PAY-003',
        contractorName: 'Green Landscaping',
        contractorId: 'CTR-003',
        projectName: 'Garden Design',
        projectId: 'PRJ-003',
        amount: 15000,
        currency: '',
        paymentMethod: 'cash',
        paymentDate: '2024-01-25',
        description: 'Landscaping materials and labor',
        status: 'pending',
        invoiceNumber: 'INV-2024-003',
        invoiceDate: '2024-01-22',
        approvalDate: '',
        approvedBy: '',
        paymentReference: '',
        createdBy: 'Mohammed Saleh',
        notes: 'Pending approval'
    }
];

const contractors = ['ABC Construction Ltd.', 'XYZ Electrical Co.', 'Green Landscaping', 'Modern Plumbing', 'Quality Painters'];
const projects = ['Office Building Construction', 'Electrical Installation', 'Garden Design', 'Plumbing Work', 'Painting Services'];
const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'card', label: 'Credit Card' }
];

export default function ContractorPaymentsPage() {
    const [payments, setPayments] = useState<ContractorPayment[]>(mockPayments);
    const [searchTerm, setSearchTerm] = useState('');
    const [contractorFilter, setContractorFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<ContractorPayment | null>(null);
    const [formData, setFormData] = useState({
        contractorId: '',
        projectId: '',
        amount: '',
        currency: '',
        paymentMethod: 'bank_transfer',
        paymentDate: '',
        description: '',
        invoiceNumber: '',
        invoiceDate: '',
        notes: ''
    });

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesContractor = contractorFilter === 'all' || payment.contractorId === contractorFilter;
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
        
        return matchesSearch && matchesContractor && matchesStatus && matchesMethod;
    });

    const handleCreate = () => {
        if (!formData.contractorId || !formData.projectId || !formData.amount || !formData.paymentDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newPayment: ContractorPayment = {
            id: Date.now().toString(),
            paymentNumber: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
            contractorName: contractors.find(c => c === formData.contractorId) || '',
            contractorId: formData.contractorId,
            projectName: projects.find(p => p === formData.projectId) || '',
            projectId: formData.projectId,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            paymentMethod: formData.paymentMethod as ContractorPayment['paymentMethod'],
            paymentDate: formData.paymentDate,
            description: formData.description,
            status: 'pending',
            invoiceNumber: formData.invoiceNumber,
            invoiceDate: formData.invoiceDate,
            approvalDate: '',
            approvedBy: '',
            paymentReference: '',
            createdBy: 'Current User',
            notes: formData.notes
        };

        setPayments([...payments, newPayment]);
        setIsCreateDialogOpen(false);
        setFormData({
            contractorId: '',
            projectId: '',
            amount: '',
            currency: '',
            paymentMethod: 'bank_transfer',
            paymentDate: '',
            description: '',
            invoiceNumber: '',
            invoiceDate: '',
            notes: ''
        });
        toast.success('Payment request created successfully');
    };

    const handleEdit = (payment: ContractorPayment) => {
        setEditingPayment(payment);
        setFormData({
            contractorId: payment.contractorId,
            projectId: payment.projectId,
            amount: payment.amount.toString(),
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            paymentDate: payment.paymentDate,
            description: payment.description,
            invoiceNumber: payment.invoiceNumber,
            invoiceDate: payment.invoiceDate,
            notes: payment.notes
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingPayment) return;

        const updatedPayments = payments.map(p =>
            p.id === editingPayment.id ? { 
                ...p, 
                contractorId: formData.contractorId,
                projectId: formData.projectId,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                paymentMethod: formData.paymentMethod as ContractorPayment['paymentMethod'],
                paymentDate: formData.paymentDate,
                description: formData.description,
                invoiceNumber: formData.invoiceNumber,
                invoiceDate: formData.invoiceDate,
                notes: formData.notes
            } : p
        );

        setPayments(updatedPayments);
        setIsEditDialogOpen(false);
        setEditingPayment(null);
        setFormData({
            contractorId: '',
            projectId: '',
            amount: '',
            currency: '',
            paymentMethod: 'bank_transfer',
            paymentDate: '',
            description: '',
            invoiceNumber: '',
            invoiceDate: '',
            notes: ''
        });
        toast.success('Payment updated successfully');
    };

    const handleDelete = (id: string) => {
        setPayments(payments.filter(p => p.id !== id));
        toast.success('Payment deleted successfully');
    };

    const handleStatusChange = (id: string, status: ContractorPayment['status']) => {
        setPayments(prev => prev.map(payment => 
            payment.id === id 
                ? { 
                    ...payment, 
                    status: status,
                    approvalDate: status === 'approved' || status === 'paid' ? new Date().toISOString().split('T')[0] : '',
                    approvedBy: status === 'approved' || status === 'paid' ? 'Current User' : ''
                }
                : payment
        ));
        toast.success(`Payment ${status} successfully`);
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = filteredPayments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = filteredPayments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);
    const approvedAmount = filteredPayments.filter(p => p.status === 'approved').reduce((sum, payment) => sum + payment.amount, 0);

    const columns = [
        {
            key: 'paymentNumber' as keyof ContractorPayment,
            header: 'Payment Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '120px'
        },
        {
            key: 'contractorName' as keyof ContractorPayment,
            header: 'Contractor',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <div className="font-semibold text-slate-800">{payment.contractorName}</div>
                    <div className="text-sm text-slate-600">{payment.contractorId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'projectName' as keyof ContractorPayment,
            header: 'Project',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <div className="font-semibold text-slate-800">{payment.projectName}</div>
                    <div className="text-sm text-slate-600">{payment.projectId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'amount' as keyof ContractorPayment,
            header: 'Amount',
            render: (value: any, payment: ContractorPayment) => (
                <span className="font-semibold text-slate-800">
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'paymentMethod' as keyof ContractorPayment,
            header: 'Payment Method',
            render: (value: any) => {
                const methodLabels = {
                    'bank_transfer': 'Bank Transfer',
                    'cash': 'Cash',
                    'check': 'Check',
                    'card': 'Credit Card'
                };
                
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {methodLabels[value as keyof typeof methodLabels]}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'paymentDate' as keyof ContractorPayment,
            header: 'Payment Date',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'invoiceNumber' as keyof ContractorPayment,
            header: 'Invoice',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <div className="font-semibold text-slate-800">{payment.invoiceNumber}</div>
                    <div className="text-sm text-slate-600">{payment.invoiceDate}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof ContractorPayment,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'approved': 'bg-blue-100 text-blue-700 border-blue-200',
                    'paid': 'bg-green-100 text-green-700 border-green-200',
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
            onClick: (payment: ContractorPayment) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Payment',
            onClick: (payment: ContractorPayment) => handleEdit(payment),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Payment',
            onClick: (payment: ContractorPayment) => handleStatusChange(payment.id, 'approved'),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (payment: ContractorPayment) => payment.status !== 'pending'
        },
        {
            label: 'Mark as Paid',
            onClick: (payment: ContractorPayment) => handleStatusChange(payment.id, 'paid'),
            icon: <DollarSign className="h-4 w-4" />,
            hidden: (payment: ContractorPayment) => payment.status !== 'approved'
        },
        {
            label: 'Reject Payment',
            onClick: (payment: ContractorPayment) => handleStatusChange(payment.id, 'rejected'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (payment: ContractorPayment) => payment.status === 'paid' || payment.status === 'rejected'
        },
        {
            label: 'Delete Payment',
            onClick: (payment: ContractorPayment) => handleDelete(payment.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Payments',
            value: filteredPayments.length,
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Total Amount',
            value: formatNumber(totalAmount),
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Paid Amount',
            value: formatNumber(paidAmount),
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Pending Amount',
            value: formatNumber(pendingAmount),
            change: '-5%',
            trend: 'down' as const
        }
    ];

    const filterOptions = [
        {
            key: 'contractor',
            label: 'Contractor',
            value: contractorFilter,
            options: [
                { key: 'all', label: 'All Contractors', value: 'all' },
                ...contractors.map(contractor => ({ key: contractor, label: contractor, value: contractor }))
            ],
            onValueChange: setContractorFilter
        },
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'pending', label: 'Pending', value: 'pending' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'paid', label: 'Paid', value: 'paid' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' },
                { key: 'cancelled', label: 'Cancelled', value: 'cancelled' }
            ],
            onValueChange: setStatusFilter
        },
        {
            key: 'method',
            label: 'Payment Method',
            value: methodFilter,
            options: [
                { key: 'all', label: 'All Methods', value: 'all' },
                ...paymentMethods.map(method => ({ key: method.value, label: method.label, value: method.value }))
            ],
            onValueChange: setMethodFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (contractorFilter !== 'all') activeFilters.push(`Contractor: ${contractorFilter}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
    if (methodFilter !== 'all') activeFilters.push(`Method: ${paymentMethods.find(m => m.value === methodFilter)?.label}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Contractor Payments"
                description="Manage contractor payments with comprehensive tracking and approval workflow"
                stats={stats}
                actions={{
                    primary: {
                        label: 'New Payment',
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
                            label: 'Payment Analysis',
                            onClick: () => toast.info('Payment analysis coming soon'),
                            icon: <TrendingUp className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by payment number, contractor, project, or invoice..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setContractorFilter('all');
                    setStatusFilter('all');
                    setMethodFilter('all');
                }}
            />

            {/* Payments Table */}
            <EnhancedCard
                title="Payment Overview"
                description={`${filteredPayments.length} payments out of ${payments.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: payments.length,
                    badge: 'Active Payments',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredPayments}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No payments found matching your criteria"
                    searchPlaceholder="Search payments..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Payment</DialogTitle>
                        <DialogDescription>
                            Add a new contractor payment request
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="contractorId">Contractor</Label>
                            <Select value={formData.contractorId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}>
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
                        <div>
                            <Label htmlFor="paymentDate">Payment Date</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Payment description"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                <Input
                                    id="invoiceNumber"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                    placeholder="Invoice number"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="invoiceDate">Invoice Date</Label>
                                <Input
                                    id="invoiceDate"
                                    type="date"
                                    value={formData.invoiceDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={2}
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Create Payment
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Payment</DialogTitle>
                        <DialogDescription>
                            Update payment information and details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-contractorId">Contractor</Label>
                            <Select value={formData.contractorId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}>
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
                        <div>
                            <Label htmlFor="edit-paymentDate">Payment Date</Label>
                            <Input
                                id="edit-paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-invoiceNumber">Invoice Number</Label>
                                <Input
                                    id="edit-invoiceNumber"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-invoiceDate">Invoice Date</Label>
                                <Input
                                    id="edit-invoiceDate"
                                    type="date"
                                    value={formData.invoiceDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={2}
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