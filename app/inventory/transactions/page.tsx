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
import { ArrowUpDown, Plus, Search, Eye, Edit, Trash2, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryTransaction {
    id: string;
    transactionNumber: string;
    itemCode: string;
    itemName: string;
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    unit: string;
    unitPrice: number;
    totalValue: number;
    currency: string;
    reason: string;
    reference?: string;
    fromLocation?: string;
    toLocation?: string;
    status: 'pending' | 'approved' | 'completed' | 'cancelled';
    transactionDate: string;
    createdBy: string;
    approvedBy?: string;
    notes?: string;
}

const mockTransactions: InventoryTransaction[] = [
    {
        id: '1',
        transactionNumber: 'TXN-001',
        itemCode: 'ITM-001',
        itemName: 'Office Chair',
        type: 'in',
        quantity: 10,
        unit: 'piece',
        unitPrice: 450,
        totalValue: 4500,
        currency: 'SAR',
        reason: 'Purchase',
        reference: 'PO-2024-001',
        toLocation: 'Warehouse A',
        status: 'completed',
        transactionDate: '2024-01-15',
        createdBy: 'Ahmed Ali',
        approvedBy: 'Warehouse Manager'
    },
    {
        id: '2',
        transactionNumber: 'TXN-002',
        itemCode: 'ITM-002',
        itemName: 'A4 Paper',
        type: 'out',
        quantity: 5,
        unit: 'ream',
        unitPrice: 25,
        totalValue: 125,
        currency: 'SAR',
        reason: 'Office Use',
        fromLocation: 'Warehouse B',
        status: 'completed',
        transactionDate: '2024-01-14',
        createdBy: 'Fatima Mohamed',
        approvedBy: 'Office Manager'
    },
    {
        id: '3',
        transactionNumber: 'TXN-003',
        itemCode: 'ITM-003',
        itemName: 'Laptop Computer',
        type: 'transfer',
        quantity: 2,
        unit: 'piece',
        unitPrice: 2500,
        totalValue: 5000,
        currency: 'SAR',
        reason: 'Department Transfer',
        reference: 'TRF-2024-001',
        fromLocation: 'Warehouse A',
        toLocation: 'IT Department',
        status: 'pending',
        transactionDate: '2024-01-16',
        createdBy: 'Omar Hassan'
    },
    {
        id: '4',
        transactionNumber: 'TXN-004',
        itemCode: 'ITM-004',
        itemName: 'Printer Toner',
        type: 'adjustment',
        quantity: -2,
        unit: 'piece',
        unitPrice: 120,
        totalValue: -240,
        currency: 'SAR',
        reason: 'Damaged Items',
        fromLocation: 'Warehouse B',
        status: 'approved',
        transactionDate: '2024-01-13',
        createdBy: 'Sara Ahmed',
        approvedBy: 'Inventory Manager',
        notes: 'Items damaged during storage'
    }
];

const transactionTypes = {
    in: 'Stock In',
    out: 'Stock Out',
    transfer: 'Transfer',
    adjustment: 'Adjustment'
};

const reasons = {
    in: ['Purchase', 'Return', 'Production', 'Transfer In', 'Other'],
    out: ['Sale', 'Office Use', 'Production', 'Transfer Out', 'Damaged', 'Other'],
    transfer: ['Department Transfer', 'Location Change', 'Reorganization', 'Other'],
    adjustment: ['Count Correction', 'Damaged Items', 'Lost Items', 'Expired Items', 'Other']
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    completed: 'Completed',
    cancelled: 'Cancelled'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
};

const items = [
    { code: 'ITM-001', name: 'Office Chair', unit: 'piece', unitPrice: 450 },
    { code: 'ITM-002', name: 'A4 Paper', unit: 'ream', unitPrice: 25 },
    { code: 'ITM-003', name: 'Laptop Computer', unit: 'piece', unitPrice: 2500 },
    { code: 'ITM-004', name: 'Printer Toner', unit: 'piece', unitPrice: 120 }
];

const locations = ['Warehouse A', 'Warehouse B', 'Storage Room', 'Office', 'IT Department', 'Maintenance Room'];

export default function InventoryTransactionsPage() {
    const [transactions, setTransactions] = useState<InventoryTransaction[]>(mockTransactions);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<InventoryTransaction | null>(null);
    const [formData, setFormData] = useState({
        itemCode: '',
        type: 'in' as InventoryTransaction['type'],
        quantity: '',
        unitPrice: '',
        currency: 'SAR',
        reason: '',
        reference: '',
        fromLocation: '',
        toLocation: '',
        notes: ''
    });

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const handleCreate = () => {
        if (!formData.itemCode || !formData.quantity || !formData.unitPrice || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        const selectedItem = items.find(item => item.code === formData.itemCode);
        if (!selectedItem) {
            toast.error('Selected item not found');
            return;
        }

        const quantity = parseInt(formData.quantity);
        const unitPrice = parseFloat(formData.unitPrice);
        const totalValue = quantity * unitPrice;

        const newTransaction: InventoryTransaction = {
            id: Date.now().toString(),
            transactionNumber: `TXN-${String(transactions.length + 1).padStart(3, '0')}`,
            itemCode: formData.itemCode,
            itemName: selectedItem.name,
            type: formData.type,
            quantity: quantity,
            unit: selectedItem.unit,
            unitPrice: unitPrice,
            totalValue: totalValue,
            currency: formData.currency,
            reason: formData.reason,
            reference: formData.reference || undefined,
            fromLocation: formData.fromLocation || undefined,
            toLocation: formData.toLocation || undefined,
            status: 'pending',
            transactionDate: new Date().toISOString().split('T')[0],
            createdBy: 'Current User',
            notes: formData.notes || undefined
        };

        setTransactions([...transactions, newTransaction]);
        setIsCreateDialogOpen(false);
        setFormData({
            itemCode: '',
            type: 'in',
            quantity: '',
            unitPrice: '',
            currency: 'SAR',
            reason: '',
            reference: '',
            fromLocation: '',
            toLocation: '',
            notes: ''
        });
        toast.success('Transaction created successfully');
    };

    const handleEdit = (transaction: InventoryTransaction) => {
        setEditingTransaction(transaction);
        setFormData({
            itemCode: transaction.itemCode,
            type: transaction.type,
            quantity: transaction.quantity.toString(),
            unitPrice: transaction.unitPrice.toString(),
            currency: transaction.currency,
            reason: transaction.reason,
            reference: transaction.reference || '',
            fromLocation: transaction.fromLocation || '',
            toLocation: transaction.toLocation || '',
            notes: transaction.notes || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingTransaction) return;

        const selectedItem = items.find(item => item.code === formData.itemCode);
        if (!selectedItem) {
            toast.error('Selected item not found');
            return;
        }

        const quantity = parseInt(formData.quantity);
        const unitPrice = parseFloat(formData.unitPrice);
        const totalValue = quantity * unitPrice;

        const updatedTransactions = transactions.map(t =>
            t.id === editingTransaction.id ? { 
                ...t, 
                itemCode: formData.itemCode,
                itemName: selectedItem.name,
                type: formData.type,
                quantity: quantity,
                unit: selectedItem.unit,
                unitPrice: unitPrice,
                totalValue: totalValue,
                currency: formData.currency,
                reason: formData.reason,
                reference: formData.reference || undefined,
                fromLocation: formData.fromLocation || undefined,
                toLocation: formData.toLocation || undefined,
                notes: formData.notes || undefined
            } : t
        );

        setTransactions(updatedTransactions);
        setIsEditDialogOpen(false);
        setEditingTransaction(null);
        setFormData({
            itemCode: '',
            type: 'in',
            quantity: '',
            unitPrice: '',
            currency: 'SAR',
            reason: '',
            reference: '',
            fromLocation: '',
            toLocation: '',
            notes: ''
        });
        toast.success('Transaction updated successfully');
    };

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
        toast.success('Transaction deleted successfully');
    };

    const handleApprove = (id: string) => {
        setTransactions(prev => prev.map(transaction => 
            transaction.id === id 
                ? { ...transaction, status: 'approved' as const, approvedBy: 'Inventory Manager' }
                : transaction
        ));
        toast.success('Transaction approved');
    };

    const handleComplete = (id: string) => {
        setTransactions(prev => prev.map(transaction => 
            transaction.id === id 
                ? { ...transaction, status: 'completed' as const }
                : transaction
        ));
        toast.success('Transaction completed');
    };

    const handleCancel = (id: string) => {
        setTransactions(prev => prev.map(transaction => 
            transaction.id === id 
                ? { ...transaction, status: 'cancelled' as const }
                : transaction
        ));
        toast.success('Transaction cancelled');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalTransactions = filteredTransactions.length;
    const totalInValue = filteredTransactions
        .filter(t => t.type === 'in' && t.status === 'completed')
        .reduce((sum, t) => sum + t.totalValue, 0);
    const totalOutValue = filteredTransactions
        .filter(t => t.type === 'out' && t.status === 'completed')
        .reduce((sum, t) => sum + t.totalValue, 0);
    const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventory Transactions</h1>
                    <p className="text-muted-foreground">Track all inventory movements and transactions</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Transaction
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Transaction</DialogTitle>
                            <DialogDescription>
                                Record a new inventory transaction
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="itemCode">Item</Label>
                                <Select value={formData.itemCode} onValueChange={(value) => setFormData(prev => ({ ...prev, itemCode: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map(item => (
                                            <SelectItem key={item.code} value={item.code}>{item.name} ({item.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="type">Transaction Type</Label>
                                <Select value={formData.type} onValueChange={(value: InventoryTransaction['type']) => setFormData(prev => ({ ...prev, type: value, reason: '', fromLocation: '', toLocation: '' }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(transactionTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                        placeholder="0"
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
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SAR">Saudi Riyal</SelectItem>
                                        <SelectItem value="USD">US Dollar</SelectItem>
                                        <SelectItem value="EUR">Euro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reasons[formData.type].map(reason => (
                                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
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
                                    placeholder="Reference number (optional)"
                                />
                            </div>
                            {(formData.type === 'out' || formData.type === 'transfer' || formData.type === 'adjustment') && (
                                <div>
                                    <Label htmlFor="fromLocation">From Location</Label>
                                    <Select value={formData.fromLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, fromLocation: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select From Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map(location => (
                                                <SelectItem key={location} value={location}>{location}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            {(formData.type === 'in' || formData.type === 'transfer') && (
                                <div>
                                    <Label htmlFor="toLocation">To Location</Label>
                                    <Select value={formData.toLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, toLocation: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select To Location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map(location => (
                                                <SelectItem key={location} value={location}>{location}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional notes (optional)"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <ArrowUpDown className="h-4 w-4 mr-2" />
                                    Create Transaction
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
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total In Value</CardTitle>
                        <ArrowUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalInValue, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Out Value</CardTitle>
                        <ArrowDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutValue, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                        <Package className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingTransactions}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(transactionTypes).map(([key, label]) => (
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

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowUpDown className="h-5 w-5" />
                        Transactions List
                    </CardTitle>
                    <CardDescription>
                        {filteredTransactions.length} transactions out of {transactions.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction Number</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total Value</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>From/To Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{transaction.itemName}</div>
                                                <div className="text-sm text-muted-foreground">{transaction.itemCode}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === 'in' ? 'default' : transaction.type === 'out' ? 'destructive' : 'secondary'}>
                                                {transactionTypes[transaction.type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`font-semibold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity} {transaction.unit}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(transaction.unitPrice, transaction.currency)}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(transaction.totalValue, transaction.currency)}
                                        </TableCell>
                                        <TableCell>{transaction.reason}</TableCell>
                                        <TableCell className="text-sm">
                                            {transaction.fromLocation && transaction.toLocation ? 
                                                `${transaction.fromLocation} → ${transaction.toLocation}` :
                                                transaction.fromLocation || transaction.toLocation || '-'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[transaction.status]} w-fit`}>
                                                {statusLabels[transaction.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{transaction.transactionDate}</TableCell>
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
                                                    onClick={() => handleEdit(transaction)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {transaction.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(transaction.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {transaction.status === 'approved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleComplete(transaction.id)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        Complete
                                                    </Button>
                                                )}
                                                {(transaction.status === 'pending' || transaction.status === 'approved') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancel(transaction.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(transaction.id)}
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
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Update transaction data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-itemCode">Item</Label>
                            <Select value={formData.itemCode} onValueChange={(value) => setFormData(prev => ({ ...prev, itemCode: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {items.map(item => (
                                        <SelectItem key={item.code} value={item.code}>{item.name} ({item.code})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-type">Transaction Type</Label>
                            <Select value={formData.type} onValueChange={(value: InventoryTransaction['type']) => setFormData(prev => ({ ...prev, type: value, reason: '', fromLocation: '', toLocation: '' }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(transactionTypes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-quantity">Quantity</Label>
                                <Input
                                    id="edit-quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
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
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-currency">Currency</Label>
                            <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAR">Saudi Riyal</SelectItem>
                                    <SelectItem value="USD">US Dollar</SelectItem>
                                    <SelectItem value="EUR">Euro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-reason">Reason</Label>
                            <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasons[formData.type].map(reason => (
                                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
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
                            />
                        </div>
                        {(formData.type === 'out' || formData.type === 'transfer' || formData.type === 'adjustment') && (
                            <div>
                                <Label htmlFor="edit-fromLocation">From Location</Label>
                                <Select value={formData.fromLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, fromLocation: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {(formData.type === 'in' || formData.type === 'transfer') && (
                            <div>
                                <Label htmlFor="edit-toLocation">To Location</Label>
                                <Select value={formData.toLocation} onValueChange={(value) => setFormData(prev => ({ ...prev, toLocation: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}