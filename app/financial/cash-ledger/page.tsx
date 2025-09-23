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
import { Wallet, Plus, Search, Eye, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface CashTransaction {
    id: string;
    transactionNumber: string;
    date: string;
    description: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    currency: string;
    balance: number;
    reference?: string;
    createdBy: string;
    status: 'pending' | 'approved' | 'rejected';
}

const mockTransactions: CashTransaction[] = [
    {
        id: '1',
        transactionNumber: 'CASH-001',
        date: '2024-01-15',
        description: 'Daily cash sales',
        type: 'income',
        category: 'Sales',
        amount: 5000,
        currency: 'SAR',
        balance: 5000,
        reference: 'SALE-001',
        createdBy: 'Ahmed Ali',
        status: 'approved'
    },
    {
        id: '2',
        transactionNumber: 'CASH-002',
        date: '2024-01-15',
        description: 'Office supplies purchase',
        type: 'expense',
        category: 'Office Expenses',
        amount: 500,
        currency: 'SAR',
        balance: 4500,
        reference: 'PUR-001',
        createdBy: 'Fatima Mohamed',
        status: 'approved'
    },
    {
        id: '3',
        transactionNumber: 'CASH-003',
        date: '2024-01-16',
        description: 'Petty cash withdrawal',
        type: 'expense',
        category: 'Petty Cash',
        amount: 200,
        currency: 'SAR',
        balance: 4300,
        reference: 'PETTY-001',
        createdBy: 'Omar Hassan',
        status: 'pending'
    },
    {
        id: '4',
        transactionNumber: 'CASH-004',
        date: '2024-01-16',
        description: 'Cash deposit from bank',
        type: 'income',
        category: 'Bank Transfer',
        amount: 10000,
        currency: 'SAR',
        balance: 14300,
        reference: 'BANK-001',
        createdBy: 'Sara Ahmed',
        status: 'approved'
    }
];

const categories = {
    income: ['Sales', 'Bank Transfer', 'Cash Deposit', 'Refund', 'Other Income'],
    expense: ['Office Expenses', 'Petty Cash', 'Utilities', 'Maintenance', 'Other Expenses']
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
};

export default function CashLedgerPage() {
    const [transactions, setTransactions] = useState<CashTransaction[]>(mockTransactions);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);
    const [formData, setFormData] = useState({
        description: '',
        type: 'income' as CashTransaction['type'],
        category: '',
        amount: '',
        currency: 'SAR',
        reference: ''
    });

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
        
        return matchesSearch && matchesType && matchesCategory && matchesStatus;
    });

    const handleCreate = () => {
        if (!formData.description || !formData.category || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        const amount = parseFloat(formData.amount);
        const lastTransaction = transactions[transactions.length - 1];
        const newBalance = formData.type === 'income' 
            ? (lastTransaction?.balance || 0) + amount
            : (lastTransaction?.balance || 0) - amount;

        const newTransaction: CashTransaction = {
            id: Date.now().toString(),
            transactionNumber: `CASH-${String(transactions.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            description: formData.description,
            type: formData.type,
            category: formData.category,
            amount: amount,
            currency: formData.currency,
            balance: newBalance,
            reference: formData.reference || undefined,
            createdBy: 'Current User',
            status: 'pending'
        };

        setTransactions([...transactions, newTransaction]);
        setIsCreateDialogOpen(false);
        setFormData({
            description: '',
            type: 'income',
            category: '',
            amount: '',
            currency: 'SAR',
            reference: ''
        });
        toast.success('Transaction created successfully');
    };

    const handleEdit = (transaction: CashTransaction) => {
        setEditingTransaction(transaction);
        setFormData({
            description: transaction.description,
            type: transaction.type,
            category: transaction.category,
            amount: transaction.amount.toString(),
            currency: transaction.currency,
            reference: transaction.reference || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingTransaction) return;

        const amount = parseFloat(formData.amount);
        const updatedTransactions = transactions.map(t => {
            if (t.id === editingTransaction.id) {
                const balanceChange = amount - editingTransaction.amount;
                const newBalance = editingTransaction.type === 'income' 
                    ? editingTransaction.balance + balanceChange
                    : editingTransaction.balance - balanceChange;
                
                return {
                    ...t,
                    description: formData.description,
                    type: formData.type,
                    category: formData.category,
                    amount: amount,
                    currency: formData.currency,
                    balance: newBalance,
                    reference: formData.reference || undefined
                };
            }
            return t;
        });

        setTransactions(updatedTransactions);
        setIsEditDialogOpen(false);
        setEditingTransaction(null);
        setFormData({
            description: '',
            type: 'income',
            category: '',
            amount: '',
            currency: 'SAR',
            reference: ''
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
                ? { ...transaction, status: 'approved' as const }
                : transaction
        ));
        toast.success('Transaction approved');
    };

    const handleReject = (id: string) => {
        setTransactions(prev => prev.map(transaction => 
            transaction.id === id 
                ? { ...transaction, status: 'rejected' as const }
                : transaction
        ));
        toast.success('Transaction rejected');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const currentBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : 0;
    const totalIncome = transactions
        .filter(t => t.type === 'income' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
        .filter(t => t.type === 'expense' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);
    const pendingAmount = transactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Cash Ledger</h1>
                    <p className="text-muted-foreground">Track all cash transactions and balance</p>
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
                                Add a new cash transaction
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Transaction description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="type">Transaction Type</Label>
                                <Select value={formData.type} onValueChange={(value: CashTransaction['type']) => setFormData(prev => ({ ...prev, type: value, category: '' }))}>
                                    <SelectTrigger>
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
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories[formData.type].map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
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
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0"
                                    />
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
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <Wallet className="h-4 w-4 mr-2" />
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
                        <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(currentBalance, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                        <Wallet className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount, 'SAR')}</div>
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
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(categories).flat().map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Cash Transactions
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
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                                        <TableCell>{transaction.date}</TableCell>
                                        <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === 'income' ? 'default' : 'rejected'}>
                                                {transaction.type === 'income' ? 'Income' : 'Expense'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{transaction.category}</TableCell>
                                        <TableCell className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(transaction.balance, transaction.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[transaction.status]} w-fit`}>
                                                {statusLabels[transaction.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{transaction.reference || '-'}</TableCell>
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
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApprove(transaction.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleReject(transaction.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
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
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-type">Transaction Type</Label>
                            <Select value={formData.type} onValueChange={(value: CashTransaction['type']) => setFormData(prev => ({ ...prev, type: value, category: '' }))}>
                                <SelectTrigger>
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
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories[formData.type].map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                />
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
                        </div>
                        <div>
                            <Label htmlFor="edit-reference">Reference</Label>
                            <Input
                                id="edit-reference"
                                value={formData.reference}
                                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
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