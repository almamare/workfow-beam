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
import { approvalBadgeVariant } from '@/lib/project-contract-badges';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/delete-dialog';
import { SquarePen, Plus, RefreshCw, Eye, Search, Trash2 } from 'lucide-react';
import type { ProjectContract } from '@/stores/types/project-contracts';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const formatCurrency = (value: number | string, currency: string) => {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(n)) return `0 ${currency}`;
    return `${new Intl.NumberFormat('en-US').format(n)} ${currency}`;
};

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
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [refreshing, setRefreshing] = useState(false);
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
        const key = JSON.stringify({
            page,
            limit,
            search: debouncedSearch,
            status: statusFilter,
            approval_status: approvalFilter,
            project_id: projectFilter,
        });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(
            fetchProjectContracts({
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                approval_status: approvalFilter !== 'All' ? approvalFilter : undefined,
                project_id: projectFilter !== 'All' ? projectFilter : undefined,
            })
        );
        dispatch(fetchProjects({ limit: 500 }));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, approvalFilter, projectFilter]);

    const reload = useCallback(() => {
        return dispatch(
            fetchProjectContracts({
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                approval_status: approvalFilter !== 'All' ? approvalFilter : undefined,
                project_id: projectFilter !== 'All' ? projectFilter : undefined,
            })
        );
    }, [dispatch, page, limit, debouncedSearch, statusFilter, approvalFilter, projectFilter]);

    const refresh = async () => {
        setRefreshing(true);
        try {
            await reload().unwrap();
            toast.success('Refreshed');
        } catch {
            toast.error('Refresh failed');
        } finally {
            setRefreshing(false);
        }
    };

    const columns: Column<ProjectContract>[] = [
        { key: 'contract_no', header: 'Reference', sortable: true },
        { key: 'title', header: 'Title', sortable: true },
        {
            key: 'project_id',
            header: 'Project',
            render: (_v, row) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.project_name || '—'}</span>
                    <span className="text-xs text-slate-500 font-mono">{row.project_number || row.project_id}</span>
                </div>
            ),
        },
        {
            key: 'contract_value',
            header: 'Value',
            render: (value, row) => (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(value as string | number, row.currency || 'IQD')}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <Badge variant="outline" className="font-normal">
                    {String(value)}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'approval_status',
            header: 'Approval',
            render: (value) => (
                <Badge variant={approvalBadgeVariant(String(value))} className="font-normal">
                    {String(value)}
                </Badge>
            ),
            sortable: true,
        },
    ];

    const handleDelete = useCallback(
        async (id: string) => {
            if (!id) return;
            setDeleting(true);
            try {
                await dispatch(deleteProjectContract(id)).unwrap();
                toast.success('Deleted');
                await reload().unwrap();
            } catch (e) {
                toast.error(typeof e === 'string' ? e : 'Delete failed');
            } finally {
                setDeleting(false);
                setOpen(false);
                setSelectedId(null);
            }
        },
        [dispatch, reload]
    );

    const actions: Action<ProjectContract>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: (r) => router.push(`/project-contracts/details?id=${r.id}`),
            variant: 'info',
        },
        {
            label: 'Edit',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (r) => router.push(`/project-contracts/update?id=${r.id}`),
            variant: 'warning',
            hidden: (r) => r.approval_status === 'Approved',
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (r) => {
                setSelectedId(r.id);
                setOpen(true);
            },
            variant: 'destructive',
            hidden: (r) => r.approval_status === 'Approved',
        },
    ];

    return (
        <>
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                            Project contracts
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage agreements tied to projects; submissions use the ProjectContracts approval flow.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push('/project-contracts/create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New contract
                        </Button>
                        <Button variant="outline" onClick={refresh} disabled={refreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <EnhancedCard title="Filters" variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="Number or title…"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select
                                value={projectFilter}
                                onValueChange={(v) => {
                                    setProjectFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All projects</SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} ({p.number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    setStatusFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    {['Draft', 'Active', 'Expired', 'Cancelled', 'Suspended'].map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Approval</Label>
                            <Select
                                value={approvalFilter}
                                onValueChange={(v) => {
                                    setApprovalFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    {['Draft', 'Pending', 'Approved', 'Rejected'].map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Contracts"
                    description={`${total} found`}
                    variant="default"
                    size="sm"
                    headerActions={
                        <Select
                            value={String(limit)}
                            onValueChange={(v) => {
                                setLimit(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 50].map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n} / page
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
                        noDataMessage="No project contracts match your filters"
                    />
                </EnhancedCard>
            </div>

            <DeleteDialog
                open={open}
                onClose={() => {
                    if (!deleting) {
                        setOpen(false);
                        setSelectedId(null);
                    }
                }}
                onConfirm={() => selectedId && handleDelete(selectedId)}
                title="Delete this project contract?"
                description="Approved contracts cannot be removed. This action is permanent for draft/pending rows."
            />
        </>
    );
}
