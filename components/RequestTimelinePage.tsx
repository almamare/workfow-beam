'use client';

import React, { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/stores/store';
import {
    fetchTaskRequest,
    clearSelectedTaskRequest,
    selectSelectedTaskRequest,
    selectLoading as selectRequestLoading,
    selectError as selectRequestError,
} from '@/stores/slices/tasks_requests';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    Info,
    Hash,
    User,
    CalendarDays,
    GitBranch,
    MinusCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { ApprovalTimeline } from '@/components/ApprovalTimeline';
import type { Approval } from '@/stores/types/approvals';

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString?: string | null): string {
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
        return 'N/A';
    }
}

function getRequestStatusBadge(status?: string | null): string {
    if (!status) return REQUEST_STATUS_BADGE.default;
    return REQUEST_STATUS_BADGE[status] ?? REQUEST_STATUS_BADGE.default;
}

/** Mirrors getStatusColor() from the details pages exactly */
const REQUEST_STATUS_BADGE: Record<string, string> = {
    Pending:
        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Approved:
        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Rejected:
        'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'Pre-Approved':
        'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    Resubmission:
        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    Revision:
        'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    Skipped:
        'bg-slate-100 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    Completed:
        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    default:
        'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
};

const REQUEST_STATUS_ICON: Record<string, React.FC<{ className?: string }>> = {
    Approved: CheckCircle as React.FC<{ className?: string }>,
    Rejected: XCircle as React.FC<{ className?: string }>,
    Pending: Clock as React.FC<{ className?: string }>,
    'Pre-Approved': CheckCircle as React.FC<{ className?: string }>,
    Resubmission: Clock as React.FC<{ className?: string }>,
    Revision: RefreshCw as React.FC<{ className?: string }>,
    Skipped: Info as React.FC<{ className?: string }>,
    Completed: CheckCircle as React.FC<{ className?: string }>,
};

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        {children}
    </div>
);

// ── config ───────────────────────────────────────────────────────────────────

interface TimelinePageConfig {
    /** e.g. "clients" | "projects" | "tasks" | "financial" | "project-contracts" */
    requestType: string;
    /** Path of the list page, e.g. "/requests/clients" */
    listPath: string;
    /** Path prefix of the details page, e.g. "/requests/clients/details" */
    detailsPath: string;
}

// ── inner component (needs Suspense wrapper for useSearchParams) ──────────────

