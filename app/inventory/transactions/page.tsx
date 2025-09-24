'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Eye, Edit, Trash2, TrendingUp, TrendingDown, Download, Filter, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

interface InventoryTransaction {
    id: string;
    transactionNumber: string;
    date: string;
    itemId: string;
    itemName: string;
    itemCode: string;
    transactionType: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    unit: string;
    unitPrice: number;
    totalValue: number;
    currency: string;
    fromLocation: string;
    toLocation: string;
    projectId: string;
    projectName: string;
    contractorId: string;
    contractorName: string;
    reference: string;
    notes: string;
    status: 'pending' | 'approved' | 'completed' | 'rejected';
    createdBy: string;
    approvedBy: string;
    approvalDate: string;
}

const mockTransactions: InventoryTransaction[] = [
    {
        id: '1',
        transactionNumber: 'TRN-001',
        date: '2024-01-15',
        itemId: 'ITM-001',
        itemName: 'Office Chair',
        itemCode: 'ITM-001',
        transactionType: 'in',
        quantity: 50,
        unit: 'piece',
        unitPrice: 450,
        totalValue: 22500,
        currency: '',
        fromLocation: 'Supplier',
        toLocation: 'Warehouse A',
        projectId: 'PRJ-001',
        projectName: 'Office Building',
        contractorId: '',
        contractorName: '',
        reference: 'PO-2024-001',
        notes: 'New stock received from supplier',
        status: 'completed',
        createdBy: 'Ahmed Ali',
        approvedBy: 'Fatima Mohamed',
        approvalDate: '2024-01-15'
    },
    {
        id: '2',
        transactionNumber: 'TRN-002',
        date: '2024-01-16',
        itemId: 'ITM-002',
        itemName: 'A4 Paper',
        itemCode: 'ITM-002',
        transactionType: 'out',
        quantity: 10,
        unit: 'ream',
        unitPrice: 25,
        totalValue: 250,
        currency: '',
        fromLocation: 'Warehouse B',
        toLocation: 'Office',
        projectId: 'PRJ-001',
        projectName: 'Office Building',
        contractorId: '',
        contractorName: '',
        reference: 'REQ-2024-001',
        notes: 'Office supplies distribution',
        status: 'completed',
        createdBy: 'Omar Hassan',
        approvedBy: 'Sara Ahmed',
        approvalDate: '2024-01-16'
    },
    {
        id: '3',
        transactionNumber: 'TRN-003',
        date: '2024-01-17',
        itemId: 'ITM-003',
        itemName: 'Laptop Computer',
        itemCode: 'ITM-003',
        transactionType: 'transfer',
        quantity: 5,
        unit: 'piece',
        unitPrice: 2500,
        totalValue: 12500,
        currency: '',
        fromLocation: 'Warehouse A',
        toLocation: 'Warehouse B',
        projectId: 'PRJ-002',
        projectName: 'IT Department',
        contractorId: '',
        contractorName: '',
        reference: 'TRF-2024-001',
        notes: 'Internal transfer between warehouses',
        status: 'pending',
        createdBy: 'Mohammed Saleh',
        approvedBy: '',
        approvalDate: ''
    },
    {
        id: '4',
        transactionNumber: 'TRN-004',
        date: '2024-01-18',
        itemId: 'ITM-004',
        itemName: 'Printer Toner',
        itemCode: 'ITM-004',
        transactionType: 'adjustment',
        quantity: -2,
        unit: 'piece',
        unitPrice: 120,
        totalValue: -240,
        currency: '',
        fromLocation: 'Warehouse B',
        toLocation: 'Warehouse B',
        projectId: '',
        projectName: '',
        contractorId: '',
        contractorName: '',
        reference: 'ADJ-2024-001',
        notes: 'Stock adjustment due to damaged items',
        status: 'approved',
        createdBy: 'Fatima Mohamed',
        approvedBy: 'Ahmed Ali',
        approvalDate: '2024-01-18'
    }
];

const items = ['Office Chair', 'A4 Paper', 'Laptop Computer', 'Printer Toner', 'Desk Lamp', 'Monitor', 'Keyboard', 'Mouse'];
const locations = ['Warehouse A', 'Warehouse B', 'Storage Room', 'Office', 'Maintenance Room', 'Supplier'];
const projects = ['Office Building', 'IT Department', 'Warehouse Construction', 'Residential Complex', 'Shopping Mall'];
const contractors = ['ABC Construction', 'XYZ Electrical', 'Green Landscaping', 'Modern Plumbing', 'Quality Painters'];
const transactionTypes = [
    { value: 'in', label: 'Stock In', icon: <ArrowDown className="h-4 w-4" /> },
    { value: 'out', label: 'Stock Out', icon: <ArrowUp className="h-4 w-4" /> },
    { value: 'transfer', label: 'Transfer', icon: <ArrowUpDown className="h-4 w-4" /> },
    { value: 'adjustment', label: 'Adjustment', icon: <Package className="h-4 w-4" /> }
];

