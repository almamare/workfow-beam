'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AppDispatch } from '@/stores/store';

import {
    fetchTaskOrders,
    selectTaskOrders,
    selectTaskOrdersLoading,
    selectTaskOrdersTotal,
    selectTaskOrdersPages,
} from '@/stores/slices/task-orders';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    SquarePen, RefreshCw, FileSpreadsheet, Eye, X, Search,
    GitPullRequestArrow, Plus, Users, FileText,
} from 'lucide-react';
import type { TaskOrder } from '@/stores/types/task-orders';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';

const STATUS_OPTIONS = ['Active', 'Pending', 'Onhold', 'Closed', 'Cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
    Active:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Pending:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Onhold:    'bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800',
    Closed:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

function escapeCsv(val: any) {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function TaskOrdersListPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const taskOrders = useSelector(selectTaskOrders);
    const loading = useSelector(selectTaskOrdersLoading);
    const total = useSelector(selectTaskOrdersTotal);
    const pages = useSelector(selectTaskOrdersPages);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, debouncedSearch, status: statusFilter, dateFrom, dateTo });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchTaskOrders({
            page,
            limit,
            search: debouncedSearch,
            status: statusFilter !== 'All' ? statusFilter : undefined,
        } as any));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, dateFrom, dateTo]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskOrders({
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            } as any));
            toast.success('Table refreshed successfully');
        } catch { toast.error('Failed to refresh table'); }
        finally { setIsRefreshing(false); }
    };

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['ID', 'Task Order #', 'Title', 'Contractor', 'Contract', 'Project', 'Est. Cost', 'Status', 'Issue Date', 'Created'];
            const rows = taskOrders.map((t: TaskOrder) => [
                t.sequence || '',
                escapeCsv(t.task_order_no),
                escapeCsv(t.title),
                escapeCsv(t.contractor_name),
                escapeCsv(t.contract_no || ''),
                escapeCsv(t.project_name),
                t.est_cost || '',
                t.status,
                t.issue_date ? String(t.issue_date).slice(0, 10) : '',
                t.created_at ? String(t.created_at).slice(0, 10) : '',
            ].join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `task_orders_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Exported successfully');
        } catch { toast.error('Export failed'); }
        finally { setIsExporting(false); }
    };

    const stats = useMemo(() => {
        const uniqueContractors = new Set(taskOrders.map((t: TaskOrder) => t.contractor_name).filter(Boolean));
        const uniqueContracts = new Set(taskOrders.map((t: TaskOrder) => t.contract_no).filter(Boolean));
        const activeCount = taskOrders.filter((t: TaskOrder) => t.status === 'Active').length;
        return { uniqueContractors: uniqueContractors.size, uniqueContracts: uniqueContracts.size, activeCount };
    }, [taskOrders]);

    const columns: Column<TaskOrder>[] = useMemo(() => [
        {
            key: 'sequence' as keyof TaskOrder,
            header: 'ID',
            render: (v: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{v}</span>,
            sortable: true,
            width: '70px',
        },
        {
            key: 'task_order_no' as keyof TaskOrder,
            header: 'Task Order #',
            render: (v: any) => <span className="font-mono font-semibold text-brand-sky-700 dark:text-brand-sky-400 text-sm">{v}</span>,
            sortable: true,
        },
        {
            key: 'title' as keyof TaskOrder,
            header: 'Title',
            render: (v: any) => <span className="font-medium text-slate-800 dark:text-slate-200">{v}</span>,
            sortable: true,
        },
        {
            key: 'contractor_name' as keyof TaskOrder,
            header: 'Contractor',
            render: (v: any) => (
                <Badge variant="outline" className="bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">
                    <Users className="h-3 w-3 mr-1" />
                    {v || '—'}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'contract_no' as keyof TaskOrder,
            header: 'Contract',
            render: (v: any, row: TaskOrder) => v ? (
                <div className="space-y-0.5">
                    <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400 text-sm block">{v}</span>
                    {row.contract_title && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[160px]">{row.contract_title}</span>
                    )}
                </div>
            ) : <span className="text-slate-400 text-sm">—</span>,
            sortable: true,
        },
        {
            key: 'project_name' as keyof TaskOrder,
            header: 'Project',
            render: (v: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {v || '—'}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'est_cost' as keyof TaskOrder,
            header: 'Est. Cost',
            render: (v: any) => (
                <div className="text-right">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {v ? Number(v).toLocaleString() : '—'}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'status' as keyof TaskOrder,
            header: 'Status',
            render: (v: any) => (
                <Badge variant="outline" className={STATUS_COLORS[v] || 'bg-slate-100 dark:bg-slate-800'}>
                    {v || 'N/A'}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'created_at' as keyof TaskOrder,
            header: 'Created',
            render: (v: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {v ? String(v).slice(0, 10) : '—'}
                </span>
            ),
            sortable: true,
        },
    ], []);

    const actions: Action<TaskOrder>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => router.push(`/contracts/details?id=${row.id}`),
            variant: 'info',
        },
        {
            label: 'Edit Task Order',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (row) => router.push(`/contracts/update?id=${row.id}`),
            variant: 'warning',
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (dateFrom) activeFilters.push(`From: ${dateFrom}`);
    if (dateTo) activeFilters.push(`To: ${dateTo}`);

    const clearFilters = () => {
        setSearch(''); setStatusFilter('All');
        setDateFrom(''); setDateTo(''); setPage(1);
    };

    return (
        <>
            <div className="space-y-4">
                <Breadcrumb />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">All Task Orders</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm md:text-base">
                            Manage task orders with contractors, contracts, and project assignments
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <Link href="/change-orders">
                            <Button
                                variant="outline"
                                className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                            >
                                <GitPullRequestArrow className="h-4 w-4 mr-2" />
                                Change Orders
                            </Button>
                        </Link>
                        <Link href="/contracts/create">
                            <Button className="bg-brand-sky-600 hover:bg-brand-sky-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                New Task Order
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <EnhancedCard title="Total Task Orders" description="In current view" variant="default" size="sm"
                        stats={{ total: total, badge: 'Total', badgeColor: 'default' }}>
                        <></>
                    </EnhancedCard>
                    <EnhancedCard title="Contractors" description="Unique on current page" variant="default" size="sm"
                        stats={{ total: stats.uniqueContractors, badge: 'Contractors', badgeColor: 'default' }}>
                        <div className="flex items-center gap-2 mt-1">
                            <Users className="h-5 w-5 text-violet-500" />
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{stats.uniqueContractors}</span>
                        </div>
                    </EnhancedCard>
                    <EnhancedCard title="Contracts" description="Linked on current page" variant="default" size="sm"
                        stats={{ total: stats.uniqueContracts, badge: 'Contracts', badgeColor: 'success' }}>
                        <div className="flex items-center gap-2 mt-1">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{stats.uniqueContracts}</span>
                        </div>
                    </EnhancedCard>
                    <EnhancedCard title="Active" description="Currently active orders" variant="default" size="sm"
                        stats={{ total: stats.activeCount, badge: 'Active', badgeColor: 'success' }}>
                        <></>
                    </EnhancedCard>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Filter task orders by status, contractor, and date range"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by task order number, title, contractor, project..."
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{s}</SelectItem>
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

                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((f, i) => (
                                        <Badge key={i} variant="outline" className="bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800">{f}</Badge>
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

                {/* Task Orders Table */}
                <EnhancedCard
                    title="Task Orders List"
                    description={`${total} task order${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{ total: total, badge: 'Total', badgeColor: 'default' }}
                    headerActions={
                        <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                {[5, 10, 20, 50, 100, 200].map(n => (
                                    <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={taskOrders}
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
                        noDataMessage="No task orders found matching your search criteria"
                        searchPlaceholder="Search task orders..."
                    />
                </EnhancedCard>
            </div>
        </>
    );
}
