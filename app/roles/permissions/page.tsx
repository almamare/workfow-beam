'use client';

import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchRole,
    fetchRolePermissions,
    setRolePermissions,
    selectSelectedRole,
    selectRolePermissions,
    selectRolesLoading,
} from '@/stores/slices/roles';
import { fetchPermissions, selectPermissions } from '@/stores/slices/permissions';
import type { SetRolePermissionItem } from '@/stores/types/roles';
import type { Permission } from '@/stores/types/permissions';
import { Button } from '@/components/ui/button';
import { Loader2, Save, KeyRound } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function RolePermissionsPageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" /></div>}>
            <RolePermissionsPage />
        </Suspense>
    );
}

function RolePermissionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id') ?? '';
    const roleId = idParam ? parseInt(idParam, 10) : NaN;
    const dispatch = useReduxDispatch<AppDispatch>();

    const role = useSelector(selectSelectedRole);
    const rolePermissions = useSelector(selectRolePermissions);
    const rolesLoading = useSelector(selectRolesLoading);
    const allPermissions = useSelector(selectPermissions);
    const permissionsList = Array.isArray(allPermissions) ? allPermissions : [];

    const [rows, setRows] = useState<PermissionRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [moduleFilter, setModuleFilter] = useState<string>('');

    useEffect(() => {
        if (!isNaN(roleId)) {
            dispatch(fetchRole(roleId));
            dispatch(fetchRolePermissions(roleId));
        }
    }, [dispatch, roleId]);

    useEffect(() => {
        dispatch(fetchPermissions({}));
    }, [dispatch]);

    const rolePermsMap = useMemo(() => {
        const map = new Map<number, { can_view: 0 | 1; can_create: 0 | 1; can_edit: 0 | 1; can_delete: 0 | 1; can_approve: 0 | 1 }>();
        if (Array.isArray(rolePermissions)) {
            rolePermissions.forEach((p) => {
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
    }, [rolePermissions]);

    useEffect(() => {
        const list: PermissionRow[] = permissionsList.map((p: Permission) => {
            const current = rolePermsMap.get(p.id) ?? {
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
    }, [permissionsList, rolePermsMap]);

    const toggleFlag = useCallback((permissionId: number, flag: keyof Pick<PermissionRow, 'can_view' | 'can_create' | 'can_edit' | 'can_delete' | 'can_approve'>) => {
        setRows((prev) =>
            prev.map((r) =>
                r.permission_id === permissionId
                    ? { ...r, [flag]: (r[flag] === 1 ? 0 : 1) as 0 | 1 }
                    : r
            )
        );
    }, []);

    const filteredRows = useMemo(() => {
        if (!moduleFilter) return rows;
        return rows.filter((r) => r.module === moduleFilter);
    }, [rows, moduleFilter]);

    const modules = useMemo(() => {
        const set = new Set(rows.map((r) => r.module).filter(Boolean));
        return Array.from(set).sort();
    }, [rows]);

    const handleSave = async () => {
        if (isNaN(roleId)) {
            toast.error('Invalid role ID');
            return;
        }
        setSaving(true);
        try {
            const payload: SetRolePermissionItem[] = rows.map((r) => ({
                permission_id: r.permission_id,
                can_view: r.can_view,
                can_create: r.can_create,
                can_edit: r.can_edit,
                can_delete: r.can_delete,
                can_approve: r.can_approve,
            }));
            const result = await dispatch(setRolePermissions({ id: roleId, permissions: payload }));
            if (setRolePermissions.fulfilled.match(result)) {
                toast.success('Role permissions updated successfully');
                dispatch(fetchRolePermissions(roleId));
            } else {
                toast.error((result.payload as string) || 'Failed to save permissions');
            }
        } catch {
            toast.error('Failed to save permissions');
        } finally {
            setSaving(false);
        }
    };

    if (!idParam || isNaN(roleId)) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing role ID.{' '}
                    <Button variant="link" onClick={() => router.push('/roles')}>
                        Back to roles
                    </Button>
                </p>
            </div>
        );
    }

    const selectedRoleId = role ? Number(role.id) : NaN;

    if (rolesLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
            </div>
        );
    }

    if (!role || Number.isNaN(selectedRoleId) || selectedRoleId !== roleId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Unable to load this role or role not found.{' '}
                    <Button variant="link" onClick={() => router.push('/roles')}>
                        Back to roles
                    </Button>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <KeyRound className="h-8 w-8 text-brand-sky-500" />
                        Manage permissions: {role.role_name ?? role.role_key}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Set view, create, edit, delete, and approve for each permission. Save replaces all assignments for this role.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/roles')}>
                        Back to roles
                    </Button>
                    <Button onClick={() => router.push(`/roles/details?id=${roleId}`)} variant="outline">
                        Role details
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save permissions
                    </Button>
                </div>
            </div>

            {modules.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Filter by module:</span>
                    <select
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                        className="rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm"
                    >
                        <option value="">All modules</option>
                        {modules.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <EnhancedCard
                title="Permission matrix"
                description={`${filteredRows.length} permission(s). Toggle flags then click Save.`}
                variant="default"
                size="sm"
            >
                <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Permission Key</th>
                                    <th className="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Name</th>
                                    <th className="text-left py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Module</th>
                                    <th className="text-center py-3 px-2 font-medium text-slate-700 dark:text-slate-300">View</th>
                                    <th className="text-center py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Create</th>
                                    <th className="text-center py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Edit</th>
                                    <th className="text-center py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Delete</th>
                                    <th className="text-center py-3 px-2 font-medium text-slate-700 dark:text-slate-300">Approve</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((r) => (
                                    <tr key={r.permission_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-2 px-2 font-mono text-slate-700 dark:text-slate-300">{r.permission_key}</td>
                                        <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{r.name_en}</td>
                                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400">{r.module}</td>
                                        <td className="py-2 px-2 text-center">
                                            <Checkbox checked={r.can_view === 1} onCheckedChange={() => toggleFlag(r.permission_id, 'can_view')} />
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <Checkbox checked={r.can_create === 1} onCheckedChange={() => toggleFlag(r.permission_id, 'can_create')} />
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <Checkbox checked={r.can_edit === 1} onCheckedChange={() => toggleFlag(r.permission_id, 'can_edit')} />
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <Checkbox checked={r.can_delete === 1} onCheckedChange={() => toggleFlag(r.permission_id, 'can_delete')} />
                                        </td>
                                        <td className="py-2 px-2 text-center">
                                            <Checkbox checked={r.can_approve === 1} onCheckedChange={() => toggleFlag(r.permission_id, 'can_approve')} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRows.length === 0 && (
                            <p className="py-6 text-center text-slate-500">No permissions to display.</p>
                        )}
                    </div>
            </EnhancedCard>
        </div>
    );
}