export default function InventoryTransactionsPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>(mockTransactions);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<InventoryTransaction | null>(null);
    const [formData, setFormData] = useState({
        date: '',
        itemId: '',
        itemName: '',
        itemCode: '',
        transactionType: 'in',
        quantity: '',
        unit: 'piece',
        unitPrice: '',
        currency: '',
        fromLocation: '',
        toLocation: '',
        projectId: '',
        contractorId: '',
        reference: '',
        notes: ''
    });

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || transaction.transactionType === typeFilter;
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        const matchesLocation = locationFilter === 'all' || 
                               transaction.fromLocation === locationFilter || 
                               transaction.toLocation === locationFilter;
        
        return matchesSearch && matchesType && matchesStatus && matchesLocation;
    });

    const handleCreate = () => {
        if (!formData.date || !formData.itemName || !formData.quantity || !formData.unitPrice) {
            toast.error('Please fill in all required fields');
            return;
        }

        const quantity = parseFloat(formData.quantity);
        const unitPrice = parseFloat(formData.unitPrice);
        const totalValue = quantity * unitPrice;

        const newTransaction: InventoryTransaction = {
            id: Date.now().toString(),
            transactionNumber: `TRN-${String(transactions.length + 1).padStart(3, '0')}`,
            date: formData.date,
            itemId: formData.itemId,
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            transactionType: formData.transactionType as InventoryTransaction['transactionType'],
            quantity: quantity,
            unit: formData.unit,
            unitPrice: unitPrice,
            totalValue: totalValue,
            currency: formData.currency,
            fromLocation: formData.fromLocation,
            toLocation: formData.toLocation,
            projectId: formData.projectId,
            projectName: projects.find(p => p === formData.projectId) || '',
            contractorId: formData.contractorId,
            contractorName: contractors.find(c => c === formData.contractorId) || '',
            reference: formData.reference,
            notes: formData.notes,
            status: 'pending',
            createdBy: 'Current User',
            approvedBy: '',
            approvalDate: ''
        };

        setTransactions([...transactions, newTransaction]);
        setIsCreateDialogOpen(false);
        setFormData({
            date: '',
            itemId: '',
            itemName: '',
            itemCode: '',
            transactionType: 'in',
            quantity: '',
            unit: 'piece',
            unitPrice: '',
            currency: '',
            fromLocation: '',
            toLocation: '',
            projectId: '',
            contractorId: '',
            reference: '',
            notes: ''
        });
        toast.success('Transaction created successfully');
    };

    const handleEdit = (transaction: InventoryTransaction) => {
        setEditingTransaction(transaction);
        setFormData({
            date: transaction.date,
            itemId: transaction.itemId,
            itemName: transaction.itemName,
            itemCode: transaction.itemCode,
            transactionType: transaction.transactionType,
            quantity: transaction.quantity.toString(),
            unit: transaction.unit,
            unitPrice: transaction.unitPrice.toString(),
            currency: transaction.currency,
            fromLocation: transaction.fromLocation,
            toLocation: transaction.toLocation,
            projectId: transaction.projectId,
            contractorId: transaction.contractorId,
            reference: transaction.reference,
            notes: transaction.notes
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingTransaction) return;

        const quantity = parseFloat(formData.quantity);
        const unitPrice = parseFloat(formData.unitPrice);
        const totalValue = quantity * unitPrice;

        const updatedTransactions = transactions.map(t =>
            t.id === editingTransaction.id ? { 
                ...t, 
                date: formData.date,
                itemId: formData.itemId,
                itemName: formData.itemName,
                itemCode: formData.itemCode,
                transactionType: formData.transactionType as InventoryTransaction['transactionType'],
                quantity: quantity,
                unit: formData.unit,
                unitPrice: unitPrice,
                totalValue: totalValue,
                currency: formData.currency,
                fromLocation: formData.fromLocation,
                toLocation: formData.toLocation,
                projectId: formData.projectId,
                projectName: projects.find(p => p === formData.projectId) || '',
                contractorId: formData.contractorId,
                contractorName: contractors.find(c => c === formData.contractorId) || '',
                reference: formData.reference,
                notes: formData.notes
            } : t
        );

        setTransactions(updatedTransactions);
        setIsEditDialogOpen(false);
        setEditingTransaction(null);
        setFormData({
            date: '',
            itemId: '',
            itemName: '',
            itemCode: '',
            transactionType: 'in',
            quantity: '',
            unit: 'piece',
            unitPrice: '',
            currency: '',
            fromLocation: '',
            toLocation: '',
            projectId: '',
            contractorId: '',
            reference: '',
            notes: ''
        });
        toast.success('Transaction updated successfully');
    };

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success('Transaction deleted successfully');
    };

    const handleStatusChange = (id: string, status: InventoryTransaction['status']) => {
        setTransactions(prev => prev.map(transaction => 
            transaction.id === id 
                ? { 
                    ...transaction, 
                    status: status,
                    approvalDate: status === 'approved' || status === 'completed' ? new Date().toISOString().split('T')[0] : '',
                    approvedBy: status === 'approved' || status === 'completed' ? 'Current User' : ''
                }
                : transaction
        ));
        toast.success(`Transaction ${status} successfully`);
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalTransactions = filteredTransactions.length;
    const totalValue = filteredTransactions.reduce((sum, transaction) => sum + transaction.totalValue, 0);
    const stockInValue = filteredTransactions.filter(t => t.transactionType === 'in').reduce((sum, transaction) => sum + transaction.totalValue, 0);
    const stockOutValue = filteredTransactions.filter(t => t.transactionType === 'out').reduce((sum, transaction) => sum + transaction.totalValue, 0);

    const columns = [
        {
            key: 'transactionNumber' as keyof InventoryTransaction,
            header: 'Transaction Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '140px'
        },
        {
            key: 'date' as keyof InventoryTransaction,
            header: 'Date',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true,
            width: '100px'
        },
        {
            key: 'itemName' as keyof InventoryTransaction,
            header: 'Item',
            render: (value: any, transaction: InventoryTransaction) => (
                <div>
                    <div className="font-semibold text-slate-800">{transaction.itemName}</div>
                    <div className="text-sm text-slate-600">{transaction.itemCode}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'transactionType' as keyof InventoryTransaction,
            header: 'Type',
            render: (value: any) => {
                const typeConfig = transactionTypes.find(t => t.value === value);
                const typeColors = {
                    'in': 'bg-green-50 text-green-700 border-green-200',
                    'out': 'bg-red-50 text-red-700 border-red-200',
                    'transfer': 'bg-blue-50 text-blue-700 border-blue-200',
                    'adjustment': 'bg-yellow-50 text-yellow-700 border-yellow-200'
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
            key: 'quantity' as keyof InventoryTransaction,
            header: 'Quantity',
            render: (value: any, transaction: InventoryTransaction) => {
                const isNegative = value < 0;
                return (
                    <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-slate-800'}`}>
                        {value} {transaction.unit}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'totalValue' as keyof InventoryTransaction,
            header: 'Total Value',
            render: (value: any, transaction: InventoryTransaction) => {
                const isNegative = value < 0;
                return (
                    <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-slate-800'}`}>
                        {formatNumber(value)}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'fromLocation' as keyof InventoryTransaction,
            header: 'From/To',
            render: (value: any, transaction: InventoryTransaction) => (
                <div>
                    <div className="text-sm text-slate-700">{transaction.fromLocation}</div>
                    <div className="text-xs text-slate-500">→ {transaction.toLocation}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'projectName' as keyof InventoryTransaction,
            header: 'Project',
            render: (value: any, transaction: InventoryTransaction) => (
                <div>
                    <div className="font-semibold text-slate-800">{transaction.projectName}</div>
                    <div className="text-sm text-slate-600">{transaction.projectId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'reference' as keyof InventoryTransaction,
            header: 'Reference',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true
        },
        {
            key: 'status' as keyof InventoryTransaction,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'approved': 'bg-blue-100 text-blue-700 border-blue-200',
                    'completed': 'bg-green-100 text-green-700 border-green-200',
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
            onClick: (transaction: InventoryTransaction) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Transaction',
            onClick: (transaction: InventoryTransaction) => handleEdit(transaction),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Transaction',
            onClick: (transaction: InventoryTransaction) => handleStatusChange(transaction.id, 'approved'),
            icon: <TrendingUp className="h-4 w-4" />,
            hidden: (transaction: InventoryTransaction) => transaction.status !== 'pending'
        },
        {
            label: 'Complete Transaction',
            onClick: (transaction: InventoryTransaction) => handleStatusChange(transaction.id, 'completed'),
            icon: <Package className="h-4 w-4" />,
            hidden: (transaction: InventoryTransaction) => transaction.status !== 'approved'
        },
        {
            label: 'Reject Transaction',
            onClick: (transaction: InventoryTransaction) => handleStatusChange(transaction.id, 'rejected'),
            icon: <TrendingDown className="h-4 w-4" />,
            hidden: (transaction: InventoryTransaction) => transaction.status === 'completed' || transaction.status === 'rejected'
        },
        {
            label: 'Delete Transaction',
            onClick: (transaction: InventoryTransaction) => handleDelete(transaction.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Transactions',
            value: totalTransactions,
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Total Value',
            value: formatNumber(totalValue),
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Stock In Value',
            value: formatNumber(stockInValue),
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Stock Out Value',
            value: formatNumber(stockOutValue),
            change: '+6%',
            trend: 'up' as const
        }
    ];

    const filterOptions = [
        {
            key: 'type',
            label: 'Transaction Type',
            value: typeFilter,
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                ...transactionTypes.map(type => ({ key: type.value, label: type.label, value: type.value }))
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
                { key: 'completed', label: 'Completed', value: 'completed' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' }
            ],
            onValueChange: setStatusFilter
        },
        {
            key: 'location',
            label: 'Location',
            value: locationFilter,
            options: [
                { key: 'all', label: 'All Locations', value: 'all' },
                ...locations.map(location => ({ key: location, label: location, value: location }))
            ],
            onValueChange: setLocationFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (typeFilter !== 'all') activeFilters.push(`Type: ${transactionTypes.find(t => t.value === typeFilter)?.label}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
    if (locationFilter !== 'all') activeFilters.push(`Location: ${locationFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Inventory Transactions"
                description="Track all inventory movements with comprehensive transaction management"
                stats={stats}
                actions={{
                    primary: {
                        label: 'New Transaction',
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
                            label: 'Transaction Analysis',
                            onClick: () => toast.info('Transaction analysis coming soon'),
                            icon: <TrendingUp className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by transaction number, item name, or reference..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                    setLocationFilter('all');
                }}
            />

            {/* Transactions Table */}
            <EnhancedCard
                title="Transaction Overview"
                description={`${filteredTransactions.length} transactions out of ${transactions.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: transactions.length,
                    badge: 'Active Transactions',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredTransactions}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No transactions found matching your criteria"
                    searchPlaceholder="Search transactions..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Transaction</DialogTitle>
                        <DialogDescription>
                            Add a new inventory transaction
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
                            <Label htmlFor="itemName">Item Name</Label>
                            <Select value={formData.itemName} onValueChange={(value) => setFormData(prev => ({ ...prev, itemName: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map(item => (
                                        <SelectItem key={item} value={item}>{item}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="itemCode">Item Code</Label>
                                <Input
                                    id="itemCode"
                                    value={formData.itemCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, itemCode: e.target.value }))}
                                    placeholder="Item code"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="transactionType">Transaction Type</Label>
                                <Select value={formData.transactionType} onValueChange={(value) => setFormData(prev => ({ ...prev, transactionType: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transactionTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="unit">Unit</Label>
                                <Input
                                    id="unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                    placeholder="piece"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="unitPrice">Unit Price</Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                            </div>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fromLocation">From Location</Label>
                                <Select value={formData.fromLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, fromLocation: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="toLocation">To Location</Label>
                                <Select value={formData.toLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, toLocation: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <Package className="h-4 w-4 mr-2" />
                                Create Transaction
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Update transaction information and details
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
                            <Label htmlFor="edit-itemName">Item Name</Label>
                            <Select value={formData.itemName} onValueChange={(value) => setFormData(prev => ({ ...prev, itemName: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map(item => (
                                        <SelectItem key={item} value={item}>{item}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-itemCode">Item Code</Label>
                                <Input
                                    id="edit-itemCode"
                                    value={formData.itemCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, itemCode: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-transactionType">Transaction Type</Label>
                                <Select value={formData.transactionType} onValueChange={(value) => setFormData(prev => ({ ...prev, transactionType: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {transactionTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="edit-quantity">Quantity</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-unit">Unit</Label>
                                <Input
                                    id="edit-unit"
                                    value={formData.unit}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-unitPrice">Unit Price</Label>
                                <Input
                                    id="edit-unitPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-fromLocation">From Location</Label>
                                <Select value={formData.fromLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, fromLocation: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-toLocation">To Location</Label>
                                <Select value={formData.toLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, toLocation: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            <Label htmlFor="edit-reference">Reference</Label>
                            <Input
                                id="edit-reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
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
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <Package className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}