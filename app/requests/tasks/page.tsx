'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, RefreshCw, FileSpreadsheet, Calendar, Clock, UserCheck, AlertTriangle, Search, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import axios from '@/utils/axios';

const requestTypes = [
    { value: 'Tasks', label: 'Tasks', icon: <ClipboardList className="h-3 w-3" /> },
    { value: 'Materials', label: 'Materials', icon: <ClipboardList className="h-3 w-3" /> },
    { value: 'Equipment', label: 'Equipment', icon: <ClipboardList className="h-3 w-3" /> },
    { value: 'Other', label: 'Other', icon: <ClipboardList className="h-3 w-3" /> }
];

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

function TaskRequestsPageContent() {
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
    const [formData, setFormData] = useState({
        request_type: '',
        contractor_name: '',
        project_name: '',
        priority: 'medium',
        description: '',
        notes: '',
        due_date: '',
        estimated_hours: '',
        assigned_to: ''
    });

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

    // Fetch task requests
    useEffect(() => {
        dispatch(fetchTaskRequests({ 
            page, 
            limit, 
            search: debouncedSearch,
            request_type: 'Tasks',
            status: statusFilter !== 'all' ? statusFilter : undefined,
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, dateFrom, dateTo]);


    // Filter task requests to only show "Tasks" type
    const taskRequestsFiltered = useMemo(() => {
        return taskRequests.filter(req => req.request_type === 'Tasks');
    }, [taskRequests]);

    const contractors: string[] = ['ABC Construction', 'XYZ Electrical', 'Green Landscaping', 'Modern Plumbing', 'Quality Painters'];
    const projects: string[] = ['Office Building Construction', 'Residential Complex', 'Shopping Mall', 'Hospital', 'School'];
    const assignees: string[] = ['Ahmed Ali', 'Sara Ahmed', 'Mohammed Saleh', 'Fatima Mohamed', 'Omar Hassan'];

    const filteredRequests = useMemo(() => {
        return taskRequestsFiltered.filter(request => {
            const matchesSearch = request.request_code?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                request.contractor_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                request.project_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                request.notes?.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [taskRequestsFiltered, debouncedSearch, statusFilter]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequests({ 
                page, 
                limit, 
                search: debouncedSearch,
                request_type: 'Tasks',
                status: statusFilter !== 'all' ? statusFilter : undefined,
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
                    search: debouncedSearch,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Request Code', 'Request Type', 'Contractor', 'Project', 'Description', 'Status', 'Created By', 'Created At'];
            const csvHeaders = headers.join(',');
            const items = data?.body?.tasks_requests?.items || [];
            
            const csvRows = items.map((req: TaskRequest) => {
                return [
                    req.request_code,
                    req.request_type,
                    escapeCsv(req.contractor_name),
                    escapeCsv(req.project_name),
                    escapeCsv(req.notes || ''),
                    req.status,
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
            a.download = `task_requests_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleCreate = () => {
        if (!formData.request_type || !formData.contractor_name || !formData.project_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        toast.success('Task request created successfully');
        setIsCreateDialogOpen(false);
        setFormData({
            request_type: '',
            contractor_name: '',
            project_name: '',
            priority: 'medium',
            description: '',
            notes: '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
    };

    const handleEdit = (request: TaskRequest) => {
        setEditingRequest(request);
        setFormData({
            request_type: request.request_type || '',
            contractor_name: request.contractor_name || '',
            project_name: request.project_name || '',
            priority: 'medium',
            description: (request as any).description || '',
            notes: request.notes || '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        toast.success('Task request updated successfully');
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({
            request_type: '',
            contractor_name: '',
            project_name: '',
            priority: 'medium',
            description: '',
            notes: '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
    };

    const handleDelete = (id: string) => {
        toast.success('Task request deleted successfully');
    };

    const handleStatusChange = (id: string, status: string) => {
        toast.success(`Request ${status} successfully`);
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

    const columns: Column<TaskRequest>[] = [
        {
            key: 'request_code',
            header: 'Request Code',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true
        },
        {
            key: 'request_type',
            header: 'Request Type',
            render: (value: any) => {
                const typeConfig = requestTypes.find(t => t.value === value);
                const typeColors: Record<string, string> = {
                    'Tasks': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                };
                
                return (
                    <Badge variant="outline" className={`${typeColors[value as keyof typeof typeColors] || typeColors.other} font-medium`}>
                        {typeConfig?.icon}
                        <span className="ml-1">{typeConfig?.label}</span>
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'contractor_name',
            header: 'Contractor',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>,
            sortable: true
        },
        {
            key: 'project_name',
            header: 'Project',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
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
                    {value ? new Date(value).toLocaleDateString('en-US') : '-'}
                </span>
            ),
            sortable: true
        }
    ];

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
            hidden: () => false
        },
        {
            label: 'Download Data',
            onClick: (request) => {
                const headers = ['Request Code', 'Request Type', 'Contractor', 'Project', 'Description', 'Status', 'Created By', 'Created At'];
                const csvHeaders = headers.join(',');
                const csvRow = [
                    request.request_code || '',
                    request.request_type || 'Tasks',
                    escapeCsv(request.contractor_name || ''),
                    escapeCsv(request.project_name || ''),
                    escapeCsv(request.notes || ''),
                    request.status || '',
                    escapeCsv(request.created_by_name || ''),
                    request.created_at || ''
                ].join(',');
                const csvContent = [csvHeaders, csvRow].join('\n');
                const BOM = '\uFEFF';
                const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `task_request_${request.request_code || request.id}_${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Request data exported successfully');
            },
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
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Task Requests</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Browse and manage all task requests with comprehensive filtering and management tools
                    </p>
                </div>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter task requests by various criteria"
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
                title="Task Requests List"
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
                    noDataMessage="No task requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                    hideEmptyMessage={true}
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-slate-100">Create New Task Request</DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            Add a new task request with comprehensive details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="request_type" className="text-slate-700 dark:text-slate-300 font-medium">Request Type</Label>
                            <Select value={formData.request_type} onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue placeholder="Select Request Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="contractor_name" className="text-slate-700 dark:text-slate-300 font-medium">Contractor</Label>
                            <Select value={formData.contractor_name} onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_name: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue placeholder="Select Contractor" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {contractors.map(contractor => (
                                        <SelectItem key={contractor} value={contractor} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {contractor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="project_name" className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                            <Select value={formData.project_name} onValueChange={(value) => setFormData(prev => ({ ...prev, project_name: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {projects.map(project => (
                                        <SelectItem key={project} value={project} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {project}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300 font-medium">Priority</Label>
                            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {priorities.map(priority => (
                                        <SelectItem key={priority.value} value={priority.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {priority.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Task description"
                                rows={4}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 font-medium">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes"
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="due_date" className="text-slate-700 dark:text-slate-300 font-medium">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="estimated_hours" className="text-slate-700 dark:text-slate-300 font-medium">Estimated Hours</Label>
                                <Input
                                    id="estimated_hours"
                                    type="number"
                                    value={formData.estimated_hours}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="assigned_to" className="text-slate-700 dark:text-slate-300 font-medium">Assigned To</Label>
                            <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue placeholder="Select Assignee" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {assignees.map(assignee => (
                                        <SelectItem key={assignee} value={assignee} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {assignee}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreate} 
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Create Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-slate-100">Edit Task Request</DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            Update task request information and details
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-request_type" className="text-slate-700 dark:text-slate-300 font-medium">Request Type</Label>
                            <Select value={formData.request_type} onValueChange={(value) => setFormData(prev => ({ ...prev, request_type: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-contractor_name" className="text-slate-700 dark:text-slate-300 font-medium">Contractor</Label>
                            <Select value={formData.contractor_name} onValueChange={(value) => setFormData(prev => ({ ...prev, contractor_name: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {contractors.map(contractor => (
                                        <SelectItem key={contractor} value={contractor} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {contractor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-project_name" className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                            <Select value={formData.project_name} onValueChange={(value) => setFormData(prev => ({ ...prev, project_name: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {projects.map(project => (
                                        <SelectItem key={project} value={project} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {project}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-priority" className="text-slate-700 dark:text-slate-300 font-medium">Priority</Label>
                            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {priorities.map(priority => (
                                        <SelectItem key={priority.value} value={priority.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {priority.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-description" className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-notes" className="text-slate-700 dark:text-slate-300 font-medium">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-due_date" className="text-slate-700 dark:text-slate-300 font-medium">Due Date</Label>
                                <Input
                                    id="edit-due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-estimated_hours" className="text-slate-700 dark:text-slate-300 font-medium">Estimated Hours</Label>
                                <Input
                                    id="edit-estimated_hours"
                                    type="number"
                                    value={formData.estimated_hours}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="edit-assigned_to" className="text-slate-700 dark:text-slate-300 font-medium">Assigned To</Label>
                            <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {assignees.map(assignee => (
                                        <SelectItem key={assignee} value={assignee} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {assignee}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsEditDialogOpen(false)}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUpdate} 
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function TaskRequestsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        }>
            <TaskRequestsPageContent />
        </Suspense>
    );
}

function escapeCsv(val: any) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}
