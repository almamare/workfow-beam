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
import { CreditCard, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Filter, Calendar, TrendingUp, DollarSign, Clock, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { fetchContractors, selectContractors, selectLoading as selectContractorsLoading } from '@/stores/slices/contractors';
import { fetchEmployees, selectEmployees, selectLoading as selectEmployeesLoading } from '@/stores/slices/employees';
import { fetchClients, selectClients, selectClientsLoading } from '@/stores/slices/clients';
import axios from '@/utils/axios';

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

const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'SAR', label: 'Saudi Riyal (SAR)' },
    { value: 'AED', label: 'UAE Dirham (AED)' },
    { value: 'KWD', label: 'Kuwaiti Dinar (KWD)' }
];

export default function LoansPage() {
    const dispatch = useReduxDispatch<AppDispatch>();
    const contractors = useSelector(selectContractors);
    const employees = useSelector(selectEmployees);
    const clients = useSelector(selectClients);
    const contractorsLoading = useSelector(selectContractorsLoading);
    const employeesLoading = useSelector(selectEmployeesLoading);
    const clientsLoading = useSelector(selectClientsLoading);

    const [loans, setLoans] = useState<Loan[]>(mockLoans);
    const [searchTerm, setSearchTerm] = useState('');
    const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<string>('all');
    const [loanTypeFilter, setLoanTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [formData, setFormData] = useState({
        borrowerName: '',
        borrowerId: '',
        borrowerType: 'employee',
        principalAmount: '',
        interestRate: '',
        currency: 'USD',
        loanPurpose: '',
        loanType: 'personal',
        startDate: '',
        termMonths: '',
        notes: '',
        collateral: '',
        guarantor: ''
    });

    // Fetch borrowers data on mount
    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchEmployees({ page: 1, limit: 1000 }));
        dispatch(fetchClients({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // Get borrowers list based on type
    const getBorrowersList = useMemo(() => {
        switch (formData.borrowerType) {
            case 'employee':
                return employees.map(emp => ({ id: emp.id, name: `${emp.name} ${emp.surname}` }));
            case 'contractor':
                return contractors.map(ctr => ({ id: ctr.id, name: ctr.name }));
            case 'client':
                return clients.map(cli => ({ id: cli.id, name: cli.name }));
            default:
                return [];
        }
    }, [formData.borrowerType, employees, contractors, clients]);

    const filteredLoans = useMemo(() => {
        return loans.filter(loan => {
            const matchesSearch = loan.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                loan.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                loan.borrowerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                loan.loanPurpose.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesBorrowerType = borrowerTypeFilter === 'all' || loan.borrowerType === borrowerTypeFilter;
            const matchesLoanType = loanTypeFilter === 'all' || loan.loanType === loanTypeFilter;
            const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
            
            return matchesSearch && matchesBorrowerType && matchesLoanType && matchesStatus;
        });
    }, [loans, searchTerm, borrowerTypeFilter, loanTypeFilter, statusFilter]);

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (searchTerm) arr.push(`Search: ${searchTerm}`);
        if (borrowerTypeFilter !== 'all') {
            const type = borrowerTypes.find(t => t.value === borrowerTypeFilter);
            if (type) arr.push(`Borrower Type: ${type.label}`);
        }
        if (loanTypeFilter !== 'all') {
            const type = loanTypes.find(t => t.value === loanTypeFilter);
            if (type) arr.push(`Loan Type: ${type.label}`);
        }
        if (statusFilter !== 'all') arr.push(`Status: ${statusFilter}`);
        return arr;
    }, [searchTerm, borrowerTypeFilter, loanTypeFilter, statusFilter]);

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

    const handleCreate = async () => {
        if (!formData.borrowerName || !formData.principalAmount || !formData.startDate || !formData.termMonths) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            // TODO: Replace with actual API call
            // const response = await axios.post('/loans/create', {
            //     borrower_name: formData.borrowerName,
            //     borrower_id: formData.borrowerId,
            //     borrower_type: formData.borrowerType,
            //     principal_amount: parseFloat(formData.principalAmount),
            //     interest_rate: parseFloat(formData.interestRate) || 0,
            //     currency: formData.currency,
            //     loan_purpose: formData.loanPurpose,
            //     loan_type: formData.loanType,
            //     start_date: formData.startDate,
            //     term_months: parseInt(formData.termMonths),
            //     notes: formData.notes,
            //     collateral: formData.collateral,
            //     guarantor: formData.guarantor
            // });

            const principalAmount = parseFloat(formData.principalAmount);
            const interestRate = parseFloat(formData.interestRate) || 0;
            const termMonths = parseInt(formData.termMonths);
            const startDate = new Date(formData.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + termMonths);

            const loanDetails = calculateLoanDetails(principalAmount, interestRate, termMonths);

            const borrower = getBorrowersList.find(b => b.id === formData.borrowerId);

            const newLoan: Loan = {
                id: Date.now().toString(),
                loanNumber: `LOAN-${String(loans.length + 1).padStart(3, '0')}`,
                borrowerName: borrower?.name || formData.borrowerName,
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
                currency: 'USD',
                loanPurpose: '',
                loanType: 'personal',
                startDate: '',
                termMonths: '',
                notes: '',
                collateral: '',
                guarantor: ''
            });
            toast.success('Loan created successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to create loan');
        }
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

    const handleUpdate = async () => {
        if (!editingLoan) return;

        try {
            // TODO: Replace with actual API call
            // await axios.put(`/loans/update/${editingLoan.id}`, {
            //     borrower_name: formData.borrowerName,
            //     borrower_id: formData.borrowerId,
            //     borrower_type: formData.borrowerType,
            //     principal_amount: parseFloat(formData.principalAmount),
            //     interest_rate: parseFloat(formData.interestRate) || 0,
            //     currency: formData.currency,
            //     loan_purpose: formData.loanPurpose,
            //     loan_type: formData.loanType,
            //     start_date: formData.startDate,
            //     term_months: parseInt(formData.termMonths),
            //     notes: formData.notes,
            //     collateral: formData.collateral,
            //     guarantor: formData.guarantor
            // });

            const principalAmount = parseFloat(formData.principalAmount);
            const interestRate = parseFloat(formData.interestRate) || 0;
            const termMonths = parseInt(formData.termMonths);
            const startDate = new Date(formData.startDate);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + termMonths);

            const loanDetails = calculateLoanDetails(principalAmount, interestRate, termMonths);

            const borrower = getBorrowersList.find(b => b.id === formData.borrowerId);

            const updatedLoans = loans.map(l =>
                l.id === editingLoan.id ? { 
                    ...l, 
                    borrowerName: borrower?.name || formData.borrowerName,
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
                currency: 'USD',
                loanPurpose: '',
                loanType: 'personal',
                startDate: '',
                termMonths: '',
                notes: '',
                collateral: '',
                guarantor: ''
            });
            toast.success('Loan updated successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update loan');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this loan?')) {
            return;
        }

        try {
            // TODO: Replace with actual API call
            // await axios.delete(`/loans/delete/${id}`);

            setLoans(loans.filter(l => l.id !== id));
            toast.success('Loan deleted successfully');
        } catch (error: any) {
            toast.error(error?.message || 'Failed to delete loan');
        }
    };

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            // TODO: Replace with actual API call
            // await dispatch(fetchLoans({ page, limit, search: searchTerm }));
            await dispatch(fetchContractors({ page: 1, limit: 1000 }));
            await dispatch(fetchEmployees({ page: 1, limit: 1000 }));
            await dispatch(fetchClients({ page: 1, limit: 1000 }));
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
            // const { data } = await axios.get('/loans/fetch', {
            //     params: {
            //         search: searchTerm,
            //         borrower_type: borrowerTypeFilter !== 'all' ? borrowerTypeFilter : undefined,
            //         loan_type: loanTypeFilter !== 'all' ? loanTypeFilter : undefined,
            //         status: statusFilter !== 'all' ? statusFilter : undefined,
            //         limit: 10000,
            //         page: 1
            //     }
            // });

            const headers = ['Loan Number', 'Borrower Name', 'Borrower ID', 'Borrower Type', 'Principal Amount', 'Interest Rate', 'Currency', 'Loan Purpose', 'Loan Type', 'Start Date', 'End Date', 'Term Months', 'Monthly Payment', 'Total Amount', 'Paid Amount', 'Remaining Amount', 'Status'];
            const csvHeaders = headers.join(',');
            const csvRows = filteredLoans.map((l: Loan) => {
                return [
                    l.loanNumber,
                    escapeCsv(l.borrowerName),
                    l.borrowerId,
                    l.borrowerType,
                    l.principalAmount,
                    l.interestRate,
                    l.currency,
                    escapeCsv(l.loanPurpose),
                    l.loanType,
                    l.startDate,
                    l.endDate,
                    l.termMonths,
                    l.monthlyPayment,
                    l.totalAmount,
                    l.paidAmount,
                    l.remainingAmount,
                    l.status
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `loans_${new Date().toISOString().slice(0,10)}.csv`;
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

    const totalLoans = useMemo(() => filteredLoans.length, [filteredLoans]);
    const totalPrincipal = useMemo(() => 
        filteredLoans.reduce((sum, loan) => sum + loan.principalAmount, 0),
        [filteredLoans]
    );
    const totalOutstanding = useMemo(() => 
        filteredLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0),
        [filteredLoans]
    );
    const activeLoans = useMemo(() => 
        filteredLoans.filter(l => l.status === 'active').length,
        [filteredLoans]
    );

    const columns: Column<Loan>[] = [
        {
            key: 'loanNumber' as keyof Loan,
            header: 'Loan Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true
        },
        {
            key: 'borrowerName' as keyof Loan,
            header: 'Borrower',
            render: (value: any, loan: Loan) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{loan.borrowerName}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{loan.borrowerId}</div>
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
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatNumber(value)} {loan.currency}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'interestRate' as keyof Loan,
            header: 'Interest Rate',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value}%</span>
            ),
            sortable: true
        },
        {
            key: 'monthlyPayment' as keyof Loan,
            header: 'Monthly Payment',
            render: (value: any, loan: Loan) => (
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatNumber(value)} {loan.currency}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'remainingAmount' as keyof Loan,
            header: 'Remaining',
            render: (value: any, loan: Loan) => (
                <div>
                    <span className={`font-semibold ${value > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {formatNumber(value)} {loan.currency}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'endDate' as keyof Loan,
            header: 'End Date',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">
                    {value ? new Date(value).toLocaleDateString('en-US') : '-'}
                </span>
            ),
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

    const actions: Action<Loan>[] = [
        {
            label: 'View Details',
            onClick: (loan: Loan) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Loan',
            onClick: (loan: Loan) => handleEdit(loan),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Mark as Completed',
            onClick: (loan: Loan) => handleStatusChange(loan.id, 'completed'),
            icon: <CheckCircle className="h-4 w-4" />,
            variant: 'success' as const,
            hidden: (loan: Loan) => loan.status !== 'active'
        },
        {
            label: 'Mark as Defaulted',
            onClick: (loan: Loan) => handleStatusChange(loan.id, 'defaulted'),
            icon: <XCircle className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (loan: Loan) => loan.status !== 'active'
        },
        {
            label: 'Cancel Loan',
            onClick: (loan: Loan) => handleStatusChange(loan.id, 'cancelled'),
            icon: <XCircle className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (loan: Loan) => loan.status === 'completed' || loan.status === 'cancelled'
        },
        {
            label: 'Delete Loan',
            onClick: (loan: Loan) => handleDelete(loan.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = useMemo(() => [
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
    ], [totalLoans, totalPrincipal, totalOutstanding, activeLoans]);

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

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Loans Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage loans with comprehensive tracking and payment monitoring</p>
                </div>
                <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Loan
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Loans"
                    description="All loans in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalLoans,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Principal"
                    description="Sum of all principal amounts"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalPrincipal,
                        badge: formatNumber(totalPrincipal),
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Outstanding Amount"
                    description="Total remaining to be paid"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalOutstanding,
                        badge: formatNumber(totalOutstanding),
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Active Loans"
                    description="Currently active loans"
                    variant="default"
                    size="sm"
                    stats={{
                        total: activeLoans,
                        badge: 'Active',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by loan number, borrower name, or purpose..."
                searchValue={searchTerm}
                onSearchChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                }}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setBorrowerTypeFilter('all');
                    setLoanTypeFilter('all');
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

            {/* Loans Table */}
            <EnhancedCard
                title="Loans Overview"
                description={`${filteredLoans.length} loans out of ${loans.length} total`}
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
                    data={filteredLoans}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredLoans.length / limit),
                        pageSize: limit,
                        totalItems: filteredLoans.length,
                        onPageChange: setPage
                    }}
                    noDataMessage="No loans found matching your search criteria"
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
                            <Label htmlFor="borrowerType">Borrower Type *</Label>
                            <Select value={formData.borrowerType} onValueChange={(value) => setFormData(prev => ({ ...prev, borrowerType: value, borrowerId: '', borrowerName: '' }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {borrowerTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="borrowerId">Borrower *</Label>
                            <Select 
                                value={formData.borrowerId} 
                                onValueChange={(value) => {
                                    const borrower = getBorrowersList.find(b => b.id === value);
                                    setFormData(prev => ({ ...prev, borrowerId: value, borrowerName: borrower?.name || '' }));
                                }}
                                disabled={!formData.borrowerType || getBorrowersList.length === 0}
                            >
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                    <SelectValue placeholder={formData.borrowerType ? "Select Borrower" : "Select borrower type first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(formData.borrowerType === 'employee' && employeesLoading) || 
                                     (formData.borrowerType === 'contractor' && contractorsLoading) ||
                                     (formData.borrowerType === 'client' && clientsLoading) ? (
                                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                                    ) : getBorrowersList.length === 0 ? (
                                        <SelectItem value="none" disabled>No {formData.borrowerType}s available</SelectItem>
                                    ) : (
                                        getBorrowersList.map(borrower => (
                                            <SelectItem key={borrower.id} value={borrower.id}>{borrower.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="principalAmount">Principal Amount *</Label>
                            <Input
                                id="principalAmount"
                                type="number"
                                step="0.01"
                                value={formData.principalAmount}
                                onChange={(e) => setFormData(prev => ({ ...prev, principalAmount: e.target.value }))}
                                placeholder="0.00"
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
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
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="guarantor">Guarantor</Label>
                            <Input
                                id="guarantor"
                                value={formData.guarantor}
                                onChange={(e) => setFormData(prev => ({ ...prev, guarantor: e.target.value }))}
                                placeholder="Guarantor name"
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
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
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
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
                            <Label htmlFor="edit-borrowerType">Borrower Type *</Label>
                            <Select value={formData.borrowerType} onValueChange={(value) => setFormData(prev => ({ ...prev, borrowerType: value, borrowerId: '', borrowerName: '' }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {borrowerTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-borrowerId">Borrower *</Label>
                            <Select 
                                value={formData.borrowerId} 
                                onValueChange={(value) => {
                                    const borrower = getBorrowersList.find(b => b.id === value);
                                    setFormData(prev => ({ ...prev, borrowerId: value, borrowerName: borrower?.name || '' }));
                                }}
                                disabled={!formData.borrowerType || getBorrowersList.length === 0}
                            >
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
                                    <SelectValue placeholder={formData.borrowerType ? "Select Borrower" : "Select borrower type first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getBorrowersList.length === 0 ? (
                                        <SelectItem value="none" disabled>No {formData.borrowerType}s available</SelectItem>
                                    ) : (
                                        getBorrowersList.map(borrower => (
                                            <SelectItem key={borrower.id} value={borrower.id}>{borrower.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-principalAmount">Principal Amount *</Label>
                                <Input
                                    id="edit-principalAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.principalAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, principalAmount: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
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
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                            <div>
                                <Label htmlFor="edit-termMonths">Term (Months) *</Label>
                                <Input
                                    id="edit-termMonths"
                                    type="number"
                                    value={formData.termMonths}
                                    onChange={(e) => setFormData(prev => ({ ...prev, termMonths: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-loanPurpose">Loan Purpose</Label>
                            <Select value={formData.loanPurpose} onValueChange={(value) => setFormData(prev => ({ ...prev, loanPurpose: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                            <Label htmlFor="edit-loanType">Loan Type *</Label>
                            <Select value={formData.loanType} onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500">
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
                            <Label htmlFor="edit-startDate">Start Date *</Label>
                            <Input
                                id="edit-startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-collateral">Collateral</Label>
                            <Input
                                id="edit-collateral"
                                value={formData.collateral}
                                onChange={(e) => setFormData(prev => ({ ...prev, collateral: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-guarantor">Guarantor</Label>
                            <Input
                                id="edit-guarantor"
                                value={formData.guarantor}
                                onChange={(e) => setFormData(prev => ({ ...prev, guarantor: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
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