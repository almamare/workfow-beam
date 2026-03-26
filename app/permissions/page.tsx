'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchPermissions,
    fetchEffectivePermissions,
    selectPermissions,
    selectPermissionsLoading,
    selectEffectivePermissions,
} from '@/stores/slices/permissions';
import type { Permission } from '@/stores/types/permissions';
import type { EffectivePermissionFlags } from '@/stores/types/permissions';
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
    const effective = useSelector(selectEffectivePermissions);
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [moduleFilter, setModuleFilter] = useState<string>('All');
    const [search, setSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        dispatch(
            fetchPermissions({
                module: moduleFilter !== 'All' ? moduleFilter : undefined,
            })
        );
    }, [dispatch, moduleFilter]);

    useEffect(() => {
        dispatch(fetchEffectivePermissions());
    }, [dispatch]);

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

    const effectiveEntries = effective
        ? Object.entries(effective)
        : [];

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

            {effectiveEntries.length > 0 && (
                <EnhancedCard
                    title="My effective permissions"
                    description="Current user permissions by key (read-only)"
                    variant="default"
                    size="sm"
                >
                    <div className="flex flex-wrap gap-2">
                        {effectiveEntries.slice(0, 24).map(([key, flags]) => (
                            <Badge
                                key={key}
                                variant="outline"
                                className="font-mono text-xs flex items-center gap-1"
                            >
                                <KeyRound className="h-3 w-3" />
                                {key}
                                <PermissionFlags flags={flags} />
                            </Badge>
                        ))}
                        {effectiveEntries.length > 24 && (
                            <Badge variant="outline">+{effectiveEntries.length - 24} more</Badge>
                        )}
                    </div>
                </EnhancedCard>
            )}

            <EnhancedCard
                title="Permission list"
                description={`${filteredBySearch.length} permission(s)`}
                variant="default"
                size="sm"
            >
                <EnhancedDataTable
                    data={filteredBySearch}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    noDataMessage="No permissions found"
                    searchPlaceholder="Search..."
                />
            </EnhancedCard>
        </div>
    );
}

function PermissionFlags({ flags }: { flags: EffectivePermissionFlags }) {
    const active = [
        flags.can_view && 'view',
        flags.can_create && 'create',
        flags.can_edit && 'edit',
        flags.can_delete && 'delete',
        flags.can_approve && 'approve',
    ].filter(Boolean) as string[];
    if (active.length === 0) return null;
    return (
        <span className="text-slate-500 dark:text-slate-400 ml-1">
            ({active.join(', ')})
        </span>
    );
}
