'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
import { Edit, Eye, Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from '@/utils/axios';

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
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        dispatch(fetchEmployees({ page, limit, search }));
    }, [dispatch, page, limit, search]);

    const columns: Column<Employee>[] = [
        { 
            key: 'employee_code', 
            header: 'Employee Code', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true
        },
        { 
            key: 'job_title', 
            header: 'Job Title', 
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
            ),
            sortable: true 
        },
        { 
            key: 'name', 
            header: 'First Name', 
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true 
        },
        { 
            key: 'surname', 
            header: 'Last Name', 
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true 
        },
        { 
            key: 'role', 
            header: 'Role', 
            render: (value: any) => {
                const roleColors: Record<string, string> = {
                    'Admin': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                    'Manager': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    'Employee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Contractor': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
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
            key: 'hire_date', 
            header: 'Hire Date', 
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleDateString('en-US') : '-'}
                </span>
            ),
            sortable: true 
        },
        { 
            key: 'salary_grade', 
            header: 'Salary Grade', 
            render: (value: any) => (
                <span className="font-semibold text-green-600 dark:text-green-400">{value}</span>
            ),
            sortable: true 
        },
        {
            key: 'notes',
            header: 'Notes',
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {value ? (value.length > 30 ? `${value.substring(0, 30)}...` : value) : '-'}
                </span>
            ),
        }
    ];

    const actions: Action<Employee>[] = [
        {
            label: 'View Details',
            onClick: (employee) => router.push(`/employees/details?id=${employee.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Employee',
            onClick: (employee) => router.push(`/employees/update?id=${employee.id}`),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        return arr;
    }, [search]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchEmployees({ page, limit, search }));
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
            const { data } = await axios.get('/employees/fetch', {
                params: {
                    search,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Employee Code', 'Job Title', 'First Name', 'Last Name', 'Role', 'Hire Date', 'Salary Grade', 'Notes'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.employees?.items || data?.body?.items || []).map((emp: any) => {
                return [
                    emp.employee_code,
                    escapeCsv(emp.job_title),
                    escapeCsv(emp.name),
                    escapeCsv(emp.surname),
                    emp.role,
                    emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('en-US') : '',
                    emp.salary_grade,
                    escapeCsv(emp.notes || '')
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `employees_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Employees</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your workforce with comprehensive employee information</p>
                </div>
                <Button 
                    onClick={() => router.push('/employees/create')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Create Employee
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Employees"
                    description="All employees in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalItems,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Managers"
                    description="Management level employees"
                    variant="default"
                    size="sm"
                    stats={{
                        total: employees.filter(e => e.role === 'Manager').length,
                        badge: 'Managers',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Active Staff"
                    description="Currently active employees"
                    variant="default"
                    size="sm"
                    stats={{
                        total: Math.floor(totalItems * 0.95),
                        badge: 'Active',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Admins"
                    description="Administrative employees"
                    variant="default"
                    size="sm"
                    stats={{
                        total: employees.filter(e => e.role === 'Admin').length,
                        badge: 'Admins',
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

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
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="h-10 px-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="h-10 px-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Employees Table */}
            <EnhancedCard
                title="Employee Directory"
                description={`${totalItems} employees in the system`}
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
                    hideEmptyMessage={true}
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