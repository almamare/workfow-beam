'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

interface Loan {
    id: string;
    loanNumber: string;
    borrowerName: string;
    borrowerId: string;
    borrowerType: 'employee' | 'contractor' | 'client' | 'other';
    principalAmount: number;
    interestRate: number;
    currency: string;
    loanPurpose: string;
    loanType: 'personal' | 'business' | 'emergency' | 'advance';
    startDate: string;
    endDate: string;
    termMonths: number;
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'active' | 'completed' | 'defaulted' | 'cancelled';
    approvalDate: string;
    approvedBy: string;
    createdBy: string;
    notes: string;
    collateral: string;
    guarantor: string;
}

const mockLoans: Loan[] = [
    {
        id: '1',
        loanNumber: 'LOAN-001',
        borrowerName: 'Ahmed Ali',
        borrowerId: 'EMP-001',
        borrowerType: 'employee',
        principalAmount: 50000,
        interestRate: 5.5,
        currency: '',
        loanPurpose: 'Home purchase',
        loanType: 'personal',
        startDate: '2024-01-01',
        endDate: '2026-01-01',
        termMonths: 24,
        monthlyPayment: 2208,
        totalInterest: 2992,
        totalAmount: 52992,
        paidAmount: 13248,
        remainingAmount: 39744,
        status: 'active',
        approvalDate: '2023-12-15',
        approvedBy: 'Fatima Mohamed',
        createdBy: 'Omar Hassan',
        notes: 'Employee personal loan for home purchase',
        collateral: 'Property deed',
        guarantor: 'Sara Ahmed'
    },
    {
        id: '2',
        loanNumber: 'LOAN-002',
        borrowerName: 'ABC Construction Ltd.',
        borrowerId: 'CTR-001',
        borrowerType: 'contractor',
        principalAmount: 200000,
        interestRate: 7.0,
        currency: '',
        loanPurpose: 'Equipment purchase',
        loanType: 'business',
        startDate: '2024-02-01',
        endDate: '2025-02-01',
        termMonths: 12,
        monthlyPayment: 17784,
        totalInterest: 13408,
        totalAmount: 213408,
        paidAmount: 0,
        remainingAmount: 213408,
        status: 'active',
        approvalDate: '2024-01-20',
        approvedBy: 'Mohammed Saleh',
        createdBy: 'Fatima Mohamed',
        notes: 'Business loan for construction equipment',
        collateral: 'Equipment lien',
        guarantor: 'Company assets'
    },
    {
        id: '3',
        loanNumber: 'LOAN-003',
        borrowerName: 'Sara Ahmed',
        borrowerId: 'EMP-002',
        borrowerType: 'employee',
        principalAmount: 10000,
        interestRate: 0,
        currency: '',
        loanPurpose: 'Medical emergency',
        loanType: 'emergency',
        startDate: '2023-06-01',
        endDate: '2024-06-01',
        termMonths: 12,
        monthlyPayment: 833,
        totalInterest: 0,
        totalAmount: 10000,
        paidAmount: 10000,
        remainingAmount: 0,
        status: 'completed',
        approvalDate: '2023-05-25',
        approvedBy: 'Ahmed Ali',
        createdBy: 'Omar Hassan',
        notes: 'Interest-free emergency loan',
        collateral: 'Salary deduction',
        guarantor: 'Company guarantee'
    }
];

const borrowers = ['Ahmed Ali', 'ABC Construction Ltd.', 'Sara Ahmed', 'XYZ Electrical Co.', 'Green Landscaping'];
const borrowerTypes = [
    { value: 'employee', label: 'Employee' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'client', label: 'Client' },
    { value: 'other', label: 'Other' }
];
const loanTypes = [
    { value: 'personal', label: 'Personal' },
    { value: 'business', label: 'Business' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'advance', label: 'Advance' }
];
const loanPurposes = ['Home purchase', 'Equipment purchase', 'Medical emergency', 'Education', 'Business expansion', 'Debt consolidation', 'Other'];

