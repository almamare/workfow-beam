'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/stores/store';
import {
    fetchTaskRequest,
    clearSelectedTaskRequest,
    selectSelectedTaskRequest,
    selectLoading as selectRequestLoading,
    selectError as selectRequestError,
} from '@/stores/slices/tasks_requests';
import {
    fetchApprovals,
    clearApprovals,
    selectApprovals,
    selectApprovalsLoading,
    selectApprovalsTotal,
} from '@/stores/slices/approvals';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Clock, CheckCircle, XCircle, Info, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import type { Approval } from '@/stores/types/approvals';

/* =========================================================
   Helpers
=========================================================== */
function fmtDateTime(date?: string) {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleString('en-US', {
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

const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('موافق') || statusLower === 'approved') {
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    }
    if (statusLower.includes('rejected') || statusLower.includes('مرفوض') || statusLower === 'rejected') {
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    }
    if (statusLower.includes('pending') || statusLower.includes('قيد') || statusLower === 'pending') {
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    }
    return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
};

const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('approved') || statusLower.includes('موافق') || statusLower === 'approved') {
        return <CheckCircle className="h-4 w-4" />;
    }
    if (statusLower.includes('rejected') || statusLower.includes('مرفوض') || statusLower === 'rejected') {
        return <XCircle className="h-4 w-4" />;
    }
    if (statusLower.includes('pending') || statusLower.includes('قيد') || statusLower === 'pending') {
        return <Clock className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
};

/* =========================================================
   Reusable UI Components
=========================================================== */
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        {children}
    </div>
);

