'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchPettyCashBoxes,
    createPettyCashBox,
    topUpPettyCash,
    selectPettyCashList,
    selectPettyCashLoading,
    selectPettyCashPagination,
} from '@/stores/slices/petty-cash';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import type { PettyCashBox } from '@/stores/types/financial-disbursements';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatePicker } from '@/components/DatePicker';
import { toast } from 'sonner';
import { Plus, RefreshCw, Wallet, FileSpreadsheet, Search, X } from 'lucide-react';

const CURRENCIES = ['IQD', 'USD', 'EUR', 'AED', 'SAR', 'TRY'];

function fmt(n: number | string | null | undefined) {
    const v = Number(n ?? 0);
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

function escapeCsv(val: any) {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function PettyCashPage() {
    const dispatch = useDispatch<AppDispatch>();
    const list       = useSelector(selectPettyCashList);
    const loading    = useSelector(selectPettyCashLoading);
    const pagination = useSelector(selectPettyCashPagination);
    const projects   = useSelector(selectProjects);

    const [page, setPage]               = useState(1);
    const [search, setSearch]           = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [dateFrom, setDateFrom]       = useState('');
    const [dateTo, setDateTo]           = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Create dialog
    const [createOpen, setCreateOpen]   = useState(false);
    const [name, setName]               = useState('');
    const [projectId, setProjectId]     = useState('');
    const [currency, setCurrency]       = useState('IQD');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Top-up dialog
    const [topUpOpen, setTopUpOpen]     = useState<PettyCashBox | null>(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isTopping, setIsTopping]     = useState(false);

    useEffect(() => {
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchPettyCashBoxes({ page, per_page: 20 }));
    }, [dispatch, page]);

    const refresh = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchPettyCashBoxes({ page, per_page: 20 })).unwrap();
            toast.success('Refreshed');
        } catch { toast.error('Refresh failed'); }
        finally { setIsRefreshing(false); }
    };

    // Client-side filtering
    const filtered = useMemo(() => {
        return list.filter(box => {
            const proj = projects.find(p => p.id === box.project_id);
            const projName = proj?.name ?? '';
            const matchSearch = !search ||
                box.name.toLowerCase().includes(search.toLowerCase()) ||
                projName.toLowerCase().includes(search.toLowerCase()) ||
                box.currency.toLowerCase().includes(search.toLowerCase());
            const matchProject = !projectFilter || box.project_id === projectFilter;
            return matchSearch && matchProject;
        });
    }, [list, search, projectFilter, projects]);

    // Stats
    const totalBoxes   = pagination?.total ?? list.length;
    const totalBalance = useMemo(() => list.reduce((s, b) => s + Number(b.balance ?? 0), 0), [list]);
    const activeBoxes  = list.filter(b => Number(b.balance ?? 0) > 0).length;

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['Box Name', 'Project', 'Currency', 'Balance'];
            const rows = filtered.map(b => {
                const proj = projects.find(p => p.id === b.project_id);
                return [escapeCsv(b.name), escapeCsv(proj?.name ?? b.project_id ?? ''), b.currency, b.balance ?? 0].join(',');
            });
            const csv  = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `petty_cash_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported successfully');
        } catch { toast.error('Export failed'); }
        finally { setIsExporting(false); }
    };

    const handleCreate = async () => {
        if (!name.trim() || !projectId || !currency.trim()) {
            toast.error('Name, project and currency are required');
            return;
        }
        setIsSubmitting(true);
        try {
            await dispatch(createPettyCashBox({ name: name.trim(), project_id: projectId, currency })).unwrap();
            toast.success('Petty cash box created');
            setCreateOpen(false);
            setName(''); setProjectId(''); setCurrency('IQD');
            dispatch(fetchPettyCashBoxes({ page, per_page: 20 }));
        } catch (e: any) { toast.error(e?.message || 'Create failed'); }
        finally { setIsSubmitting(false); }
    };

    const handleTopUp = async () => {
        if (!topUpOpen || !topUpAmount || Number(topUpAmount) <= 0) {
            toast.error('Enter a valid amount');
            return;
        }
        setIsTopping(true);
        try {
            await dispatch(topUpPettyCash({ id: topUpOpen.id, amount: Number(topUpAmount) })).unwrap();
            toast.success('Top-up recorded');
            setTopUpOpen(null); setTopUpAmount('');
            dispatch(fetchPettyCashBoxes({ page, per_page: 20 }));
        } catch (e: any) { toast.error(e?.message || 'Top-up failed'); }
        finally { setIsTopping(false); }
    };

    const columns: Column<PettyCashBox>[] = [
        {
            key: 'name' as keyof PettyCashBox,
            header: 'Box Name',
            render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>,
            sortable: true,
        },
        {
            key: 'project_id' as keyof PettyCashBox,
            header: 'Project',
            render: (v: any) => {
                const proj = projects.find(p => p.id === v);
                return (
                    <span className="text-slate-700 dark:text-slate-300">
                        {proj?.name ?? (v ? String(v).slice(0, 8) : '—')}
                    </span>
                );
            },
            sortable: true,
        },
        {
            key: 'currency' as keyof PettyCashBox,
            header: 'Currency',
            render: (v: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold">
                    {v}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'balance' as keyof PettyCashBox,
            header: 'Balance',
            render: (v: any, row: PettyCashBox) => {
                const bal = Number(v ?? 0);
                return (
                    <span className={`font-bold font-mono ${bal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {fmt(bal)} {row.currency}
                    </span>
                );
            },
            sortable: true,
        },
    ];

    const actions: Action<PettyCashBox>[] = [
        {
            label: 'Top Up',
            icon: <Wallet className="h-4 w-4" />,
            variant: 'success' as const,
            onClick: (row) => { setTopUpOpen(row); setTopUpAmount(''); },
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (projectFilter) {
        const proj = projects.find(p => p.id === projectFilter);
        activeFilters.push(`Project: ${proj?.name ?? projectFilter}`);
    }

    const clearFilters = () => {
        setSearch('');
        setProjectFilter('');
        setDateFrom('');
        setDateTo('');
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Petty Cash</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Manage petty cash boxes per project — track balances and top-ups
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-lg"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Box
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <EnhancedCard title="Total Boxes" description="Registered cash boxes" variant="default" size="sm"
                    stats={{ total: totalBoxes, badge: 'Total', badgeColor: 'default' }}>
                    <></>
                </EnhancedCard>
                <EnhancedCard title="Combined Balance" description="Sum of all box balances" variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(totalBalance), badgeColor: 'success' }}>
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{fmt(totalBalance)}</p>
                </EnhancedCard>
                <EnhancedCard title="Active Boxes" description="Boxes with positive balance" variant="default" size="sm"
                    stats={{ total: activeBoxes, badge: 'Active', badgeColor: 'success' }}>
                    <></>
                </EnhancedCard>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter petty cash boxes"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search + Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by box name, project, or currency..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportCsv}
                                disabled={isExporting || filtered.length === 0}
                                className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refresh}
                                disabled={isRefreshing}
                                className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Project Filter */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                            <Select
                                value={projectFilter || '__all'}
                                onValueChange={v => setProjectFilter(v === '__all' ? '' : v)}
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

                        {/* From Date */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">From Date</Label>
                            <DatePicker value={dateFrom} onChange={v => setDateFrom(v)} />
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">To Date</Label>
                            <DatePicker value={dateTo} onChange={v => setDateTo(v)} />
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

            {/* Boxes Table */}
            <EnhancedCard
                title="Petty Cash Boxes"
                description={`${filtered.length} box${filtered.length !== 1 ? 'es' : ''} found`}
                variant="default"
                size="sm"
                stats={{ total: totalBoxes, badge: 'Total Boxes', badgeColor: 'default' }}
                headerActions={
                    <Select value={String(20)} onValueChange={() => {}}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                            <SelectValue placeholder="20 per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={filtered}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={
                        pagination
                            ? {
                                currentPage: pagination.current_page,
                                totalPages:  pagination.last_page,
                                pageSize:    pagination.per_page,
                                totalItems:  pagination.total,
                                onPageChange: setPage,
                              }
                            : undefined
                    }
                    noDataMessage="No petty cash boxes found. Create one to get started."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={o => { if (!isSubmitting) setCreateOpen(o); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Petty Cash Box</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Box Name *</Label>
                            <Input
                                placeholder="e.g. Site Office Cash Box"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Project *</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Currency *</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    {CURRENCIES.map(c => (
                                        <SelectItem key={c} value={c} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Creating...' : 'Create Box'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Top-Up Dialog */}
            <Dialog open={!!topUpOpen} onOpenChange={o => { if (!isTopping && !o) setTopUpOpen(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Top Up — {topUpOpen?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0.00"
                                value={topUpAmount}
                                onChange={e => setTopUpAmount(e.target.value)}
                            />
                        </div>
                        {topUpOpen && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Current balance: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{fmt(topUpOpen.balance)} {topUpOpen.currency}</span>
                            </p>
                        )}
                    </div>
                    <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setTopUpOpen(null)} disabled={isTopping}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleTopUp}
                            disabled={isTopping}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                        >
                            <Wallet className="h-4 w-4 mr-2" />
                            {isTopping ? 'Processing...' : 'Confirm Top-Up'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
