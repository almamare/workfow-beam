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
import { fetchJobTitles, selectJobTitles } from '@/stores/slices/job-titles';
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

// level â†’ label + badge colour
const LEVEL_META: Record<number, { label: string; color: string; badgeColor: 'default' | 'info' | 'success' | 'warning' | 'error' }> = {
    1: { label: 'C-Level',  color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',    badgeColor: 'error' },
    2: { label: 'Director', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',                badgeColor: 'info' },
    3: { label: 'Manager',  color: 'bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800', badgeColor: 'info' },
    4: { label: 'Senior',   color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',          badgeColor: 'warning' },
    5: { label: 'Staff',    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',          badgeColor: 'success' },
};

export default function EmployeesPage() {
    const employees  = useSelector(selectEmployees);
    const loading    = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);
    const jobTitlesList = useSelector(selectJobTitles);

    const router   = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search,      setSearch]      = useState('');
    const [page,        setPage]        = useState(1);
    const [limit,       setLimit]       = useState(10);
    const [isRefreshing,setIsRefreshing]= useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [level,       setLevel]       = useState<string>('All');
    const [jobTitle,    setJobTitle]    = useState<string>('All');
    const [status,      setStatus]      = useState<string>('All');

    useEffect(() => {
        dispatch(fetchJobTitles({ page: 1, limit: 500 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchEmployees({
            page,
            limit,
            search,
            job_title : jobTitle !== 'All' ? Number(jobTitle) : undefined,
            level     : level !== 'All' ? Number(level) : undefined,
            status    : status !== 'All' ? status : undefined,
        } as any));
    }, [dispatch, page, limit, search, jobTitle, level, status]);

    const jobTitleOptions = useMemo(() => {
        return jobTitlesList.map((jt) => ({
            key: String(jt.id),
            value: String(jt.id),
            label: (jt.title_en ?? jt.title_ar ?? String(jt.id)) as string,
        }));
    }, [jobTitlesList]);

    // Count by level for stats cards
    const levelCounts = useMemo(() => {
        return employees.reduce<Record<number, number>>((acc, emp) => {
            if (emp.level) acc[emp.level] = (acc[emp.level] || 0) + 1;
            return acc;
        }, {});
    }, [employees]);

    const columns: Column<Employee>[] = [
        {
            key: 'employee_code',
            header: 'EMP NO.',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true
        },
        {
            key: 'job_title',
            header: 'Job Title',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>,
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
            key: 'role_key',
            header: 'Role',
            render: (value: any, row: Employee) => {
                const meta  = row.level ? LEVEL_META[row.level] : null;
                const color = meta?.color ?? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                return (
                    <Badge variant="outline" className={`${color} font-mono text-xs font-semibold tracking-wide`}>
                        {value ?? 'â€”'}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'hire_date',
            header: 'Hire Date',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value ?? 'â€”'}</span>,
            sortable: true
        },
        {
            key: 'salary_grade',
            header: 'Salary Grade',
            render: (value: any) => <span className="font-semibold text-green-600 dark:text-green-400">{value}</span>,
            sortable: true
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400 text-sm">{value ?? 'â€”'}</span>,
            sortable: true
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search)             arr.push(`Search: ${search}`);
        if (level !== 'All')    arr.push(`Level: ${LEVEL_META[Number(level)]?.label ?? level}`);
        if (jobTitle !== 'All') {
            const jt = jobTitlesList.find((j) => String(j.id) === jobTitle);
            arr.push(`Job Title: ${jt ? (jt.title_en ?? jt.title_ar ?? jobTitle) : jobTitle}`);
        }
        if (status !== 'All')   arr.push(`Status: ${status}`);
        return arr;
    }, [search, level, jobTitle, status, jobTitlesList]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchEmployees({
                page, limit, search,
                job_title : jobTitle !== 'All' ? Number(jobTitle) : undefined,
                level     : level !== 'All' ? Number(level) : undefined,
                status    : status !== 'All' ? status : undefined,
            } as any));
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
                    job_title : jobTitle !== 'All' ? Number(jobTitle) : undefined,
                    level     : level !== 'All' ? Number(level) : undefined,
                    limit: 10000, page: 1
                }
            });

            const headers = ['Employee Code', 'Job Title', 'First Name', 'Last Name', 'Role Key', 'Level', 'Hire Date', 'Salary Grade', 'Created At'];
            const csvRows = (data?.body?.employees?.items || []).map((emp: any) => [
                emp.employee_code,
                escapeCsv(emp.job_title),
                escapeCsv(emp.name),
                escapeCsv(emp.surname),
                emp.role_key ?? '',
                emp.level ? (LEVEL_META[emp.level]?.label ?? emp.level) : '',
                emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('en-US') : '',
                emp.salary_grade,
                emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-US') : ''
            ].join(','));

            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const actions: Action<Employee>[] = [
        {
            label: 'View Details',
            onClick: (employee) => router.push(`/employees/details?id=${employee.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info'
        },
        {
            label: 'Edit Employee',
            onClick: (employee) => router.push(`/employees/update?id=${employee.id}`),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning'
        }
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Employees</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your workforce with comprehensive employee information</p>
                </div>
                <Button
                    onClick={() => router.push('/employees/create')}
                    className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Create Employee
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <EnhancedCard title="Total" description="All employees" variant="default" size="sm"
                    stats={{ total: totalItems, badge: 'Total', badgeColor: 'default' }}>
                    <></>
                </EnhancedCard>
                {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <EnhancedCard
                        key={lvl}
                        title={LEVEL_META[lvl].label}
                        description={`Level ${lvl} employees`}
                        variant="default"
                        size="sm"
                        stats={{ total: levelCounts[lvl] || 0, badge: LEVEL_META[lvl].label, badgeColor: LEVEL_META[lvl].badgeColor }}
                    >
                        <></>
                    </EnhancedCard>
                ))}
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by EMP NO., name, or job title..."
                searchValue={search}
                onSearchChange={(value) => { setSearch(value); setPage(1); }}
                filters={[
                    {
                        key: 'level',
                        label: 'Level',
                        value: level,
                        options: [
                            { key: 'All', value: 'All', label: 'All Levels' },
                            { key: '1', value: '1', label: 'C-Level' },
                            { key: '2', value: '2', label: 'Director' },
                            { key: '3', value: '3', label: 'Manager' },
                            { key: '4', value: '4', label: 'Senior' },
                            { key: '5', value: '5', label: 'Staff' },
                        ],
                        onValueChange: (value) => { setLevel(value); setPage(1); }
                    },
                    {
                        key: 'job_title',
                        label: 'Job Title',
                        value: jobTitle,
                        options: [
                            { key: 'All', value: 'All', label: 'All Job Titles' },
                            ...jobTitleOptions,
                        ],
                        onValueChange: (value) => { setJobTitle(value); setPage(1); }
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        value: status,
                        options: [
                            { key: 'All', value: 'All', label: 'All Statuses' },
                            { key: 'Active',    value: 'Active',    label: 'Active' },
                            { key: 'Inactive',  value: 'Inactive',  label: 'Inactive' },
                            { key: 'Suspended', value: 'Suspended', label: 'Suspended' },
                            { key: 'Resigned',  value: 'Resigned',  label: 'Resigned' },
                        ],
                        onValueChange: (value) => { setStatus(value); setPage(1); }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch(''); setLevel('All'); setJobTitle('All'); setStatus('All'); setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
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
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200">
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
