'use client';

import React, { useEffect, useState } from 'react';
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
import { Edit, Eye, Plus, Download, Filter, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';

export default function TaskOrdersPage() {
    const taskOrders = useSelector(selectTaskOrders);
    const loading = useSelector(selectTaskOrdersLoading);
    const totalPages = useSelector(selectTaskOrdersPages);
    const totalItems = useSelector(selectTaskOrdersTotal);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        dispatch(fetchTaskOrders({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    const columns = [
        {
            key: 'sequence' as keyof TaskOrder,
            header: 'ID',
            render: (value: any) => <span className="text-slate-500 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '80px'
        },
        {
            key: 'title' as keyof TaskOrder,
            header: 'Task Title',
            render: (value: any) => (
                <span className="font-semibold text-slate-800">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'task_order_no' as keyof TaskOrder,
            header: 'Task Order #',
            render: (value: any) => (
                <span className="text-slate-600 font-mono">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'contractor_name' as keyof TaskOrder,
            header: 'Contractor',
            render: (value: any) => (
                <span className="text-slate-700">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'project_name' as keyof TaskOrder,
            header: 'Project',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'issue_date' as keyof TaskOrder,
            header: 'Issue Date',
            render: (value: any) => (
                <span className="text-slate-600">{new Date(value).toLocaleDateString()}</span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof TaskOrder,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'Active': 'bg-green-100 text-green-700 border-green-200',
                    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'Onhold': 'bg-orange-100 text-orange-700 border-orange-200',
                    'Closed': 'bg-blue-100 text-blue-700 border-blue-200',
                    'Cancelled': 'bg-red-100 text-red-700 border-red-200'
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

    const actions = [
        {
            label: 'View Details',
            onClick: (taskOrder: TaskOrder) => {
                router.push(`/tasks/details?id=${taskOrder.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Task',
            onClick: (taskOrder: TaskOrder) => {
                router.push(`/tasks/update?id=${taskOrder.id}`);
            },
            icon: <Edit className="h-4 w-4" />
        }
    ];

    const stats = [
        {
            label: 'Total Tasks',
            value: totalItems,
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Active Tasks',
            value: taskOrders.filter(t => t.status === 'Active').length,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Pending Review',
            value: taskOrders.filter(t => t.status === 'Pending').length,
            change: '+3%',
            trend: 'up' as const
        },
        {
            label: 'Completed',
            value: taskOrders.filter(t => t.status === 'Closed').length,
            change: '+12%',
            trend: 'up' as const
        }
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Task Orders"
                description="Manage and track all task orders with comprehensive workflow management and status tracking"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Create Task Order',
                        onClick: () => router.push('/tasks/create'),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Export Data',
                            onClick: () => toast.info('Export feature coming soon'),
                            icon: <Download className="h-4 w-4" />
                        },
                        {
                            label: 'Status Report',
                            onClick: () => toast.info('Status report coming soon'),
                            icon: <Filter className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by task title, order number, or contractor..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setPage(1);
                }}
            />

            {/* Tasks Table */}
            <EnhancedCard
                title="Task Orders List"
                description={`${totalItems} task orders in the system`}
                variant="gradient"
                size="lg"
                stats={{
                    total: totalItems,
                    badge: 'Active Tasks',
                    badgeColor: 'success'
                }}
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