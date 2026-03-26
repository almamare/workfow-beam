'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchDepartment, selectSelectedDepartment } from '@/stores/slices/departments';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Building } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';

const LEVEL_LABELS: Record<number, string> = { 1: 'Top', 2: 'Mid', 3: 'Sub' };

function DepartmentDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const departmentId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const department = useSelector(selectSelectedDepartment);

    useEffect(() => {
        if (departmentId) {
            dispatch(fetchDepartment(departmentId));
        }
    }, [dispatch, departmentId]);

    if (!departmentId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing department ID.{' '}
                    <Button variant="link" onClick={() => router.push('/departments')}>
                        Back to list
                    </Button>
                </p>
            </div>
        );
    }

    if (!department || (department.department_id !== departmentId && String(department.id) !== departmentId)) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    const levelLabel = department.level != null ? LEVEL_LABELS[department.level] ?? department.level : '-';

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Building className="h-8 w-8 text-sky-500" />
                        {department.name_en ?? department.name_ar ?? department.department_id}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Department details (read-only)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/departments')}
                        className="border-sky-200 dark:border-sky-800"
                    >
                        Back to list
                    </Button>
                    <Button
                        onClick={() => router.push(`/departments/update?id=${department.department_id ?? department.id}`)}
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            <EnhancedCard
                title="Department information"
                description={`Code: ${department.department_id ?? department.id}`}
                variant="default"
                size="sm"
            >
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Name (EN)</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{department.name_en ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Name (AR)</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{department.name_ar ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Department ID / Code</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{department.department_id ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Dept code</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{department.dept_code ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Parent ID</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{department.parent_id ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Level</dt>
                        <dd className="mt-1">
                            <Badge variant="outline">{levelLabel}</Badge>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</dt>
                        <dd className="mt-1">
                            <Badge
                                variant="outline"
                                className={
                                    department.status === 'Active'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                                }
                            >
                                {department.status ?? '-'}
                            </Badge>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created at</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {department.created_at ? new Date(department.created_at).toLocaleString() : '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Updated at</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {department.updated_at ? new Date(department.updated_at).toLocaleString() : '-'}
                        </dd>
                    </div>
                </dl>
            </EnhancedCard>
        </div>
    );
}

export default function DepartmentDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <DepartmentDetailsContent />
        </Suspense>
    );
}
