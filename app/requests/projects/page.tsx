'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderKanban, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, RefreshCw, FileSpreadsheet, Calendar, Clock, UserCheck, AlertTriangle, Search, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import type { Project } from '@/stores/types/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import axios from '@/utils/axios';

// Project Request type is always "Projects" for this page
const requestTypes = [
    { value: 'Projects', label: 'Projects', icon: <FolderKanban className="h-3 w-3" /> }
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

// Extended TaskRequest with project data
interface ProjectRequestWithData extends TaskRequest {
    project?: Project;
}

function ProjectRequestsPageContent() {
    const taskRequests = useSelector(selectTaskRequests);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useReduxDispatch<AppDispatch>();

    // Get status from URL query parameter
    const statusFromUrl = searchParams.get('status') || 'all';
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>(statusFromUrl);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<TaskRequest | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [projectsData, setProjectsData] = useState<Map<string, Project>>(new Map());
    const [loadingProjects, setLoadingProjects] = useState<Set<string>>(new Set());
    const [formData, setFormData] = useState({
        request_type: 'Projects',
        project_id: '',
        priority: 'medium',
        description: '',
        notes: '',
        due_date: ''
    });

    // Filter task requests to only show "Projects" type
    const projectRequests = useMemo(() => {
        return taskRequests.filter(req => req.request_type === 'Projects');
    }, [taskRequests]);

    // Update status filter when URL changes
    useEffect(() => {
        const statusFromUrl = searchParams.get('status') || 'all';
        setStatusFilter(statusFromUrl);
        setPage(1);
    }, [searchParams]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch task requests with request_type = "Projects"
    useEffect(() => {
        dispatch(fetchTaskRequests({ 
            page, 
            limit, 
            search: debouncedSearch,
            request_type: 'Projects',
            status: statusFilter !== 'all' ? statusFilter : undefined,
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, dateFrom, dateTo]);

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
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [enrichedRequests, search, statusFilter]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequests({ 
                page, 
                limit, 
                search: debouncedSearch,
                request_type: 'Projects',
                status: statusFilter !== 'all' ? statusFilter : undefined,
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
                    search,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Request Code', 'Request Type', 'Project', 'Project Number', 'Project Type', 'Status', 'Notes', 'Created By', 'Created At'];
            const csvHeaders = headers.join(',');
            const items = data?.body?.tasks_requests?.items || [];
            
            // Fetch project data for export
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
                    req.created_at ? new Date(req.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_requests_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const exportRequestData = async (request: ProjectRequestWithData) => {
        try {
            // Fetch project data if not already loaded
            let project = request.project;
            if (!project && request.task_order_id) {
                try {
                    const result = await dispatch(fetchProject({ id: request.task_order_id })).unwrap();
                    if (result?.body?.project) {
                        project = result.body.project;
                    }
                } catch (error) {
                    console.error(`Failed to fetch project ${request.task_order_id}:`, error);
                    toast.error('Failed to fetch project data');
                    return;
                }
            }

            const headers = ['Request Code', 'Request Type', 'Project Name', 'Project Number', 'Project Type', 'Status', 'Notes', 'Created By', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const csvRow = [
                request.request_code || '',
                request.request_type || 'Projects',
                escapeCsv(project?.name || ''),
                escapeCsv(project?.number || ''),
                escapeCsv(project?.type || ''),
                request.status || '',
                escapeCsv(request.notes || ''),
                escapeCsv(request.created_by_name || ''),
                request.created_at || ''
            ].join(',');
            
            const csvContent = [csvHeaders, csvRow].join('\n');
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_request_${request.request_code || request.id}_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Request data exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export request data');
        }
    };

    const escapeCsv = (str: string) => {
        if (!str) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
    };

    const handleCreate = () => {
        if (!formData.request_type || !formData.project_id) {
            toast.error('Please fill in all required fields');
            return;
        }

        toast.success('Project request created successfully');
        setIsCreateDialogOpen(false);
        setFormData({
            request_type: 'Projects',
            project_id: '',
            priority: 'medium',
            description: '',
            notes: '',
            due_date: ''
        });
    };

    const handleEdit = (request: ProjectRequestWithData) => {
        setEditingRequest(request);
        setFormData({
            request_type: request.request_type || 'Projects',
            project_id: request.task_order_id || '',
            priority: (request as any).priority || 'medium',
            description: (request as any).description || '',
            notes: request.notes || '',
            due_date: ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        toast.success('Project request updated successfully');
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({
            request_type: 'Projects',
            project_id: '',
            priority: 'medium',
            description: '',
            notes: '',
            due_date: ''
        });
    };

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (statusFilter !== 'all') arr.push(`Status: ${statusFilter}`);
        if (dateFrom && dateTo) arr.push(`Date: ${dateFrom} to ${dateTo}`);
        else if (dateFrom) arr.push(`From Date: ${dateFrom}`);
        else if (dateTo) arr.push(`To Date: ${dateTo}`);
        return arr;
    }, [search, statusFilter, dateFrom, dateTo]);

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
                    Referral: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
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
                const statusColors: Record<string, string> = {
                    'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Rejected': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                    'Closed': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
                    'Complete': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors] || statusColors.Pending} font-medium`}>
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
            hidden: () => false
        },
        {
            label: 'Download Data',
            onClick: (request) => exportRequestData(request),
            icon: <FileSpreadsheet className="h-4 w-4" />,
            variant: 'success' as const,
            hidden: (request) => request.status !== 'Completed'
        },
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Project Requests</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Browse and manage all project requests with comprehensive filtering and management tools
                    </p>
                </div>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter project requests by various criteria"
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
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToExcel}
                                disabled={isExporting || loading}
                                className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshTable}
                                disabled={isRefreshing}
                                className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 whitespace-nowrap"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                Status
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                    <SelectItem value="Pending" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Pending</SelectItem>
                                    <SelectItem value="Approved" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Approved</SelectItem>
                                    <SelectItem value="Rejected" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Rejected</SelectItem>
                                    <SelectItem value="Complete" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Complete</SelectItem>
                                    <SelectItem value="Closed" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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
                                        className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800"
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
                                    setStatusFilter('all');
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
                title="Project Requests List"
                description={`${totalItems} request${totalItems !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: totalItems,
                    badge: 'Total Requests',
                    badgeColor: 'default'
                }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
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
                    noDataMessage="No project requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                    hideEmptyMessage={true}
                />
            </EnhancedCard>
        </div>
    );
}

export default function ProjectRequestsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        }>
            <ProjectRequestsPageContent />
        </Suspense>
    );
}

