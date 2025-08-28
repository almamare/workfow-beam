'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchUsers,
    selectUsers,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/users';
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
import type { User } from '@/stores/types/users';
import { Edit, Eye } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';

export default function UsersPage() {
    const users = useSelector(selectUsers);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    // Local UI states
    const [search, setSearch] = useState(''); // Search input
    const [status, setStatus] = useState<'Active' | 'Inactive' | 'Blocked' | 'Pending'>('Active'); // Status filter
    const [type, setType] = useState<'Accounts' | 'Employment' | 'Contracts' | 'General'>('Accounts'); // Type filter
    const [page, setPage] = useState(1); // Current page
    const [limit, setLimit] = useState(10); // Items per page

    // Fetch users from Redux store whenever filters/page/limit change
    useEffect(() => {
        dispatch(fetchUsers({ page, limit, search, type }));
    }, [dispatch, page, limit, search, status, type]);

    // Table columns definition
    const columns: Column<User>[] = [
        { key: 'number', header: 'Number', sortable: true },
        { key: 'name', header: 'Name', sortable: true },
        { key: 'surname', header: 'Surname', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'phone', header: 'Phone', sortable: true },
        { key: 'role', header: 'Role', sortable: true },
        { key: 'type', header: 'Type', sortable: true },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <Badge
                    variant={
                        value === 'Active' ? 'completed' :
                            value === 'Disabled' ? 'rejected' :
                                value === 'Locked' ? 'draft' :
                                        'default'
                    }
                >
                    {value}
                </Badge>
            ),
            sortable: true
        },
        { key: 'created_at', header: 'Created At', sortable: true }
    ];

    // Actions for each row (view details, edit)
    const actions: Action<User>[] = [
        { label: 'Edit', onClick: (user) => router.push(`/users/update?id=${user.id}`), icon: <Edit className="h-4 w-4" /> }
    ];

    return (
        <div className="space-y-4">
            {/* Page header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Users</h1>
                    <p className="text-muted-foreground mt-1">Browse and manage all system users</p>
                </div>
                <Button onClick={() => router.push('/users/create')} className="bg-primary text-white">
                    + Create User
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                {/* Search input */}
                <Input
                    placeholder="Search by number..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full sm:max-w-sm"
                />

                {/* Type filter */}
                <Select value={type} onValueChange={(value) => { setType(value as typeof type); setPage(1); }}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="User Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Accounts">Accounts</SelectItem>
                        <SelectItem value="Employment">Employment</SelectItem>
                        <SelectItem value="Contracts">Contracts</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Users table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>User List</CardTitle>
                            <CardDescription>Total {totalItems} users found</CardDescription>
                        </div>

                        {/* Pagination limit selector */}
                        <Select value={limit.toString()} onValueChange={(value) => { setLimit(parseInt(value, 10)); setPage(1); }}>
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
                        data={users}
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
                        noDataMessage="No users found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
