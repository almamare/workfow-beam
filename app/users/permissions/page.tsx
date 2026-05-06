'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchUser,
    fetchUserPermissions,
    setUserPermissions,
    selectSelectedUser,
    selectUserPermissions,
} from '@/stores/slices/users';
import {
    fetchPermissions,
    selectPermissions,
    selectPermissionsLoading,
} from '@/stores/slices/permissions';
import type { SetUserPermissionItem } from '@/stores/types/users';
import type { Permission } from '@/stores/types/permissions';
import { Button } from '@/components/ui/button';
import { Loader2, Save, KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';

type PermissionRow = {
    permission_id: number;
    permission_key: string;
    name_en: string;
    module: string;
    can_view: 0 | 1;
    can_create: 0 | 1;
    can_edit: 0 | 1;
    can_delete: 0 | 1;
    can_approve: 0 | 1;
};

export default function UserPermissionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();

    const user = useSelector(selectSelectedUser);
    const userPermissions = useSelector(selectUserPermissions);
    const allPermissions = useSelector(selectPermissions);
    const permissionsLoading = useSelector(selectPermissionsLoading);
    const permissionsList = Array.isArray(allPermissions) ? allPermissions : [];

    const [rows, setRows] = useState<PermissionRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [moduleFilter, setModuleFilter] = useState<string>('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUser({ id: userId }));
            dispatch(fetchUserPermissions(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        dispatch(fetchPermissions({}));
    }, [dispatch]);

    const userPermsMap = useMemo(() => {
        const map = new Map<number, { can_view: 0 | 1; can_create: 0 | 1; can_edit: 0 | 1; can_delete: 0 | 1; can_approve: 0 | 1 }>();
        if (Array.isArray(userPermissions)) {
            userPermissions.forEach((p) => {
                map.set(p.permission_id, {
                    can_view: p.can_view ?? 0,
                    can_create: p.can_create ?? 0,
                    can_edit: p.can_edit ?? 0,
                    can_delete: p.can_delete ?? 0,
                    can_approve: p.can_approve ?? 0,
                });
            });
        }
        return map;
    }, [userPermissions]);

    useEffect(() => {
        const list: PermissionRow[] = permissionsList.map((p: Permission) => {
            const current = userPermsMap.get(p.id) ?? {
                can_view: 0 as 0 | 1,
                can_create: 0 as 0 | 1,
                can_edit: 0 as 0 | 1,
                can_delete: 0 as 0 | 1,
                can_approve: 0 as 0 | 1,
            };
            return {
                permission_id: p.id,
                permission_key: p.permission_key ?? '',
                name_en: p.name_en ?? p.name_ar ?? p.permission_key ?? '',
                module: p.module ?? '',
                can_view: current.can_view,
                can_create: current.can_create,
                can_edit: current.can_edit,
                can_delete: current.can_delete,
                can_approve: current.can_approve,
            };
        });
        setRows(list);
    }, [permissionsList, userPermsMap]);

    const filteredRows = useMemo(() => {
        const moduleScoped =
            moduleFilter === 'All' ? rows : rows.filter((r) => r.module === moduleFilter);

        if (!search.trim()) return moduleScoped;

        const q = search.toLowerCase();
        return moduleScoped.filter(
            (r) =>
                r.permission_key.toLowerCase().includes(q) ||
                r.name_en.toLowerCase().includes(q) ||
                r.module.toLowerCase().includes(q)
        );
    }, [rows, moduleFilter, search]);

    const modules = useMemo(() => {
        const set = new Set(rows.map((r) => r.module).filter(Boolean));
        return Array.from(set).sort();
    }, [rows]);

    useEffect(() => {
        setPage(1);
    }, [moduleFilter, search]);

    const totalItems = filteredRows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * perPage;
        return filteredRows.slice(start, start + perPage);
    }, [filteredRows, page, perPage]);

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search.trim()) arr.push(`Search: ${search}`);
        if (moduleFilter !== 'All') arr.push(`Module: ${moduleFilter}`);
        return arr;
    }, [search, moduleFilter]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchPermissions({})).unwrap();
            if (userId) {
                await dispatch(fetchUserPermissions(userId)).unwrap();
            }
            toast.success('Permissions refreshed');
        } catch {
            toast.error('Failed to refresh permissions');
        } finally {
            setIsRefreshing(false);
        }
    };

    const columns: Column<PermissionRow>[] = [
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
            key: 'name_en',
            header: 'Permission name',
            sortable: true,
            render: (value: unknown) => (
                <span className="font-medium text-slate-800 dark:text-slate-200">{String(value ?? '-')}</span>
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
        {
            key: 'can_view',
            header: 'View',
            align: 'center',
            render: (_value: unknown, row: PermissionRow) => (
                <Checkbox
                    checked={row.can_view === 1}
                    onCheckedChange={(checked) =>
                        setRows((prev) =>
                            prev.map((r) =>
                                r.permission_id === row.permission_id
                                    ? { ...r, can_view: checked === true ? 1 : 0 }
                                    : r
                            )
                        )
                    }
                />
            ),
        },
        {
            key: 'can_create',
            header: 'Create',
            align: 'center',
            render: (_value: unknown, row: PermissionRow) => (
                <Checkbox
                    checked={row.can_create === 1}
                    onCheckedChange={(checked) =>
                        setRows((prev) =>
                            prev.map((r) =>
                                r.permission_id === row.permission_id
                                    ? { ...r, can_create: checked === true ? 1 : 0 }
                                    : r
                            )
                        )
                    }
                />
            ),
        },
        {
            key: 'can_edit',
            header: 'Edit',
            align: 'center',
            render: (_value: unknown, row: PermissionRow) => (
                <Checkbox
                    checked={row.can_edit === 1}
                    onCheckedChange={(checked) =>
                        setRows((prev) =>
                            prev.map((r) =>
                                r.permission_id === row.permission_id
                                    ? { ...r, can_edit: checked === true ? 1 : 0 }
                                    : r
                            )
                        )
                    }
                />
            ),
        },
        {
            key: 'can_delete',
            header: 'Delete',
            align: 'center',
            render: (_value: unknown, row: PermissionRow) => (
                <Checkbox
                    checked={row.can_delete === 1}
                    onCheckedChange={(checked) =>
                        setRows((prev) =>
                            prev.map((r) =>
                                r.permission_id === row.permission_id
                                    ? { ...r, can_delete: checked === true ? 1 : 0 }
                                    : r
                            )
                        )
                    }
                />
            ),
        },
        {
            key: 'can_approve',
            header: 'Approve',
            align: 'center',
            render: (_value: unknown, row: PermissionRow) => (
                <Checkbox
                    checked={row.can_approve === 1}
                    onCheckedChange={(checked) =>
                        setRows((prev) =>
                            prev.map((r) =>
                                r.permission_id === row.permission_id
                                    ? { ...r, can_approve: checked === true ? 1 : 0 }
                                    : r
                            )
                        )
                    }
                />
            ),
        },
    ];

    const handleSave = async () => {
        if (!userId) {
            toast.error('Invalid user ID');
            return;
        }
        setSaving(true);
        try {
            const payload: SetUserPermissionItem[] = rows.map((r) => ({
                permission_id: r.permission_id,
                can_view: r.can_view,
                can_create: r.can_create,
                can_edit: r.can_edit,
                can_delete: r.can_delete,
                can_approve: r.can_approve,
            }));
            const result = await dispatch(setUserPermissions({ userId, permissions: payload }));
            if (setUserPermissions.fulfilled.match(result)) {
                toast.success('User permissions updated successfully');
                dispatch(fetchUserPermissions(userId));
            } else {
                toast.error((result.payload as string) || 'Failed to save permissions');
            }
        } catch {
            toast.error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    if (!userId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing user ID.{' '}
                    <Button variant="link" onClick={() => router.push('/users')}>
                        Back to users
                    </Button>
                </p>
            </div>
        );
    }

    const userDisplay = user
        ? [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email || userId
        : userId;

    if (!user || user.id !== userId) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <KeyRound className="h-8 w-8 text-sky-500" />
                        User permissions
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base">
                        Manage permission overrides for <span className="font-semibold text-slate-800 dark:text-slate-200">{userDisplay}</span>.
                        Effective access = role permissions + these user overrides.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/users')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to users
                    </Button>
                    <Button onClick={() => router.push(`/users/update?id=${userId}`)} variant="outline">
                        User details
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save permissions
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Total permissions" description="Rows in catalog" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{rows.length}</div>
                </EnhancedCard>
                <EnhancedCard title="Filtered results" description="After search/module filters" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalItems}</div>
                </EnhancedCard>
                <EnhancedCard title="Modules" description="Distinct permission groups" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{modules.length}</div>
                </EnhancedCard>
                <EnhancedCard title="Current page" description="Pagination position" variant="default" size="sm">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {page} / {totalPages}
                    </div>
                </EnhancedCard>
            </div>

            <FilterBar
                searchPlaceholder="Search by permission key, name, or module..."
                searchValue={search}
                onSearchChange={setSearch}
                filters={[
                    {
                        key: 'module',
                        label: 'Module',
                        value: moduleFilter,
                        options: [
                            { key: 'All', value: 'All', label: 'All modules' },
                            ...modules.map((m) => ({ key: m, value: m, label: m })),
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
                        disabled={isRefreshing || permissionsLoading}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                }
            />

            <EnhancedCard
                title="Permission overrides table"
                description={`${totalItems} permission(s). Save replaces all user overrides in one request.`}
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
                    data={paginatedRows}
                    columns={columns}
                    loading={permissionsLoading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: perPage,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No permission rows found"
                    showActions={false}
                />
            </EnhancedCard>
        </div>
    );
}
