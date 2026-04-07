'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTaskRequests,
    selectTaskRequests,
    selectLoading,
    selectTotalPages,
    selectTotalItems,
} from '@/stores/slices/tasks_requests';
import { fetchProjectContract } from '@/stores/slices/project-contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, RefreshCw, Clock, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import type { ProjectContract } from '@/stores/types/project-contracts';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';

export type ProjectContractRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'all';

interface Row extends TaskRequest {
    contract?: ProjectContract | null;
}

export function ProjectContractRequestsListContent({
    status,
    title,
    description,
}: {
    status: ProjectContractRequestStatus;
    title: string;
    description: string;
}) {
    const taskRequests = useSelector(selectTaskRequests);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [contracts, setContracts] = useState<Map<string, ProjectContract>>(new Map());
    const [loadingContract, setLoadingContract] = useState<Set<string>>(new Set());
    const loadingContractRef = useRef(loadingContract);
    useEffect(() => {
        loadingContractRef.current = loadingContract;
    }, [loadingContract]);

    const filtered = useMemo(() => {
        const base = taskRequests.filter((r) => r.request_type === 'ProjectContracts');
        if (status === 'all') return base;
        return base.filter((r) => r.status === status);
    }, [taskRequests, status]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        dispatch(
            fetchTaskRequests({
                page,
                limit,
                search: debouncedSearch,
                request_type: 'ProjectContracts',
                ...(status === 'all' ? {} : { status }),
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            })
        );
    }, [dispatch, page, limit, debouncedSearch, status, dateFrom, dateTo]);

    const loadContract = useCallback(
        async (contractId: string) => {
            if (!contractId || contracts.has(contractId) || loadingContractRef.current.has(contractId)) return;
            setLoadingContract((prev) => new Set(prev).add(contractId));
            try {
                const c = await dispatch(fetchProjectContract(contractId)).unwrap();
                if (c) setContracts((prev) => new Map(prev).set(contractId, c));
            } catch {
                /* ignore */
            } finally {
                setLoadingContract((prev) => {
                    const n = new Set(prev);
                    n.delete(contractId);
                    return n;
                });
            }
        },
        [dispatch, contracts]
    );

    useEffect(() => {
        filtered.forEach((r) => {
            if (r.task_order_id) loadContract(r.task_order_id);
        });
    }, [filtered, loadContract]);

    const rows: Row[] = useMemo(
        () =>
            filtered.map((r) => ({
                ...r,
                contract: r.task_order_id ? contracts.get(r.task_order_id) ?? null : null,
            })),
        [filtered, contracts]
    );

    const displayRows = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return rows;
        return rows.filter(
            (r) =>
                r.request_code?.toLowerCase().includes(q) ||
                r.notes?.toLowerCase().includes(q) ||
                r.contract?.title?.toLowerCase().includes(q) ||
                r.contract?.contract_no?.toLowerCase().includes(q)
        );
    }, [rows, search]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchTaskRequests({
                    page,
                    limit,
                    search: debouncedSearch,
                    request_type: 'ProjectContracts',
                    ...(status === 'all' ? {} : { status }),
                    from_date: dateFrom || undefined,
                    to_date: dateTo || undefined,
                })
            );
            setContracts(new Map());
            toast.success('Refreshed');
        } catch {
            toast.error('Refresh failed');
        } finally {
            setIsRefreshing(false);
        }
    };

    const statusBadgeClass = (s: string) => {
        if (s === 'Pending') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
        if (s === 'Approved') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
        if (s === 'Rejected') return 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200';
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200';
    };

    const columns: Column<Row>[] = useMemo(
        () => [
            {
                key: 'request_code',
                header: 'Request code',
                render: (v: string) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{v}</span>,
            },
            {
                key: 'contract' as keyof Row,
                header: 'Contract',
                render: (_: unknown, row: Row) => {
                    if (row.task_order_id && loadingContractRef.current.has(row.task_order_id)) {
                        return <span className="text-slate-400">Loading…</span>;
                    }
                    return (
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                            {row.contract?.title || '—'}
                        </span>
                    );
                },
            },
            {
                key: 'contract_no' as keyof Row,
                header: 'Contract No.',
                render: (_: unknown, row: Row) => (
                    <span className="font-mono text-sm">{row.contract?.contract_no || '—'}</span>
                ),
            },
            {
                key: 'status',
                header: 'Status',
                render: (v: string) => (
                    <Badge variant="outline" className={statusBadgeClass(v)}>
                        {v}
                    </Badge>
                ),
            },
            {
                key: 'created_by_name',
                header: 'Created by',
                render: (v: string) => <span>{v || '—'}</span>,
            },
            {
                key: 'created_at',
                header: 'Created',
                render: (v: string) => <span className="text-slate-600 dark:text-slate-400 text-sm">{v}</span>,
            },
        ],
        []
    );

    const actions: Action<Row>[] = useMemo(
        () => [
            {
                label: 'Request details',
                onClick: (r) => router.push(`/requests/project-contracts/details?id=${r.id}`),
                icon: <FileText className="h-4 w-4" />,
                variant: 'warning',
            },
            {
                label: 'Contract',
                onClick: (r) => {
                    const id = r.contract?.id || r.task_order_id;
                    if (id) router.push(`/project-contracts/details?id=${id}`);
                    else toast.error('Contract not loaded');
                },
                icon: <Eye className="h-4 w-4" />,
                variant: 'info',
            },
            {
                label: 'Timeline',
                onClick: (r) => router.push(`/requests/project-contracts/timeline?id=${r.id}`),
                icon: <Clock className="h-4 w-4" />,
                variant: 'info',
            },
        ],
        [router]
    );

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{title}</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{description}</p>
            </div>

            <EnhancedCard title="Search & filters" variant="default" size="sm">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search code, contract title, notes…"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={refreshTable} disabled={isRefreshing}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>From</Label>
                            <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); setPage(1); }} />
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <DatePicker value={dateTo} onChange={(v) => { setDateTo(v); setPage(1); }} />
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            <EnhancedCard title="Requests" variant="default" size="sm">
                <EnhancedDataTable
                    data={displayRows}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage={
                        status === 'all'
                            ? 'No project contract requests'
                            : `No ${status.toLowerCase()} project contract requests`
                    }
                    hideEmptyMessage
                />
            </EnhancedCard>
        </div>
    );
}
