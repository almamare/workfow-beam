'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import {
    fetchLoans, createLoan, updateLoan, deleteLoan,
    selectLoans, selectLoansLoading, selectLoansSubmitting,
    selectLoansTotal, selectLoansPages, selectLoansError,
} from '@/stores/slices/loans';
import type { Loan } from '@/stores/types/loans';
import { fetchContractors, selectContractors, selectLoading as selectContractorsLoading } from '@/stores/slices/contractors';
import { fetchEmployees, selectEmployees, selectLoading as selectEmployeesLoading } from '@/stores/slices/employees';
import { fetchClients, selectClients, selectClientsLoading } from '@/stores/slices/clients';

const BORROWER_TYPES = [
    { value: 'Employee',   label: 'Employee' },
    { value: 'Contractor', label: 'Contractor' },
    { value: 'Client',     label: 'Client' },
    { value: 'Other',      label: 'Other' },
];
const LOAN_TYPES = [
    { value: 'Personal',  label: 'Personal' },
    { value: 'Business',  label: 'Business' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Advance',   label: 'Advance' },
];
const CURRENCIES = ['IQD', 'USD', 'EUR', 'AED', 'SAR', 'TRY'];

const STATUS_COLORS: Record<string, string> = {
    Draft:      'bg-slate-100 text-slate-700 border-slate-200',
    Active:     'bg-green-100 text-green-700 border-green-200',
    Completed:  'bg-blue-100 text-blue-700 border-blue-200',
    Defaulted:  'bg-red-100 text-red-700 border-red-200',
    Cancelled:  'bg-gray-100 text-gray-600 border-gray-200',
};
const BORROWER_COLORS: Record<string, string> = {
    Employee:   'bg-blue-50 text-blue-700 border-blue-200',
    Contractor: 'bg-green-50 text-green-700 border-green-200',
    Client:     'bg-purple-50 text-purple-700 border-purple-200',
    Other:      'bg-gray-50 text-gray-700 border-gray-200',
};

const EMPTY_FORM = {
    borrowerType: 'Employee',
    borrowerId: '',
    currency: 'IQD',
    principalAmount: '',
    interestRate: '',
    termMonths: '12',
    startDate: '',
    loanType: 'Personal',
    purpose: '',
    collateral: '',
    guarantor: '',
    notes: '',
};

function fmt(n: number | string | undefined) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n) || 0);
}

