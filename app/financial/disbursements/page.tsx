'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    fetchDisbursements,
    deleteDisbursement,
    selectDisbursementsList,
    selectDisbursementsPagination,
    selectDisbursementsLoading,
} from '@/stores/slices/financial-disbursements';
import type { Disbursement } from '@/stores/types/financial-disbursements';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { DeleteDialog } from '@/components/delete-dialog';
import { Eye, FileSpreadsheet, Inbox, Plus, RefreshCw, Search, SquarePen, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { FinancialAnalysisButton } from '@/components/ai/FinancialAnalysisModal';
import { AnomalyDetectionButton } from '@/components/ai/AnomalyDetectionPanel';

const STATUS_OPTIONS = ['Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected', 'Paid', 'Cancelled'] as const;
const SOURCE_OPTIONS = ['Bank', 'Sarraf', 'Petty_Cash'] as const;

const STATUS_COLORS: Record<string, string> = {
    Draft:        'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
    Submitted:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Under_Review: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    Approved:     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Paid:         'bg-green-600/10 dark:bg-green-500/20 text-green-800 dark:text-green-200 border-green-600 dark:border-green-400',
    Rejected:     'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    Cancelled:    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700',
};

function escapeCsv(val: any) {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function DisbursementsListPage() {
    const router   = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const list       = useSelector(selectDisbursementsList);
    const pagination = useSelector(selectDisbursementsPagination);
    const loading    = useSelector(selectDisbursementsLoading);

    const [search, setSearch]               = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus]               = useState('All');
    const [paymentSource, setPaymentSource] = useState('All');
    const [dateFrom, setDateFrom]           = useState('');
    const [dateTo, setDateTo]               = useState('');
    const [page, setPage]                   = useState(1);
    const [perPage, setPerPage]             = useState(10);
    const [isRefreshing, setIsRefreshing]   = useState(false);
    const [isExporting, setIsExporting]     = useState(false);

    // Delete dialog
    const [deleteOpen, setDeleteOpen]       = useState(false);
    const [selectedId, setSelectedId]       = useState<string | null>(null);
    const [deleting, setDeleting]           = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, perPage, debouncedSearch, status, paymentSource, dateFrom, dateTo });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchDisbursements({
            page,
            per_page:       perPage,
            status:         status !== 'All' ? status : undefined,
            payment_source: paymentSource !== 'All' ? paymentSource : undefined,
            date_from:      dateFrom || undefined,
            date_to:        dateTo   || undefined,
        }));
    }, [dispatch, page, perPage, debouncedSearch, status, paymentSource, dateFrom, dateTo]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchDisbursements({
                page,
                per_page:       perPage,
                status:         status !== 'All' ? status : undefined,
                payment_source: paymentSource !== 'All' ? paymentSource : undefined,
                date_from:      dateFrom || undefined,
                date_to:        dateTo   || undefined,
            })).unwrap();
            toast.success('Table refreshed successfully');
        } catch { toast.error('Failed to refresh table'); }
        finally { setIsRefreshing(false); }
    };

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['Ref No.', 'Project', 'Source', 'Amount', 'Currency', 'Beneficiary', 'Category', 'Status', 'Created'];
            const rows = list.map(d => [
                escapeCsv(d.disbursement_no || d.id?.slice(0, 8) || ''),
                escapeCsv(d.project_id || ''),
                d.payment_source,
                d.amount,
                d.currency,
                escapeCsv(d.beneficiary_name || ''),
                d.cost_category || '',
                d.status,
                d.created_at ? String(d.created_at).slice(0, 10) : '',
            ].join(','));
            const csv  = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `disbursements_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported successfully');
        } catch { toast.error('Export failed'); }
        finally { setIsExporting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!id) return;
        setDeleting(true);
        try {
            await dispatch(deleteDisbursement(id)).unwrap();
            toast.success('Disbursement deleted');
            dispatch(fetchDisbursements({
                page, per_page: perPage,
                status:         status !== 'All' ? status : undefined,
                payment_source: paymentSource !== 'All' ? paymentSource : undefined,
                date_from:      dateFrom || undefined,
                date_to:        dateTo   || undefined,
            }));
        } catch (e: any) { toast.error(typeof e === 'string' ? e : e?.message || 'Delete failed'); }
        finally { setDeleting(false); setDeleteOpen(false); setSelectedId(null); }
    };

    const totalPages = pagination?.last_page ?? 1;
    const totalItems = pagination?.total ?? list.length;

    // Summary stats
    const stats = useMemo(() => ({
        totalAmount: list.reduce((s, d) => s + Number(d.amount || 0), 0),
        paidCount:   list.filter(d => d.status === 'Paid').length,
        pendingCount: list.filter(d => d.status === 'Draft' || d.status === 'Submitted' || d.status === 'Under_Review').length,
    }), [list]);

    const columns: Column<Disbursement>[] = useMemo(() => [
        {
            key: 'disbursement_no' as keyof Disbursement,
            header: 'Ref No.',
            render: (v: any, row: Disbursement) => (
                <span className="font-mono font-semibold text-brand-sky-700 dark:text-brand-sky-400 text-sm">
                    {v || row.id?.slice(0, 8) || '—'}
                </span>
            ),
            sortable: true, width: '140px',
        },
        {
            key: 'project_id' as keyof Disbursement,
            header: 'Project',
            render: (v: any) => (
                <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{v || '—'}</span>
            ),
            sortable: true,
        },
        {
            key: 'payment_source' as keyof Disbursement,
            header: 'Source',
            render: (v: any) => {
                const colors: Record<string, string> = {
                    Bank:       'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Sarraf:     'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
                    Petty_Cash: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                };
                return (
                    <Badge variant="outline" className={colors[v] || 'bg-slate-100 dark:bg-slate-800'}>
                        {v === 'Sarraf' ? 'Exchange' : v?.replace('_', ' ')}
                    </Badge>
                );
            },
            sortable: true,
        },
        {
            key: 'amount' as keyof Disbursement,
            header: 'Amount',
            render: (v: any, row: Disbursement) => (
                <div className="text-right">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">{row.currency}</span>
                    </div>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'beneficiary_name' as keyof Disbursement,
            header: 'Beneficiary',
            render: (v: any) => (
                <span className="font-medium text-slate-800 dark:text-slate-200">{v || '—'}</span>
            ),
            sortable: true,
        },
        {
            key: 'cost_category' as keyof Disbursement,
            header: 'Category',
            render: (v: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">{v || '—'}</span>
            ),
            sortable: true,
        },
        {
            key: 'status' as keyof Disbursement,
            header: 'Status',
            render: (v: any) => (
                <Badge variant="outline" className={STATUS_COLORS[v] || 'bg-slate-100 dark:bg-slate-800'}>
                    {v?.replace('_', ' ')}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'created_at' as keyof Disbursement,
            header: 'Created',
            render: (v: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {v ? String(v).slice(0, 10) : '—'}
                </span>
            ),
            sortable: true,
        },
    ], []);

    const actions: Action<Disbursement>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            variant: 'info',
            onClick: (row) => router.push(`/financial/disbursements/${row.disbursement_id || row.id}`),
        },
        {
            label: 'Edit',
            icon: <SquarePen className="h-4 w-4" />,
            variant: 'warning',
            onClick: (row) => router.push(`/financial/disbursements/${row.disbursement_id || row.id}`),
            hidden: (row) => row.status === 'Paid' || row.status === 'Cancelled' || row.status === 'Rejected',
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            onClick: (row) => {
                setSelectedId(row.disbursement_id || row.id || null);
                setDeleteOpen(true);
            },
            hidden: (row) => row.status !== 'Draft',
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (status !== 'All') activeFilters.push(`Status: ${status}`);
    if (paymentSource !== 'All') activeFilters.push(`Source: ${paymentSource}`);
    if (dateFrom) activeFilters.push(`From: ${dateFrom}`);
    if (dateTo) activeFilters.push(`To: ${dateTo}`);

    const clearFilters = () => {
        setSearch(''); setStatus('All'); setPaymentSource('All');
        setDateFrom(''); setDateTo(''); setPage(1);
    };

    return (
        <>
            <div className="space-y-4">
                <Breadcrumb />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Disbursements</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
                            Manage all project payment requests — Bank, Exchange, and Petty Cash
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <FinancialAnalysisButton
                            data={{
                                disbursements_by_category: list.reduce<Record<string, number>>((acc, d) => {
                                    const cat = d.cost_category || 'Other';
                                    acc[cat] = (acc[cat] || 0) + Number(d.amount || 0);
                                    return acc;
                                }, {}),
                                total_disbursements: list.reduce((s, d) => s + Number(d.amount || 0), 0),
                            }}
                        />
                        <AnomalyDetectionButton
                            data={list.slice(0, 50).map(d => ({
                                invoice_no: d.disbursement_no || d.id || '',
                                vendor:     d.beneficiary_name || '',
                                amount:     Number(d.amount || 0),
                                date:       d.created_at ? String(d.created_at).slice(0, 10) : '',
                                status:     d.status || '',
                            }))}
                        />
                        <Button
                            variant="outline"
                            onClick={() => router.push('/financial/disbursements/inbox')}
                            className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                        >
                            <Inbox className="h-4 w-4 mr-2" />
                            My Queue
                        </Button>
                        <Button
                            onClick={() => router.push('/financial/disbursements/new')}
                            className="bg-brand-sky-600 hover:bg-brand-sky-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Disbursement
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <EnhancedCard title="Total Disbursements" description="In current view" variant="default" size="sm"
                        stats={{ total: totalItems, badge: 'Total', badgeColor: 'default' }}>
                        <></>
                    </EnhancedCard>
                    <EnhancedCard title="Total Amount" description="Sum on current page" variant="default" size="sm"
                        stats={{ total: 0, badge: stats.totalAmount.toLocaleString(), badgeColor: 'default' }}>
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                            {stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </p>
                    </EnhancedCard>
                    <EnhancedCard title="Paid" description="Completed payments" variant="default" size="sm"
                        stats={{ total: stats.paidCount, badge: 'Paid', badgeColor: 'success' }}>
                        <></>
                    </EnhancedCard>
                    <EnhancedCard title="Pending Review" description="Draft, Submitted, Under Review" variant="default" size="sm"
                        stats={{ total: stats.pendingCount, badge: 'Pending', badgeColor: 'warning' }}>
                        <></>
                    </EnhancedCard>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Filter disbursements by status, source, and date range"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search + Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by disbursement number or beneficiary..."
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={exportCsv} disabled={isExporting || loading}
                                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                                >
                                    <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                    {isExporting ? 'Exporting...' : 'Export CSV'}
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={refreshTable} disabled={isRefreshing || loading}
                                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                                <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {s.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Source Filter */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Payment Source</Label>
                                <Select value={paymentSource} onValueChange={v => { setPaymentSource(v); setPage(1); }}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Sources" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Sources</SelectItem>
                                        {SOURCE_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {s === 'Sarraf' ? 'Exchange' : s.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* From Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">From Date</Label>
                                <DatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} />
                            </div>

                            {/* To Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">To Date</Label>
                                <DatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} />
                            </div>
                        </div>

                        {/* Active Filters & Clear Button */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((f, i) => (
                                        <Badge key={i} variant="outline" className="bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800">
                                            {f}
                                        </Badge>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={clearFilters}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap">
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Disbursements Table */}
                <EnhancedCard
                    title="Disbursements List"
                    description={`${totalItems} disbursement${totalItems !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{ total: totalItems, badge: 'Total', badgeColor: 'default' }}
                    headerActions={
                        <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                {[5, 10, 20, 50, 100].map(n => (
                                    <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={list}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{
                            currentPage: page,
                            totalPages:  totalPages || 1,
                            pageSize:    perPage,
                            totalItems,
                            onPageChange: setPage,
                        }}
                        noDataMessage="No disbursements found matching your search criteria"
                        searchPlaceholder="Search disbursements..."
                    />
                </EnhancedCard>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteDialog
                open={deleteOpen}
                onClose={() => { if (!deleting) { setDeleteOpen(false); setSelectedId(null); } }}
                onConfirm={() => selectedId && handleDelete(selectedId)}
            />
        </>
    );
}
