'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Plus, Eye, Edit, Trash2, TrendingUp, TrendingDown, Download, Filter, Calendar, CreditCard, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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
const projects = ['Office Building', 'Warehouse Construction', 'Residential Complex', 'Shopping Mall', 'Hospital'];
const contractors = ['ABC Construction', 'XYZ Electrical', 'Green Landscaping', 'Modern Plumbing', 'Quality Painters'];
const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'card', label: 'Credit Card' }
];

export default function CashLedgerPage() {
    const [entries, setEntries] = useState<CashLedgerEntry[]>(mockEntries);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<CashLedgerEntry | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        description: '',
        type: 'expense',
        category: '',
        amount: '',
        currency: '',
        paymentMethod: 'cash',
        reference: '',
        projectId: '',
        contractorId: '',
        notes: ''
    });

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || entry.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
        
        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    const handleCreate = () => {
        if (!formData.date || !formData.description || !formData.category || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

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
            projectName: projects.find(p => p === formData.projectId) || '',
            contractorId: formData.contractorId,
            contractorName: contractors.find(c => c === formData.contractorId) || '',
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
            currency: '',
            paymentMethod: 'cash',
            reference: '',
            projectId: '',
            contractorId: '',
            notes: ''
        });
        toast.success('Cash ledger entry created successfully');
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

    const handleUpdate = () => {
        if (!editingEntry) return;

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
                projectName: projects.find(p => p === formData.projectId) || '',
                contractorId: formData.contractorId,
                contractorName: contractors.find(c => c === formData.contractorId) || '',
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
            currency: '',
            paymentMethod: 'cash',
            reference: '',
            projectId: '',
            contractorId: '',
            notes: ''
        });
        toast.success('Cash ledger entry updated successfully');
    };

    const handleDelete = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
        toast.success('Cash ledger entry deleted successfully');
    };

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

    const totalIncome = filteredEntries.filter(e => e.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = filteredEntries.filter(e => e.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const pendingAmount = filteredEntries.filter(e => e.status === 'pending').reduce((sum, entry) => sum + entry.amount, 0);

    const columns = [
        {
            key: 'entryNumber' as keyof CashLedgerEntry,
            header: 'Entry Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '120px'
        },
        {
            key: 'date' as keyof CashLedgerEntry,
            header: 'Date',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true,
            width: '100px'
        },
        {
            key: 'description' as keyof CashLedgerEntry,
            header: 'Description',
            render: (value: any, entry: CashLedgerEntry) => (
                <div>
                    <div className="font-semibold text-slate-800">{entry.description}</div>
                    <div className="text-sm text-slate-600">{entry.category}</div>
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
                    <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{formatNumber(value)}
                    </span>
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
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true
        },
        {
            key: 'projectName' as keyof CashLedgerEntry,
            header: 'Project',
            render: (value: any, entry: CashLedgerEntry) => (
                <div>
                    <div className="font-semibold text-slate-800">{entry.projectName}</div>
                    <div className="text-sm text-slate-600">{entry.projectId}</div>
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

    const actions = [
        {
            label: 'View Details',
            onClick: (entry: CashLedgerEntry) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Entry',
            onClick: (entry: CashLedgerEntry) => handleEdit(entry),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Entry',
            onClick: (entry: CashLedgerEntry) => handleStatusChange(entry.id, 'approved'),
            icon: <TrendingUp className="h-4 w-4" />,
            hidden: (entry: CashLedgerEntry) => entry.status !== 'pending'
        },
        {
            label: 'Reject Entry',
            onClick: (entry: CashLedgerEntry) => handleStatusChange(entry.id, 'rejected'),
            icon: <TrendingDown className="h-4 w-4" />,
            hidden: (entry: CashLedgerEntry) => entry.status === 'approved' || entry.status === 'rejected'
        },
        {
            label: 'Delete Entry',
            onClick: (entry: CashLedgerEntry) => handleDelete(entry.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
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
    ];

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

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (typeFilter !== 'all') activeFilters.push(`Type: ${typeFilter}`);
    if (categoryFilter !== 'all') activeFilters.push(`Category: ${categoryFilter}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Cash Ledger"
                description="Track all cash transactions with comprehensive income and expense management"
                stats={stats}
                actions={{
                    primary: {
                        label: 'New Entry',
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
                            label: 'Financial Analysis',
                            onClick: () => toast.info('Financial analysis coming soon'),
                            icon: <TrendingUp className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by entry number, description, category, or reference..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                }}
            />

            {/* Entries Table */}
            <EnhancedCard
                title="Cash Ledger Overview"
                description={`${filteredEntries.length} entries out of ${entries.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: entries.length,
                    badge: 'Active Entries',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredEntries}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No entries found matching your criteria"
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
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Entry description"
                                rows={3}
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
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <Label htmlFor="reference">Reference</Label>
                            <Input
                                id="reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                placeholder="Transaction reference"
                                className="mt-1"
                            />
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
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
                                <Label htmlFor="edit-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <Label htmlFor="edit-reference">Reference</Label>
                            <Input
                                id="edit-reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                className="mt-1"
                            />
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