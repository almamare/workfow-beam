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
import { CreditCard, Plus, Search, Eye, Edit, Trash2, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Loan {
    id: string;
    loanNumber: string;
    borrowerName: string;
    borrowerType: 'employee' | 'contractor' | 'supplier';
    loanAmount: number;
    currency: string;
    interestRate: number;
    loanTerm: number; // in months
    monthlyPayment: number;
    remainingBalance: number;
    status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted';
    startDate: string;
    endDate: string;
    purpose: string;
    collateral?: string;
    guarantor?: string;
    createdBy: string;
    approvedBy?: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
}

const mockLoans: Loan[] = [
    {
        id: '1',
        loanNumber: 'LOAN-001',
        borrowerName: 'Ahmed Ali',
        borrowerType: 'employee',
        loanAmount: 50000,
        currency: 'SAR',
        interestRate: 5.5,
        loanTerm: 24,
        monthlyPayment: 2200,
        remainingBalance: 35000,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        purpose: 'Home purchase',
        collateral: 'Property mortgage',
        guarantor: 'Mohamed Hassan',
        createdBy: 'Sara Ahmed',
        approvedBy: 'Financial Manager',
        lastPaymentDate: '2024-01-15',
        nextPaymentDate: '2024-02-15'
    },
    {
        id: '2',
        loanNumber: 'LOAN-002',
        borrowerName: 'Gulf Construction Co.',
        borrowerType: 'contractor',
        loanAmount: 200000,
        currency: 'SAR',
        interestRate: 7.0,
        loanTerm: 36,
        monthlyPayment: 6500,
        remainingBalance: 180000,
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2027-01-15',
        purpose: 'Equipment purchase',
        collateral: 'Equipment and machinery',
        guarantor: 'Company guarantee',
        createdBy: 'Omar Hassan',
        approvedBy: 'General Manager',
        lastPaymentDate: '2024-01-15',
        nextPaymentDate: '2024-02-15'
    },
    {
        id: '3',
        loanNumber: 'LOAN-003',
        borrowerName: 'Fatima Mohamed',
        borrowerType: 'employee',
        loanAmount: 15000,
        currency: 'SAR',
        interestRate: 4.0,
        loanTerm: 12,
        monthlyPayment: 1300,
        remainingBalance: 0,
        status: 'completed',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        purpose: 'Personal emergency',
        guarantor: 'Ahmed Ali',
        createdBy: 'Sara Ahmed',
        approvedBy: 'HR Manager',
        lastPaymentDate: '2023-12-15'
    },
    {
        id: '4',
        loanNumber: 'LOAN-004',
        borrowerName: 'Modern Supplies Ltd.',
        borrowerType: 'supplier',
        loanAmount: 100000,
        currency: 'SAR',
        interestRate: 6.5,
        loanTerm: 18,
        monthlyPayment: 6000,
        remainingBalance: 75000,
        status: 'defaulted',
        startDate: '2023-06-01',
        endDate: '2024-12-01',
        purpose: 'Working capital',
        collateral: 'Accounts receivable',
        guarantor: 'Company guarantee',
        createdBy: 'Omar Hassan',
        approvedBy: 'Financial Manager',
        lastPaymentDate: '2023-11-15',
        nextPaymentDate: '2024-01-15'
    }
];

const borrowerTypes = {
    employee: 'Employee',
    contractor: 'Contractor',
    supplier: 'Supplier'
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    active: 'Active',
    completed: 'Completed',
    defaulted: 'Defaulted'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    defaulted: 'bg-red-100 text-red-800'
};

export default function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>(mockLoans);
    const [searchTerm, setSearchTerm] = useState('');
    const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [formData, setFormData] = useState({
        borrowerName: '',
        borrowerType: 'employee' as Loan['borrowerType'],
        loanAmount: '',
        currency: 'SAR',
        interestRate: '',
        loanTerm: '',
        purpose: '',
        collateral: '',
        guarantor: ''
    });

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBorrowerType = borrowerTypeFilter === 'all' || loan.borrowerType === borrowerTypeFilter;
        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
        
        return matchesSearch && matchesBorrowerType && matchesStatus;
    });

    const calculateMonthlyPayment = (amount: number, rate: number, term: number) => {
        const monthlyRate = rate / 100 / 12;
        const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                      (Math.pow(1 + monthlyRate, term) - 1);
        return Math.round(payment);
    };

    const handleCreate = () => {
        if (!formData.borrowerName || !formData.loanAmount || !formData.interestRate || !formData.loanTerm) {
            toast.error('Please fill in all required fields');
            return;
        }

        const loanAmount = parseFloat(formData.loanAmount);
        const interestRate = parseFloat(formData.interestRate);
        const loanTerm = parseInt(formData.loanTerm);
        const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + loanTerm);

        const newLoan: Loan = {
            id: Date.now().toString(),
            loanNumber: `LOAN-${String(loans.length + 1).padStart(3, '0')}`,
            borrowerName: formData.borrowerName,
            borrowerType: formData.borrowerType,
            loanAmount: loanAmount,
            currency: formData.currency,
            interestRate: interestRate,
            loanTerm: loanTerm,
            monthlyPayment: monthlyPayment,
            remainingBalance: loanAmount,
            status: 'pending',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            purpose: formData.purpose,
            collateral: formData.collateral || undefined,
            guarantor: formData.guarantor || undefined,
            createdBy: 'Current User'
        };

        setLoans([...loans, newLoan]);
        setIsCreateDialogOpen(false);
        setFormData({
            borrowerName: '',
            borrowerType: 'employee',
            loanAmount: '',
            currency: 'SAR',
            interestRate: '',
            loanTerm: '',
            purpose: '',
            collateral: '',
            guarantor: ''
        });
        toast.success('Loan created successfully');
    };

    const handleEdit = (loan: Loan) => {
        setEditingLoan(loan);
        setFormData({
            borrowerName: loan.borrowerName,
            borrowerType: loan.borrowerType,
            loanAmount: loan.loanAmount.toString(),
            currency: loan.currency,
            interestRate: loan.interestRate.toString(),
            loanTerm: loan.loanTerm.toString(),
            purpose: loan.purpose,
            collateral: loan.collateral || '',
            guarantor: loan.guarantor || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingLoan) return;

        const loanAmount = parseFloat(formData.loanAmount);
        const interestRate = parseFloat(formData.interestRate);
        const loanTerm = parseInt(formData.loanTerm);
        const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);

        const updatedLoans = loans.map(l =>
            l.id === editingLoan.id ? { 
                ...l, 
                borrowerName: formData.borrowerName,
                borrowerType: formData.borrowerType,
                loanAmount: loanAmount,
                currency: formData.currency,
                interestRate: interestRate,
                loanTerm: loanTerm,
                monthlyPayment: monthlyPayment,
                purpose: formData.purpose,
                collateral: formData.collateral || undefined,
                guarantor: formData.guarantor || undefined
            } : l
        );

        setLoans(updatedLoans);
        setIsEditDialogOpen(false);
        setEditingLoan(null);
        setFormData({
            borrowerName: '',
            borrowerType: 'employee',
            loanAmount: '',
            currency: 'SAR',
            interestRate: '',
            loanTerm: '',
            purpose: '',
            collateral: '',
            guarantor: ''
        });
        toast.success('Loan updated successfully');
    };

    const handleDelete = (id: string) => {
        setLoans(loans.filter(l => l.id !== id));
        toast.success('Loan deleted successfully');
    };

    const handleApprove = (id: string) => {
        setLoans(prev => prev.map(loan => 
            loan.id === id 
                ? { ...loan, status: 'approved' as const, approvedBy: 'Financial Manager' }
                : loan
        ));
        toast.success('Loan approved');
    };

    const handleActivate = (id: string) => {
        setLoans(prev => prev.map(loan => 
            loan.id === id 
                ? { ...loan, status: 'active' as const }
                : loan
        ));
        toast.success('Loan activated');
    };

    const handleComplete = (id: string) => {
        setLoans(prev => prev.map(loan => 
            loan.id === id 
                ? { ...loan, status: 'completed' as const, remainingBalance: 0 }
                : loan
        ));
        toast.success('Loan completed');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalLoanAmount = filteredLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const totalRemainingBalance = filteredLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
    const activeLoans = filteredLoans.filter(l => l.status === 'active').length;
    const defaultedLoans = filteredLoans.filter(l => l.status === 'defaulted').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Loans Management</h1>
                    <p className="text-muted-foreground">Manage employee and business loans</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Loan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Loan</DialogTitle>
                            <DialogDescription>
                                Create a new loan for employee or business
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="borrowerName">Borrower Name</Label>
                                <Input
                                    id="borrowerName"
                                    value={formData.borrowerName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, borrowerName: e.target.value }))}
                                    placeholder="Borrower name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="borrowerType">Borrower Type</Label>
                                <Select value={formData.borrowerType} onValueChange={(value: Loan['borrowerType']) => setFormData(prev => ({ ...prev, borrowerType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(borrowerTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="loanAmount">Loan Amount</Label>
                                    <Input
                                        id="loanAmount"
                                        type="number"
                                        value={formData.loanAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                    <Input
                                        id="interestRate"
                                        type="number"
                                        step="0.1"
                                        value={formData.interestRate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                                        placeholder="0.0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="loanTerm">Loan Term (months)</Label>
                                    <Input
                                        id="loanTerm"
                                        type="number"
                                        value={formData.loanTerm}
                                        onChange={(e) => setFormData(prev => ({ ...prev, loanTerm: e.target.value }))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="purpose">Purpose</Label>
                                <Input
                                    id="purpose"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                                    placeholder="Loan purpose"
                                />
                            </div>
                            <div>
                                <Label htmlFor="collateral">Collateral</Label>
                                <Input
                                    id="collateral"
                                    value={formData.collateral}
                                    onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
                                    placeholder="Collateral description (optional)"
                                />
                            </div>
                            <div>
                                <Label htmlFor="guarantor">Guarantor</Label>
                                <Input
                                    id="guarantor"
                                    value={formData.guarantor}
                                    onChange={(e) => setFormData(prev => ({ ...prev, guarantor: e.target.value }))}
                                    placeholder="Guarantor name (optional)"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Create Loan
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
                        <CardTitle className="text-sm font-medium">Total Loan Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalLoanAmount, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRemainingBalance, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <Calendar className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeLoans}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Defaulted Loans</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{defaultedLoans}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search loans..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={borrowerTypeFilter} onValueChange={setBorrowerTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Borrower Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(borrowerTypes).map(([key, label]) => (
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

            {/* Loans Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Loans List
                    </CardTitle>
                    <CardDescription>
                        {filteredLoans.length} loans out of {loans.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loan Number</TableHead>
                                    <TableHead>Borrower</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Interest Rate</TableHead>
                                    <TableHead>Term</TableHead>
                                    <TableHead>Monthly Payment</TableHead>
                                    <TableHead>Remaining Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Next Payment</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLoans.map((loan) => (
                                    <TableRow key={loan.id}>
                                        <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                                        <TableCell className="max-w-xs truncate">{loan.borrowerName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {borrowerTypes[loan.borrowerType]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(loan.loanAmount, loan.currency)}
                                        </TableCell>
                                        <TableCell>{loan.interestRate}%</TableCell>
                                        <TableCell>{loan.loanTerm} months</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(loan.monthlyPayment, loan.currency)}
                                        </TableCell>
                                        <TableCell className={`font-semibold ${loan.remainingBalance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(loan.remainingBalance, loan.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[loan.status]} w-fit`}>
                                                {statusLabels[loan.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{loan.nextPaymentDate || '-'}</TableCell>
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
                                                    onClick={() => handleEdit(loan)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {loan.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(loan.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {loan.status === 'approved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleActivate(loan.id)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                                {loan.status === 'active' && loan.remainingBalance > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleComplete(loan.id)}
                                                        className="text-gray-600 hover:text-gray-700"
                                                    >
                                                        Complete
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(loan.id)}
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
                        <DialogTitle>Edit Loan</DialogTitle>
                        <DialogDescription>
                            Update loan data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-borrowerName">Borrower Name</Label>
                            <Input
                                id="edit-borrowerName"
                                value={formData.borrowerName}
                                onChange={(e) => setFormData(prev => ({ ...prev, borrowerName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-borrowerType">Borrower Type</Label>
                            <Select value={formData.borrowerType} onValueChange={(value: Loan['borrowerType']) => setFormData(prev => ({ ...prev, borrowerType: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(borrowerTypes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-loanAmount">Loan Amount</Label>
                                <Input
                                    id="edit-loanAmount"
                                    type="number"
                                    value={formData.loanAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, loanAmount: e.target.value }))}
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-interestRate">Interest Rate (%)</Label>
                                <Input
                                    id="edit-interestRate"
                                    type="number"
                                    step="0.1"
                                    value={formData.interestRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-loanTerm">Loan Term (months)</Label>
                                <Input
                                    id="edit-loanTerm"
                                    type="number"
                                    value={formData.loanTerm}
                                    onChange={(e) => setFormData(prev => ({ ...prev, loanTerm: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-purpose">Purpose</Label>
                            <Input
                                id="edit-purpose"
                                value={formData.purpose}
                                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-collateral">Collateral</Label>
                            <Input
                                id="edit-collateral"
                                value={formData.collateral}
                                onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-guarantor">Guarantor</Label>
                            <Input
                                id="edit-guarantor"
                                value={formData.guarantor}
                                onChange={(e) => setFormData(prev => ({ ...prev, guarantor: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}