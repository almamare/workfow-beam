'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchTaskRequests,
    selectTaskRequests,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/tasks_requests';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import { Edit, Eye } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function TaskRequestsPage() {
    const taskRequests = useSelector(selectTaskRequests);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        dispatch(fetchTaskRequests({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    const columns: Column<TaskRequest>[] = [
        {
            key: 'request_code',
            header: 'Request Code',
            sortable: true
        },
        {
            key: 'request_type',
            header: 'Type',
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
            key: 'notes',
            header: 'Notes',
            sortable: true
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <Badge
                    variant={
                        value === 'Pending'
                            ? 'pending'
                            : value === 'Approved'
                                ? 'approved'
                                : value === 'Rejected'
                                    ? 'rejected'
                                    : value === 'Closed'
                                        ? 'draft'
                                        : value === 'Complete'
                                            ? 'completed'
                                            : 'default'
                    }
                >
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'created_by_name',
            header: 'Created By'
        },
        {
            key: 'created_at',
            header: 'Created At'
        },
        {
            key: 'updated_at',
            header: 'Updated At',
            sortable: true
        }
    ];

    const actions: Action<TaskRequest>[] = [
        {
            label: 'Details',
            onClick: (task) => {
                router.push(`/requests/tasks/details?id=${task.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit',
            onClick: (task) => {
                router.push(`/tasks/requests/update?id=${task.id}`);
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
                    <h1 className="text-3xl font-bold">Task Requests</h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all task requests
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Input
                    placeholder="Search by code..."
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
                            <CardTitle>Task Requests List </CardTitle>
                            <CardDescription>Total {totalItems} requests found</CardDescription>
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
                        data={taskRequests}
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
                        noDataMessage="No task requests found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