function TimelineInner({ requestType, listPath, detailsPath }: TimelinePageConfig) {
    const router = useRouter();
    const params = useSearchParams();
    const requestId = params.get('id');

    const dispatch = useDispatch<AppDispatch>();
    const request = useSelector((state: RootState) => selectSelectedTaskRequest(state));
    const requestLoading = useSelector((state: RootState) => selectRequestLoading(state));
    const requestError = useSelector((state: RootState) => selectRequestError(state));

    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [approvalsLoading, setApprovalsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch request metadata
    useEffect(() => {
        if (!requestId) {
            toast.error('Request ID is missing');
            router.push(listPath);
            return;
        }
        dispatch(fetchTaskRequest({ id: requestId }));
        return () => {
            dispatch(clearSelectedTaskRequest());
        };
    }, [requestId, dispatch, router, listPath]);

    // Fetch approvals for this specific request
    const fetchApprovals = useCallback(async () => {
        if (!requestId) return;
        setApprovalsLoading(true);
        try {
            const res = await axios.get(`/approvals/fetch/${requestId}`);
            let items: Approval[] = [];

            if (res.data?.body?.approvals?.items) {
                items = res.data.body.approvals.items;
            } else if (res.data?.data?.approvals?.items) {
                items = res.data.data.approvals.items;
            } else if (Array.isArray(res.data?.body)) {
                items = res.data.body;
            } else if (Array.isArray(res.data?.data)) {
                items = res.data.data;
            } else if (Array.isArray(res.data)) {
                items = res.data;
            }

            setApprovals(items);
        } catch {
            toast.error('Failed to load approvals timeline');
            setApprovals([]);
        } finally {
            setApprovalsLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchApprovals();
        return () => setApprovals([]);
    }, [fetchApprovals]);

    useEffect(() => {
        if (requestError) toast.error(requestError);
    }, [requestError]);

    // Sort by sequence then date
    const sortedApprovals = useMemo(
        () =>
            [...approvals].sort((a, b) => {
                if (a.sequence !== b.sequence) return (a.sequence ?? 0) - (b.sequence ?? 0);
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }),
        [approvals]
    );

    const handleRefresh = async () => {
        if (!requestId) return;
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequest({ id: requestId }));
            await fetchApprovals();
            toast.success('Timeline refreshed successfully');
        } finally {
            setIsRefreshing(false);
        }
    };

    // ── loading / error states ──
    if (requestLoading && !request) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading...</p>
            </Centered>
        );
    }

    if (requestError) {
        return (
            <Centered>
                <AlertCircle className="h-10 w-10 text-rose-400" />
                <p className="text-rose-600 dark:text-rose-400 text-sm">{requestError}</p>
                <Button variant="outline" onClick={() => router.push(listPath)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Button>
            </Centered>
        );
    }

    if (!request) {
        return (
            <Centered>
                <AlertCircle className="h-10 w-10 text-slate-400" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">Request not found</p>
                <Button variant="outline" onClick={() => router.push(listPath)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Button>
            </Centered>
        );
    }

    const StatusIcon = REQUEST_STATUS_ICON[request.status ?? ''] ?? Info;
    const statusBadgeCls = getRequestStatusBadge(request.status);

    const approvedCount = sortedApprovals.filter((a) => a.status === 'Approved').length;
    const rejectedCount = sortedApprovals.filter((a) => a.status === 'Rejected').length;
    const pendingCount  = sortedApprovals.filter((a) => a.status === 'Pending').length;

    return (
        <div className="space-y-5 pb-8">
            <Breadcrumb />

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                        Approvals Timeline
                    </h1>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                        Complete approval workflow history for request{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono">
                            {request.request_code}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`${detailsPath}?id=${request.id}`)}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Back to Details
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing || approvalsLoading}
                        className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Request code */}
                <EnhancedCard variant="default" size="sm" title="Request Code" description="">
                    <div className="flex items-center gap-2 mt-1">
                        <Hash className="h-4 w-4 text-brand-sky-500 flex-shrink-0" />
                        <span className="text-base font-bold font-mono text-slate-800 dark:text-slate-100 truncate">
                            {request.request_code || 'N/A'}
                        </span>
                    </div>
                </EnhancedCard>

                {/* Status */}
                <EnhancedCard variant="default" size="sm" title="Status" description="">
                    <div className="mt-1">
                        <Badge
                            variant="outline"
                            className={`flex items-center gap-1.5 w-fit text-xs font-semibold px-2.5 py-1 ${statusBadgeCls}`}
                        >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {request.status || 'N/A'}
                        </Badge>
                    </div>
                </EnhancedCard>

                {/* Created by */}
                <EnhancedCard variant="default" size="sm" title="Created By" description="">
                    <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {(request as any).created_by_name || 'N/A'}
                        </span>
                    </div>
                </EnhancedCard>

                {/* Created at */}
                <EnhancedCard variant="default" size="sm" title="Created At" description="">
                    <div className="flex items-center gap-2 mt-1">
                        <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                            {formatDate(request.created_at)}
                        </span>
                    </div>
                </EnhancedCard>
            </div>

            {/* ── Step summary pills ── */}
            {!approvalsLoading && sortedApprovals.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <GitBranch className="h-3.5 w-3.5" />
                        <span className="font-medium">{sortedApprovals.length} step{sortedApprovals.length !== 1 ? 's' : ''}</span>
                    </div>
                    {approvedCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {approvedCount} Approved
                        </Badge>
                    )}
                    {rejectedCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700">
                            <XCircle className="h-3 w-3 mr-1" />
                            {rejectedCount} Rejected
                        </Badge>
                    )}
                    {pendingCount > 0 && (
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {pendingCount} Pending
                        </Badge>
                    )}
                </div>
            )}

            {/* ── Timeline card ── */}
            <EnhancedCard
                title="Approval History"
                description={
                    approvalsLoading
                        ? 'Loading...'
                        : sortedApprovals.length === 0
                        ? 'No approval steps found'
                        : `${sortedApprovals.length} step${sortedApprovals.length !== 1 ? 's' : ''} in the approval workflow`
                }
                variant="default"
                size="sm"
            >
                <ApprovalTimeline
                    approvals={sortedApprovals}
                    loading={approvalsLoading}
                />
            </EnhancedCard>
        </div>
    );
}

// ── exported page component (with Suspense) ──────────────────────────────────

export function RequestTimelinePage(config: TimelinePageConfig) {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            }
        >
            <TimelineInner {...config} />
        </Suspense>
    );
}
