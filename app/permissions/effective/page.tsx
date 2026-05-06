'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchPermissions,
    fetchEffectivePermissions,
    selectPermissions,
    selectPermissionsLoading,
    selectEffectivePermissions,
} from '@/stores/slices/permissions';
import type { EffectivePermissionFlags, Permission } from '@/stores/types/permissions';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/ui/filter-bar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type EffectivePermissionRow = {
    permission_key: string;
    module: string;
    can_view: number;
    can_create: number;
    can_edit: number;
    can_delete: number;
    can_approve: number;
};

const FLAG_LABELS: Array<keyof EffectivePermissionFlags> = [
    'can_view',
    'can_create',
    'can_edit',
    'can_delete',
    'can_approve',
];

export default function EffectivePermissionsPage() {
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    const loading = useSelector(selectPermissionsLoading);
    const permissions = useSelector(selectPermissions);
    const effective = useSelector(selectEffectivePermissions);

    const [search, setSearch] = useState('');
    const [moduleFilter, setModuleFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchPermissions({}));
        dispatch(fetchEffectivePermissions());
    }, [dispatch]);

    const permissionIndex = useMemo(() => {
        const list = Array.isArray(permissions) ? permissions : [];
        const map = new Map<string, Permission>();
        list.forEach((p) => {
            if (p.permission_key) map.set(p.permission_key, p);
        });
        return map;
    }, [permissions]);

    const rows = useMemo<EffectivePermissionRow[]>(() => {
        if (!effective) return [];
        return Object.entries(effective).map(([permission_key, flags]) => {
            const permission = permissionIndex.get(permission_key);
            return {
                permission_key,
                module: permission?.module || 'Uncategorized',
                can_view: flags.can_view ?? 0,
                can_create: flags.can_create ?? 0,
                can_edit: flags.can_edit ?? 0,
                can_delete: flags.can_delete ?? 0,
                can_approve: flags.can_approve ?? 0,
            };
        });
    }, [effective, permissionIndex]);

    const moduleOptions = useMemo(() => {
        return Array.from(new Set(rows.map((r) => r.module).filter(Boolean))).sort();
    }, [rows]);

    const filtered = useMemo(() => {
        const moduleScoped = moduleFilter === 'All' ? rows : rows.filter((r) => r.module === moduleFilter);
        if (!search.trim()) return moduleScoped;
        const q = search.toLowerCase();
        return moduleScoped.filter(
            (r) =>
                r.permission_key.toLowerCase().includes(q) ||
                r.module.toLowerCase().includes(q) ||
                FLAG_LABELS.some((flag) => r[flag] === 1 && flag.replace('can_', '').includes(q))
        );
    }, [rows, moduleFilter, search]);

    useEffect(() => {
        setPage(1);
    }, [search, moduleFilter]);

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const paginated = useMemo(() => {
        const start = (page - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, page, perPage]);

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (moduleFilter !== 'All') arr.push(`Module: ${moduleFilter}`);
        return arr;
    }, [search, moduleFilter]);

    const enabledCount = useMemo(
        () => rows.reduce((count, r) => count + FLAG_LABELS.filter((flag) => r[flag] === 1).length, 0),
        [rows]
    );

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                dispatch(fetchPermissions({})).unwrap(),
                dispatch(fetchEffectivePermissions()).unwrap(),
            ]);
            toast.success('Effective permissions refreshed');
        } catch {
            toast.error('Failed to refresh effective permissions');
        } finally {
            setIsRefreshing(false);
        }
    };

    const columns: Column<EffectivePermissionRow>[] = [
        {
            key: 'permission_key',
            header: 'Permission key',
            sortable: true,
            render: (value: unknown) => (
                <span className="font-mono text-xs md:text-sm text-slate-700 dark:text-slate-300">
                    {String(value ?? '-')}
                </span>
            ),
        },
        {
            key: 'module',
            header: 'Module',
            sortable: true,
            render: (value: unknown) => <Badge variant="outline">{String(value ?? 'Uncategorized')}</Badge>,
        },
        ...FLAG_LABELS.map((flag) => ({
            key: flag,
            header: flag.replace('can_', '').replace(/^./, (c) => c.toUpperCase()),
            align: 'center' as const,
            render: (value: unknown) =>
                value === 1 ? (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                        Yes
                    </Badge>
                ) : (
                    <span className="text-slate-400">—</span>
                ),
        })),
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        My effective permissions
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base">
                        Complete, read-only matrix of effective access for your current account.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/permissions')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to permissions
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Permission keys" description="Total effective keys" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{rows.length}</div>
                </EnhancedCard>
                <EnhancedCard title="Enabled flags" description="All active access flags" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{enabledCount}</div>
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

            <FilterBar
                searchPlaceholder="Search by key, module, or access flag..."
                searchValue={search}
                onSearchChange={setSearch}
                filters={[
                    {
                        key: 'module',
                        label: 'Module',
                        value: moduleFilter,
                        options: [
                            { key: 'All', value: 'All', label: 'All modules' },
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
                        onClick={refreshData}
                        disabled={isRefreshing || loading}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                }
            />

            <EnhancedCard
                title="Effective permissions matrix"
                description={`${totalItems} row(s)`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(perPage)} onValueChange={(v) => setPerPage(Number(v))}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Rows per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[10, 20, 30, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={paginated}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: perPage,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No effective permissions found"
                    showActions={false}
                />
            </EnhancedCard>
        </div>
    );
}
