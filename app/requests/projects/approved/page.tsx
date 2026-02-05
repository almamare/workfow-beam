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
import { fetchProject } from '@/stores/slices/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderKanban, Eye, RefreshCw, FileSpreadsheet, Clock, Search, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import type { Project } from '@/stores/types/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import axios from '@/utils/axios';

// Extended TaskRequest with project data
interface ProjectRequestWithData extends TaskRequest {
    project?: Project;
}

function ProjectsApprovedPageContent() {
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
    const statusFilter = 'Approved'; // Fixed status filter
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [projectsData, setProjectsData] = useState<Map<string, Project>>(new Map());
    const [loadingProjects, setLoadingProjects] = useState<Set<string>>(new Set());

    // Filter task requests to only show "Projects" type with "Approved" status
    const projectRequests = useMemo(() => {
        return taskRequests.filter(req => req.request_type === 'Projects' && req.status === 'Approved');
    }, [taskRequests]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch task requests with request_type = "Projects" and status = "Approved"
    useEffect(() => {
        dispatch(fetchTaskRequests({ 
            page, 
            limit, 
            search: debouncedSearch,
            request_type: 'Projects',
            status: 'Approved',
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, dateFrom, dateTo]);

    // Fetch project data for each task request
    const fetchProjectData = useCallback(async (projectId: string) => {
        if (projectsData.has(projectId) || loadingProjects.has(projectId)) {
            return;
        }

        setLoadingProjects(prev => new Set(prev).add(projectId));
        try {
            const result = await dispatch(fetchProject({ id: projectId })).unwrap();
            if (result?.body?.project) {
                setProjectsData(prev => new Map(prev).set(projectId, result.body!.project));
            }
        } catch (error) {
            console.error(`Failed to fetch project ${projectId}:`, error);
        } finally {
            setLoadingProjects(prev => {
                const next = new Set(prev);
                next.delete(projectId);
                return next;
            });
        }
    }, [dispatch, projectsData, loadingProjects]);

    // Fetch project data for all requests
    useEffect(() => {
        projectRequests.forEach(request => {
            if (request.task_order_id && !projectsData.has(request.task_order_id)) {
                fetchProjectData(request.task_order_id);
            }
        });
    }, [projectRequests, fetchProjectData, projectsData]);

    // Create enriched requests with project data
    const enrichedRequests = useMemo(() => {
        return projectRequests.map(request => {
            const project = projectsData.get(request.task_order_id);
            return {
                ...request,
                project
            } as ProjectRequestWithData;
        });
    }, [projectRequests, projectsData]);

    const filteredRequests = useMemo(() => {
        return enrichedRequests.filter(request => {
            const project = request.project;
            const matchesSearch = request.request_code?.toLowerCase().includes(search.toLowerCase()) ||
                                project?.name?.toLowerCase().includes(search.toLowerCase()) ||
                                project?.number?.toLowerCase().includes(search.toLowerCase()) ||
                                request.notes?.toLowerCase().includes(search.toLowerCase());
            
            return matchesSearch;
        });
    }, [enrichedRequests, search]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequests({ 
                page, 
                limit, 
                search: debouncedSearch,
                request_type: 'Projects',
                status: 'Approved',
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            }));
            setProjectsData(new Map()); // Clear cached projects to refetch
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
                    request_type: 'Projects',
                    status: 'Approved',
                    search: debouncedSearch,
                    limit: 10000,
                    page: 1,
                    from_date: dateFrom || undefined,
                    to_date: dateTo || undefined,
                }
            });

            const headers = ['Request Code', 'Request Type', 'Project', 'Project Number', 'Project Type', 'Status', 'Notes', 'Created By', 'Created At'];
            const csvHeaders = headers.join(',');
            const items = data?.body?.tasks_requests?.items || data?.data?.tasks_requests?.items || [];

            const exportData = await Promise.all(
                items.map(async (req: TaskRequest) => {
                    let project: Project | null = null;
                    if (req.task_order_id) {
                        try {
                            const result = await dispatch(fetchProject({ id: req.task_order_id })).unwrap();
                            if (result?.body?.project) {
                                project = result.body.project;
                            }
                        } catch (error) {
                            console.error(`Failed to fetch project ${req.task_order_id}:`, error);
                        }
                    }
                    return { req, project };
                })
            );

            const csvRows = exportData.map(({ req, project }) => {
                return [
                    req.request_code,
                    req.request_type,
                    escapeCsv(project?.name || ''),
                    escapeCsv(project?.number || ''),
                    escapeCsv(project?.type || ''),
                    req.status,
                    escapeCsv(req.notes || ''),
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
            a.download = `approved_project_requests_${new Date().toISOString().slice(0, 10)}.csv`;
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

    // Memoize loadingProjects to prevent unnecessary re-renders
    const loadingProjectsRef = useRef(loadingProjects);
    useEffect(() => {
        loadingProjectsRef.current = loadingProjects;
    }, [loadingProjects]);

    const columns: Column<ProjectRequestWithData>[] = useMemo(() => [
        {
            key: 'request_code' as keyof ProjectRequestWithData,
            header: 'Request Code',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true
        },
        {
            key: 'project_name' as any,
            header: 'Project Name',
            render: (value: any, row: ProjectRequestWithData) => {
                const project = row.project;
                const isLoading = loadingProjectsRef.current.has(row.task_order_id);
                if (isLoading) {
                    return <span className="text-slate-400">Loading...</span>;
                }
                return <span className="font-semibold text-slate-800 dark:text-slate-200">{project?.name || 'N/A'}</span>;
            },
            sortable: true
        },
        {
            key: 'project_number' as any,
            header: 'Project Number',
            render: (value: any, row: ProjectRequestWithData) => {
                const project = row.project;
                return <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{project?.number || 'N/A'}</span>;
            },
            sortable: true
        },
        {
            key: 'project_type' as any,
            header: 'Project Type',
            render: (value: any, row: ProjectRequestWithData) => {
                const project = row.project;
                if (!project?.type) return <span className="text-slate-400">N/A</span>;
                const colors = {
                    Public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Communications: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                    Restoration: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    Referral: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[project.type as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {project.type}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'status' as keyof ProjectRequestWithData,
            header: 'Status',
            render: (value: any) => {
                return (
                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 font-medium">
                        {value}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'created_by_name' as keyof ProjectRequestWithData,
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>,
            sortable: true
        },
        {
            key: 'created_at' as keyof ProjectRequestWithData,
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value}
                </span>
            ),
            sortable: true
        }
    ], []);

    const actions: Action<ProjectRequestWithData>[] = [
        {
            label: 'View Request Details',
            onClick: (request) => {
                router.push(`/requests/projects/details?id=${request.id}`);
            },
            icon: <FileText className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'View Project Details',
            onClick: (request) => {
                if (request.project) {
                    router.push(`/projects/details?id=${request.project.id}`);
                } else if (request.task_order_id) {
                    router.push(`/projects/details?id=${request.task_order_id}`);
                }
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Show Approvals Timeline',
            onClick: (request) => router.push(`/requests/projects/timeline?id=${request.id}`),
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
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Approved Project Requests</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Browse and manage all approved project requests
                    </p>
                </div>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter approved project requests"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by request code, project name, project number, or notes..."
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
                title="Approved Project Requests List"
                description={`${totalItems} approved request${totalItems !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: totalItems,
                    badge: 'Total Approved',
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
                    noDataMessage="No approved project requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                    hideEmptyMessage={true}
                />
            </EnhancedCard>
        </div>
    );
}

export default function ProjectsApprovedPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        }>
            <ProjectsApprovedPageContent />
        </Suspense>
    );
}
