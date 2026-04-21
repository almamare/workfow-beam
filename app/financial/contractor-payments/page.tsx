'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    fetchContractorPayments,
    createContractorPayment,
    selectContractorPayments,
    selectContractorPaymentsLoading,
    selectContractorPaymentsSubmitting,
    selectContractorPaymentsTotal,
    selectContractorPaymentsPages,
    selectContractorPaymentsError,
} from '@/stores/slices/contractor-payments';
import { fetchContractors, selectContractors } from '@/stores/slices/contractors';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RefreshCw, FileSpreadsheet, Eye, SquarePen, Trash2, X, Search, Loader2, Plus, DollarSign } from 'lucide-react';
import type { ContractorPayment, CreateContractorPaymentPayload } from '@/stores/types/contractor-payments';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import { DeleteDialog } from '@/components/delete-dialog';

const CURRENCIES = ['IQD', 'USD', 'EUR', 'AED', 'SAR', 'TRY'];
const PAYMENT_METHODS = ['Bank', 'Cash', 'Check', 'Other'] as const;

const EMPTY_FORM: CreateContractorPaymentPayload = {
    contractor_id: '',
    project_id: '',
    currency: 'IQD',
    amount: 0,
    exchange_rate: 1,
    payment_date: '',
    payment_method: 'Bank',
    payment_ref: '',
    purpose: '',
    status: 'Draft',
    notes: '',
};

function fmt(n: number | string | null | undefined) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n) || 0);
}