function escapeCsv(v: any) {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function LoansPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loans    = useSelector(selectLoans);
    const loading  = useSelector(selectLoansLoading);
    const submitting = useSelector(selectLoansSubmitting);
    const total    = useSelector(selectLoansTotal);
    const pages    = useSelector(selectLoansPages);
    const error    = useSelector(selectLoansError);

    const contractors      = useSelector(selectContractors);
    const employees        = useSelector(selectEmployees);
    const clients          = useSelector(selectClients);
    const contractorsLoad  = useSelector(selectContractorsLoading);
    const employeesLoad    = useSelector(selectEmployeesLoading);
    const clientsLoad      = useSelector(selectClientsLoading);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [borrowerTypeFilter, setBorrowerTypeFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => { if (error) toast.error(error); }, [error]);
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch, statusFilter, borrowerTypeFilter });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchLoans({
            page, limit,
            search: debouncedSearch || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            borrower_type: borrowerTypeFilter !== 'all' ? borrowerTypeFilter : undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, borrowerTypeFilter]);

    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchEmployees({ page: 1, limit: 1000 }));
        dispatch(fetchClients({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // Resolve borrower name client-side from Redux lists
    const resolveBorrowerName = (loan: Loan): string => {
        if (!loan.borrower_id) return '—';
        switch (loan.borrower_type) {
            case 'Employee': {
                const e = employees.find(x => x.id === loan.borrower_id);
                return e ? `${e.name} ${e.surname ?? ''}`.trim() : loan.borrower_id;
            }
            case 'Contractor': {
                const c = contractors.find(x => x.id === loan.borrower_id);
                return c?.name ?? loan.borrower_id;
            }
            case 'Client': {
                const cl = clients.find(x => x.id === loan.borrower_id);
                return cl?.name ?? loan.borrower_id;
            }
            default: return loan.borrower_id;
        }
    };

    const borrowerList = useMemo(() => {
        switch (formData.borrowerType) {
            case 'Employee':   return employees.map(e => ({ id: e.id, name: `${e.name} ${e.surname ?? ''}`.trim() }));
            case 'Contractor': return contractors.map(c => ({ id: c.id, name: c.name }));
            case 'Client':     return clients.map(c => ({ id: c.id, name: c.name }));
            default: return [];
        }
    }, [formData.borrowerType, employees, contractors, clients]);

    const summaryStats = useMemo(() => ({
        totalLoans: total,
        totalPrincipal: loans.reduce((s, l) => s + Number(l.principal_amount || 0), 0),
        totalOutstanding: loans.reduce((s, l) => s + Math.max(0, Number(l.principal_amount || 0) - Number(l.paid_amount || 0)), 0),
        activeLoans: loans.filter(l => l.status === 'Active').length,
    }), [loans, total]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchLoans({
                page, limit,
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                borrower_type: borrowerTypeFilter !== 'all' ? borrowerTypeFilter : undefined,
            })).unwrap();
            toast.success('Refreshed');
        } catch { toast.error('Refresh failed'); }
        finally { setIsRefreshing(false); }
    };

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['Loan No','Borrower','Borrower Type','Loan Type','Currency','Principal','Interest %','Term (mo)','Start Date','End Date','Paid','Status'];
            const rows = loans.map(l => [
                l.loan_no, escapeCsv(resolveBorrowerName(l)), l.borrower_type, l.loan_type,
                l.currency, l.principal_amount, l.interest_rate, l.term_months,
                l.start_date, l.end_date ?? '', l.paid_amount, l.status,
            ].join(','));
            const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `loans_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('Exported');
        } catch { toast.error('Export failed'); }
        finally { setIsExporting(false); }
    };

    const openCreate = () => { setFormData({ ...EMPTY_FORM }); setIsCreateOpen(true); };
    const openEdit = (loan: Loan) => {
        setEditingLoan(loan);
        setFormData({
            borrowerType:    loan.borrower_type,
            borrowerId:      loan.borrower_id,
            currency:        loan.currency,
            principalAmount: String(loan.principal_amount),
            interestRate:    String(loan.interest_rate),
            termMonths:      String(loan.term_months),
            startDate:       loan.start_date,
            loanType:        loan.loan_type,
            purpose:         loan.purpose,
            collateral:      loan.collateral || '',
            guarantor:       loan.guarantor  || '',
            notes:           loan.notes      || '',
        });
        setIsEditOpen(true);
    };

    const handleCreate = async () => {
        if (!formData.borrowerId || !formData.principalAmount || !formData.startDate || !formData.purpose) {
            toast.error('Borrower, amount, start date and purpose are required.');
            return;
        }
        try {
            await dispatch(createLoan({
                borrower_type:    formData.borrowerType as Loan['borrower_type'],
                borrower_id:      formData.borrowerId,
                currency:         formData.currency,
                principal_amount: Number(formData.principalAmount),
                interest_rate:    Number(formData.interestRate) || 0,
                term_months:      Number(formData.termMonths)   || 12,
                start_date:       formData.startDate,
                loan_type:        formData.loanType as Loan['loan_type'],
                purpose:          formData.purpose,
                collateral:       formData.collateral || undefined,
                guarantor:        formData.guarantor  || undefined,
                notes:            formData.notes      || undefined,
                status:           'Active',
            })).unwrap();
            toast.success('Loan created');
            setIsCreateOpen(false);
        } catch (e: any) { toast.error(typeof e === 'string' ? e : e?.message || 'Create failed'); }
    };

    const handleUpdate = async () => {
        if (!editingLoan) return;
        try {
            await dispatch(updateLoan({
                loanId: editingLoan.loan_id,
                payload: {
                    borrower_type:    formData.borrowerType as Loan['borrower_type'],
                    borrower_id:      formData.borrowerId,
                    currency:         formData.currency,
                    principal_amount: Number(formData.principalAmount),
                    interest_rate:    Number(formData.interestRate) || 0,
                    term_months:      Number(formData.termMonths)   || 12,
                    start_date:       formData.startDate,
                    loan_type:        formData.loanType as Loan['loan_type'],
                    purpose:          formData.purpose,
                    collateral:       formData.collateral || undefined,
                    guarantor:        formData.guarantor  || undefined,
                    notes:            formData.notes      || undefined,
                },
            })).unwrap();
            toast.success('Loan updated');
            setIsEditOpen(false);
            setEditingLoan(null);
        } catch (e: any) { toast.error(typeof e === 'string' ? e : e?.message || 'Update failed'); }
    };

    const handleDelete = async (loanId: string) => {
        if (!confirm('Delete this loan? Active or Completed loans cannot be removed.')) return;
        try {
            await dispatch(deleteLoan(loanId)).unwrap();
            toast.success('Loan deleted');
        } catch (e: any) { toast.error(typeof e === 'string' ? e : e?.message || 'Delete failed'); }
    };

    const handleStatusChange = async (loan: Loan, status: Loan['status']) => {
        try {
            await dispatch(updateLoan({ loanId: loan.loan_id, payload: { status } })).unwrap();
            toast.success(`Loan marked as ${status}`);
        } catch (e: any) { toast.error(typeof e === 'string' ? e : e?.message || 'Status change failed'); }
    };

    const columns: Column<Loan>[] = [
        {
            key: 'loan_no' as keyof Loan,
            header: 'Loan Number',
            render: (v: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{v}</span>,
            sortable: true,
        },
        {
            key: 'borrower_id' as keyof Loan,
            header: 'Borrower',
            render: (_: any, loan: Loan) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{resolveBorrowerName(loan)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{loan.borrower_id}</div>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'borrower_type' as keyof Loan,
            header: 'Type',
            render: (v: any) => (
                <Badge variant="outline" className={BORROWER_COLORS[v] || ''}>{v}</Badge>
            ),
            sortable: true,
        },
        {
            key: 'principal_amount' as keyof Loan,
            header: 'Principal',
            render: (v: any, loan: Loan) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {fmt(v)} {loan.currency}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'interest_rate' as keyof Loan,
            header: 'Rate',
            render: (v: any) => <span className="text-slate-700 dark:text-slate-300">{Number(v).toFixed(2)}%</span>,
            sortable: true,
        },
        {
            key: 'paid_amount' as keyof Loan,
            header: 'Remaining',
            render: (v: any, loan: Loan) => {
                const remaining = Math.max(0, Number(loan.principal_amount || 0) - Number(v || 0));
                return (
                    <span className={`font-semibold ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {fmt(remaining)} {loan.currency}
                    </span>
                );
            },
            sortable: true,
        },
        {
            key: 'end_date' as keyof Loan,
            header: 'End Date',
            render: (v: any) => <span className="text-slate-700 dark:text-slate-300">{v || '—'}</span>,
            sortable: true,
        },
        {
            key: 'status' as keyof Loan,
            header: 'Status',
            render: (v: any) => (
                <Badge variant="outline" className={STATUS_COLORS[v] || ''}>{v}</Badge>
            ),
            sortable: true,
        },
    ];

    const actions: Action<Loan>[] = [
        {
            label: 'Edit Loan',
            onClick: (loan: Loan) => openEdit(loan),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const,
            hidden: (loan: Loan) => loan.status === 'Completed' || loan.status === 'Defaulted',
        },
        {
            label: 'Mark Completed',
            onClick: (loan: Loan) => handleStatusChange(loan, 'Completed'),
            icon: <CheckCircle className="h-4 w-4" />,
            variant: 'success' as const,
            hidden: (loan: Loan) => loan.status !== 'Active',
        },
        {
            label: 'Mark Defaulted',
            onClick: (loan: Loan) => handleStatusChange(loan, 'Defaulted'),
            icon: <XCircle className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (loan: Loan) => loan.status !== 'Active',
        },
        {
            label: 'Cancel Loan',
            onClick: (loan: Loan) => handleStatusChange(loan, 'Cancelled'),
            icon: <XCircle className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (loan: Loan) => loan.status === 'Completed' || loan.status === 'Cancelled' || loan.status === 'Defaulted',
        },
        {
            label: 'Delete Loan',
            onClick: (loan: Loan) => handleDelete(loan.loan_id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (loan: Loan) => loan.status === 'Active' || loan.status === 'Completed',
        },
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (statusFilter !== 'all') arr.push(`Status: ${statusFilter}`);
        if (borrowerTypeFilter !== 'all') arr.push(`Borrower Type: ${borrowerTypeFilter}`);
        return arr;
    }, [search, statusFilter, borrowerTypeFilter]);

    const filterOptions = [
        {
            key: 'borrowerType', label: 'Borrower Type', value: borrowerTypeFilter,
            options: [
                { key: 'all', label: 'All Types', value: 'all' },
                ...BORROWER_TYPES.map(t => ({ key: t.value, label: t.label, value: t.value })),
            ],
            onValueChange: (v: string) => { setBorrowerTypeFilter(v); setPage(1); },
        },
        {
            key: 'status', label: 'Status', value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'Draft',     label: 'Draft',     value: 'Draft' },
                { key: 'Active',    label: 'Active',    value: 'Active' },
                { key: 'Completed', label: 'Completed', value: 'Completed' },
                { key: 'Defaulted', label: 'Defaulted', value: 'Defaulted' },
                { key: 'Cancelled', label: 'Cancelled', value: 'Cancelled' },
            ],
            onValueChange: (v: string) => { setStatusFilter(v); setPage(1); },
        },
    ];

    // Shared form fields JSX (used in both create and edit dialogs)
    const formFields = (
        <div className="space-y-4">
            <div>
                <Label>Borrower Type *</Label>
                <Select
                    value={formData.borrowerType}
                    onValueChange={v => setFormData(p => ({ ...p, borrowerType: v, borrowerId: '' }))}
                >
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {BORROWER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {formData.borrowerType !== 'Other' && (
                <div>
                    <Label>Borrower *</Label>
                    <Select
                        value={formData.borrowerId}
                        onValueChange={v => setFormData(p => ({ ...p, borrowerId: v }))}
                        disabled={borrowerList.length === 0}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select borrower" />
                        </SelectTrigger>
                        <SelectContent>
                            {borrowerList.length === 0 ? (
                                <SelectItem value="__none" disabled>No {formData.borrowerType}s loaded</SelectItem>
                            ) : borrowerList.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {formData.borrowerType === 'Other' && (
                <div>
                    <Label>Borrower ID / Name *</Label>
                    <Input
                        className="mt-1"
                        value={formData.borrowerId}
                        onChange={e => setFormData(p => ({ ...p, borrowerId: e.target.value }))}
                        placeholder="Enter borrower identifier"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Currency</Label>
                    <Select value={formData.currency} onValueChange={v => setFormData(p => ({ ...p, currency: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Principal Amount *</Label>
                    <Input className="mt-1" type="number" min="0" step="0.01" placeholder="0.00"
                        value={formData.principalAmount}
                        onChange={e => setFormData(p => ({ ...p, principalAmount: e.target.value }))} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Interest Rate (%)</Label>
                    <Input className="mt-1" type="number" min="0" step="0.01" placeholder="0.00"
                        value={formData.interestRate}
                        onChange={e => setFormData(p => ({ ...p, interestRate: e.target.value }))} />
                </div>
                <div>
                    <Label>Term (Months)</Label>
                    <Input className="mt-1" type="number" min="1" placeholder="12"
                        value={formData.termMonths}
                        onChange={e => setFormData(p => ({ ...p, termMonths: e.target.value }))} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Loan Type</Label>
                    <Select value={formData.loanType} onValueChange={v => setFormData(p => ({ ...p, loanType: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {LOAN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Start Date *</Label>
                    <Input className="mt-1" type="date"
                        value={formData.startDate}
                        onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
            </div>

            <div>
                <Label>Purpose *</Label>
                <Textarea className="mt-1" rows={2} placeholder="What is this loan for?"
                    value={formData.purpose}
                    onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Collateral</Label>
                    <Input className="mt-1" placeholder="e.g. Property deed"
                        value={formData.collateral}
                        onChange={e => setFormData(p => ({ ...p, collateral: e.target.value }))} />
                </div>
                <div>
                    <Label>Guarantor</Label>
                    <Input className="mt-1" placeholder="Guarantor name"
                        value={formData.guarantor}
                        onChange={e => setFormData(p => ({ ...p, guarantor: e.target.value }))} />
                </div>
            </div>

            <div>
                <Label>Notes</Label>
                <Textarea className="mt-1" rows={2} placeholder="Additional notes"
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Loans Management</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage employee and contractor loans with comprehensive tracking</p>
                </div>
                <Button onClick={openCreate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" /> New Loan
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Total Loans" description="In current view" variant="default" size="sm"
                    stats={{ total: summaryStats.totalLoans, badge: 'Total', badgeColor: 'default' }}>
                    <></>
                </EnhancedCard>
                <EnhancedCard title="Total Principal" description="Sum of principal amounts" variant="default" size="sm"
                    stats={{ total: summaryStats.totalPrincipal, badge: fmt(summaryStats.totalPrincipal), badgeColor: 'default' }}>
                    <></>
                </EnhancedCard>
                <EnhancedCard title="Outstanding" description="Remaining to be paid" variant="default" size="sm"
                    stats={{ total: summaryStats.totalOutstanding, badge: fmt(summaryStats.totalOutstanding), badgeColor: 'warning' }}>
                    <></>
                </EnhancedCard>
                <EnhancedCard title="Active Loans" description="Currently active" variant="default" size="sm"
                    stats={{ total: summaryStats.activeLoans, badge: 'Active', badgeColor: 'success' }}>
                    <></>
                </EnhancedCard>
            </div>

            <FilterBar
                searchPlaceholder="Search by loan number or purpose..."
                searchValue={search}
                onSearchChange={v => { setSearch(v); setPage(1); }}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => { setSearch(''); setStatusFilter('all'); setBorrowerTypeFilter('all'); setPage(1); }}
                actions={
                    <>
                        <Button variant="outline" onClick={refreshTable} disabled={isRefreshing}
                            className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50">
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button variant="outline" onClick={exportCsv} disabled={isExporting}
                            className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50">
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </>
                }
            />

            <EnhancedCard
                title="Loans Overview"
                description={`${total} loan${total !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{ total, badge: 'Total', badgeColor: 'default' }}
                headerActions={
                    <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 15, 25, 50, 100].map(n => (
                                <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={loans}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: pages || 1,
                        pageSize: limit,
                        totalItems: total,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No loans found matching your criteria"
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Loan</DialogTitle>
                        <DialogDescription>Add a new loan record to the system</DialogDescription>
                    </DialogHeader>
                    {formFields}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            disabled={submitting}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {submitting ? 'Creating...' : 'Create Loan'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Loan</DialogTitle>
                        <DialogDescription>{editingLoan?.loan_no}</DialogDescription>
                    </DialogHeader>
                    {formFields}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={submitting}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
