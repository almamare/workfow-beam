'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchBudgets,
    selectBudgetItems,
    selectBudgetLoading,
    selectBudgetError,
    selectBudgetMeta,
} from '@/stores/slices/budgets';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import type { Budget } from '@/stores/types/budgets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { RefreshCw, FileSpreadsheet, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';

function fmt(n: number | string | null | undefined) {
    const v = Number(n ?? 0);
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);
}

function escapeCsv(val: any) {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function BudgetsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const items    = useSelector(selectBudgetItems);
    const loading  = useSelector(selectBudgetLoading);
    const error    = useSelector(selectBudgetError);
    const meta     = useSelector(selectBudgetMeta);
    const projects = useSelector(selectProjects);

    const [page, setPage]                   = useState(1);
    const [limit, setLimit]                 = useState(15);
    const [search, setSearch]               = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [fiscalYearFilter, setFiscalYearFilter] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [isRefreshing, setIsRefreshing]   = useState(false);
    const [isExporting, setIsExporting]     = useState(false);

    useEffect(() => { if (error) toast.error(error); }, [error]);

    useEffect(() => {
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchBudgets({ page, limit, search: debouncedSearch || undefined }));
    }, [dispatch, page, limit, debouncedSearch]);

    // Client-side filter by project and fiscal year
    const filtered = useMemo(() => {
        return items.filter(b => {
            const matchProject = !projectFilter || b.project_id === projectFilter;
            const matchYear    = !fiscalYearFilter || b.fiscal_year === fiscalYearFilter;
            return matchProject && matchYear;
        });
    }, [items, projectFilter, fiscalYearFilter]);

    // Get unique fiscal years from data
    const fiscalYears = useMemo(() => {
        const years = items.reduce<string[]>((acc, b) => {
            const year = b.fiscal_year;
            if (!year || acc.includes(year)) return acc;
            acc.push(year);
            return acc;
        }, []);
        years.sort().reverse();
        return years;
    }, [items]);

    // Summary stats
    const stats = useMemo(() => ({
        totalOriginal:  filtered.reduce((s, b) => s + Number(b.original_budget  || 0), 0),
        totalRevised:   filtered.reduce((s, b) => s + Number(b.revised_budget   || 0), 0),
        totalCommitted: filtered.reduce((s, b) => s + Number(b.committed_cost   || 0), 0),
        totalActual:    filtered.reduce((s, b) => s + Number(b.actual_cost      || 0), 0),
    }), [filtered]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchBudgets({ page, limit, search: debouncedSearch || undefined })).unwrap();
            toast.success('Table refreshed successfully');
        } catch { toast.error('Failed to refresh table'); }
        finally { setIsRefreshing(false); }
    };

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['Project', 'Fiscal Year', 'Original Budget', 'Revised Budget', 'Committed Cost', 'Actual Cost', 'Remaining', 'Created At'];
            const rows = filtered.map(b => {
                const proj     = projects.find(p => p.id === b.project_id);
                const remaining = Number(b.revised_budget || b.original_budget || 0) - Number(b.actual_cost || 0);
                return [
                    escapeCsv(proj?.name ?? b.project_id),
                    b.fiscal_year || '',
                    b.original_budget,
                    b.revised_budget,
                    b.committed_cost,
                    b.actual_cost,
                    remaining,
                    b.created_at ? String(b.created_at).slice(0, 10) : '',
                ].join(',');
            });
            const csv  = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href = url;
            a.download = `budgets_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported successfully');
        } catch { toast.error('Export failed'); }
        finally { setIsExporting(false); }
    };

    const columns: Column<Budget>[] = [
        {
            key: 'project_id' as keyof Budget,
            header: 'Project',
            render: (v: any) => {
                const proj = projects.find(p => p.id === v);
                return (
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {proj?.name ?? String(v).slice(0, 12)}
                    </span>
                );
            },
            sortable: true,
        },
        {
            key: 'fiscal_year' as keyof Budget,
            header: 'Fiscal Year',
            render: (v: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold">
                    {v || '—'}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'original_budget' as keyof Budget,
            header: 'Original Budget',
            render: (v: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {fmt(v)}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'revised_budget' as keyof Budget,
            header: 'Revised Budget',
            render: (v: any, row: Budget) => {
                const diff = Number(v || 0) - Number(row.original_budget || 0);
                return (
                    <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{fmt(v)}</span>
                        {diff !== 0 && (
                            <span className={`text-xs ml-1 ${diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                ({diff > 0 ? '+' : ''}{fmt(diff)})
                            </span>
                        )}
                    </div>
                );
            },
            sortable: true,
        },
        {
            key: 'committed_cost' as keyof Budget,
            header: 'Committed',
            render: (v: any) => (
                <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">{fmt(v)}</span>
            ),
            sortable: true,
        },
        {
            key: 'actual_cost' as keyof Budget,
            header: 'Actual Cost',
            render: (v: any) => (
                <span className="font-semibold text-red-600 dark:text-red-400 font-mono">{fmt(v)}</span>
            ),
            sortable: true,
        },
        {
            key: 'revised_budget' as keyof Budget,
            header: 'Remaining',
            render: (_: any, row: Budget) => {
                const budget    = Number(row.revised_budget || row.original_budget || 0);
                const actual    = Number(row.actual_cost || 0);
                const remaining = budget - actual;
                const pct       = budget > 0 ? Math.round((actual / budget) * 100) : 0;
                return (
                    <div>
                        <span className={`font-bold font-mono ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {remaining < 0 ? '−' : ''}{fmt(Math.abs(remaining))}
                        </span>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pct}% spent</div>
                    </div>
                );
            },
            sortable: false,
        },
        {
            key: 'created_at' as keyof Budget,
            header: 'Created',
            render: (v: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {v ? String(v).slice(0, 10) : '—'}
                </span>
            ),
            sortable: true,
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (projectFilter) {
        const proj = projects.find(p => p.id === projectFilter);
        activeFilters.push(`Project: ${proj?.name ?? projectFilter}`);
    }
    if (fiscalYearFilter) activeFilters.push(`Fiscal Year: ${fiscalYearFilter}`);

    const clearFilters = () => {
        setSearch(''); setProjectFilter(''); setFiscalYearFilter(''); setPage(1);
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Project Budgets</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
                        Track original, revised, committed, and actual costs across all project budgets
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportCsv}
                        disabled={isExporting || filtered.length === 0}
                        className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshTable}
                        disabled={isRefreshing || loading}
                        className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Original Budget" description="Total allocated" variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(stats.totalOriginal), badgeColor: 'default' }}>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">{fmt(stats.totalOriginal)}</p>
                </EnhancedCard>
                <EnhancedCard title="Revised Budget" description="After amendments" variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(stats.totalRevised), badgeColor: 'default' }}>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">{fmt(stats.totalRevised)}</p>
                </EnhancedCard>
                <EnhancedCard title="Actual Cost" description="Amount spent" variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(stats.totalActual), badgeColor: 'warning' }}>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1 font-mono">{fmt(stats.totalActual)}</p>
                </EnhancedCard>
                <EnhancedCard title="Remaining" description="Budget - Actual" variant="default" size="sm"
                    stats={{ total: 0, badge: fmt(stats.totalRevised - stats.totalActual), badgeColor: 'success' }}>
                    <p className={`text-xl font-bold mt-1 font-mono ${stats.totalRevised - stats.totalActual >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {fmt(stats.totalRevised - stats.totalActual)}
                    </p>
                </EnhancedCard>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter budgets by project and fiscal year"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search + Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search budgets..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Project Filter */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                            <Select value={projectFilter || '__all'} onValueChange={v => setProjectFilter(v === '__all' ? '' : v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="__all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Projects</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fiscal Year Filter */}
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Fiscal Year</Label>
                            <Select value={fiscalYearFilter || '__all'} onValueChange={v => setFiscalYearFilter(v === '__all' ? '' : v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="__all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Fiscal Years</SelectItem>
                                    {fiscalYears.map(y => (
                                        <SelectItem key={y} value={y} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                {activeFilters.map((f, i) => (
                                    <Badge key={i} variant="outline" className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">
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

            {/* Budgets Table */}
            <EnhancedCard
                title="Budget Overview"
                description={`${filtered.length} budget${filtered.length !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{ total: meta.total, badge: 'Total', badgeColor: 'default' }}
                headerActions={
                    <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
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
                    data={filtered}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        currentPage:  page,
                        totalPages:   meta.pages || 1,
                        pageSize:     limit,
                        totalItems:   meta.total,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No budgets found. Budgets are linked to projects."
                />
            </EnhancedCard>
        </div>
    );
}
