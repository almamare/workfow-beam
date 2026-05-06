'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchApprovals,
    selectApprovals,
    selectApprovalsLoading,
    selectApprovalsTotal,
    selectApprovalsPages,
    clearApprovals,
} from '@/stores/slices/approvals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Shield, Eye, Check, X, Clock, RefreshCw, FileSpreadsheet, Search, Loader2, X as XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Input } from '@/components/ui/input';
import type { Approval } from '@/stores/types/approvals';
import axios from '@/utils/axios';

function ApprovalsPageContent() {
    // Redux state
    const approvals = useSelector(selectApprovals);
    const loading = useSelector(selectApprovalsLoading);
    const totalItems = useSelector(selectApprovalsTotal);
    const totalPages = useSelector(selectApprovalsPages);
    
    const dispatch = useReduxDispatch<AppDispatch>();
    
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | string>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

    // Fetch approvals from API using Redux
    useEffect(() => {
        dispatch(fetchApprovals({
            page,
            limit,
            search: search || undefined,
            type: undefined,
            status: status !== 'All' ? status : undefined
        }));
    }, [dispatch, page, limit, search, status]);

    // Handle errors
    useEffect(() => {
        // Errors are handled in the slice, but we can show toast if needed
        // The error state is available via selector if needed
    }, []);

    const getStatusIcon = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('موافق') || statusLower.includes('approved') || statusLower === 'موافق') {
            return <Check className="h-4 w-4" />;
        }
        if (statusLower.includes('مرفوض') || statusLower.includes('rejected') || statusLower === 'مرفوض') {
            return <X className="h-4 w-4" />;
        }
        if (statusLower.includes('مراجعة') || statusLower.includes('pending') || statusLower === 'قيد المراجعة') {
            return <Clock className="h-4 w-4" />;
        }
        return <Clock className="h-4 w-4" />;
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('موافق') || statusLower.includes('approved') || statusLower === 'موافق') {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        }
        if (statusLower.includes('مرفوض') || statusLower.includes('rejected') || statusLower === 'مرفوض') {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        }
        if (statusLower.includes('مراجعة') || statusLower.includes('pending') || statusLower === 'قيد المراجعة') {
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        }
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    };

    const columns: Column<Approval>[] = [
        {
            key: 'sequence',
            header: 'Sequence',
            sortable: true,
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400 font-semibold">{value || '-'}</span>
        },
        {
            key: 'step_no',
            header: 'Step No',
            sortable: true,
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value || '-'}
                </Badge>
            )
        },
        {
            key: 'step_name',
            header: 'Step Name',
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value || '-'}</span>
            )
        },
        {
            key: 'created_name',
            header: 'Approver',
            sortable: true,
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || 'غير محدد'}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any, approval: Approval) => {
                return (
                    <Badge variant="outline" className={`${getStatusColor(value)} flex items-center gap-1 w-fit font-medium`}>
                        {getStatusIcon(value)}
                        {value || '-'}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'remarks',
            header: 'Remarks',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm" title={value}>
                    {value && value.length > 50 ? `${value.substring(0, 50)}...` : (value || '-')}
                </span>
            )
        },
        {
            key: 'created_at',
            header: 'Created Date',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '-'}
                </span>
            )
        }
    ];

    const actions: Action<Approval>[] = [
        {
            label: 'View Details',
            onClick: (approval) => {
                setSelectedApproval(approval);
                setIsDetailsDialogOpen(true);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        }
    ];


    // Note: Filtering by status and search is now done on the server side
    // The approvals from Redux are already filtered by the server

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            setPage(1);
            await dispatch(fetchApprovals({
                page: 1,
                limit,
                search: search || undefined,
                type: undefined,
                status: status !== 'All' ? status : undefined
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
            // Fetch all data for export
            const res = await axios.get('/approvals/fetch', {
                params: {
                    page: 1,
                    limit: 10000,
                    search: search || undefined,
                    status: status !== 'All' ? status : undefined
                }
            });

            // Handle both response structures
            const items = 
                res?.data?.data?.approvals?.items || 
                res?.data?.body?.approvals?.items || 
                approvals;
            
            const headers = ['Request ID', 'Sequence', 'Step No', 'Step Name', 'Approver', 'Status', 'Remarks', 'Created Date'];
            const csvHeaders = headers.join(',');
            const csvRows = items.map((a: Approval) => {
                return [
                    a.request_id || '',
                    a.sequence || '',
                    a.step_no || '',
                    escapeCsv(a.step_name || ''),
                    escapeCsv(a.created_name || 'غير محدد'),
                    escapeCsv(a.status || ''),
                    escapeCsv(a.remarks || ''),
                    a.created_at ? new Date(a.created_at).toLocaleString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `approvals_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        return arr;
    }, [search, status]);

    // Get unique statuses from all loaded approvals for filter options
    // Note: This gets statuses from currently loaded data, may not include all possible statuses
    const uniqueStatuses = useMemo(() => {
        const statusSet = new Set<string>();
        approvals.forEach(a => {
            if (a.status) statusSet.add(a.status);
        });
        return Array.from(statusSet).sort();
    }, [approvals]);
    
    // Calculate filtered total and pages (from server response)
    const filteredTotal = totalItems; // Use total from server (already filtered)
    const filteredPages = totalPages; // Use pages from server (already filtered)

    // Count statuses from filtered data (already filtered by server)
    const pendingCount = useMemo(() => {
        return approvals.filter(a => {
            const s = a.status?.toLowerCase() || '';
            return s.includes('مراجعة') || s.includes('pending') || s === 'قيد المراجعة';
        }).length;
    }, [approvals]);
    
    const approvedCount = useMemo(() => {
        return approvals.filter(a => {
            const s = a.status?.toLowerCase() || '';
            return s.includes('موافق') || s.includes('approved') || s === 'موافق';
        }).length;
    }, [approvals]);
    
    const rejectedCount = useMemo(() => {
        return approvals.filter(a => {
            const s = a.status?.toLowerCase() || '';
            return s.includes('مرفوض') || s.includes('rejected') || s === 'مرفوض';
        }).length;
    }, [approvals]);

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Approvals</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Review and track approval workflow for requests with comprehensive filtering and management tools
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Approvals"
                    description="All approval records"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {filteredTotal}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Pending Approval"
                    description="Requests awaiting review"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {pendingCount}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Approved"
                    description="Successfully approved requests"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {approvedCount}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Rejected"
                    description="Rejected requests"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {rejectedCount}
                    </div>
                </EnhancedCard>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter approvals by various criteria"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by step name, approver, remarks, sequence, or request ID..."
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                Status
                            </Label>
                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Statuses</SelectItem>
                                    {uniqueStatuses.map(s => (
                                        <SelectItem key={s} value={s} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters & Clear Button */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setStatus('All');
                                    setPage(1);
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <XIcon className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Approvals Table */}
            <EnhancedCard
                title="Approvals List"
                description={`${filteredTotal} approval${filteredTotal !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: filteredTotal,
                    badge: 'Total Approvals',
                    badgeColor: 'success'
                }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            <SelectItem value="5" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">5 per page</SelectItem>
                            <SelectItem value="10" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">10 per page</SelectItem>
                            <SelectItem value="20" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">20 per page</SelectItem>
                            <SelectItem value="50" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">50 per page</SelectItem>
                            <SelectItem value="100" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">100 per page</SelectItem>
                            <SelectItem value="200" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">200 per page</SelectItem>
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={approvals}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: filteredPages,
                        pageSize: limit,
                        totalItems: filteredTotal,
                        onPageChange: setPage
                    }}
                    noDataMessage="No approvals found matching your search criteria"
                    searchPlaceholder="Search approvals..."
                />
            </EnhancedCard>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Approval Details
                        </DialogTitle>
                        <DialogDescription>
                            View request details and approve or reject it
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApproval && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sequence</Label>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedApproval.sequence || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Step Number</Label>
                                    <p className="text-lg text-slate-900 dark:text-slate-100">{selectedApproval.step_no || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Step Name</Label>
                                    <p className="text-lg text-slate-900 dark:text-slate-100">{selectedApproval.step_name || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={`${getStatusColor(selectedApproval.status)} flex items-center gap-1 w-fit font-medium`}>
                                            {getStatusIcon(selectedApproval.status)}
                                            {selectedApproval.status || '-'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Approver</Label>
                                    <p className="text-lg text-slate-900 dark:text-slate-100">{selectedApproval.created_name || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created Date</Label>
                                    <p className="text-lg text-slate-900 dark:text-slate-100">
                                        {selectedApproval.created_at ? new Date(selectedApproval.created_at).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '-'}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Request ID</Label>
                                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedApproval.request_id || '-'}</p>
                            </div>
                            
                            {selectedApproval.remarks && (
                                <div>
                                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Remarks</Label>
                                    <p className="text-lg text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedApproval.remarks}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function escapeCsv(val: any) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

export default function ApprovalsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        }>
            <ApprovalsPageContent />
        </Suspense>
    );
}
