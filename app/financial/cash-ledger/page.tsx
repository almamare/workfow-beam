'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchFinancialLedger,
    selectFinancialLedgerItems,
    selectFinancialLedgerPagination,
    selectFinancialLedgerLoading,
    type LedgerListParams,
} from '@/stores/slices/financial-ledger-api';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import {
    RefreshCw, FileSpreadsheet, X,
    Building2, CreditCard, Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';

interface LedgerRow {
    ledger_id: string;
    disbursement_id: string;
    project_id: string;
    payment_source: 'Bank' | 'Sarraf' | 'Petty_Cash';
    source_ref_id?: string;
    currency: string;
    debit_amount: number;
    credit_amount: number;
    balance_after: number;
    transaction_date: string;
    posted_by: string;
}

const SOURCE_ICON: Record<string, React.ReactNode> = {
    Bank:       <Building2 className="h-3.5 w-3.5 mr-1 inline-block" />,
    Sarraf:     <CreditCard className="h-3.5 w-3.5 mr-1 inline-block" />,
    Petty_Cash: <Banknote   className="h-3.5 w-3.5 mr-1 inline-block" />,
};
const SOURCE_COLOR: Record<string, string> = {
    Bank:       'bg-brand-sky-50 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800',
    Sarraf:     'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    Petty_Cash: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

function fmt(n: number | string | null | undefined) {
    const v = Number(n ?? 0);
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function escapeCsv(val: any) {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
        ? '"' + s.replace(/"/g, '""') + '"'
        : s;
}

export default function CashLedgerPage() {
    const dispatch = useDispatch<AppDispatch>();

    const items      = useSelector(selectFinancialLedgerItems) as LedgerRow[];
    const pagination = useSelector(selectFinancialLedgerPagination);
    const loading    = useSelector(selectFinancialLedgerLoading);
    const projects   = useSelector(selectProjects);

    const [page, setPage]                   = useState(1);
    const [perPage, setPerPage]             = useState(15);
    const [projectFilter, setProjectFilter] = useState('');
    const [sourceFilter, setSourceFilter]   = useState('');
    const [dateFrom, setDateFrom]           = useState('');
    const [dateTo, setDateTo]               = useState('');
    const [isRefreshing, setIsRefreshing]   = useState(false);
    const [isExporting, setIsExporting]     = useState(false);

    const lastKeyRef = useRef('');

    useEffect(() => {
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        const key = JSON.stringify({ page, perPage, projectFilter, sourceFilter, dateFrom, dateTo });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchFinancialLedger({
            page,
            per_page:       perPage,
            project_id:     projectFilter || undefined,
            payment_source: sourceFilter  || undefined,
            date_from:      dateFrom      || undefined,
            date_to:        dateTo        || undefined,
        }));
    }, [dispatch, page, perPage, projectFilter, sourceFilter, dateFrom, dateTo]);

    const totalDebit  = useMemo(() => items.reduce((s, r) => s + Number(r.debit_amount  ?? 0), 0), [items]);
    const totalCredit = useMemo(() => items.reduce((s, r) => s + Number(r.credit_amount ?? 0), 0), [items]);
    const totalItems  = pagination?.total ?? items.length;

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchFinancialLedger({
                page, per_page: perPage,
                project_id:     projectFilter || undefined,
                payment_source: sourceFilter  || undefined,
                date_from:      dateFrom      || undefined,
                date_to:        dateTo        || undefined,
            })).unwrap();
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['Ledger ID', 'Disbursement Ref', 'Project', 'Payment Source', 'Currency', 'Debit (Out)', 'Credit (In)', 'Balance After', 'Date', 'Posted By'];
            const rows = items.map(r => {
                const proj = projects.find(p => p.id === r.project_id);
                return [
                    escapeCsv(r.ledger_id),
                    escapeCsv(String(r.disbursement_id).slice(0, 8).toUpperCase()),
                    escapeCsv(proj?.name ?? r.project_id),
                    r.payment_source,
                    r.currency,
                    r.debit_amount,
                    r.credit_amount,
                    r.balance_after,
                    r.transaction_date ? new Date(r.transaction_date).toLocaleDateString('en-CA') : '',
                    escapeCsv(r.posted_by),
                ].join(',');
            });
            const csv  = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `cash_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported successfully');
        } catch {
            toast.error('Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<LedgerRow>[] = [
        {
            key: 'disbursement_id',
            header: 'Ref',
            render: (v: any) => (
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {String(v).slice(0, 8).toUpperCase()}
                </span>
            ),
            sortable: true,
            width: '100px',
        },
        {
            key: 'transaction_date',
            header: 'Date',
            render: (v: any) => (
                <span className="text-sm text-slate-700 dark:text-slate-300">
                    {v ? new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'project_id',
            header: 'Project',
            render: (v: any) => {
                const proj = projects.find(p => p.id === v);
                return (
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {proj?.name ?? String(v).slice(0, 12)}
                    </span>
                );
            },
        },
        {
            key: 'payment_source',
            header: 'Source',
            render: (v: any) => (
                <Badge variant="outline" className={`${SOURCE_COLOR[v] ?? ''} text-xs font-medium`}>
                    {SOURCE_ICON[v]}
                    {v === 'Petty_Cash' ? 'Petty Cash' : v}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'currency',
            header: 'Currency',
            render: (v: any) => (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{v}</span>
            ),
        },
        {
            key: 'debit_amount',
            header: 'Debit (Out)',
            render: (v: any, row: LedgerRow) => (
                <span className="font-semibold text-red-600 dark:text-red-400">
                    {Number(v) > 0 ? `− ${fmt(v)} ${row.currency}` : '—'}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'credit_amount',
            header: 'Credit (In)',
            render: (v: any, row: LedgerRow) => (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {Number(v) > 0 ? `+ ${fmt(v)} ${row.currency}` : '—'}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'balance_after',
            header: 'Balance After',
            render: (v: any, row: LedgerRow) => (
                <span className="font-bold text-slate-800 dark:text-slate-100">
                    {fmt(v)} {row.currency}
                </span>
            ),
            sortable: true,
        },
    ];

    const activeFilters: string[] = [];
    if (projectFilter) {
        const proj = projects.find(p => p.id === projectFilter);
        activeFilters.push(`Project: ${proj?.name ?? projectFilter}`);
    }
    if (sourceFilter) activeFilters.push(`Source: ${sourceFilter === 'Petty_Cash' ? 'Petty Cash' : sourceFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    const clearFilters = () => {
        setProjectFilter('');
        setSourceFilter('');
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Cash Ledger</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Transaction history — entries are auto-posted when disbursements are marked as Paid
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportCsv}
                        disabled={isExporting || items.length === 0}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshTable}
                        disabled={isRefreshing || loading}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <EnhancedCard title="Total Paid (Debit)" description={`${items.length} entries on this page`} variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(totalDebit), badgeColor: 'warning' }}>
                    <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{fmt(totalDebit)}</p>
                </EnhancedCard>
                <EnhancedCard title="Total Received (Credit)" description="Refunds & reversals" variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(totalCredit), badgeColor: 'success' }}>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{fmt(totalCredit)}</p>
                </EnhancedCard>
                <EnhancedCard title="Total Records" description={`Page ${pagination?.current_page ?? page} of ${pagination?.last_page ?? 1}`} variant="default" size="sm"
                    stats={{ total: totalItems, badge: 'Entries', badgeColor: 'default' }}>
                    <></>
                </EnhancedCard>
            </div>

            {/* Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Filter cash ledger entries by project, source, and date range"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Project Filter */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                            <Select
                                value={projectFilter || '__all'}
                                onValueChange={v => { setProjectFilter(v === '__all' ? '' : v); setPage(1); }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="__all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Projects</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Source Filter */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Payment Source</Label>
                            <Select
                                value={sourceFilter || '__all'}
                                onValueChange={v => { setSourceFilter(v === '__all' ? '' : v); setPage(1); }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Sources" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="__all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Sources</SelectItem>
                                    <SelectItem value="Bank" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Bank</SelectItem>
                                    <SelectItem value="Sarraf" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Exchange (Sarraf)</SelectItem>
                                    <SelectItem value="Petty_Cash" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Petty Cash</SelectItem>
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

                    {/* Active Filters */}
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Ledger Table */}
            <EnhancedCard
                title="Ledger Entries"
                description={`${totalItems} transaction${totalItems !== 1 ? 's' : ''} recorded`}
                variant="default"
                size="sm"
                stats={{ total: totalItems, badge: 'Total', badgeColor: 'default' }}
                headerActions={
                    <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[10, 15, 25, 50, 100].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={items}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        currentPage:  pagination?.current_page ?? page,
                        totalPages:   pagination?.last_page    ?? 1,
                        pageSize:     perPage,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage={
                        !loading && items.length === 0
                            ? 'No ledger entries yet. Entries are posted automatically when disbursements are marked as Paid.'
                            : 'No entries match the current filters.'
                    }
                />
            </EnhancedCard>
        </div>
    );
}
