'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import {
    fetchProjectContracts,
    selectProjectContracts,
    selectProjectContractsLoading,
    selectProjectContractsTotal,
    selectProjectContractsPages,
    selectProjectContractsError,
    deleteProjectContract,
} from '@/stores/slices/project-contracts';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen, Plus, RefreshCw, FileSpreadsheet, Eye, X, Search } from 'lucide-react';
import type { ProjectContract } from '@/stores/types/project-contracts';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';

const STATUS_OPTIONS = ['Draft', 'Active', 'Expired', 'Cancelled', 'Suspended'] as const;
const APPROVAL_OPTIONS = ['Draft', 'Pending', 'Approved', 'Rejected'] as const;

const STATUS_COLORS: Record<string, string> = {
    Active:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Draft:     'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
    Expired:   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    Suspended: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
};

const APPROVAL_COLORS: Record<string, string> = {
    Approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Pending:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    Draft:    'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
};

const SELECT_TRIGGER_CLS =
    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100';

const SELECT_CONTENT_CLS = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700';

const SELECT_ITEM_CLS =
    'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200';

function escapeCsv(val: any) {
    const s = String(val ?? '');
    return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function ProjectContractsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const contracts = useSelector(selectProjectContracts);
    const loading = useSelector(selectProjectContractsLoading);
    const total = useSelector(selectProjectContractsTotal);
    const pages = useSelector(selectProjectContractsPages);
    const error = useSelector(selectProjectContractsError);
    const projects = useSelector(selectProjects);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [approvalFilter, setApprovalFilter] = useState('All');
    const [projectFilter, setProjectFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch, statusFilter, approvalFilter, projectFilter, dateFrom, dateTo });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchProjectContracts({
            page, limit,
            search: debouncedSearch,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            approval_status: approvalFilter !== 'All' ? approvalFilter : undefined,
            project_id: projectFilter !== 'All' ? projectFilter : undefined,
        }));
        dispatch(fetchProjects({ limit: 500 }));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, approvalFilter, projectFilter, dateFrom, dateTo]);

    const reload = useCallback(() =>
        dispatch(fetchProjectContracts({
            page, limit,
            search: debouncedSearch,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            approval_status: approvalFilter !== 'All' ? approvalFilter : undefined,
            project_id: projectFilter !== 'All' ? projectFilter : undefined,
        })),
        [dispatch, page, limit, debouncedSearch, statusFilter, approvalFilter, projectFilter]
    );

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await reload().unwrap();
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = () => {
        setIsExporting(true);
        try {
            const headers = ['Reference', 'Title', 'Project', 'Contractor', 'Type', 'Status', 'Approval', 'Contract Date', 'Created'];
            const rows = contracts.map((c: ProjectContract) => [
                escapeCsv(c.contract_no),
                escapeCsv(c.title),
                escapeCsv(c.project_name || ''),
                escapeCsv(c.contractor_name || ''),
                escapeCsv(c.contract_type || ''),
                escapeCsv(c.status),
                escapeCsv(c.approval_status),
                escapeCsv(c.contract_date || ''),
                escapeCsv(c.created_at ? String(c.created_at).slice(0, 10) : ''),
            ].join(','));
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contracts_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Contracts exported successfully');
        } catch {
            toast.error('Failed to export contracts');
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<ProjectContract>[] = [
        {
            key: 'contract_no',
            header: 'Reference',
            render: (v: any) => (
                <span className="text-brand-sky-700 dark:text-brand-sky-400 font-mono font-semibold text-sm">{v}</span>
            ),
            sortable: true,
            width: '130px',
        },
        {
            key: 'title',
            header: 'Contract Title',
            render: (v: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>
            ),
            sortable: true,
        },
        {
            key: 'project_id',
            header: 'Project',
            render: (_v: any, row: ProjectContract) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-800 dark:text-slate-200 leading-tight">{row.project_name || '—'}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{row.project_number || ''}</span>
                </div>
            ),
        },
        {
            key: 'contractor_id',
            header: 'Contractor',
            render: (_v: any, row: ProjectContract) =>
                row.contractor_name
                    ? <span className="text-slate-700 dark:text-slate-300">{row.contractor_name}</span>
                    : <span className="text-slate-400 dark:text-slate-500">—</span>,
        },
        {
            key: 'contract_type',
            header: 'Type',
            render: (v: any) => (
                <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                    {v}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'contract_date',
            header: 'Contract Date',
            render: (v: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">{v ? String(v).slice(0, 10) : '—'}</span>
            ),
            sortable: true,
        },
        {
            key: 'status',
            header: 'Status',
            render: (v: any) => (
                <Badge variant="outline" className={STATUS_COLORS[String(v)] || 'bg-slate-100 dark:bg-slate-800'}>
                    {String(v)}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'approval_status',
            header: 'Approval',
            render: (v: any) => (
                <Badge variant="outline" className={APPROVAL_COLORS[String(v)] || 'bg-slate-100 dark:bg-slate-800'}>
                    {String(v)}
                </Badge>
            ),
            sortable: true,
        },
    ];

    const handleDelete = useCallback(async (id: string) => {
        if (!id) return;
        setDeleting(true);
        try {
            await dispatch(deleteProjectContract(id)).unwrap();
            toast.success('Contract deleted successfully');
            await reload().unwrap();
        } catch (e) {
            toast.error(typeof e === 'string' ? e : 'Delete failed');
        } finally {
            setDeleting(false);
            setOpen(false);
            setSelectedId(null);
        }
    }, [dispatch, reload]);

    const actions: Action<ProjectContract>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (r: ProjectContract) => router.push(`/contracts/contracts/details?id=${r.id}`),
            variant: 'info' as const,
        },
        {
            label: 'Edit Contract',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (r: ProjectContract) => router.push(`/contracts/contracts/update?id=${r.id}`),
            variant: 'warning' as const,
            hidden: (r: ProjectContract) => r.approval_status === 'Approved',
        },
        {
            label: 'Delete Contract',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (r: ProjectContract) => {
                setSelectedId(r.id);
                setOpen(true);
            },
            variant: 'destructive' as const,
            hidden: (r: ProjectContract) => r.approval_status === 'Approved',
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (projectFilter !== 'All') {
        const proj = projects.find((p: any) => p.id === projectFilter);
        activeFilters.push(`Project: ${proj?.name || projectFilter}`);
    }
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (approvalFilter !== 'All') activeFilters.push(`Approval: ${approvalFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    const clearFilters = () => {
        setSearch(''); setStatusFilter('All'); setApprovalFilter('All');
        setProjectFilter('All'); setDateFrom(''); setDateTo(''); setPage(1);
    };

    return (
        <>
            <div className="space-y-4">
                <Breadcrumb />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">All Contracts</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Browse and manage all project contracts with comprehensive filtering and management tools
                        </p>
                    </div>
                    <Button
                        className="bg-brand-sky-600 hover:bg-brand-sky-700 text-white w-fit"
                        onClick={() => router.push('/contracts/contracts/create')}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Contract
                    </Button>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter contracts by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search + Export + Refresh */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by reference number, title, project..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={exportToExcel}
                                    disabled={isExporting || loading}
                                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                                >
                                    <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                    {isExporting ? 'Exporting...' : 'Export Excel'}
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={refreshTable}
                                    disabled={isRefreshing || loading}
                                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* Project */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                                <Select value={projectFilter} onValueChange={(v) => { setProjectFilter(v); setPage(1); }}>
                                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                        <SelectValue placeholder="All Projects" />
                                    </SelectTrigger>
                                    <SelectContent className={SELECT_CONTENT_CLS}>
                                        <SelectItem value="All" className={SELECT_ITEM_CLS}>All Projects</SelectItem>
                                        {projects.map((p: any) => (
                                            <SelectItem key={p.id} value={p.id} className={SELECT_ITEM_CLS}>
                                                {p.name} ({p.number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className={SELECT_CONTENT_CLS}>
                                        <SelectItem value="All" className={SELECT_ITEM_CLS}>All Status</SelectItem>
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={s} className={SELECT_ITEM_CLS}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Approval */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Approval Status</Label>
                                <Select value={approvalFilter} onValueChange={(v) => { setApprovalFilter(v); setPage(1); }}>
                                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                        <SelectValue placeholder="All Approvals" />
                                    </SelectTrigger>
                                    <SelectContent className={SELECT_CONTENT_CLS}>
                                        <SelectItem value="All" className={SELECT_ITEM_CLS}>All Approvals</SelectItem>
                                        {APPROVAL_OPTIONS.map((a) => (
                                            <SelectItem key={a} value={a} className={SELECT_ITEM_CLS}>{a}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* From Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">From Date</Label>
                                <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); setPage(1); }} />
                            </div>

                            {/* To Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">To Date</Label>
                                <DatePicker value={dateTo} onChange={(v) => { setDateTo(v); setPage(1); }} />
                            </div>
                        </div>

                        {/* Active Filters & Clear */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((f, i) => (
                                        <Badge key={i} variant="outline" className="bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-200 dark:hover:bg-brand-sky-900/50 border-brand-sky-200 dark:border-brand-sky-800">
                                            {f}
                                        </Badge>
                                    ))}
                                </div>
                                <Button
                                    variant="outline" size="sm" onClick={clearFilters}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Contracts Table */}
                <EnhancedCard
                    title="Contracts List"
                    description={`${total} contract${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{ total, badge: 'Total Contracts', badgeColor: 'success' }}
                    headerActions={
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className={`w-36 ${SELECT_TRIGGER_CLS}`}>
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className={`${SELECT_CONTENT_CLS} shadow-lg`}>
                                {[5, 10, 20, 50, 100, 200].map((n) => (
                                    <SelectItem key={n} value={String(n)} className={SELECT_ITEM_CLS}>
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={contracts}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{
                            currentPage: page,
                            totalPages: Math.max(1, pages),
                            pageSize: limit,
                            totalItems: total,
                            onPageChange: setPage,
                        }}
                        noDataMessage="No contracts found matching your search criteria"
                        searchPlaceholder="Search contracts..."
                    />
                </EnhancedCard>
            </div>

            <DeleteDialog
                open={open}
                onClose={() => { if (!deleting) { setOpen(false); setSelectedId(null); } }}
                onConfirm={() => selectedId && handleDelete(selectedId)}
                title="Delete this contract?"
                description="Approved contracts cannot be removed. This action is permanent for draft/pending contracts."
            />
        </>
    );
}