/* =========================================================
   Main Component
=========================================================== */
function FinancialRequestTimeline() {
    const router = useRouter();
    const params = useSearchParams();
    const requestId = params.get('id');

    const dispatch = useReduxDispatch<AppDispatch>();

    // Redux Selectors
    const request = useSelector((state: RootState) => selectSelectedTaskRequest(state));
    const requestLoading = useSelector((state: RootState) => selectRequestLoading(state));
    const requestError = useSelector((state: RootState) => selectRequestError(state));

    const approvals = useSelector((state: RootState) => selectApprovals(state));
    const approvalsLoading = useSelector((state: RootState) => selectApprovalsLoading(state));
    const approvalsTotal = useSelector((state: RootState) => selectApprovalsTotal(state));

    // Local State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [localApprovals, setLocalApprovals] = useState<Approval[]>([]);

    // Fetch request data
    useEffect(() => {
        if (!requestId) {
            toast.error('Request ID is missing');
            router.push('/requests/financial');
            return;
        }
        dispatch(fetchTaskRequest({ id: requestId }));
        return () => {
            dispatch(clearSelectedTaskRequest());
        };
    }, [requestId, router, dispatch]);

    // Fetch approvals for this request
    useEffect(() => {
        if (!requestId) return;
        
        // Try Redux first
        dispatch(fetchApprovals({
            request_id: requestId,
            page: 1,
            limit: 100, // Get all approvals for timeline
        }))
            .then((result: any) => {
                // If Redux fails, try direct API call
                if (result.type === 'approvals/fetchApprovals/rejected') {
                    console.warn('Redux fetch failed, trying direct API call');
                    axios.get(`/approvals/fetch/${requestId}`)
                        .then((res) => {
                            const approvalsData = res.data?.body?.approvals?.items || res.data?.data?.approvals?.items || [];
                            setLocalApprovals(approvalsData);
                        })
                        .catch((error) => {
                            console.error('Direct API call also failed:', error);
                            toast.error('Failed to load approvals timeline');
                        });
                }
            });
        
        return () => {
            dispatch(clearApprovals());
            setLocalApprovals([]);
        };
    }, [requestId, dispatch]);

    // Handle errors
    useEffect(() => {
        if (requestError) toast.error(requestError);
    }, [requestError]);

    // Combine Redux approvals and local approvals
    const allApprovals = useMemo(() => {
        const combined = [...approvals, ...localApprovals];
        // Remove duplicates by ID
        const unique = combined.filter((approval, index, self) => 
            index === self.findIndex(a => a.id === approval.id)
        );
        return unique;
    }, [approvals, localApprovals]);

    // Sort approvals by sequence and created_at
    const sortedApprovals = useMemo(() => {
        return [...allApprovals].sort((a, b) => {
            // First sort by sequence
            if (a.sequence !== b.sequence) {
                return (a.sequence || 0) - (b.sequence || 0);
            }
            // Then by created_at
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
    }, [allApprovals]);

    const refreshTimeline = async () => {
        if (!requestId) return;
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequest({ id: requestId }));
            await dispatch(fetchApprovals({
                request_id: requestId,
                page: 1,
                limit: 100,
            }));
            toast.success('Timeline refreshed successfully');
        } catch (error) {
            toast.error('Failed to refresh timeline');
        } finally {
            setIsRefreshing(false);
        }
    };

    const loading = requestLoading || approvalsLoading;

    if (loading && !request) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading timeline...</p>
            </Centered>
        );
    }

    if (requestError) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">{requestError}</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/requests/financial')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requests
                </Button>
            </Centered>
        );
    }

    if (!request) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">Financial request not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/requests/financial')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requests
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Approvals Timeline
                    </h1>
                    {request.request_code && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Request Code: {request.request_code}
                        </p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View the complete approval workflow timeline for this financial request.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/requests/financial/details?id=${request.id}`)}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Details
                    </Button>
                    <Button
                        variant="outline"
                        onClick={refreshTimeline}
                        disabled={isRefreshing || loading}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Request Info Card */}
            <EnhancedCard
                title="Request Information"
                description="Basic request details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Request Code</p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-sky-500" />
                            {request.request_code || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
                        <Badge variant="outline" className={getStatusColor(request.status || '')}>
                            {request.status || 'N/A'}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Created At</p>
                        <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{fmtDateTime(request.created_at)}</p>
                    </div>
                </div>
            </EnhancedCard>

            {/* Timeline Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <EnhancedCard
                    title="Total Steps"
                    description="All approval steps"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {approvalsTotal || 0}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Completed"
                    description="Approved or rejected steps"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                        {sortedApprovals.filter(a => {
                            const s = a.status?.toLowerCase() || '';
                            return s.includes('approved') || s.includes('موافق') || s.includes('rejected') || s.includes('مرفوض');
                        }).length}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Pending"
                    description="Steps awaiting approval"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {sortedApprovals.filter(a => {
                            const s = a.status?.toLowerCase() || '';
                            return s.includes('pending') || s.includes('قيد');
                        }).length}
                    </div>
                </EnhancedCard>
            </div>

            {/* Timeline */}
            <EnhancedCard
                title="Approval Timeline"
                description={
                    approvalsLoading
                        ? 'Loading timeline...'
                        : `${sortedApprovals.length} step${sortedApprovals.length === 1 ? '' : 's'} in the approval workflow`
                }
                variant="default"
                size="sm"
            >
                {approvalsLoading ? (
                    <Centered>
                        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                        <p className="text-slate-500 dark:text-slate-400">Loading timeline...</p>
                    </Centered>
                ) : sortedApprovals.length === 0 ? (
                    <Centered>
                        <AlertCircle className="h-12 w-12 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">No approval steps found for this request</p>
                    </Centered>
                ) : (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-400 dark:from-sky-600 dark:via-sky-700 dark:to-sky-600" />

                        <div className="space-y-6">
                            {sortedApprovals.map((approval, index) => {
                                const isLast = index === sortedApprovals.length - 1;
                                const statusLower = (approval.status || '').toLowerCase();
                                const isApproved = statusLower.includes('approved') || statusLower.includes('موافق');
                                const isRejected = statusLower.includes('rejected') || statusLower.includes('مرفوض');
                                const isPending = statusLower.includes('pending') || statusLower.includes('قيد');

                                return (
                                    <div key={approval.id} className="relative pl-16">
                                        {/* Timeline dot */}
                                        <div className={`absolute left-0 top-2 w-12 h-12 rounded-full border-4 ${
                                            isApproved 
                                                ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                                                : isRejected 
                                                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
                                                    : isPending
                                                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                                                        : 'border-slate-400 bg-slate-50 dark:bg-slate-800'
                                        } flex items-center justify-center shadow-lg`}>
                                            {getStatusIcon(approval.status || '')}
                                        </div>

                                        {/* Timeline content */}
                                        <div className={`bg-white dark:bg-slate-900/70 border-2 rounded-xl p-5 shadow-md transition-all hover:shadow-lg ${
                                            isApproved 
                                                ? 'border-green-200 dark:border-green-800' 
                                                : isRejected 
                                                    ? 'border-red-200 dark:border-red-800' 
                                                    : isPending
                                                        ? 'border-yellow-200 dark:border-yellow-800'
                                                        : 'border-slate-200 dark:border-slate-700'
                                        }`}>
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusColor(approval.status || '')} flex items-center gap-1 font-medium`}
                                                    >
                                                        {getStatusIcon(approval.status || '')}
                                                        <span>{approval.status || 'N/A'}</span>
                                                    </Badge>
                                                    {approval.sequence && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-mono"
                                                        >
                                                            Step {approval.sequence}
                                                        </Badge>
                                                    )}
                                                    {(approval as any).step_no && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-mono"
                                                        >
                                                            Step No: {(approval as any).step_no}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {fmtDateTime(approval.created_at)}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                                {approval.step_name || approval.title || 'Approval Step'}
                                            </h3>

                                            {approval.remarks && (
                                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks:</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                                        {approval.remarks}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                                                {approval.created_name && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">By:</span>
                                                        <span>{approval.created_name}</span>
                                                    </span>
                                                )}
                                                {approval.request_id && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">Request ID:</span>
                                                        <span className="font-mono">{approval.request_id}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </EnhancedCard>
        </div>
    );
}

/* =========================================================
   Page Wrapper
=========================================================== */
export default function Page() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading timeline...</p>
                </Centered>
            }
        >
            <FinancialRequestTimeline />
        </Suspense>
    );
}

