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
import { DollarSign, Plus, Search, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface ContractorPayment {
    id: string;
    paymentNumber: string;
    contractorName: string;
    projectName: string;
    amount: number;
    currency: string;
    paymentType: 'advance' | 'progress' | 'final' | 'retention';
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    paymentDate: string;
    dueDate: string;
    description: string;
    invoiceNumber?: string;
    approver?: string;
    comments?: string;
}

const mockPayments: ContractorPayment[] = [
    {
        id: '1',
        paymentNumber: 'PAY-001',
        contractorName: 'Advanced Construction Co.',
        projectName: 'New Building Project',
        amount: 150000,
        currency: 'SAR',
        paymentType: 'progress',
        status: 'pending',
        paymentDate: '2024-01-15',
        dueDate: '2024-01-30',
        description: 'Progress payment - Phase 1',
        invoiceNumber: 'INV-2024-001'
    },
    {
        id: '2',
        paymentNumber: 'PAY-002',
        contractorName: 'Gulf Contractors',
        projectName: 'Development Project',
        amount: 75000,
        currency: 'SAR',
        paymentType: 'final',
        status: 'paid',
        paymentDate: '2024-01-10',
        dueDate: '2024-01-25',
        description: 'Final payment for the project',
        invoiceNumber: 'INV-2024-002',
        approver: 'Mohamed Ali',
        comments: 'Payment approved and processed'
    },
    {
        id: '3',
        paymentNumber: 'PAY-003',
        contractorName: 'United Contractors Co.',
        projectName: 'Maintenance Project',
        amount: 25000,
        currency: 'SAR',
        paymentType: 'advance',
        status: 'rejected',
        paymentDate: '2024-01-12',
        dueDate: '2024-01-28',
        description: 'Advance payment for the project',
        invoiceNumber: 'INV-2024-003',
        approver: 'Fatima Mohamed',
        comments: 'Budget not available'
    }
];

const paymentTypes = {
    advance: 'Advance Payment',
    progress: 'Progress Payment',
    final: 'Final Payment',
    retention: 'Retention'
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    paid: 'Paid',
    rejected: 'Rejected'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800'
};

const contractors = ['Advanced Construction Co.', 'Gulf Contractors', 'United Contractors Co.', 'Palm Contractors', 'Modern Construction Co.'];
const projects = ['New Building Project', 'Development Project', 'Maintenance Project', 'Expansion Project', 'Renovation Project'];

export default function ContractorPaymentsPage() {
    const [payments, setPayments] = useState<ContractorPayment[]>(mockPayments);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<ContractorPayment | null>(null);
    const [formData, setFormData] = useState({
        contractorName: '',
        projectName: '',
        amount: '',
        currency: 'SAR',
        paymentType: 'progress' as ContractorPayment['paymentType'],
        paymentDate: '',
        dueDate: '',
        description: '',
        invoiceNumber: ''
    });

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    const handleCreate = () => {
        if (!formData.contractorName || !formData.projectName || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newPayment: ContractorPayment = {
            id: Date.now().toString(),
            paymentNumber: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
            contractorName: formData.contractorName,
            projectName: formData.projectName,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            paymentType: formData.paymentType,
            status: 'pending',
            paymentDate: formData.paymentDate,
            dueDate: formData.dueDate,
            description: formData.description,
            invoiceNumber: formData.invoiceNumber || undefined
        };

        setPayments([...payments, newPayment]);
        setIsCreateDialogOpen(false);
        setFormData({
            contractorName: '',
            projectName: '',
            amount: '',
            currency: 'SAR',
            paymentType: 'progress',
            paymentDate: '',
            dueDate: '',
            description: '',
            invoiceNumber: ''
        });
        toast.success('Payment created successfully');
    };

    const handleEdit = (payment: ContractorPayment) => {
        setEditingPayment(payment);
        setFormData({
            contractorName: payment.contractorName,
            projectName: payment.projectName,
            amount: payment.amount.toString(),
            currency: payment.currency,
            paymentType: payment.paymentType,
            paymentDate: payment.paymentDate,
            dueDate: payment.dueDate,
            description: payment.description,
            invoiceNumber: payment.invoiceNumber || ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingPayment) return;

        const updatedPayments = payments.map(p =>
            p.id === editingPayment.id ? { 
                ...p, 
                contractorName: formData.contractorName,
                projectName: formData.projectName,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                paymentType: formData.paymentType,
                paymentDate: formData.paymentDate,
                dueDate: formData.dueDate,
                description: formData.description,
                invoiceNumber: formData.invoiceNumber || undefined
            } : p
        );

        setPayments(updatedPayments);
        setIsEditDialogOpen(false);
        setEditingPayment(null);
        setFormData({
            contractorName: '',
            projectName: '',
            amount: '',
            currency: 'SAR',
            paymentType: 'progress',
            paymentDate: '',
            dueDate: '',
            description: '',
            invoiceNumber: ''
        });
        toast.success('Payment updated successfully');
    };

    const handleDelete = (id: string) => {
        setPayments(payments.filter(p => p.id !== id));
        toast.success('Payment deleted successfully');
    };

    const handleApprove = (id: string) => {
        setPayments(prev => prev.map(payment => 
            payment.id === id 
                ? { ...payment, status: 'approved' as const, approver: 'General Manager' }
                : payment
        ));
        toast.success('Payment approved');
    };

    const handlePay = (id: string) => {
        setPayments(prev => prev.map(payment => 
            payment.id === id 
                ? { ...payment, status: 'paid' as const, approver: 'Financial Manager' }
                : payment
        ));
        toast.success('Payment recorded');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = filteredPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Contractor Payments</h1>
                    <p className="text-muted-foreground">Manage contractor payments and contracts</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Payment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Payment</DialogTitle>
                            <DialogDescription>
                                Create a new payment for contractor
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="contractorName">Contractor Name</Label>
                                <Select value={formData.contractorName} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorName: value }))}>
                                    <SelectTrigger>
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
                                <Label htmlFor="projectName">Project Name</Label>
                                <Select value={formData.projectName} onValueChange={(value) => setFormData(prev => ({ ...prev, projectName: value }))}>
                                    <SelectTrigger>
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
                                <Label htmlFor="paymentType">Payment Type</Label>
                                <Select value={formData.paymentType} onValueChange={(value: ContractorPayment['paymentType']) => setFormData(prev => ({ ...prev, paymentType: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(paymentTypes).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="paymentDate">Payment Date</Label>
                                    <Input
                                        id="paymentDate"
                                        type="date"
                                        value={formData.paymentDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Payment description"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                                <Input
                                    id="invoiceNumber"
                                    value={formData.invoiceNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                    placeholder="Invoice number (optional)"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Create Payment
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAmount, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Number of Payments</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredPayments.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search payments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Payment Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Payment Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(paymentTypes).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payments List
                    </CardTitle>
                    <CardDescription>
                        {filteredPayments.length} payments out of {payments.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Payment Number</TableHead>
                                    <TableHead>Contractor</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Payment Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment Date</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                                        <TableCell>{payment.contractorName}</TableCell>
                                        <TableCell className="max-w-xs truncate">{payment.projectName}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(payment.amount, payment.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {paymentTypes[payment.paymentType]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[payment.status]} w-fit`}>
                                                {statusLabels[payment.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{payment.paymentDate}</TableCell>
                                        <TableCell>{payment.dueDate}</TableCell>
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
                                                    onClick={() => handleEdit(payment)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {payment.status === 'pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(payment.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {payment.status === 'approved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handlePay(payment.id)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        Pay
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(payment.id)}
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
                        <DialogTitle>Edit Payment</DialogTitle>
                        <DialogDescription>
                            Update payment data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-contractorName">Contractor Name</Label>
                            <Select value={formData.contractorName} onValueChange={(value) => setFormData(prev => ({ ...prev, contractorName: value }))}>
                                <SelectTrigger>
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
                            <Label htmlFor="edit-projectName">Project Name</Label>
                            <Select value={formData.projectName} onValueChange={(value) => setFormData(prev => ({ ...prev, projectName: value }))}>
                                <SelectTrigger>
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
                            <Label htmlFor="edit-paymentType">Payment Type</Label>
                            <Select value={formData.paymentType} onValueChange={(value: ContractorPayment['paymentType']) => setFormData(prev => ({ ...prev, paymentType: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(paymentTypes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-paymentDate">Payment Date</Label>
                                <Input
                                    id="edit-paymentDate"
                                    type="date"
                                    value={formData.paymentDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-dueDate">Due Date</Label>
                                <Input
                                    id="edit-dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-invoiceNumber">Invoice Number</Label>
                            <Input
                                id="edit-invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
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