export default function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>(mockLoans);
    const [searchTerm, setSearchTerm] = useState('');
    const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<string>('all');
    const [loanTypeFilter, setLoanTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [formData, setFormData] = useState({
        borrowerName: '',
        borrowerId: '',
        borrowerType: 'employee',
        principalAmount: '',
        interestRate: '',
        currency: '',
        loanPurpose: '',
        loanType: 'personal',
        startDate: '',
        termMonths: '',
        notes: '',
        collateral: '',
        guarantor: ''
    });

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.borrowerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            loan.loanPurpose.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBorrowerType = borrowerTypeFilter === 'all' || loan.borrowerType === borrowerTypeFilter;
        const matchesLoanType = loanTypeFilter === 'all' || loan.loanType === loanTypeFilter;
        const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
        
        return matchesSearch && matchesBorrowerType && matchesLoanType && matchesStatus;
    });

    const calculateLoanDetails = (principal: number, interestRate: number, termMonths: number) => {
        const monthlyRate = interestRate / 100 / 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
        const totalAmount = monthlyPayment * termMonths;
        const totalInterest = totalAmount - principal;
        
        return {
            monthlyPayment: Math.round(monthlyPayment),
            totalAmount: Math.round(totalAmount),
            totalInterest: Math.round(totalInterest)
        };
    };

    const handleCreate = () => {
        if (!formData.borrowerName || !formData.principalAmount || !formData.startDate || !formData.termMonths) {
            toast.error('Please fill in all required fields');
            return;
        }

        const principalAmount = parseFloat(formData.principalAmount);
        const interestRate = parseFloat(formData.interestRate) || 0;
        const termMonths = parseInt(formData.termMonths);
        const startDate = new Date(formData.startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + termMonths);

        const loanDetails = calculateLoanDetails(principalAmount, interestRate, termMonths);

        const newLoan: Loan = {
            id: Date.now().toString(),
            loanNumber: `LOAN-${String(loans.length + 1).padStart(3, '0')}`,
            borrowerName: formData.borrowerName,
            borrowerId: formData.borrowerId,
            borrowerType: formData.borrowerType as Loan['borrowerType'],
            principalAmount: principalAmount,
            interestRate: interestRate,
            currency: formData.currency,
            loanPurpose: formData.loanPurpose,
            loanType: formData.loanType as Loan['loanType'],
            startDate: formData.startDate,
            endDate: endDate.toISOString().split('T')[0],
            termMonths: termMonths,
            monthlyPayment: loanDetails.monthlyPayment,
            totalInterest: loanDetails.totalInterest,
            totalAmount: loanDetails.totalAmount,
            paidAmount: 0,
            remainingAmount: loanDetails.totalAmount,
            status: 'active',
            approvalDate: new Date().toISOString().split('T')[0],
            approvedBy: 'Current User',
            createdBy: 'Current User',
            notes: formData.notes,
            collateral: formData.collateral,
            guarantor: formData.guarantor
        };

        setLoans([...loans, newLoan]);
        setIsCreateDialogOpen(false);
        setFormData({
            borrowerName: '',
            borrowerId: '',
            borrowerType: 'employee',
            principalAmount: '',
            interestRate: '',
            currency: '',
            loanPurpose: '',
            loanType: 'personal',
            startDate: '',
            termMonths: '',
            notes: '',
            collateral: '',
            guarantor: ''
        });
        toast.success('Loan created successfully');
    };

    const handleEdit = (loan: Loan) => {
        setEditingLoan(loan);
        setFormData({
            borrowerName: loan.borrowerName,
            borrowerId: loan.borrowerId,
            borrowerType: loan.borrowerType,
            principalAmount: loan.principalAmount.toString(),
            interestRate: loan.interestRate.toString(),
            currency: loan.currency,
            loanPurpose: loan.loanPurpose,
            loanType: loan.loanType,
            startDate: loan.startDate,
            termMonths: loan.termMonths.toString(),
            notes: loan.notes,
            collateral: loan.collateral,
            guarantor: loan.guarantor
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingLoan) return;

        const principalAmount = parseFloat(formData.principalAmount);
        const interestRate = parseFloat(formData.interestRate) || 0;
        const termMonths = parseInt(formData.termMonths);
        const startDate = new Date(formData.startDate);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + termMonths);

        const loanDetails = calculateLoanDetails(principalAmount, interestRate, termMonths);

        const updatedLoans = loans.map(l =>
            l.id === editingLoan.id ? { 
                ...l, 
                borrowerName: formData.borrowerName,
                borrowerId: formData.borrowerId,
                borrowerType: formData.borrowerType as Loan['borrowerType'],
                principalAmount: principalAmount,
                interestRate: interestRate,
                currency: formData.currency,
                loanPurpose: formData.loanPurpose,
                loanType: formData.loanType as Loan['loanType'],
                startDate: formData.startDate,
                endDate: endDate.toISOString().split('T')[0],
                termMonths: termMonths,
                monthlyPayment: loanDetails.monthlyPayment,
                totalInterest: loanDetails.totalInterest,
                totalAmount: loanDetails.totalAmount,
                remainingAmount: loanDetails.totalAmount - l.paidAmount,
                notes: formData.notes,
                collateral: formData.collateral,
                guarantor: formData.guarantor
            } : l
        );

        setLoans(updatedLoans);
        setIsEditDialogOpen(false);
        setEditingLoan(null);
        setFormData({
            borrowerName: '',
            borrowerId: '',
            borrowerType: 'employee',
            principalAmount: '',
            interestRate: '',
            currency: '',
            loanPurpose: '',
            loanType: 'personal',
            startDate: '',
            termMonths: '',
            notes: '',
            collateral: '',
            guarantor: ''
        });
        toast.success('Loan updated successfully');
    };

    const handleDelete = (id: string) => {
        setLoans(loans.filter(l => l.id !== id));
        toast.success('Loan deleted successfully');
    };

    const handleStatusChange = (id: string, status: Loan['status']) => {
        setLoans(prev => prev.map(loan => 
            loan.id === id 
                ? { ...loan, status: status }
                : loan
        ));
        toast.success(`Loan ${status} successfully`);
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalLoans = filteredLoans.length;
    const totalPrincipal = filteredLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    const totalOutstanding = filteredLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const activeLoans = filteredLoans.filter(l => l.status === 'active').length;

    const columns = [
        {
            key: 'loanNumber' as keyof Loan,
            header: 'Loan Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '120px'
        },
        {
            key: 'borrowerName' as keyof Loan,
            header: 'Borrower',
            render: (value: any, loan: Loan) => (
                <div>
                    <div className="font-semibold text-slate-800">{loan.borrowerName}</div>
                    <div className="text-sm text-slate-600">{loan.borrowerId}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'borrowerType' as keyof Loan,
            header: 'Type',
            render: (value: any) => {
                const typeColors = {
                    'employee': 'bg-blue-50 text-blue-700 border-blue-200',
                    'contractor': 'bg-green-50 text-green-700 border-green-200',
                    'client': 'bg-purple-50 text-purple-700 border-purple-200',
                    'other': 'bg-gray-50 text-gray-700 border-gray-200'
                };
                
                return (
                    <Badge variant="outline" className={`${typeColors[value as keyof typeof typeColors]} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'principalAmount' as keyof Loan,
            header: 'Principal Amount',
            render: (value: any, loan: Loan) => (
                <span className="font-semibold text-slate-800">
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'interestRate' as keyof Loan,
            header: 'Interest Rate',
            render: (value: any) => (
                <span className="text-slate-700">{value}%</span>
            ),
            sortable: true
        },
        {
            key: 'monthlyPayment' as keyof Loan,
            header: 'Monthly Payment',
            render: (value: any, loan: Loan) => (
                <span className="font-semibold text-slate-800">
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'remainingAmount' as keyof Loan,
            header: 'Remaining',
            render: (value: any, loan: Loan) => (
                <span className={`font-semibold ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'endDate' as keyof Loan,
            header: 'End Date',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'status' as keyof Loan,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'active': 'bg-green-100 text-green-700 border-green-200',
                    'completed': 'bg-blue-100 text-blue-700 border-blue-200',
                    'defaulted': 'bg-red-100 text-red-700 border-red-200',
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
            onClick: (loan: Loan) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Loan',
            onClick: (loan: Loan) => handleEdit(loan),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Mark as Completed',
            onClick: (loan: Loan) => handleStatusChange(loan.id, 'completed'),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (loan: Loan) => loan.status !== 'active'
        },
        {
            label: 'Mark as Defaulted',
            onClick: (loan: Loan) => handleStatusChange(loan.id, 'defaulted'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (loan: Loan) => loan.status !== 'active'
        },
        {
            label: 'Cancel Loan',
            onClick: (loan: Loan) => handleStatusChange(loan.id, 'cancelled'),
            icon: <XCircle className="h-4 w-4" />,
            hidden: (loan: Loan) => loan.status === 'completed' || loan.status === 'cancelled'
        },
        {
            label: 'Delete Loan',
            onClick: (loan: Loan) => handleDelete(loan.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Loans',
            value: totalLoans,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Total Principal',
            value: formatNumber(totalPrincipal),
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Outstanding Amount',
            value: formatNumber(totalOutstanding),
            change: '+5%',
            trend: 'up' as const
        },
        {
            label: 'Active Loans',
            value: activeLoans,
            change: '+3%',
            trend: 'up' as const
        }
    ];

    const filterOptions = [
        {
            key: 'borrowerType',
            label: 'Borrower Type',
            value: borrowerTypeFilter,
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                ...borrowerTypes.map(type => ({ key: type.value, label: type.label, value: type.value }))
            ],
            onValueChange: setBorrowerTypeFilter
        },
        {
            key: 'loanType',
            label: 'Loan Type',
            value: loanTypeFilter,
            options: [
                { key: 'all', label: 'All Loan Types', value: 'all' },
                ...loanTypes.map(type => ({ key: type.value, label: type.label, value: type.value }))
            ],
            onValueChange: setLoanTypeFilter
        },
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'active', label: 'Active', value: 'active' },
                { key: 'completed', label: 'Completed', value: 'completed' },
                { key: 'defaulted', label: 'Defaulted', value: 'defaulted' },
                { key: 'cancelled', label: 'Cancelled', value: 'cancelled' }
            ],
            onValueChange: setStatusFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (borrowerTypeFilter !== 'all') activeFilters.push(`Borrower Type: ${borrowerTypes.find(t => t.value === borrowerTypeFilter)?.label}`);
    if (loanTypeFilter !== 'all') activeFilters.push(`Loan Type: ${loanTypes.find(t => t.value === loanTypeFilter)?.label}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Loans Management"
                description="Manage loans with comprehensive tracking and payment monitoring"
                stats={stats}
                actions={{
                    primary: {
                        label: 'New Loan',
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
                searchPlaceholder="Search by loan number, borrower name, or purpose..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setBorrowerTypeFilter('all');
                    setLoanTypeFilter('all');
                    setStatusFilter('all');
                }}
            />

            {/* Loans Table */}
            <EnhancedCard
                title="Loans Overview"
                description={`${filteredLoans.length} loans out of ${loans.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: loans.length,
                    badge: 'Active Loans',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredLoans}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No loans found matching your criteria"
                    searchPlaceholder="Search loans..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Loan</DialogTitle>
                        <DialogDescription>
                            Add a new loan with comprehensive details
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
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="borrowerId">Borrower ID</Label>
                                <Input
                                    id="borrowerId"
                                    value={formData.borrowerId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, borrowerId: e.target.value }))}
                                    placeholder="Borrower ID"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="borrowerType">Borrower Type</Label>
                                <Select value={formData.borrowerType} onValueChange={(value) => setFormData(prev => ({ ...prev, borrowerType: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {borrowerTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="principalAmount">Principal Amount</Label>
                                <Input
                                    id="principalAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.principalAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, principalAmount: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="interestRate">Interest Rate (%)</Label>
                                <Input
                                    id="interestRate"
                                    type="number"
                                    step="0.01"
                                    value={formData.interestRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                            <div>
                                <Label htmlFor="termMonths">Term (Months)</Label>
                                <Input
                                    id="termMonths"
                                    type="number"
                                    value={formData.termMonths}
                                    onChange={(e) => setFormData(prev => ({ ...prev, termMonths: e.target.value }))}
                                    placeholder="12"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="loanPurpose">Loan Purpose</Label>
                            <Select value={formData.loanPurpose} onValueChange={(value) => setFormData(prev => ({ ...prev, loanPurpose: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select Purpose" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loanPurposes.map(purpose => (
                                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="loanType">Loan Type</Label>
                            <Select value={formData.loanType} onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {loanTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="collateral">Collateral</Label>
                            <Input
                                id="collateral"
                                value={formData.collateral}
                                onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
                                placeholder="Collateral description"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="guarantor">Guarantor</Label>
                            <Input
                                id="guarantor"
                                value={formData.guarantor}
                                onChange={(e) => setFormData(prev => ({ ...prev, guarantor: e.target.value }))}
                                placeholder="Guarantor name"
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
                                <CreditCard className="h-4 w-4 mr-2" />
                                Create Loan
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Loan</DialogTitle>
                        <DialogDescription>
                            Update loan information and details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-borrowerName">Borrower Name</Label>
                            <Input
                                id="edit-borrowerName"
                                value={formData.borrowerName}
                                onChange={(e) => setFormData(prev => ({ ...prev, borrowerName: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-borrowerId">Borrower ID</Label>
                                <Input
                                    id="edit-borrowerId"
                                    value={formData.borrowerId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, borrowerId: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-borrowerType">Borrower Type</Label>
                                <Select value={formData.borrowerType} onValueChange={(value) => setFormData(prev => ({ ...prev, borrowerType: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {borrowerTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-principalAmount">Principal Amount</Label>
                                <Input
                                    id="edit-principalAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.principalAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, principalAmount: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-interestRate">Interest Rate (%)</Label>
                                <Input
                                    id="edit-interestRate"
                                    type="number"
                                    step="0.01"
                                    value={formData.interestRate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                            <div>
                                <Label htmlFor="edit-termMonths">Term (Months)</Label>
                                <Input
                                    id="edit-termMonths"
                                    type="number"
                                    value={formData.termMonths}
                                    onChange={(e) => setFormData(prev => ({ ...prev, termMonths: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-loanPurpose">Loan Purpose</Label>
                            <Select value={formData.loanPurpose} onValueChange={(value) => setFormData(prev => ({ ...prev, loanPurpose: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {loanPurposes.map(purpose => (
                                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-loanType">Loan Type</Label>
                            <Select value={formData.loanType} onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {loanTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-startDate">Start Date</Label>
                            <Input
                                id="edit-startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-collateral">Collateral</Label>
                            <Input
                                id="edit-collateral"
                                value={formData.collateral}
                                onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-guarantor">Guarantor</Label>
                            <Input
                                id="edit-guarantor"
                                value={formData.guarantor}
                                onChange={(e) => setFormData(prev => ({ ...prev, guarantor: e.target.value }))}
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