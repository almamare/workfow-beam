'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
import { Shield, Eye, Check, X, Clock, RefreshCw, FileSpreadsheet, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import type { Approval } from '@/stores/types/approvals';
import axios from '@/utils/axios';

export default function ApprovalsPage() {
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
            key: 'request_id',
            header: 'Request ID',
            sortable: true,
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value || '-'}</span>
        },
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
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Approvals</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Review and track approval workflow for requests</p>
                </div>
            </div>


            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Approvals"
                    description="All approval records"
                    variant="default"
                    size="sm"
                    stats={{
                        total: filteredTotal,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Pending Approval"
                    description="Requests awaiting review"
                    variant="default"
                    size="sm"
                    stats={{
                        total: pendingCount,
                        badge: 'Pending',
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Approved"
                    description="Successfully approved requests"
                    variant="default"
                    size="sm"
                    stats={{
                        total: approvedCount,
                        badge: 'Approved',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Rejected"
                    description="Rejected requests"
                    variant="default"
                    size="sm"
                    stats={{
                        total: rejectedCount,
                        badge: 'Rejected',
                        badgeColor: 'error'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by step name, approver, remarks, sequence, or request ID..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'status',
                        label: 'Status',
                        value: status,
                        options: [
                            { key: 'all', label: 'All Statuses', value: 'All' },
                            ...uniqueStatuses.map(s => ({
                                key: s,
                                label: s,
                                value: s
                            }))
                        ],
                        onValueChange: (value) => {
                            setStatus(value);
                            setPage(1);
                        }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setStatus('All');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Approvals Table */}
            <EnhancedCard
                title="Approvals List"
                description={`${filteredTotal} approvals found`}
                variant="default"
                size="sm"
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
