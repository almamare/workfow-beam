'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchTaskOrders,
    selectTaskOrders,
    selectTaskOrdersLoading,
    selectTaskOrdersTotal,
    selectTaskOrdersPages
} from '@/stores/slices/task-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { TaskOrder } from '@/stores/types/task-orders';
import { Edit, Eye, Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';

export default function TaskOrdersPage() {
    const taskOrders = useSelector(selectTaskOrders);
    const loading = useSelector(selectTaskOrdersLoading);
    const totalPages = useSelector(selectTaskOrdersPages);
    const totalItems = useSelector(selectTaskOrdersTotal);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | 'Active' | 'Pending' | 'Onhold' | 'Closed' | 'Cancelled'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        dispatch(fetchTaskOrders({ page, limit, search, status: status === 'All' ? undefined : status } as any));
    }, [dispatch, page, limit, search, status]);

    const columns: Column<TaskOrder>[] = [
        {
            key: 'sequence' as keyof TaskOrder,
            header: 'ID',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '80px'
        },
        {
            key: 'title' as keyof TaskOrder,
            header: 'Task Title',
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'task_order_no' as keyof TaskOrder,
            header: 'Task Order #',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-300 font-mono">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'contractor_name' as keyof TaskOrder,
            header: 'Contractor',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'project_name' as keyof TaskOrder,
            header: 'Project',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'issue_date' as keyof TaskOrder,
            header: 'Issue Date',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof TaskOrder,
            header: 'Status',
            render: (value: any) => {
                const statusColors: Record<string, string> = {
                    'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    'Onhold': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                    'Closed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    'Cancelled': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                };
                return (
                    <Badge 
                        variant="outline" 
                        className={`${statusColors[value as keyof typeof statusColors] || statusColors.Pending} font-medium`}
                    >
                        {value}
                    </Badge>
                );
            },
            sortable: true
        }
    ];

    const actions: Action<TaskOrder>[] = [
        {
            label: 'View Details',
            onClick: (taskOrder: TaskOrder) => router.push(`/tasks/details?id=${taskOrder.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Task',
            onClick: (taskOrder: TaskOrder) => router.push(`/tasks/update?id=${taskOrder.id}`),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        return arr;
    }, [search, status]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskOrders({ page, limit, search, status: status === 'All' ? undefined : status } as any));
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
            const { data } = await axios.get('/task-orders/fetch', {
                params: {
                    search,
                    status: status !== 'All' ? status : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['ID', 'Order #', 'Title', 'Contractor', 'Project', 'Issue Date', 'Status'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.tasks?.items || []).map((t: any) => {
                return [
                    t.sequence,
                    t.task_order_no,
                    escapeCsv(t.title),
                    escapeCsv(t.contractor_name),
                    escapeCsv(t.project_name),
                    new Date(t.issue_date).toLocaleDateString('en-US'),
                    t.status
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `task_orders_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">

            {/* Page Header */}
            <PageHeader
                title="Task Orders"
                breadcrumb={true}
                description="Manage all task orders with comprehensive filtering and management tools"
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by task order number..."
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
                            { key: 'All', value: 'All', label: 'All Statuses' },
                            { key: 'Active', value: 'Active', label: 'Active' },
                            { key: 'Pending', value: 'Pending', label: 'Pending' },
                            { key: 'Onhold', value: 'Onhold', label: 'Onhold' },
                            { key: 'Closed', value: 'Closed', label: 'Closed' },
                            { key: 'Cancelled', value: 'Cancelled', label: 'Cancelled' },
                        ],
                        onValueChange: (v) => { setStatus(v as any); setPage(1); }
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

            {/* Tasks Table */}
            <EnhancedCard
                title="Task Orders List"
                description={`${totalItems} task orders in the system`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5,10,20,50,100,200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
                stats={{ total: totalItems, badge: 'Total', badgeColor: 'default' }}
            >
                <EnhancedDataTable
                    data={taskOrders}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No task orders found matching your search criteria"
                    searchPlaceholder="Search task orders..."
                />
            </EnhancedCard>
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