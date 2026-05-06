'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchTaskRequests,
    selectTaskRequests,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/tasks_requests';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, RefreshCw, FileSpreadsheet, Clock, Search, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import axios from '@/utils/axios';

function TasksRejectedPageContent() {
    const taskRequests = useSelector(selectTaskRequests);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const statusFilter = 'Rejected'; // Fixed status filter
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Filter task requests to only show "Tasks" type with "Rejected" status
    const taskRequestsFiltered = useMemo(() => {
        return taskRequests.filter(req => req.request_type === 'Tasks' && req.status === 'Rejected');
    }, [taskRequests]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch task requests with request_type = "Tasks" and status = "Rejected"
    useEffect(() => {
        dispatch(fetchTaskRequests({ 
            page, 
            limit, 
            search: debouncedSearch,
            request_type: 'Tasks',
            status: 'Rejected',
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, dateFrom, dateTo]);

    const filteredRequests = useMemo(() => {
        return taskRequestsFiltered.filter(request => {
            const matchesSearch = request.request_code?.toLowerCase().includes(search.toLowerCase()) ||
                                request.contractor_name?.toLowerCase().includes(search.toLowerCase()) ||
                                request.project_name?.toLowerCase().includes(search.toLowerCase()) ||
                                request.notes?.toLowerCase().includes(search.toLowerCase());
            
            return matchesSearch;
        });
    }, [taskRequestsFiltered, search]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequests({ 
                page, 
                limit, 
                search: debouncedSearch,
                request_type: 'Tasks',
                status: 'Rejected',
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            }));
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/requests/tasks/fetch', {
                params: {
                    request_type: 'Tasks',
                    status: 'Rejected',
                    search: debouncedSearch,
                    limit: 10000,
                    page: 1,
                    from_date: dateFrom || undefined,
                    to_date: dateTo || undefined,
                }
            });

            const headers = ['Request Code', 'Request Type', 'Contractor', 'Project', 'Description', 'Status', 'Created By', 'Created At'];
            const csvHeaders = headers.join(',');
            const items = data?.body?.tasks_requests?.items || data?.data?.tasks_requests?.items || [];

            const csvRows = items.map((req: TaskRequest) => {
                return [
                    req.request_code,
                    req.request_type,
                    escapeCsv(req.contractor_name || ''),
                    escapeCsv(req.project_name || ''),
                    escapeCsv(req.notes || ''),
                    req.status,
                    escapeCsv(req.created_by_name || ''),
                    req.created_at || ''
                ].join(',');
            });

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rejected_task_requests_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const escapeCsv = (str: string) => {
        if (!str) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
    };

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (dateFrom && dateTo) arr.push(`Date: ${dateFrom} to ${dateTo}`);
        else if (dateFrom) arr.push(`From Date: ${dateFrom}`);
        else if (dateTo) arr.push(`To Date: ${dateTo}`);
        return arr;
    }, [search, dateFrom, dateTo]);

    const columns: Column<TaskRequest>[] = useMemo(() => [
        {
            key: 'request_code',
            header: 'Request Code',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true
        },
        {
            key: 'request_type',
            header: 'Request Type',
            render: (value: any) => (
                <Badge variant="outline" className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800">
                    {value || 'Tasks'}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'contractor_name',
            header: 'Contractor',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || 'N/A'}</span>,
            sortable: true
        },
        {
            key: 'project_name',
            header: 'Project',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || 'N/A'}</span>,
            sortable: true
        },
        {
            key: 'notes',
            header: 'Description',
            render: (value: any) => (
                <div className="max-w-xs">
                    <div className="text-sm text-slate-800 dark:text-slate-200 truncate">{value || '-'}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any) => {
                return (
                    <Badge variant="outline" className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium">
                        {value || 'Rejected'}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'created_by_name',
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>,
            sortable: true
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value}
                </span>
            ),
            sortable: true
        }
    ], []);

    const actions: Action<TaskRequest>[] = [
        {
            label: 'View Request Details',
            onClick: (request) => {
                router.push(`/requests/tasks/details?id=${request.id}`);
            },
            icon: <FileText className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Show Approvals Timeline',
            onClick: (request) => router.push(`/requests/tasks/timeline?id=${request.id}`),
            icon: <Clock className="h-4 w-4" />,
            variant: 'info' as const,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Rejected Task Requests</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Browse and manage all rejected task requests
                    </p>
                </div>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter rejected task requests"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by request code, contractor, project, or notes..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToExcel}
                                disabled={isExporting || loading}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshTable}
                                disabled={isRefreshing}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* From Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date_from" className="text-slate-700 dark:text-slate-300 font-medium">
                                From Date
                            </Label>
                            <DatePicker
                                value={dateFrom}
                                onChange={(value) => {
                                    setDateFrom(value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date_to" className="text-slate-700 dark:text-slate-300 font-medium">
                                To Date
                            </Label>
                            <DatePicker
                                value={dateTo}
                                onChange={(value) => {
                                    setDateTo(value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Active Filters & Clear Button */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            {/* Active Filters */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                {activeFilters.map((filter, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
                                    >
                                        {filter}
                                    </Badge>
                                ))}
                            </div>

                            {/* Clear All Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setDateFrom('');
                                    setDateTo('');
                                    setPage(1);
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Requests Table */}
            <EnhancedCard
                title="Rejected Task Requests List"
                description={`${totalItems} rejected request${totalItems !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: totalItems,
                    badge: 'Total Rejected',
                    badgeColor: 'default'
                }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={filteredRequests}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems: totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No rejected task requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                    hideEmptyMessage={true}
                />
            </EnhancedCard>
        </div>
    );
}

export default function TasksRejectedPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        }>
            <TasksRejectedPageContent />
        </Suspense>
    );
}
