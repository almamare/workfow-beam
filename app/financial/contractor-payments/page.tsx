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
import { DollarSign, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, Building2, CreditCard, TrendingUp, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { fetchContractors, selectContractors, selectLoading as selectContractorsLoading } from '@/stores/slices/contractors';
import { fetchProjects, selectProjects, selectLoading as selectProjectsLoading } from '@/stores/slices/projects';
import axios from '@/utils/axios';

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

const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'card', label: 'Credit Card' }
];

const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'KWD', label: 'Kuwaiti Dinar (KWD)' }
];

export default function ContractorPaymentsPage() {
    const dispatch = useReduxDispatch<AppDispatch>();
    const contractors = useSelector(selectContractors);
    const projects = useSelector(selectProjects);
    const contractorsLoading = useSelector(selectContractorsLoading);
    const projectsLoading = useSelector(selectProjectsLoading);

    const [payments, setPayments] = useState<ContractorPayment[]>(mockPayments);
    const [searchTerm, setSearchTerm] = useState('');
    const [contractorFilter, setContractorFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<ContractorPayment | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [formData, setFormData] = useState({
        contractorId: '',
        projectId: '',
        amount: '',
        currency: 'USD',
        paymentMethod: 'bank_transfer',
        paymentDate: '',
        description: '',
        invoiceNumber: '',
        invoiceDate: '',
        notes: ''
    });

    // Fetch contractors and projects on mount
    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                payment.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesContractor = contractorFilter === 'all' || payment.contractorId === contractorFilter;
            const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
            const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
            
            return matchesSearch && matchesContractor && matchesStatus && matchesMethod;
        });
    }, [payments, searchTerm, contractorFilter, statusFilter, methodFilter]);

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (searchTerm) arr.push(`Search: ${searchTerm}`);
        if (contractorFilter !== 'all') {
            const contractor = contractors.find(c => c.id === contractorFilter);
            if (contractor) arr.push(`Contractor: ${contractor.name}`);
        }
        if (statusFilter !== 'all') arr.push(`Status: ${statusFilter}`);
        if (methodFilter !== 'all') {
            const method = paymentMethods.find(m => m.value === methodFilter);
            if (method) arr.push(`Method: ${method.label}`);
        }
        return arr;
    }, [searchTerm, contractorFilter, statusFilter, methodFilter, contractors]);

    const handleCreate = async () => {
        if (!formData.contractorId || !formData.projectId || !formData.amount || !formData.paymentDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // TODO: Replace with actual API call
            // const response = await axios.post('/contractor-payments/create', {
            //     contractor_id: formData.contractorId,
            //     project_id: formData.projectId,
            //     amount: parseFloat(formData.amount),
            //     currency: formData.currency,
            //     payment_method: formData.paymentMethod,
            //     payment_date: formData.paymentDate,
            //     description: formData.description,
            //     invoice_number: formData.invoiceNumber,
            //     invoice_date: formData.invoiceDate,
            //     notes: formData.notes
            // });

            const contractor = contractors.find(c => c.id === formData.contractorId);
            const project = projects.find(p => p.id === formData.projectId);

            const newPayment: ContractorPayment = {
                id: Date.now().toString(),
                paymentNumber: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
                contractorName: contractor?.name || '',
                contractorId: formData.contractorId,
                projectName: project?.name || '',
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
                currency: 'USD',
                paymentMethod: 'bank_transfer',
                paymentDate: '',
                description: '',
                invoiceNumber: '',
                invoiceDate: '',
                notes: ''
            });
            toast.success('Payment request created successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create payment');
        }
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

    const handleUpdate = async () => {
        if (!editingPayment) return;

        try {
            // TODO: Replace with actual API call
            // await axios.put(`/contractor-payments/update/${editingPayment.id}`, {
            //     contractor_id: formData.contractorId,
            //     project_id: formData.projectId,
            //     amount: parseFloat(formData.amount),
            //     currency: formData.currency,
            //     payment_method: formData.paymentMethod,
            //     payment_date: formData.paymentDate,
            //     description: formData.description,
            //     invoice_number: formData.invoiceNumber,
            //     invoice_date: formData.invoiceDate,
            //     notes: formData.notes
            // });

            const contractor = contractors.find(c => c.id === formData.contractorId);
            const project = projects.find(p => p.id === formData.projectId);

            const updatedPayments = payments.map(p =>
                p.id === editingPayment.id ? { 
                    ...p, 
                    contractorId: formData.contractorId,
                    contractorName: contractor?.name || p.contractorName,
                    projectId: formData.projectId,
                    projectName: project?.name || p.projectName,
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
                currency: 'USD',
                paymentMethod: 'bank_transfer',
                paymentDate: '',
                description: '',
                invoiceNumber: '',
                invoiceDate: '',
                notes: ''
            });
            toast.success('Payment updated successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update payment');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this payment?')) {
            return;
        }

        try {
            // TODO: Replace with actual API call
            // await axios.delete(`/contractor-payments/delete/${id}`);

            setPayments(payments.filter(p => p.id !== id));
            toast.success('Payment deleted successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete payment');
        }
    };

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            // TODO: Replace with actual API call
            // await dispatch(fetchContractorPayments({ page, limit, search: searchTerm }));
            await dispatch(fetchContractors({ page: 1, limit: 1000 }));
            await dispatch(fetchProjects({ page: 1, limit: 1000 }));
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
            // TODO: Replace with actual API call
            // const { data } = await axios.get('/contractor-payments/fetch', {
            //     params: {
            //         search: searchTerm,
            //         status: statusFilter !== 'all' ? statusFilter : undefined,
            //         method: methodFilter !== 'all' ? methodFilter : undefined,
            //         limit: 10000,
            //         page: 1
            //     }
            // });

            const headers = ['Payment Number', 'Contractor', 'Project', 'Amount', 'Currency', 'Payment Method', 'Payment Date', 'Status', 'Invoice Number', 'Invoice Date'];
            const csvHeaders = headers.join(',');
            const csvRows = filteredPayments.map((p: ContractorPayment) => {
                return [
                    p.paymentNumber,
                    escapeCsv(p.contractorName),
                    escapeCsv(p.projectName),
                    p.amount,
                    p.currency,
                    p.paymentMethod,
                    p.paymentDate,
                    p.status,
                    p.invoiceNumber,
                    p.invoiceDate
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contractor_payments_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    function escapeCsv(val: any) {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

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

    const columns: Column<ContractorPayment>[] = [
        {
            key: 'paymentNumber' as keyof ContractorPayment,
            header: 'Payment Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true
        },
        {
            key: 'contractorName' as keyof ContractorPayment,
            header: 'Contractor',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{payment.contractorName}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{payment.contractorId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'projectName' as keyof ContractorPayment,
            header: 'Project',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{payment.projectName}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{payment.projectId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'amount' as keyof ContractorPayment,
            header: 'Amount',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatNumber(value)} {payment.currency}
                    </span>
                </div>
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
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">
                    {value ? new Date(value).toLocaleDateString('en-US') : '-'}
                </span>
            ),
            sortable: true
        },
        {
            key: 'invoiceNumber' as keyof ContractorPayment,
            header: 'Invoice',
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{payment.invoiceNumber || '-'}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        {payment.invoiceDate ? new Date(payment.invoiceDate).toLocaleDateString('en-US') : '-'}
                    </div>
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

    const actions: Action<ContractorPayment>[] = [
        {
            label: 'View Details',
            onClick: (payment: ContractorPayment) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Payment',
            onClick: (payment: ContractorPayment) => handleEdit(payment),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Approve Payment',
            onClick: (payment: ContractorPayment) => handleStatusChange(payment.id, 'approved'),
            icon: <CheckCircle className="h-4 w-4" />,
            variant: 'success' as const,
            hidden: (payment: ContractorPayment) => payment.status !== 'pending'
        },
        {
            label: 'Mark as Paid',
            onClick: (payment: ContractorPayment) => handleStatusChange(payment.id, 'paid'),
            icon: <DollarSign className="h-4 w-4" />,
            variant: 'success' as const,
            hidden: (payment: ContractorPayment) => payment.status !== 'approved'
        },
        {
            label: 'Reject Payment',
            onClick: (payment: ContractorPayment) => handleStatusChange(payment.id, 'rejected'),
            icon: <XCircle className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (payment: ContractorPayment) => payment.status === 'paid' || payment.status === 'rejected'
        },
        {
            label: 'Delete Payment',
            onClick: (payment: ContractorPayment) => handleDelete(payment.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = useMemo(() => [
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
    ], [filteredPayments, totalAmount, paidAmount, pendingAmount]);

    const filterOptions = [
        {
            key: 'contractor',
            label: 'Contractor',
            value: contractorFilter,
            options: [
                { key: 'all', label: 'All Contractors', value: 'all' },
                ...contractors.map(contractor => ({ key: contractor.id, label: contractor.name, value: contractor.id }))
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


    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Contractor Payments</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage contractor payments with comprehensive tracking and approval workflow</p>
                </div>
                <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Payment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Payments"
                    description="All payments in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: filteredPayments.length,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Amount"
                    description="Sum of all payments"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalAmount,
                        badge: formatNumber(totalAmount),
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Paid Amount"
                    description="Successfully paid payments"
                    variant="default"
                    size="sm"
                    stats={{
                        total: paidAmount,
                        badge: formatNumber(paidAmount),
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Pending Amount"
                    description="Awaiting approval"
                    variant="default"
                    size="sm"
                    stats={{
                        total: pendingAmount,
                        badge: formatNumber(pendingAmount),
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by payment number, contractor, project, or invoice..."
                searchValue={searchTerm}
                onSearchChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                }}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setContractorFilter('all');
                    setStatusFilter('all');
                    setMethodFilter('all');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing}
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

            {/* Payments Table */}
            <EnhancedCard
                title="Payment Overview"
                description={`${filteredPayments.length} payments out of ${payments.length} total`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={filteredPayments}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredPayments.length / limit),
                        pageSize: limit,
                        totalItems: filteredPayments.length,
                        onPageChange: setPage
                    }}
                    noDataMessage="No payments found matching your search criteria"
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
                            <Label htmlFor="contractorId">Contractor *</Label>
                            <Select value={formData.contractorId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
                                    <SelectValue placeholder="Select Contractor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contractorsLoading ? (
                                        <SelectItem value="loading" disabled>Loading contractors...</SelectItem>
                                    ) : contractors.length === 0 ? (
                                        <SelectItem value="none" disabled>No contractors available</SelectItem>
                                    ) : (
                                        contractors.map(contractor => (
                                            <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="projectId">Project *</Label>
                            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projectsLoading ? (
                                        <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                                    ) : projects.length === 0 ? (
                                        <SelectItem value="none" disabled>No projects available</SelectItem>
                                    ) : (
                                        projects.map(project => (
                                            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                        ))
                                    )}
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
                                <Label htmlFor="currency">Currency *</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map(currency => (
                                            <SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="paymentMethod">Payment Method *</Label>
                            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
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
                            <Label htmlFor="paymentDate">Payment Date *</Label>
                            <Input
                                id="paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500"
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
                            <Label htmlFor="edit-contractorId">Contractor *</Label>
                            <Select value={formData.contractorId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {contractors.map(contractor => (
                                        <SelectItem key={contractor.id} value={contractor.id}>{contractor.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-projectId">Project *</Label>
                            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
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
                                <Label htmlFor="edit-currency">Currency *</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map(currency => (
                                            <SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-paymentMethod">Payment Method *</Label>
                            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500">
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
                            <Label htmlFor="edit-paymentDate">Payment Date *</Label>
                            <Input
                                id="edit-paymentDate"
                                type="date"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500"
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