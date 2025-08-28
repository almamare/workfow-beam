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
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { TaskOrder } from '@/stores/types/task-orders';
import { Edit, Eye } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';

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

    const columns: Column<TaskOrder>[] = [
        {
            key: 'sequence',
            header: 'ID',
            render: (value) => <span className="text-muted-foreground">{value}</span>,
            sortable: true
        },
        {
            key: 'title',
            header: 'Title',
            sortable: true
        },
        {
            key: 'task_order_no',
            header: 'Task Order No',
            sortable: true
        },
        {
            key: 'contractor_name',
            header: 'Contractor',
            sortable: true
        },
        {
            key: 'project_name',
            header: 'Project',
            sortable: true
        },
        {
            key: 'issue_date',
            header: 'Issue Date',
            sortable: true
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <Badge
                    variant={
                        value === 'Active'
                            ? 'completed'
                            : value === 'Pending'
                                ? 'pending'
                                : value === 'Onhold'
                                    ? 'onhold'
                                    : value === 'Closed'
                                        ? 'draft'
                                        : value === 'Cancelled'
                                            ? 'rejected'
                                            : 'default'
                    }
                >
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'created_at',
            header: 'Created At',
            sortable: true
        }
    ];

    const actions: Action<TaskOrder>[] = [
        {
            label: 'Details',
            onClick: (taskOrder) => {
                router.push(`/tasks/details?id=${taskOrder.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit',
            onClick: (taskOrder) => {
                router.push(`/tasks/update?id=${taskOrder.id}`);
            },
            icon: <Edit className="h-4 w-4" />
        }
    ];

    return (
        <div className="space-y-4">
            {/* Page header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Task Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all task orders in the system
                    </p>
                </div>
                <Button onClick={() => router.push('/tasks/create')} className="bg-primary text-white">
                    + Create Task Order
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Input
                    placeholder="Search by task order number..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full sm:max-w-sm"
                />
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Task Order List</CardTitle>
                            <CardDescription>Total {totalItems} task orders found</CardDescription>
                        </div>

                        <Select
                            value={limit.toString()}
                            onValueChange={(value) => {
                                setLimit(parseInt(value, 10));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <DataTable
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
                        noDataMessage="No task orders found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
