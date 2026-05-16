'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchRoles,
    deleteRole,
    selectRoles,
    selectRolesLoading,
    selectRolesPages,
    selectRolesTotal,
} from '@/stores/slices/roles';
import { fetchDepartments, selectDepartments } from '@/stores/slices/departments';
import type { Role } from '@/stores/types/roles';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Plus, RefreshCw, Trash2, Shield, KeyRound } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function RolesPage() {
    const roles = useSelector(selectRoles);
    const loading = useSelector(selectRolesLoading);
    const totalPages = useSelector(selectRolesPages);
    const totalItems = useSelector(selectRolesTotal);
    const departments = useSelector(selectDepartments);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [departmentId, setDepartmentId] = useState<string>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

    useEffect(() => {
        dispatch(
            fetchRoles({
                page,
                limit,
                search: search || undefined,
                department_id: departmentId !== 'All' ? departmentId : undefined,
            })
        );
    }, [dispatch, page, limit, search, departmentId]);

    useEffect(() => {
        dispatch(fetchDepartments({}));
    }, [dispatch]);

    const rolesList = Array.isArray(roles) ? roles : [];
    const departmentsList = Array.isArray(departments) ? departments : [];

    const departmentOptions = useMemo(() => {
        const list = departmentsList.map((d) => ({
            id: d.department_id ?? String(d.id),
            name: d.name_en ?? d.name_ar ?? d.department_id ?? String(d.id),
        }));
        return Array.from(new Map(list.map((x) => [x.id, x])).values());
    }, [departmentsList]);

    const columns: Column<Role>[] = [
        {
            key: 'role_key',
            header: 'Role Key',
            sortable: true,
            render: (value: unknown) => (
                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                    {String(value ?? '')}
                </span>
            ),
        },
        {
            key: 'role_name',
            header: 'Role Name',
            sortable: true,
            render: (value: unknown, row: Role) => (
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                        {String(value ?? row.role_key ?? '-')}
                    </span>
                </div>
            ),
        },
        {
            key: 'department_id',
            header: 'Department',
            sortable: true,
            render: (value: unknown) => (
                <span className="text-slate-600 dark:text-slate-400">{String(value ?? '-')}</span>
            ),
        },
        {
            key: 'description',
            header: 'Description',
            sortable: true,
            render: (value: unknown) => (
                <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {String(value ?? '-')}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'Created',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {value ? String(value) as string : '-'}
                </span>
            ),
        },
    ];

    const handleDeleteClick = (row: Role) => {
        setDeleteTarget(row);
        setDeletingId(row.id);
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget == null) return;
        const id = deleteTarget.id;
        setDeletingId(id);
        try {
            const result = await dispatch(deleteRole(id));
            if (deleteRole.rejected.match(result)) {
                toast.error(result.payload || 'Failed to delete role');
                return;
            }
            toast.success('Role deleted successfully');
            setDeleteTarget(null);
            setDeletingId(null);
            dispatch(
                fetchRoles({
                    page,
                    limit,
                    search: search || undefined,
                    department_id: departmentId !== 'All' ? departmentId : undefined,
                })
            );
        } catch {
            toast.error('Failed to delete role');
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const actions: Action<Role>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => router.push(`/roles/details?id=${row.id}`),
            variant: 'info',
        },
        {
            label: 'Edit',
            icon: <Edit className="h-4 w-4" />,
            onClick: (row) => router.push(`/roles/update?id=${row.id}`),
            variant: 'warning',
        },
        {
            label: 'Manage permissions',
            icon: <KeyRound className="h-4 w-4" />,
            onClick: (row) => router.push(`/roles/permissions?id=${row.id}`),
            variant: 'success',
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row) => handleDeleteClick(row),
            variant: 'destructive',
            hidden: (row) => deletingId === row.id,
        },
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (departmentId !== 'All') arr.push(`Department: ${departmentId}`);
        return arr;
    }, [search, departmentId]);

    const refreshTable = () => {
        setIsRefreshing(true);
        dispatch(
            fetchRoles({
                page,
                limit,
                search: search || undefined,
                department_id: departmentId !== 'All' ? departmentId : undefined,
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
                        Roles
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage roles and assign permissions
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/roles/create')}
                    className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                </Button>
            </div>

            <FilterBar
                searchPlaceholder="Search roles..."
                searchValue={search}
                onSearchChange={(v) => {
                    setSearch(v);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'department',
                        label: 'Department',
                        value: departmentId,
                        options: [
                            { key: 'All', value: 'All', label: 'All Departments' },
                            ...departmentOptions.map((p) => ({ key: p.id, value: p.id, label: p.name })),
                        ],
                        onValueChange: (v) => {
                            setDepartmentId(v);
                            setPage(1);
                        },
                    },
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setDepartmentId('All');
                    setPage(1);
                }}
                actions={
                    <Button
                        variant="outline"
                        onClick={refreshTable}
                        disabled={isRefreshing || loading}
                        className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                }
            />

            <EnhancedCard
                title="Role list"
                description={`${totalItems} role(s)`}
                variant="default"
                size="sm"
                headerActions={
                    <Select
                        value={String(limit)}
                        onValueChange={(v) => {
                            setLimit(Number(v));
                            setPage(1);
                        }}
                    >
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
                    data={rolesList}
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
                    noDataMessage="No roles found"
                    searchPlaceholder="Search..."
                />
            </EnhancedCard>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the role &quot;{deleteTarget?.role_name ?? deleteTarget?.role_key}&quot;?
                            This action cannot be undone. If this role is assigned to any user, the server will reject the delete.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDeleteConfirm();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deletingId !== null}
                        >
                            {deletingId !== null ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
