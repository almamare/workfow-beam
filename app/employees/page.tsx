'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchEmployees,
    selectEmployees,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/employees';
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
import type { Employee } from '@/stores/types/employees';
import { Edit, Eye } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';

export default function EmployeesPage() {
    const employees = useSelector(selectEmployees);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    // Local UI states
    const [search, setSearch] = useState(''); // Search input
    const [page, setPage] = useState(1); // Current page
    const [limit, setLimit] = useState(10); // Items per page

    // Fetch employees from Redux store whenever filters/page/limit change
    useEffect(() => {
        dispatch(fetchEmployees({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    // Table columns definition
    const columns: Column<Employee>[] = [
        { key: 'employee_code', header: 'Code', sortable: true },
        { key: 'job_title', header: 'Job Title', sortable: true },
        { key: 'role', header: 'Role', sortable: true },
        { key: 'hire_date', header: 'Hire Date', sortable: true },
        { key: 'salary_grade', header: 'Salary Grade', sortable: true },
        {
            key: 'notes',
            header: 'Notes',
            render: (value) => value || '-',
        },
        {
            key: 'created_at',
            header: 'Created At',
            sortable: true
        }
    ];

    // Actions for each row (view details, edit)
    const actions: Action<Employee>[] = [
        {
            label: 'Details',
            onClick: (employee) => router.push(`/employees/details?id=${employee.id}`),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit',
            onClick: (employee) => router.push(`/employees/update?id=${employee.id}`),
            icon: <Edit className="h-4 w-4" />
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Employees</h1>
                    <p className="text-muted-foreground mt-1">Browse and manage all company employees</p>
                </div>
                <Button onClick={() => router.push('/employees/create')} className="bg-primary text-white">
                    + Create Employee
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                {/* Search input */}
                <Input
                    placeholder="Search by employee code or job title..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full sm:max-w-sm"
                />
            </div>

            {/* Employees table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>Employee List</CardTitle>
                            <CardDescription>Total {totalItems} employees found</CardDescription>
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
                        data={employees}
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
                        noDataMessage="No employees found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
