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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/stores/types/employees';
import { Edit, Eye, Plus, Download, Filter, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';

export default function EmployeesPage() {
    const employees = useSelector(selectEmployees);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        dispatch(fetchEmployees({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    const columns = [
        { 
            key: 'employee_code' as keyof Employee, 
            header: 'Employee Code', 
            render: (value: any) => <span className="text-slate-500 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '120px'
        },
        { 
            key: 'job_title' as keyof Employee, 
            header: 'Job Title', 
            render: (value: any) => (
                <span className="font-semibold text-slate-800">{value}</span>
            ),
            sortable: true 
        },
        { 
            key: 'name' as keyof Employee, 
            header: 'First Name', 
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true 
        },
        { 
            key: 'surname' as keyof Employee, 
            header: 'Last Name', 
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true 
        },
        { 
            key: 'role' as keyof Employee, 
            header: 'Role', 
            render: (value: any) => {
                const roleColors = {
                    'Admin': 'bg-purple-100 text-purple-700 border-purple-200',
                    'Manager': 'bg-blue-100 text-blue-700 border-blue-200',
                    'Employee': 'bg-green-100 text-green-700 border-green-200',
                    'Contractor': 'bg-orange-100 text-orange-700 border-orange-200'
                };
                
                return (
                    <Badge 
                        variant="outline" 
                        className={`${roleColors[value as keyof typeof roleColors] || roleColors.Employee} font-medium`}
                    >
                        {value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'hire_date' as keyof Employee, 
            header: 'Hire Date', 
            render: (value: any) => (
                <span className="text-slate-600">{new Date(value).toLocaleDateString()}</span>
            ),
            sortable: true 
        },
        { 
            key: 'salary_grade' as keyof Employee, 
            header: 'Salary Grade', 
            render: (value: any) => (
                <span className="font-semibold text-green-600">{value}</span>
            ),
            sortable: true 
        },
        {
            key: 'notes' as keyof Employee,
            header: 'Notes',
            render: (value: any) => (
                <span className="text-slate-500 text-sm">
                    {value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : '-'}
                </span>
            ),
        }
    ];

    const actions = [
        {
            label: 'View Details',
            onClick: (employee: Employee) => router.push(`/employees/details?id=${employee.id}`),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Employee',
            onClick: (employee: Employee) => router.push(`/employees/update?id=${employee.id}`),
            icon: <Edit className="h-4 w-4" />
        }
    ];

    const stats = [
        {
            label: 'Total Employees',
            value: totalItems,
            change: '+5%',
            trend: 'up' as const
        },
        {
            label: 'Managers',
            value: employees.filter(e => e.role === 'Manager').length,
            change: '+2%',
            trend: 'up' as const
        },
        {
            label: 'Active Staff',
            value: Math.floor(totalItems * 0.95),
            change: '+1%',
            trend: 'up' as const
        },
        {
            label: 'Avg. Experience',
            value: '3.2 years',
            change: '+0.3',
            trend: 'up' as const
        }
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Employees"
                description="Manage your workforce with comprehensive employee information and role-based access control"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Add Employee',
                        onClick: () => router.push('/employees/create'),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Export Data',
                            onClick: () => toast.info('Export feature coming soon'),
                            icon: <Download className="h-4 w-4" />
                        },
                        {
                            label: 'Department View',
                            onClick: () => router.push('/departments'),
                            icon: <Users className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by employee code, name, or job title..."
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

            {/* Employees Table */}
            <EnhancedCard
                title="Employee Directory"
                description={`${totalItems} employees in the system`}
                variant="gradient"
                size="lg"
                stats={{
                    total: totalItems,
                    badge: 'Active Staff',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
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
                    noDataMessage="No employees found matching your search criteria"
                    searchPlaceholder="Search employees..."
                />
            </EnhancedCard>
        </div>
    );
}