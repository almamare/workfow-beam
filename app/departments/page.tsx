'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchDepartments,
    deleteDepartment,
    selectDepartments,
    selectDepartmentsLoading,
    selectDepartmentsPages,
    selectDepartmentsTotal,
} from '@/stores/slices/departments';
import type { Department } from '@/stores/types/departments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Plus, RefreshCw, Trash2, Building } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';

const LEVEL_LABELS: Record<number, string> = { 1: 'Top', 2: 'Mid', 3: 'Sub' };

export default function DepartmentsPage() {
    const departments = useSelector(selectDepartments);
    const loading = useSelector(selectDepartmentsLoading);
    const totalPages = useSelector(selectDepartmentsPages);
    const totalItems = useSelector(selectDepartmentsTotal);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [parentId, setParentId] = useState<string>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(
            fetchDepartments({
                page,
                limit,
                search: search || undefined,
                status: status !== 'All' ? status : undefined,
                parent_id: parentId !== 'All' ? parentId : undefined,
            })
        );
    }, [dispatch, page, limit, search, status, parentId]);

    const departmentsList = Array.isArray(departments) ? departments : [];

    const parentOptions = useMemo(() => {
        const list = departmentsList.map((d) => ({ id: d.department_id, name: d.name_en ?? d.name_ar ?? d.department_id }));
        return Array.from(new Map(list.map((x) => [x.id, x])).values());
    }, [departmentsList]);

    const columns: Column<Department>[] = [
        {
            key: 'department_id',
            header: 'Code',
            sortable: true,
            render: (value: unknown) => (
                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{String(value ?? '')}</span>
            ),
        },
        {
            key: 'name_en',
            header: 'Name (EN)',
            sortable: true,
            render: (value: unknown, row: Department) => (
                <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                        {String(value ?? row.name_ar ?? '-')}
                    </span>
                </div>
            ),
        },
        {
            key: 'name_ar',
            header: 'Name (AR)',
            sortable: true,
            render: (value: unknown) => (
                <span className="text-slate-700 dark:text-slate-300">{String(value ?? '-')}</span>
            ),
        },
        {
            key: 'dept_code',
            header: 'Dept Code',
            sortable: true,
            render: (value: unknown) => (
                <span className="text-slate-600 dark:text-slate-400">{String(value ?? '-')}</span>
            ),
        },
        {
            key: 'level',
            header: 'Level',
            sortable: true,
            render: (value: unknown) => {
                const num = typeof value === 'number' ? value : Number(value);
                const label = LEVEL_LABELS[num] ?? String(value ?? '-');
                return (
                    <Badge variant="outline" className="font-mono">
                        {label}
                    </Badge>
                );
            },
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value: unknown) => {
                const v = String(value ?? '').toLowerCase();
                const isActive = v === 'active';
                return (
                    <Badge
                        variant="outline"
                        className={
                            isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                : 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }
                    >
                        {value ? String(value) : '-'}
                    </Badge>
                );
            },
        },
        {
            key: 'created_at',
            header: 'Created',
            sortable: true,
            render: (value: unknown) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {String(value ?? '-') as string}
                </span>
            ),
        },
    ];

    const handleDelete = async (dept: Department) => {
        const id = dept.department_id ?? String(dept.id);
        setDeletingId(id);
        try {
            const result = await dispatch(deleteDepartment(id));
            if (deleteDepartment.fulfilled.match(result)) {
                toast.success('Department deleted successfully');
                dispatch(fetchDepartments({ page, limit, search: search || undefined, status: status !== 'All' ? status : undefined, parent_id: parentId !== 'All' ? parentId : undefined }));
            } else {
                toast.error(result.payload as string || 'Delete failed');
            }
        } catch {
            toast.error('Failed to delete department');
        } finally {
            setDeletingId(null);
        }
    };

    const actions: Action<Department>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => router.push(`/departments/details?id=${row.department_id ?? row.id}`),
            variant: 'info',
        },
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => router.push(`/departments/update?id=${row.department_id ?? row.id}`),
            variant: 'warning',
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row) => handleDelete(row),
            variant: 'destructive',
            hidden: (row) => deletingId === (row.department_id ?? String(row.id)),
        },
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        if (parentId !== 'All') arr.push(`Parent: ${parentId}`);
        return arr;
    }, [search, status, parentId]);

    const refreshTable = () => {
        setIsRefreshing(true);
        dispatch(
            fetchDepartments({
                page,
                limit,
                search: search || undefined,
                status: status !== 'All' ? status : undefined,
                parent_id: parentId !== 'All' ? parentId : undefined,
            })
        ).finally(() => setIsRefreshing(false));
        toast.success('List refreshed');
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Departments
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage organizational departments
                    </p>
                </div>
            </div>

            <FilterBar
                searchPlaceholder="Search departments..."
                searchValue={search}
                onSearchChange={(v) => {
                    setSearch(v);
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
                            { key: 'Inactive', value: 'Inactive', label: 'Inactive' },
                        ],
                        onValueChange: (v) => {
                            setStatus(v as typeof status);
                            setPage(1);
                        },
                    },
                    {
                        key: 'parent',
                        label: 'Parent',
                        value: parentId,
                        options: [
                            { key: 'All', value: 'All', label: 'All Parents' },
                            ...parentOptions.map((p) => ({ key: p.id, value: p.id, label: p.name })),
                        ],
                        onValueChange: (v) => {
                            setParentId(v);
                            setPage(1);
                        },
                    },
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setStatus('All');
                    setParentId('All');
                    setPage(1);
                }}
                actions={
                    <Button
                        variant="outline"
                        onClick={refreshTable}
                        disabled={isRefreshing || loading}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                }
            />

            <EnhancedCard
                title="Department list"
                description={`${totalItems} department(s)`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            {[5, 10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={departmentsList}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages || 1,
                        pageSize: limit,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No departments found"
                    searchPlaceholder="Search..."
                />
            </EnhancedCard>
        </div>
    );
}
