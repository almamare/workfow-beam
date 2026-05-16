'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchRole, selectSelectedRole } from '@/stores/slices/roles';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Shield, KeyRound, AlertCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

function RoleDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id') ?? '';
    const roleId = idParam ? parseInt(idParam, 10) : NaN;
    const dispatch = useReduxDispatch<AppDispatch>();
    const role = useSelector(selectSelectedRole);
    const [fetched, setFetched] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!isNaN(roleId)) {
            setFetched(false);
            setFetchError(null);
            dispatch(fetchRole(roleId))
                .unwrap()
                .then(() => setFetched(true))
                .catch((err: unknown) => {
                    setFetchError(typeof err === 'string' ? err : 'Failed to load role');
                    setFetched(true);
                });
        }
    }, [dispatch, roleId]);

    if (!idParam || isNaN(roleId)) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing role ID.{' '}
                    <Button variant="link" onClick={() => router.push('/roles')}>
                        Back to list
                    </Button>
                </p>
            </div>
        );
    }

    if (!fetched) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
            </div>
        );
    }

    if (fetchError || !role || role.id !== roleId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {fetchError ?? 'Role not found'}
                    </p>
                    <Button variant="outline" onClick={() => router.push('/roles')}>
                        Back to list
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Shield className="h-8 w-8 text-brand-sky-500" />
                        {role.role_name ?? role.role_key}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Role details (read-only)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/roles')}
                        className="border-brand-sky-200 dark:border-brand-sky-800"
                    >
                        Back to list
                    </Button>
                    <Button
                        onClick={() => router.push(`/roles/permissions?id=${role.id}`)}
                        className="bg-brand-sky-600 hover:bg-brand-sky-700 text-white"
                    >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Manage permissions
                    </Button>
                    <Button
                        onClick={() => router.push(`/roles/update?id=${role.id}`)}
                        className="bg-brand-sky-600 hover:bg-brand-sky-700 text-white"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            <EnhancedCard
                title="Role information"
                description={`Key: ${role.role_key}`}
                variant="default"
                size="sm"
            >
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">ID</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{role.id}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Role Key</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">
                            {role.role_key ?? '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Role Name</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{role.role_name ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Department ID</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{role.department_id ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Description</dt>
                        <dd className="mt-1 text-slate-700 dark:text-slate-300">
                            {role.description ?? '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created at</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {role.created_at
                                ? new Date(role.created_at).toLocaleString()
                                : '-'}
                        </dd>
                    </div>
                </dl>
            </EnhancedCard>
        </div>
    );
}

export default function RoleDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <RoleDetailsContent />
        </Suspense>
    );
}
