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
import { Wallet, Plus, Eye, Edit, Trash2, TrendingUp, TrendingDown, Download, Filter, Calendar, CreditCard, DollarSign, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { fetchContractors, selectContractors, selectLoading as selectContractorsLoading } from '@/stores/slices/contractors';
import { fetchProjects, selectProjects, selectLoading as selectProjectsLoading } from '@/stores/slices/projects';
import axios from '@/utils/axios';

interface CashLedgerEntry {
    id: string;
    entryNumber: string;
    date: string;
    description: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    currency: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card';
    reference: string;
    projectId: string;
    projectName: string;
    contractorId: string;
    contractorName: string;
    status: 'pending' | 'approved' | 'rejected';
    createdBy: string;
    approvedBy: string;
    approvalDate: string;
    notes: string;
    balance: number;
}

const mockEntries: CashLedgerEntry[] = [
    {
        id: '1',
        entryNumber: 'CL-001',
        date: '2024-01-15',
        description: 'Office rent payment',
        type: 'expense',
        category: 'Rent',
        amount: 5000,
        currency: '',
        paymentMethod: 'bank_transfer',
        reference: 'TXN-001',
        projectId: 'PRJ-001',
        projectName: 'Office Building',
        contractorId: '',
        contractorName: '',
        status: 'approved',
        createdBy: 'Ahmed Ali',
        approvedBy: 'Fatima Mohamed',
        approvalDate: '2024-01-15',
        notes: 'Monthly office rent',
        balance: 95000
    },
    {
        id: '2',
        entryNumber: 'CL-002',
        date: '2024-01-16',
        description: 'Contractor payment for foundation work',
        type: 'expense',
        category: 'Contractor Payment',
        amount: 25000,
        currency: '',
        paymentMethod: 'check',
        reference: 'CHK-001',
        projectId: 'PRJ-001',
        projectName: 'Office Building',
        contractorId: 'CTR-001',
        contractorName: 'ABC Construction',
        status: 'approved',
        createdBy: 'Omar Hassan',
        approvedBy: 'Sara Ahmed',
        approvalDate: '2024-01-16',
        notes: 'Foundation work completion',
        balance: 70000
    },
    {
        id: '3',
        entryNumber: 'CL-003',
        date: '2024-01-17',
        description: 'Client payment received',
        type: 'income',
        category: 'Client Payment',
        amount: 100000,
        currency: '',
        paymentMethod: 'bank_transfer',
        reference: 'TXN-002',
        projectId: 'PRJ-001',
        projectName: 'Office Building',
        contractorId: '',
        contractorName: '',
        status: 'approved',
        createdBy: 'Mohammed Saleh',
        approvedBy: 'Ahmed Ali',
        approvalDate: '2024-01-17',
        notes: 'Progress payment from client',
        balance: 170000
    },
    {
        id: '4',
        entryNumber: 'CL-004',
        date: '2024-01-18',
        description: 'Equipment purchase',
        type: 'expense',
        category: 'Equipment',
        amount: 15000,
        currency: '',
        paymentMethod: 'card',
        reference: 'CARD-001',
        projectId: 'PRJ-002',
        projectName: 'Warehouse Construction',
        contractorId: '',
        contractorName: '',
        status: 'pending',
        createdBy: 'Fatima Mohamed',
        approvedBy: '',
        approvalDate: '',
        notes: 'Construction equipment',
        balance: 155000
    }
];

const categories = ['Rent', 'Contractor Payment', 'Client Payment', 'Equipment', 'Materials', 'Utilities', 'Salaries', 'Insurance', 'Transportation', 'Other'];
const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
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

export default function CashLedgerPage() {
    const dispatch = useReduxDispatch<AppDispatch>();
    const contractors = useSelector(selectContractors);
    const projects = useSelector(selectProjects);
    const contractorsLoading = useSelector(selectContractorsLoading);
    const projectsLoading = useSelector(selectProjectsLoading);

    const [entries, setEntries] = useState<CashLedgerEntry[]>(mockEntries);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<CashLedgerEntry | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        type: 'expense',
        category: '',
        amount: '',
        currency: 'USD',
        paymentMethod: 'cash',
        reference: '',
        projectId: '',
        contractorId: '',
        notes: ''
    });

    // Fetch contractors and projects on mount
    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const matchesSearch = entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || entry.type === typeFilter;
            const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
            
            return matchesSearch && matchesType && matchesCategory && matchesStatus;
        });
    }, [entries, searchTerm, typeFilter, categoryFilter, statusFilter]);

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (searchTerm) arr.push(`Search: ${searchTerm}`);
        if (typeFilter !== 'all') arr.push(`Type: ${typeFilter}`);
        if (categoryFilter !== 'all') arr.push(`Category: ${categoryFilter}`);
        if (statusFilter !== 'all') arr.push(`Status: ${statusFilter}`);
        return arr;
    }, [searchTerm, typeFilter, categoryFilter, statusFilter]);

    const handleCreate = async () => {
        if (!formData.date || !formData.description || !formData.category || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // TODO: Replace with actual API call
            // const response = await axios.post('/cash-ledger/create', {
            //     date: formData.date,
            //     description: formData.description,
            //     type: formData.type,
            //     category: formData.category,
            //     amount: parseFloat(formData.amount),
            //     currency: formData.currency,
            //     payment_method: formData.paymentMethod,
            //     reference: formData.reference,
            //     project_id: formData.projectId,
            //     contractor_id: formData.contractorId,
            //     notes: formData.notes
            // });

            const project = projects.find(p => p.id === formData.projectId);
            const contractor = contractors.find(c => c.id === formData.contractorId);

            const newEntry: CashLedgerEntry = {
                id: Date.now().toString(),
                entryNumber: `CL-${String(entries.length + 1).padStart(3, '0')}`,
                date: formData.date,
                description: formData.description,
                type: formData.type as CashLedgerEntry['type'],
                category: formData.category,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                paymentMethod: formData.paymentMethod as CashLedgerEntry['paymentMethod'],
                reference: formData.reference,
                projectId: formData.projectId,
                projectName: project?.name || '',
                contractorId: formData.contractorId,
                contractorName: contractor?.name || '',
                status: 'pending',
                createdBy: 'Current User',
                approvedBy: '',
                approvalDate: '',
                notes: formData.notes,
                balance: 0 // Will be calculated based on previous entries
            };

            setEntries([...entries, newEntry]);
            setIsCreateDialogOpen(false);
            setFormData({
                date: '',
                description: '',
                type: 'expense',
                category: '',
                amount: '',
                currency: 'USD',
                paymentMethod: 'cash',
                reference: '',
                projectId: '',
                contractorId: '',
                notes: ''
            });
            toast.success('Cash ledger entry created successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create entry');
        }
    };

    const handleEdit = (entry: CashLedgerEntry) => {
        setEditingEntry(entry);
        setFormData({
            date: entry.date,
            description: entry.description,
            type: entry.type,
            category: entry.category,
            amount: entry.amount.toString(),
            currency: entry.currency,
            paymentMethod: entry.paymentMethod,
            reference: entry.reference,
            projectId: entry.projectId,
            contractorId: entry.contractorId,
            notes: entry.notes
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingEntry) return;

        try {
            // TODO: Replace with actual API call
            // await axios.put(`/cash-ledger/update/${editingEntry.id}`, {
            //     date: formData.date,
            //     description: formData.description,
            //     type: formData.type,
            //     category: formData.category,
            //     amount: parseFloat(formData.amount),
            //     currency: formData.currency,
            //     payment_method: formData.paymentMethod,
            //     reference: formData.reference,
            //     project_id: formData.projectId,
            //     contractor_id: formData.contractorId,
            //     notes: formData.notes
            // });

            const project = projects.find(p => p.id === formData.projectId);
            const contractor = contractors.find(c => c.id === formData.contractorId);

            const updatedEntries = entries.map(e =>
                e.id === editingEntry.id ? { 
                    ...e, 
                    date: formData.date,
                    description: formData.description,
                    type: formData.type as CashLedgerEntry['type'],
                    category: formData.category,
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    paymentMethod: formData.paymentMethod as CashLedgerEntry['paymentMethod'],
                    reference: formData.reference,
                    projectId: formData.projectId,
                    projectName: project?.name || e.projectName,
                    contractorId: formData.contractorId,
                    contractorName: contractor?.name || e.contractorName,
                    notes: formData.notes
                } : e
            );

            setEntries(updatedEntries);
            setIsEditDialogOpen(false);
            setEditingEntry(null);
            setFormData({
                date: '',
                description: '',
                type: 'expense',
                category: '',
                amount: '',
                currency: 'USD',
                paymentMethod: 'cash',
                reference: '',
                projectId: '',
                contractorId: '',
                notes: ''
            });
            toast.success('Cash ledger entry updated successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update entry');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        try {
            // TODO: Replace with actual API call
            // await axios.delete(`/cash-ledger/delete/${id}`);

            setEntries(entries.filter(e => e.id !== id));
            toast.success('Cash ledger entry deleted successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete entry');
        }
    };

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            // TODO: Replace with actual API call
            // await dispatch(fetchCashLedgerEntries({ page, limit, search: searchTerm }));
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
            // const { data } = await axios.get('/cash-ledger/fetch', {
            //     params: {
            //         search: searchTerm,
            //         type: typeFilter !== 'all' ? typeFilter : undefined,
            //         category: categoryFilter !== 'all' ? categoryFilter : undefined,
            //         status: statusFilter !== 'all' ? statusFilter : undefined,
            //         limit: 10000,
            //         page: 1
            //     }
            // });

            const headers = ['Entry Number', 'Date', 'Description', 'Type', 'Category', 'Amount', 'Currency', 'Payment Method', 'Reference', 'Project', 'Contractor', 'Status'];
            const csvHeaders = headers.join(',');
            const csvRows = filteredEntries.map((e: CashLedgerEntry) => {
                return [
                    e.entryNumber,
                    e.date,
                    escapeCsv(e.description),
                    e.type,
                    escapeCsv(e.category),
                    e.amount,
                    e.currency,
                    e.paymentMethod,
                    e.reference,
                    escapeCsv(e.projectName),
                    escapeCsv(e.contractorName),
                    e.status
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cash_ledger_${new Date().toISOString().slice(0,10)}.csv`;
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

    const handleStatusChange = (id: string, status: CashLedgerEntry['status']) => {
        setEntries(prev => prev.map(entry => 
            entry.id === id 
                ? { 
                    ...entry, 
                    status: status,
                    approvalDate: status === 'approved' ? new Date().toISOString().split('T')[0] : '',
                    approvedBy: status === 'approved' ? 'Current User' : ''
                }
                : entry
        ));
        toast.success(`Entry ${status} successfully`);
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalIncome = useMemo(() => 
        filteredEntries.filter(e => e.type === 'income').reduce((sum, entry) => sum + entry.amount, 0),
        [filteredEntries]
    );
    const totalExpense = useMemo(() => 
        filteredEntries.filter(e => e.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0),
        [filteredEntries]
    );
    const netBalance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);
    const pendingAmount = useMemo(() => 
        filteredEntries.filter(e => e.status === 'pending').reduce((sum, entry) => sum + entry.amount, 0),
        [filteredEntries]
    );

    const columns: Column<CashLedgerEntry>[] = [
        {
            key: 'entryNumber' as keyof CashLedgerEntry,
            header: 'Entry Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true
        },
        {
            key: 'date' as keyof CashLedgerEntry,
            header: 'Date',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">
                    {value ? new Date(value).toLocaleDateString('en-US') : '-'}
                </span>
            ),
            sortable: true
        },
        {
            key: 'description' as keyof CashLedgerEntry,
            header: 'Description',
            render: (value: any, entry: CashLedgerEntry) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{entry.description}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{entry.category}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'type' as keyof CashLedgerEntry,
            header: 'Type',
            render: (value: any) => {
                const isIncome = value === 'income';
                return (
                    <Badge variant="outline" className={`${isIncome ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} font-medium`}>
                        {isIncome ? (
                            <>
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Income
                            </>
                        ) : (
                            <>
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Expense
                            </>
                        )}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'amount' as keyof CashLedgerEntry,
            header: 'Amount',
            render: (value: any, entry: CashLedgerEntry) => {
                const isIncome = entry.type === 'income';
                return (
                    <div>
                        <span className={`font-semibold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isIncome ? '+' : '-'}{formatNumber(value)} {entry.currency}
                        </span>
                    </div>
                );
            },
            sortable: true
        },
        {
            key: 'paymentMethod' as keyof CashLedgerEntry,
            header: 'Payment Method',
            render: (value: any) => {
                const methodLabels = {
                    'cash': 'Cash',
                    'bank_transfer': 'Bank Transfer',
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
            key: 'reference' as keyof CashLedgerEntry,
            header: 'Reference',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value || '-'}</span>,
            sortable: true
        },
        {
            key: 'projectName' as keyof CashLedgerEntry,
            header: 'Project',
            render: (value: any, entry: CashLedgerEntry) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{entry.projectName || '-'}</div>
                    {entry.projectId && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">{entry.projectId}</div>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof CashLedgerEntry,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'approved': 'bg-green-100 text-green-700 border-green-200',
                    'rejected': 'bg-red-100 text-red-700 border-red-200'
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

    const actions: Action<CashLedgerEntry>[] = [
        {
            label: 'View Details',
            onClick: (entry: CashLedgerEntry) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Entry',
            onClick: (entry: CashLedgerEntry) => handleEdit(entry),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Approve Entry',
            onClick: (entry: CashLedgerEntry) => handleStatusChange(entry.id, 'approved'),
            icon: <TrendingUp className="h-4 w-4" />,
            variant: 'success' as const,
            hidden: (entry: CashLedgerEntry) => entry.status !== 'pending'
        },
        {
            label: 'Reject Entry',
            onClick: (entry: CashLedgerEntry) => handleStatusChange(entry.id, 'rejected'),
            icon: <TrendingDown className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (entry: CashLedgerEntry) => entry.status === 'approved' || entry.status === 'rejected'
        },
        {
            label: 'Delete Entry',
            onClick: (entry: CashLedgerEntry) => handleDelete(entry.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = useMemo(() => [
        {
            label: 'Total Income',
            value: formatNumber(totalIncome),
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Total Expenses',
            value: formatNumber(totalExpense),
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Net Balance',
            value: formatNumber(netBalance),
            change: netBalance >= 0 ? '+12%' : '-5%',
            trend: netBalance >= 0 ? 'up' as const : 'down' as const
        },
        {
            label: 'Pending Amount',
            value: formatNumber(pendingAmount),
            change: '-3%',
            trend: 'down' as const
        }
    ], [totalIncome, totalExpense, netBalance, pendingAmount]);

    const filterOptions = [
        {
            key: 'type',
            label: 'Type',
            value: typeFilter,
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                { key: 'income', label: 'Income', value: 'income' },
                { key: 'expense', label: 'Expense', value: 'expense' }
            ],
            onValueChange: setTypeFilter
        },
        {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            options: [
                { key: 'all', label: 'All Categories', value: 'all' },
                ...categories.map(category => ({ key: category, label: category, value: category }))
            ],
            onValueChange: setCategoryFilter
        },
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'pending', label: 'Pending', value: 'pending' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' }
            ],
            onValueChange: setStatusFilter
        }
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Cash Ledger</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Track all cash transactions with comprehensive income and expense management</p>
                </div>
                <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Entry
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Income"
                    description="All income entries"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalIncome,
                        badge: formatNumber(totalIncome),
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Expenses"
                    description="All expense entries"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalExpense,
                        badge: formatNumber(totalExpense),
                        badgeColor: 'error'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Net Balance"
                    description="Income minus expenses"
                    variant="default"
                    size="sm"
                    stats={{
                        total: netBalance,
                        badge: formatNumber(netBalance),
                        badgeColor: netBalance >= 0 ? 'success' : 'error'
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
                searchPlaceholder="Search by entry number, description, category, or reference..."
                searchValue={searchTerm}
                onSearchChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                }}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Entries Table */}
            <EnhancedCard
                title="Cash Ledger Overview"
                description={`${filteredEntries.length} entries out of ${entries.length} total`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={filteredEntries}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredEntries.length / limit),
                        pageSize: limit,
                        totalItems: filteredEntries.length,
                        onPageChange: setPage
                    }}
                    noDataMessage="No entries found matching your search criteria"
                    searchPlaceholder="Search entries..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Entry</DialogTitle>
                        <DialogDescription>
                            Add a new cash ledger entry
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Entry description"
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">Type *</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency *</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                            <Label htmlFor="reference">Reference</Label>
                            <Input
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                placeholder="Transaction reference"
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="projectId">Project</Label>
                            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                        <div>
                            <Label htmlFor="contractorId">Contractor</Label>
                            <Select value={formData.contractorId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={2}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                                <Wallet className="h-4 w-4 mr-2" />
                                Create Entry
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Entry</DialogTitle>
                        <DialogDescription>
                            Update cash ledger entry information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-date">Date *</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description *</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-type">Type *</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-category">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-amount">Amount *</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-currency">Currency *</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                            <Label htmlFor="edit-reference">Reference</Label>
                            <Input
                                id="edit-reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-projectId">Project</Label>
                            <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-contractorId">Contractor</Label>
                            <Select value={formData.contractorId} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorId: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={2}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                                <Wallet className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}