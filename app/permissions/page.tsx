'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchPermissions,
    selectPermissions,
    selectPermissionsLoading,
} from '@/stores/slices/permissions';
import type { Permission } from '@/stores/types/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Eye, RefreshCw, KeyRound } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';

export default function PermissionsPage() {
    const permissions = useSelector(selectPermissions);
    const loading = useSelector(selectPermissionsLoading);
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [moduleFilter, setModuleFilter] = useState<string>('All');
    const [search, setSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        dispatch(
            fetchPermissions({
                module: moduleFilter !== 'All' ? moduleFilter : undefined,
            })
        );
    }, [dispatch, moduleFilter]);

    const permissionsList = Array.isArray(permissions) ? permissions : [];

    const moduleOptions = useMemo(() => {
        const modules = Array.from(
            new Set(permissionsList.map((p) => p.module).filter(Boolean) as string[])
        ).sort();
        return modules;
    }, [permissionsList]);

    const columns: Column<Permission>[] = [
        {
            key: 'permission_key',
            header: 'Permission Key',
            sortable: true,
            render: (value: unknown) => (
                <span className="font-mono text-sm text-slate-600 dark:text-slate-400">
                    {String(value ?? '')}
                </span>
            ),
        },
        {
            key: 'name_en',
            header: 'Name (EN)',
            sortable: true,
            render: (value: unknown, row: Permission) => (
                <span className="font-medium text-slate-800 dark:text-slate-200">
                    {String(value ?? row.name_ar ?? '-')}
                </span>
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
            key: 'module',
            header: 'Module',
            sortable: true,
            render: (value: unknown) => (
                <Badge variant="outline" className="font-medium">
                    {String(value ?? '-')}
                </Badge>
            ),
        },
    ];

    const actions: Action<Permission>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => router.push(`/permissions/details?id=${row.id}`),
            variant: 'info',
        },
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (moduleFilter !== 'All') arr.push(`Module: ${moduleFilter}`);
        return arr;
    }, [search, moduleFilter]);

    const refreshTable = () => {
        setIsRefreshing(true);
        dispatch(
            fetchPermissions({
                module: moduleFilter !== 'All' ? moduleFilter : undefined,
            })
        )
            .unwrap()
            .catch((msg) => toast.error(msg))
            .finally(() => setIsRefreshing(false));
        toast.success('List refreshed');
    };

    const filteredBySearch = useMemo(() => {
        if (!search.trim()) return permissionsList;
        const q = search.toLowerCase();
        return permissionsList.filter(
            (p) =>
                (p.permission_key ?? '').toLowerCase().includes(q) ||
                (p.name_en ?? '').toLowerCase().includes(q) ||
                (p.name_ar ?? '').toLowerCase().includes(q) ||
                (p.module ?? '').toLowerCase().includes(q)
        );
    }, [permissionsList, search]);

    useEffect(() => {
        setPage(1);
    }, [moduleFilter, search]);

    const totalItems = filteredBySearch.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const paginatedPermissions = useMemo(() => {
        const start = (page - 1) * perPage;
        return filteredBySearch.slice(start, start + perPage);
    }, [filteredBySearch, page, perPage]);

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Permissions
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Reference list of permission keys and modules (read-only)
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/permissions/effective')}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md"
                >
                    <KeyRound className="h-4 w-4 mr-2" />
                    My effective permissions
                </Button>
            </div>

            <FilterBar
                searchPlaceholder="Search by key, name, or module..."
                searchValue={search}
                onSearchChange={setSearch}
                filters={[
                    {
                        key: 'module',
                        label: 'Module',
                        value: moduleFilter,
                        options: [
                            { key: 'All', value: 'All', label: 'All Modules' },
                            ...moduleOptions.map((m) => ({ key: m, value: m, label: m })),
                        ],
                        onValueChange: setModuleFilter,
                    },
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setModuleFilter('All');
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Total permissions" description="Catalog rows" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{permissionsList.length}</div>
                </EnhancedCard>
                <EnhancedCard title="Filtered results" description="After search/module filters" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalItems}</div>
                </EnhancedCard>
                <EnhancedCard title="Modules" description="Distinct permission groups" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{moduleOptions.length}</div>
                </EnhancedCard>
                <EnhancedCard title="Current page" description="Pagination position" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {page} / {totalPages}
                    </div>
                </EnhancedCard>
            </div>

            <EnhancedCard
                title="Permission list"
                description={`${totalItems} permission(s)`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Rows per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[10, 15, 20, 30, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={paginatedPermissions}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: perPage,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No permissions found"
                    searchPlaceholder="Search..."
                />
            </EnhancedCard>
        </div>
    );
}
