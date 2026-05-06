'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchPermission, selectSelectedPermission } from '@/stores/slices/permissions';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';

function PermissionDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id') ?? '';
    const permissionId = idParam ? parseInt(idParam, 10) : NaN;
    const dispatch = useReduxDispatch<AppDispatch>();
    const permission = useSelector(selectSelectedPermission);

    useEffect(() => {
        if (!isNaN(permissionId)) {
            dispatch(fetchPermission(permissionId));
        }
    }, [dispatch, permissionId]);

    if (!idParam || isNaN(permissionId)) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing permission ID.{' '}
                    <Button variant="link" onClick={() => router.push('/permissions')}>
                        Back to list
                    </Button>
                </p>
            </div>
        );
    }

    if (!permission || permission.id !== permissionId) {
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
                        {permission.name_en ?? permission.name_ar ?? permission.permission_key}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Permission details (read-only)
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/permissions')}
                    className="border-sky-200 dark:border-sky-800"
                >
                    Back to list
                </Button>
            </div>

            <EnhancedCard
                title="Permission information"
                description={`Key: ${permission.permission_key}`}
                variant="default"
                size="sm"
            >
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">ID</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{permission.id}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Permission Key</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">
                            {permission.permission_key ?? '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Name (EN)</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{permission.name_en ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Name (AR)</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{permission.name_ar ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Module</dt>
                        <dd className="mt-1">
                            <Badge variant="outline">{permission.module ?? '-'}</Badge>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created at</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {permission.created_at
                                ? new Date(permission.created_at).toLocaleString()
                                : '-'}
                        </dd>
                    </div>
                </dl>
            </EnhancedCard>
        </div>
    );
}

export default function PermissionDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <PermissionDetailsContent />
        </Suspense>
    );
}