function ContractorPaymentsPageContent() {
    const dispatch = useReduxDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();

    const payments    = useSelector(selectContractorPayments);
    const loading     = useSelector(selectContractorPaymentsLoading);
    const submitting  = useSelector(selectContractorPaymentsSubmitting);
    const total       = useSelector(selectContractorPaymentsTotal);
    const pages       = useSelector(selectContractorPaymentsPages);
    const error       = useSelector(selectContractorPaymentsError);
    const contractors = useSelector(selectContractors);
    const projects    = useSelector(selectProjects);

    const [search, setSearch]                   = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [contractorFilter, setContractorFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter]       = useState<'All' | 'Draft' | 'Submitted' | 'Approved' | 'Paid' | 'Cancelled'>('All');
    const [methodFilter, setMethodFilter]       = useState<'All' | 'Bank' | 'Cash' | 'Check' | 'Other'>('All');
    const [dateFrom, setDateFrom]               = useState<string>('');
    const [dateTo, setDateTo]                   = useState<string>('');
    const [page, setPage]                       = useState(1);
    const [limit, setLimit]                     = useState(10);
    const [isRefreshing, setIsRefreshing]       = useState(false);
    const [isExporting, setIsExporting]         = useState(false);

    // Create dialog
    const [createOpen, setCreateOpen]           = useState(false);
    const [formData, setFormData]               = useState<CreateContractorPaymentPayload>({ ...EMPTY_FORM });

    // Delete dialog
    const [open, setOpen]                       = useState(false);
    const [selectedId, setSelectedId]           = useState<string | null>(null);
    const [deleting, setDeleting]               = useState(false);

    useEffect(() => {
        const status = searchParams.get('status');
        if (status && ['Draft', 'Submitted', 'Approved', 'Paid', 'Cancelled'].includes(status)) {
            setStatusFilter(status as any);
        }
    }, [searchParams]);

    useEffect(() => { if (error) toast.error(error); }, [error]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef<string>('');
    useEffect(() => {
        const key = JSON.stringify({
            page, limit, search: debouncedSearch,
            contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            payment_method: methodFilter !== 'All' ? methodFilter : undefined,
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchContractorPayments({
            page, limit, search: debouncedSearch,
            contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            payment_method: methodFilter !== 'All' ? methodFilter : undefined,
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, contractorFilter, statusFilter, methodFilter, dateFrom, dateTo]);

    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    // Stats
    const stats = useMemo(() => ({
        totalAmount: payments.reduce((s, p) => s + Number(p.amount || 0), 0),
        paidCount:   payments.filter(p => p.status === 'Paid').length,
        pendingCount: payments.filter(p => p.status === 'Draft' || p.status === 'Submitted').length,
    }), [payments]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchContractorPayments({
                page, limit, search: debouncedSearch,
                contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                payment_method: methodFilter !== 'All' ? methodFilter : undefined,
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            })).unwrap();
            toast.success('Table refreshed successfully');
        } catch { toast.error('Failed to refresh table'); }
        finally { setIsRefreshing(false); }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/contractor-payments/fetch', {
                params: {
                    search: debouncedSearch,
                    contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    payment_method: methodFilter !== 'All' ? methodFilter : undefined,
                    limit: 10000, page: 1,
                    ...(dateFrom ? { from_date: dateFrom } : {}),
                    ...(dateTo ? { to_date: dateTo } : {}),
                }
            });
            const headers = ['Payment Number', 'Contractor', 'Project', 'Amount', 'Currency', 'Payment Method', 'Payment Date', 'Status', 'Reference', 'Created At'];
            const items   = data.body?.contractor_payments?.items ?? data.data?.contractor_payments?.items ?? [];
            const rows    = items.map((p: ContractorPayment) =>
                [p.payment_no, p.contractor_name, p.project_name, p.amount, p.currency, p.payment_method, p.payment_date, p.status, p.payment_ref, p.created_at].join(',')
            );
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.download = `contractor_payments_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link); link.click();
            window.URL.revokeObjectURL(url); link.remove();
            toast.success('Contractor payments exported successfully');
        } catch { toast.error('Failed to export contractor payments'); }
        finally { setIsExporting(false); }
    };

    const handleCreate = async () => {
        if (!formData.contractor_id || !formData.amount || !formData.payment_date || !formData.purpose) {
            toast.error('Contractor, amount, payment date, and purpose are required');
            return;
        }
        try {
            await dispatch(createContractorPayment({
                ...formData,
                amount: Number(formData.amount),
                exchange_rate: Number(formData.exchange_rate) || 1,
            })).unwrap();
            toast.success('Payment created successfully');
            setCreateOpen(false);
            setFormData({ ...EMPTY_FORM });
            dispatch(fetchContractorPayments({ page, limit }));
        } catch (e: any) { toast.error(typeof e === 'string' ? e : e?.message || 'Create failed'); }
    };

    const handleDeletePayment = useCallback(async (id: string) => {
        if (!id) return;
        try {
            setDeleting(true);
            await axios.delete(`/contractor-payments/delete/${id}`);
            toast.success('Payment deleted successfully');
            dispatch(fetchContractorPayments({
                page, limit, search: debouncedSearch,
                contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                payment_method: methodFilter !== 'All' ? methodFilter : undefined,
                from_date: dateFrom || undefined, to_date: dateTo || undefined,
            }));
        } catch { toast.error('Failed to delete payment'); }
        finally { setDeleting(false); setOpen(false); setSelectedId(null); }
    }, [dispatch, page, limit, debouncedSearch, contractorFilter, statusFilter, methodFilter, dateFrom, dateTo]);

    const columns: Column<ContractorPayment>[] = [
        {
            key: 'payment_no' as keyof ContractorPayment,
            header: 'Payment No.',
            render: (v: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{v}</span>,
            sortable: true, width: '130px',
        },
        {
            key: 'contractor_name' as keyof ContractorPayment,
            header: 'Contractor',
            render: (v: any, p: ContractorPayment) => (
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{v || 'N/A'}</span>
                    {p.contractor_id && <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{p.contractor_id}</div>}
                </div>
            ),
            sortable: true,
        },
        {
            key: 'project_name' as keyof ContractorPayment,
            header: 'Project',
            render: (v: any) => <span className="text-slate-700 dark:text-slate-300">{v || '—'}</span>,
            sortable: true,
        },
        {
            key: 'amount' as keyof ContractorPayment,
            header: 'Amount',
            render: (v: any, p: ContractorPayment) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    {fmt(v)} {p.currency}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'payment_method' as keyof ContractorPayment,
            header: 'Method',
            render: (v: any) => v ? (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {v}
                </Badge>
            ) : <span className="text-slate-400">N/A</span>,
            sortable: true,
        },
        {
            key: 'payment_date' as keyof ContractorPayment,
            header: 'Payment Date',
            render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v || '—'}</span>,
            sortable: true,
        },
        {
            key: 'status' as keyof ContractorPayment,
            header: 'Status',
            render: (v: any) => {
                if (!v) return <span className="text-slate-400">N/A</span>;
                const colors: Record<string, string> = {
                    Draft:     'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    Submitted: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                    Approved:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Paid:      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    Cancelled: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
                };
                return <Badge variant="outline" className={`${colors[v] || ''} w-fit`}>{v}</Badge>;
            },
            sortable: true,
        },
        {
            key: 'payment_ref' as keyof ContractorPayment,
            header: 'Reference',
            render: (v: any) => <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{v || '—'}</span>,
            sortable: true,
        },
        {
            key: 'created_at' as keyof ContractorPayment,
            header: 'Created',
            render: (v: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{v || '—'}</span>,
            sortable: true,
        },
    ];

    const actions: Action<ContractorPayment>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (p: ContractorPayment) => router.push(`/financial/contractor-payments/details?id=${p.payment_id}`),
            variant: 'info' as const,
        },
        {
            label: 'Edit Payment',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (p: ContractorPayment) => router.push(`/financial/contractor-payments/update?id=${p.payment_id}`),
            variant: 'warning' as const,
            hidden: (p: ContractorPayment) => p.status === 'Paid' || p.status === 'Cancelled',
        },
        {
            label: 'Delete Payment',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (p: ContractorPayment) => { setSelectedId(p.payment_id); setOpen(true); },
            variant: 'destructive' as const,
            hidden: (p: ContractorPayment) => p.status === 'Paid',
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (contractorFilter !== 'All') {
        const c = contractors.find(x => x.id === contractorFilter);
        if (c) activeFilters.push(`Contractor: ${c.name}`);
    }
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (methodFilter !== 'All') activeFilters.push(`Method: ${methodFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    const clearFilters = () => {
        setSearch(''); setContractorFilter('All'); setStatusFilter('All');
        setMethodFilter('All'); setDateFrom(''); setDateTo(''); setPage(1);
    };

    return (
        <>
            <div className="space-y-4">
                <Breadcrumb />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Contractor Payments</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
                            Manage all contractor payments with comprehensive filtering and tracking
                        </p>
                    </div>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Payment
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <EnhancedCard title="Total Payments" description="In current view" variant="default" size="sm"
                        stats={{ total, badge: 'Total', badgeColor: 'default' }}>
                        <></>
                    </EnhancedCard>
                    <EnhancedCard title="Total Amount" description="Sum on current page" variant="default" size="sm"
                        stats={{ total: 0, badge: fmt(stats.totalAmount), badgeColor: 'default' }}>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{fmt(stats.totalAmount)}</p>
                    </EnhancedCard>
                    <EnhancedCard title="Paid" description="Completed payments" variant="default" size="sm"
                        stats={{ total: stats.paidCount, badge: 'Paid', badgeColor: 'success' }}>
                        <></>
                    </EnhancedCard>
                    <EnhancedCard title="Pending" description="Draft & submitted" variant="default" size="sm"
                        stats={{ total: stats.pendingCount, badge: 'Pending', badgeColor: 'warning' }}>
                        <></>
                    </EnhancedCard>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter contractor payments by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search + Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by payment number, contractor, project, invoice..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={exportToExcel} disabled={isExporting || loading}
                                    className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                                >
                                    <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                    {isExporting ? 'Exporting...' : 'Export CSV'}
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={refreshTable} disabled={isRefreshing}
                                    className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Contractor</Label>
                                <Select value={contractorFilter} onValueChange={v => { setContractorFilter(v); setPage(1); }}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Contractors" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Contractors</SelectItem>
                                        {contractors.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as any); setPage(1); }}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {['All', 'Draft', 'Submitted', 'Approved', 'Paid', 'Cancelled'].map(s => (
                                            <SelectItem key={s} value={s} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{s === 'All' ? 'All Status' : s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Payment Method</Label>
                                <Select value={methodFilter} onValueChange={v => { setMethodFilter(v as any); setPage(1); }}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Methods" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {['All', 'Bank', 'Cash', 'Check', 'Other'].map(m => (
                                            <SelectItem key={m} value={m} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{m === 'All' ? 'All Methods' : m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">From Date</Label>
                                <DatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">To Date</Label>
                                <DatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} />
                            </div>
                        </div>

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((f, i) => (
                                        <Badge key={i} variant="outline" className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">{f}</Badge>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={clearFilters}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap">
                                    <X className="h-4 w-4 mr-2" />Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Payments Table */}
                <EnhancedCard
                    title="Contractor Payments List"
                    description={`${total} payment${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{ total, badge: 'Total Payments', badgeColor: 'success' }}
                    headerActions={
                        <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                {[5, 10, 20, 50, 100, 200].map(n => (
                                    <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">{n} per page</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={payments}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{ currentPage: page, totalPages: pages, pageSize: limit, totalItems: total, onPageChange: setPage }}
                        noDataMessage="No contractor payments found matching your search criteria"
                        searchPlaceholder="Search contractor payments..."
                    />
                </EnhancedCard>
            </div>

            {/* Delete Dialog */}
            <DeleteDialog
                open={open}
                onClose={() => { if (!deleting) { setOpen(false); setSelectedId(null); } }}
                onConfirm={() => selectedId && handleDeletePayment(selectedId)}
            />

            {/* Create Payment Dialog */}
            <Dialog open={createOpen} onOpenChange={o => { if (!submitting) setCreateOpen(o); }}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>New Contractor Payment</DialogTitle>
                        <DialogDescription>Create a new payment record for a contractor</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Contractor */}
                        <div className="space-y-2">
                            <Label>Contractor *</Label>
                            <Select value={formData.contractor_id} onValueChange={v => setFormData(p => ({ ...p, contractor_id: v }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select contractor" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    {contractors.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project */}
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={formData.project_id || '__none'} onValueChange={v => setFormData(p => ({ ...p, project_id: v === '__none' ? '' : v }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select project (optional)" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="__none" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">No Project</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount + Currency */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount *</Label>
                                <Input type="number" min="0" step="0.01" placeholder="0.00"
                                    value={formData.amount || ''}
                                    onChange={e => setFormData(p => ({ ...p, amount: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={formData.currency} onValueChange={v => setFormData(p => ({ ...p, currency: v }))}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Payment Date + Method */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Payment Date *</Label>
                                <Input type="date" value={formData.payment_date}
                                    onChange={e => setFormData(p => ({ ...p, payment_date: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={formData.payment_method} onValueChange={v => setFormData(p => ({ ...p, payment_method: v as any }))}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Payment Reference */}
                        <div className="space-y-2">
                            <Label>Payment Reference</Label>
                            <Input placeholder="e.g. Bank transfer ref #"
                                value={formData.payment_ref || ''}
                                onChange={e => setFormData(p => ({ ...p, payment_ref: e.target.value }))} />
                        </div>

                        {/* Purpose */}
                        <div className="space-y-2">
                            <Label>Purpose *</Label>
                            <Textarea rows={2} placeholder="What is this payment for?"
                                value={formData.purpose}
                                onChange={e => setFormData(p => ({ ...p, purpose: e.target.value }))} />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status || 'Draft'} onValueChange={v => setFormData(p => ({ ...p, status: v as any }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="Draft" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Draft</SelectItem>
                                    <SelectItem value="Submitted" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Submitted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea rows={2} placeholder="Additional notes"
                                value={formData.notes || ''}
                                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button variant="outline" onClick={() => { setCreateOpen(false); setFormData({ ...EMPTY_FORM }); }} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {submitting ? 'Creating...' : 'Create Payment'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function ContractorPaymentsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        }>
            <ContractorPaymentsPageContent />
        </Suspense>
    );
}
