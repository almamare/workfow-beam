'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
    fetchTasksRequestsForApproval,
    setPage,
    resetFilters,
    selectTasksRequestsForApproval,
    selectTasksRequestsForApprovalTotal,
    selectTasksRequestsForApprovalPages,
    selectTasksRequestsForApprovalCurrentPage,
    selectTasksRequestsForApprovalLoading,
    selectTasksRequestsForApprovalError,
    selectTasksRequestsForApprovalFilters,
} from '@/stores/slices/tasks_requests_for_approval';
import { fetchProject } from '@/stores/slices/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, RefreshCw, Clock, Search, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import type { Project } from '@/stores/types/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';

interface FinancialPendingRequest extends TaskRequest {
    project?: Project;
}

function FinancialPendingContent() {
    const items = useSelector(selectTasksRequestsForApproval);
    const total = useSelector(selectTasksRequestsForApprovalTotal);
    const pages = useSelector(selectTasksRequestsForApprovalPages);
    const currentPage = useSelector(selectTasksRequestsForApprovalCurrentPage);
    const loading = useSelector(selectTasksRequestsForApprovalLoading);
    const error = useSelector(selectTasksRequestsForApprovalError);
    const filters = useSelector(selectTasksRequestsForApprovalFilters);

    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [search, setSearch] = useState(filters.search || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [limit, setLimit] = useState(10);
    const [dateFrom, setDateFrom] = useState(filters.from_date || '');
    const [dateTo, setDateTo] = useState(filters.to_date || '');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [projectsData, setProjectsData] = useState<Map<string, Project>>(new Map());
    const [loadingProjects, setLoadingProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch only requests assigned to the current user for approval
    useEffect(() => {
        dispatch(fetchTasksRequestsForApproval({
            page: currentPage,
            limit,
            search: debouncedSearch || undefined,
            request_type: 'Financial',
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, currentPage, limit, debouncedSearch, dateFrom, dateTo]);

    // Load project data for each request
    const loadingProjectsRef = useRef(loadingProjects);
    useEffect(() => { loadingProjectsRef.current = loadingProjects; }, [loadingProjects]);

    const fetchProjectData = useCallback(async (projectId: string) => {
        if (projectsData.has(projectId) || loadingProjectsRef.current.has(projectId)) return;
        setLoadingProjects(prev => new Set(prev).add(projectId));
        try {
            const result = await dispatch(fetchProject({ id: projectId })).unwrap();
            if (result?.body?.project) {
                setProjectsData(prev => new Map(prev).set(projectId, result.body!.project));
            }
        } catch {
            // ignore
        } finally {
            setLoadingProjects(prev => { const n = new Set(prev); n.delete(projectId); return n; });
        }
    }, [dispatch, projectsData]);

    useEffect(() => {
        items.forEach(r => {
            if (r.task_order_id && !projectsData.has(r.task_order_id)) {
                fetchProjectData(r.task_order_id);
            }
        });
    }, [items, fetchProjectData, projectsData]);

    const enrichedItems = useMemo(() => items.map(r => ({
        ...r,
        project: r.task_order_id ? projectsData.get(r.task_order_id) : undefined,
    })) as FinancialPendingRequest[], [items, projectsData]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTasksRequestsForApproval({
                page: currentPage,
                limit,
                search: debouncedSearch || undefined,
                request_type: 'Financial',
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            }));
            setProjectsData(new Map());
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (dateFrom && dateTo) arr.push(`Date: ${dateFrom} to ${dateTo}`);
        else if (dateFrom) arr.push(`From Date: ${dateFrom}`);
        else if (dateTo) arr.push(`To Date: ${dateTo}`);
        return arr;
    }, [search, dateFrom, dateTo]);

    const stepColors: Record<string, string> = {
        '1': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        '2': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        '3': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        '4': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        '5': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };

    const columns: Column<FinancialPendingRequest>[] = useMemo(() => [
        {
            key: 'request_code',
            header: 'Request Code',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true,
        },
        {
            key: 'project_name' as any,
            header: 'Project Name',
            render: (_: any, row: FinancialPendingRequest) => {
                if (row.task_order_id && loadingProjectsRef.current.has(row.task_order_id)) {
                    return <span className="text-slate-400">Loading...</span>;
                }
                return <span className="font-semibold text-slate-800 dark:text-slate-200">{row.project?.name || row.project_name || '-'}</span>;
            },
            sortable: true,
        },
        {
            key: 'step_name',
            header: 'Step Name',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>,
            sortable: true,
        },
        {
            key: 'notes',
            header: 'Notes',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>,
            sortable: true,
        },
        {
            key: 'created_by_name',
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>,
            sortable: true,
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                    {value ? new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    }) : '-'}
                </span>
            ),
            sortable: true,
        },
    ], []);

    const actions: Action<FinancialPendingRequest>[] = [
        {
            label: 'View Request Details',
            onClick: (r) => router.push(`/requests/financial/details?id=${r.id}`),
            icon: <FileText className="h-4 w-4" />,
            variant: 'warning' as const,
        },
        {
            label: 'View Project',
            onClick: (r) => {
                const id = r.project?.id || r.task_order_id;
                if (id) router.push(`/projects/details?id=${id}`);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const,
        },
        {
            label: 'Approvals Timeline',
            onClick: (r) => router.push(`/requests/financial/timeline?id=${r.id}`),
            icon: <Clock className="h-4 w-4" />,
            variant: 'info' as const,
        },
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                        Financial Requests â€” Pending Approval
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Financial requests currently assigned to you for review and approval
                    </p>
                </div>
            </div>

            <EnhancedCard title="Search & Filters" description="Search and filter pending financial requests" variant="default" size="sm">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by request code, project name, or notes..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); dispatch(setPage(1)); }}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshTable}
                            disabled={isRefreshing}
                            className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 whitespace-nowrap"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">From Date</Label>
                            <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); dispatch(setPage(1)); }} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">To Date</Label>
                            <DatePicker value={dateTo} onChange={(v) => { setDateTo(v); dispatch(setPage(1)); }} />
                        </div>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                {activeFilters.map((filter, index) => (
                                    <Badge key={index} variant="outline" className="bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800">
                                        {filter}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); dispatch(resetFilters()); }}
                                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            <EnhancedCard
                title="Pending Financial Requests"
                description={`${total} request${total !== 1 ? 's' : ''} awaiting your approval`}
                variant="default"
                size="sm"
                stats={{ total, badge: 'Pending Approval', badgeColor: 'default' }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); dispatch(setPage(1)); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
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
                {error ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <Button variant="outline" onClick={refreshTable}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : (
                    <EnhancedDataTable
                        data={enrichedItems}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{
                            currentPage,
                            totalPages: pages,
                            pageSize: limit,
                            totalItems: total,
                            onPageChange: (page) => dispatch(setPage(page)),
                        }}
                        noDataMessage="No financial requests pending your approval"
                        searchPlaceholder="Search requests..."
                        
                    />
                )}
            </EnhancedCard>

        </div>
    );
}

export default function FinancialPendingPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        }>
            <FinancialPendingContent />
        </Suspense>
    );
}
