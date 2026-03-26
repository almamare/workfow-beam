'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchUser, selectSelectedUser } from '@/stores/slices/users';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, UserCircle, KeyRound } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';

function UserDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const user = useSelector(selectSelectedUser);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUser({ id: userId }));
        }
    }, [dispatch, userId]);

    if (!userId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    معرّف المستخدم مفقود.{' '}
                    <Button variant="link" onClick={() => router.push('/users')}>
                        العودة للقائمة
                    </Button>
                </p>
            </div>
        );
    }

    if (!user || user.id !== userId) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    const displayName = [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email || user.username || userId;

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <UserCircle className="h-8 w-8 text-sky-500" />
                        {displayName}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        تفاصيل المستخدم (للقراءة فقط)
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/users')}
                        className="border-sky-200 dark:border-sky-800"
                    >
                        العودة للقائمة
                    </Button>
                    <Button
                        onClick={() => router.push(`/users/permissions?id=${user.id}`)}
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                        <KeyRound className="h-4 w-4 mr-2" />
                        صلاحيات المستخدم
                    </Button>
                    <Button
                        onClick={() => router.push(`/users/update?id=${user.id}`)}
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        تعديل
                    </Button>
                </div>
            </div>

            <EnhancedCard
                title="معلومات الحساب"
                description={`المستخدم: ${user.username ?? user.email ?? user.id}`}
                variant="default"
                size="sm"
            >
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">المعرّف (ID)</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200 text-sm">{user.id}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">الاسم</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{user.name ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">اللقب</dt>
                        <dd className="mt-1 text-slate-900 dark:text-slate-100">{user.surname ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">اسم المستخدم</dt>
                        <dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{user.username ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">البريد الإلكتروني</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{user.email ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">الهاتف</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{user.phone ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">الرقم / Number</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{user.number ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">الدور (Role)</dt>
                        <dd className="mt-1">
                            <Badge variant="outline" className="font-medium">
                                {user.role_key ?? user.role ?? '-'}
                            </Badge>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">القسم (Department)</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{user.department_id ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">النوع (Type)</dt>
                        <dd className="mt-1 text-slate-800 dark:text-slate-200">{user.type ?? '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">الحالة (Status)</dt>
                        <dd className="mt-1">
                            <Badge
                                variant="outline"
                                className={
                                    user.status === 'Active'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                        : user.status === 'Disabled' || user.status === 'Locked'
                                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        : 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300'
                                }
                            >
                                {user.status ?? '-'}
                            </Badge>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">آخر تسجيل دخول</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">تاريخ الإنشاء</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">تاريخ التحديث</dt>
                        <dd className="mt-1 text-slate-600 dark:text-slate-400">
                            {user.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}
                        </dd>
                    </div>
                </dl>
            </EnhancedCard>
        </div>
    );
}

export default function UserDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">جاري التحميل...</div>}>
            <UserDetailsContent />
        </Suspense>
    );
}
