'use client';

// صفحة طلبات الموافقة المعلقة للمستخدم الحالي
// Endpoint: GET /requests/tasks/fetch/for-approval

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchTasksRequestsForApproval,
    setFilters,
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
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Search, RefreshCw, CheckCircle, XCircle, Eye, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { ApprovalModal } from '@/components/ApprovalModal';
import { DatePicker } from '@/components/DatePicker';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import { useAuth } from '@/hooks/useAuth';
import { fetchApprovals } from '@/stores/slices/approvals';

// Request types for filter
const requestTypes = [
    { value: 'Extension', label: 'Extension' },
    { value: 'Material Change', label: 'Material Change' },
    { value: 'Time Extension', label: 'Time Extension' },
    { value: 'Budget Change', label: 'Budget Change' },
    { value: 'Other', label: 'Other' },
];

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Rejected': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

const getRequestTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'Extension': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Material Change': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        'Time Extension': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        'Budget Change': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Other': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    };
    return colors[type] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

export default function TasksRequestsPendingPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useAuth();

    // Redux state
    const items = useSelector(selectTasksRequestsForApproval);
    const total = useSelector(selectTasksRequestsForApprovalTotal);
    const pages = useSelector(selectTasksRequestsForApprovalPages);
    const currentPage = useSelector(selectTasksRequestsForApprovalCurrentPage);
    const loading = useSelector(selectTasksRequestsForApprovalLoading);
    const error = useSelector(selectTasksRequestsForApprovalError);
    const filters = useSelector(selectTasksRequestsForApprovalFilters);

    // Local state for filters (before applying)
    const [localSearch, setLocalSearch] = useState(filters.search || '');
    const [localRequestType, setLocalRequestType] = useState(filters.request_type || 'all');
    const [localFromDate, setLocalFromDate] = useState(filters.from_date || '');
    const [localToDate, setLocalToDate] = useState(filters.to_date || '');
    const [limit, setLimit] = useState(10);
    const [debouncedSearch, setDebouncedSearch] = useState(localSearch);

    // Modal state
    const [selectedRequest, setSelectedRequest] = useState<TaskRequest | null>(null);
    const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch]);

    // Fetch data when filters or page change
    useEffect(() => {
        const params = {
            page: currentPage,
            limit,
            search: debouncedSearch || undefined,
            request_type: localRequestType !== 'all' ? localRequestType : undefined,
            from_date: localFromDate || undefined,
            to_date: localToDate || undefined,
        };

        dispatch(fetchTasksRequestsForApproval(params));
    }, [dispatch, currentPage, limit, debouncedSearch, localRequestType, localFromDate, localToDate]);

    // Apply filters to Redux
    const handleApplyFilters = useCallback(() => {
        dispatch(setFilters({
            search: debouncedSearch || undefined,
            request_type: localRequestType !== 'all' ? localRequestType : undefined,
            from_date: localFromDate || undefined,
            to_date: localToDate || undefined,
        }));
        dispatch(setPage(1));
    }, [dispatch, debouncedSearch, localRequestType, localFromDate, localToDate]);

    // Clear filters
    const handleClearFilters = useCallback(() => {
        setLocalSearch('');
        setLocalRequestType('all');
        setLocalFromDate('');
        setLocalToDate('');
        dispatch(resetFilters());
    }, [dispatch]);

    // Handle approve/reject - need to fetch pending approval first
    const handleApprove = async (request: TaskRequest) => {
        try {
            // Fetch approvals for this request to get the pending approval ID
            const result = await dispatch(fetchApprovals({ request_id: request.id }));
            if (fetchApprovals.fulfilled.match(result)) {
                // Find the pending approval for current user
                // Handle both response formats
                let approvals: any[] = [];
                if ('data' in result.payload && result.payload.data?.approvals?.items) {
                    approvals = result.payload.data.approvals.items;
                } else if ('body' in result.payload && result.payload.body?.approvals?.items) {
                    approvals = result.payload.body.approvals.items;
                }
                
                const pendingApproval = approvals.find((a: any) => 
                    a.status?.toLowerCase().includes('pending') || 
                    a.status?.toLowerCase().includes('قيد')
                );
                
                if (pendingApproval) {
                    setSelectedRequest({ ...request, id: pendingApproval.id } as any);
                    setModalAction('approve');
                } else {
                    toast.error('لم يتم العثور على موافقة معلقة لهذا الطلب');
                }
            } else {
                toast.error('فشل في جلب بيانات الموافقة');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب بيانات الموافقة');
        }
    };

    const handleReject = async (request: TaskRequest) => {
        try {
            // Fetch approvals for this request to get the pending approval ID
            const result = await dispatch(fetchApprovals({ request_id: request.id }));
            if (fetchApprovals.fulfilled.match(result)) {
                // Find the pending approval for current user
                // Handle both response formats
                let approvals: any[] = [];
                if ('data' in result.payload && result.payload.data?.approvals?.items) {
                    approvals = result.payload.data.approvals.items;
                } else if ('body' in result.payload && result.payload.body?.approvals?.items) {
                    approvals = result.payload.body.approvals.items;
                }
                
                const pendingApproval = approvals.find((a: any) => 
                    a.status?.toLowerCase().includes('pending') || 
                    a.status?.toLowerCase().includes('قيد')
                );
                
                if (pendingApproval) {
                    setSelectedRequest({ ...request, id: pendingApproval.id } as any);
                    setModalAction('reject');
                } else {
                    toast.error('لم يتم العثور على موافقة معلقة لهذا الطلب');
                }
            } else {
                toast.error('فشل في جلب بيانات الموافقة');
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب بيانات الموافقة');
        }
    };

    const handleViewDetails = (request: TaskRequest) => {
        router.push(`/requests/tasks/details?id=${request.id}`);
    };

    const handleModalClose = () => {
        setSelectedRequest(null);
        setModalAction(null);
        // Refresh data after approval action
        dispatch(fetchTasksRequestsForApproval({
            page: currentPage,
            limit,
            ...filters,
        }));
    };

    // Table columns
    const columns: Column<TaskRequest>[] = useMemo(() => [
        {
            key: 'request_code',
            header: 'Request Code',
            sortable: true,
            render: (value: any) => (
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{value || '-'}</span>
            ),
        },
        {
            key: 'request_type',
            header: 'Request Type',
            sortable: true,
            render: (value: any) => (
                <Badge variant="outline" className={getRequestTypeColor(value)}>
                    {value || '-'}
                </Badge>
            ),
        },
        {
            key: 'created_by_name',
            header: 'Created By',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
            ),
        },
        {
            key: 'contractor_name',
            header: 'Contractor',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
            ),
        },
        {
            key: 'project_name',
            header: 'Project',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value: any) => (
                <Badge variant="outline" className={getStatusColor(value)}>
                    {value || 'Pending'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            header: 'Created At',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) : '-'}
                </span>
            ),
        },
    ], []);

    // Table actions
    const getActions = useCallback((request: TaskRequest): Action<TaskRequest>[] => {
        const actions: Action<TaskRequest>[] = [
            {
                label: 'View Details',
                onClick: () => handleViewDetails(request),
                icon: <Eye className="h-4 w-4" />,
                variant: 'info',
            },
        ];

        // Only show approve/reject if status is Pending
        if (request.status === 'Pending') {
            actions.push(
                {
                    label: 'Approve',
                    onClick: () => handleApprove(request),
                    icon: <CheckCircle className="h-4 w-4" />,
                    variant: 'success',
                },
                {
                    label: 'Reject',
                    onClick: () => handleReject(request),
                    icon: <XCircle className="h-4 w-4" />,
                    variant: 'destructive',
                }
            );
        }

        return actions;
    }, []);

    // Active filters for display
    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (debouncedSearch) arr.push(`Search: ${debouncedSearch}`);
        if (localRequestType !== 'all') arr.push(`Type: ${localRequestType}`);
        if (localFromDate && localToDate) arr.push(`Date: ${localFromDate} to ${localToDate}`);
        else if (localFromDate) arr.push(`From: ${localFromDate}`);
        else if (localToDate) arr.push(`To: ${localToDate}`);
        return arr;
    }, [debouncedSearch, localRequestType, localFromDate, localToDate]);

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        طلبات الموافقة المعلقة
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        قائمة بجميع طلبات المهام المعلقة التي تحتاج إلى موافقتك
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EnhancedCard
                    title="إجمالي الطلبات"
                    description="جميع الطلبات المعلقة"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {total}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="الصفحة الحالية"
                    description={`من ${pages} صفحة`}
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {currentPage} / {pages}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="الطلبات المعروضة"
                    description="في هذه الصفحة"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {items.length}
                    </div>
                </EnhancedCard>
            </div>

            {/* Search & Filters */}
            <EnhancedCard
                title="البحث والتصفية"
                description="ابحث وفلتر الطلبات المعلقة"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="ابحث في رقم الطلب..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="pr-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleApplyFilters}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                            >
                                <Search className="h-4 w-4 mr-2" />
                                تطبيق
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    dispatch(fetchTasksRequestsForApproval({
                                        page: currentPage,
                                        limit,
                                        ...filters,
                                    }));
                                    toast.success('تم تحديث البيانات');
                                }}
                                disabled={loading}
                                className="border-slate-200 dark:border-slate-700"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                تحديث
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Request Type Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="request_type" className="text-slate-700 dark:text-slate-300 font-medium">
                                نوع الطلب
                            </Label>
                            <Select value={localRequestType} onValueChange={setLocalRequestType}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="جميع الأنواع" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأنواع</SelectItem>
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* From Date */}
                        <div className="space-y-2">
                            <Label htmlFor="from_date" className="text-slate-700 dark:text-slate-300 font-medium">
                                من تاريخ
                            </Label>
                            <DatePicker
                                value={localFromDate}
                                onChange={setLocalFromDate}
                            />
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <Label htmlFor="to_date" className="text-slate-700 dark:text-slate-300 font-medium">
                                إلى تاريخ
                            </Label>
                            <DatePicker
                                value={localToDate}
                                onChange={setLocalToDate}
                            />
                        </div>
                    </div>

                    {/* Active Filters & Clear Button */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">الفلاتر النشطة:</span>
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                            >
                                <X className="h-4 w-4 mr-2" />
                                مسح الكل
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Requests Table */}
            <EnhancedCard
                title="قائمة الطلبات المعلقة"
                description={`${total} طلب معلق`}
                variant="default"
                size="sm"
                stats={{
                    total: total,
                    badge: 'إجمالي الطلبات',
                    badgeColor: 'default',
                }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); dispatch(setPage(1)); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 50, 100].map(n => (
                                <SelectItem key={n} value={String(n)}>
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
                            <Button
                                variant="outline"
                                onClick={() => dispatch(fetchTasksRequestsForApproval({
                                    page: currentPage,
                                    limit,
                                    ...filters,
                                }))}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                إعادة المحاولة
                            </Button>
                        </div>
                    </div>
                ) : (
                    <EnhancedDataTable
                        data={items}
                        columns={columns}
                        actions={getActions}
                        loading={loading}
                        pagination={{
                            currentPage: currentPage,
                            totalPages: pages,
                            pageSize: limit,
                            totalItems: total,
                            onPageChange: (page) => dispatch(setPage(page)),
                        }}
                        noDataMessage="لا توجد طلبات معلقة"
                        searchPlaceholder="ابحث في الطلبات..."
                    />
                )}
            </EnhancedCard>

            {/* Approval Modal */}
            {selectedRequest && modalAction && (
                <ApprovalModal
                    open={true}
                    onClose={handleModalClose}
                    approvalId={selectedRequest.id} // Using request ID as approval ID - backend should handle mapping
                    action={modalAction}
                    requestCode={selectedRequest.request_code}
                    requestType={selectedRequest.request_type}
                    creatorName={selectedRequest.created_by_name}
                    onSuccess={handleModalClose}
                />
            )}
        </div>
    );
}

