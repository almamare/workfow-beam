'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchUser,
    selectSelectedUser,
    selectLoading,
    selectError,
    clearSelectedUser,
} from '@/stores/slices/users';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, KeyRound, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">{children}</div>
);

function getStatusBadgeClass(status?: string) {
    if (!status) {
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
    const s = status.toLowerCase();
    if (s === 'active') {
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    }
    if (s === 'disabled' || s === 'locked' || s === 'inactive') {
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    }
    return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
}

function formatDateTime(dateString?: string | null) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Invalid date';
    }
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0 text-left">
        <span className="font-medium text-slate-700 dark:text-slate-100 text-sm md:text-base shrink-0">{label}</span>
        <span className="text-left sm:text-right text-xs md:text-sm text-slate-600 dark:text-slate-400 break-all sm:max-w-[60%]">
            {value ?? 'N/A'}
        </span>
    </div>
);

function UserDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const user = useSelector(selectSelectedUser);
    const loading = useSelector(selectLoading);
    const loadError = useSelector(selectError);

    const loadUser = useCallback(async () => {
        if (!userId) return;
        try {
            await dispatch(fetchUser({ id: userId })).unwrap();
        } catch (err: unknown) {
            const msg = typeof err === 'string' ? err : 'Failed to load user details.';
            toast.error(msg);
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (!userId) return;
        void loadUser();
        return () => {
            dispatch(clearSelectedUser());
        };
    }, [dispatch, userId, loadUser]);

    if (!userId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    User ID is missing.{' '}
                    <Button variant="link" className="text-sky-600" onClick={() => router.push('/users')}>
                        Back to Users
                    </Button>
                </p>
            </div>
        );
    }

    if (loading || (user && user.id !== userId)) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading user details…</p>
            </Centered>
        );
    }

    if (!user && loadError) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400 text-center max-w-md">{loadError}</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/users')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </Centered>
        );
    }

    if (!user) {
        return (
            <Centered>
                <p className="text-slate-600 dark:text-slate-400">User not found.</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/users')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </Centered>
        );
    }

    const displayName =
        [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email || user.username || 'Unknown user';

    const roleLabel = user.role_key || user.role || '—';
    const mustChange = user.must_change_password === 1;

    return (
        <div className="space-y-4 pb-8">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        User Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm md:text-base">
                        Read-only overview for <span className="font-semibold text-slate-800 dark:text-slate-200">{displayName}</span>
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/users')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 shrink-0"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
            </div>

            {/* Stat cards — same rhythm as Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Display name" description="Public profile name" variant="default" size="sm">
                    <div className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 truncate" title={displayName}>
                        {displayName}
                    </div>
                </EnhancedCard>
                <EnhancedCard title="Username" description="Sign-in name" variant="default" size="sm">
                    <div className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono truncate" title={user.username || ''}>
                        {user.username || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard title="Account status" description="Access state" variant="default" size="sm">
                    <div className="flex items-center gap-2">
                        {user.status ? (
                            <Badge variant="outline" className={`${getStatusBadgeClass(user.status)} w-fit font-semibold`}>
                                {user.status}
                            </Badge>
                        ) : (
                            <span className="text-slate-500">N/A</span>
                        )}
                    </div>
                </EnhancedCard>
                <EnhancedCard title="Role" description="Assigned role" variant="default" size="sm">
                    <div className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 truncate" title={roleLabel}>
                        {roleLabel}
                    </div>
                </EnhancedCard>
            </div>

            {/* Actions — Project-style action strip */}
            <EnhancedCard title="User actions" description="Navigate to related screens" variant="default" size="sm">
                <div className="flex flex-wrap gap-3 items-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/users')}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Users list
                    </Button>
                    <Button
                        onClick={() => router.push(`/users/permissions?id=${user.id}`)}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md"
                    >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Permissions
                    </Button>
                    <Button
                        onClick={() => router.push(`/users/update?id=${user.id}`)}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-md"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit user
                    </Button>
                </div>
            </EnhancedCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EnhancedCard
                    title="Profile & account"
                    description={`Account: ${user.username || user.email || 'N/A'}`}
                    variant="default"
                    size="sm"
                >
                    <DetailItem label="Full name" value={displayName} />
                    <DetailItem label="First name" value={user.name || '—'} />
                    <DetailItem label="Last name" value={user.surname || '—'} />
                    <DetailItem label="Email" value={user.email || '—'} />
                    <DetailItem label="Phone" value={user.phone || '—'} />
                    <DetailItem label="Account type" value={user.type || '—'} />
                </EnhancedCard>

                <EnhancedCard title="Organization & security" description="Role, department, and activity" variant="default" size="sm">
                    <DetailItem
                        label="Role"
                        value={
                            <Badge variant="outline" className="font-medium w-fit">
                                {roleLabel}
                            </Badge>
                        }
                    />
                    <DetailItem label="Department code" value={user.department_id || '—'} />
                    <DetailItem
                        label="Password policy"
                        value={
                            mustChange ? (
                                <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800 w-fit">
                                    Change required
                                </Badge>
                            ) : (
                                <span className="text-slate-600 dark:text-slate-400">Up to date</span>
                            )
                        }
                    />
                    <DetailItem label="Last sign-in" value={formatDateTime(user.last_login)} />
                    <DetailItem label="Created" value={formatDateTime(user.created_at)} />
                    <DetailItem label="Updated" value={formatDateTime(user.updated_at)} />
                </EnhancedCard>
            </div>
        </div>
    );
}

export default function UserDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading…</div>}>
            <UserDetailsContent />
        </Suspense>
    );
}
