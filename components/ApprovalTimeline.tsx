'use client';

// REFACTOR-PHASE-2: Updated to use Redux instead of direct API calls
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchApprovalsByRequestId, selectTimelineApprovals, selectTimelineLoading, selectTimelineError } from '@/stores/slices/approvals';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, CheckCircle, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import type { Approval } from '@/stores/types/approvals';

interface ApprovalTimelineProps {
    requestId: string;
    onRefresh?: () => void;
}

const formatDateTime = (dateString?: string) => {
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
};

const getStatusColor = (status: string) => {
    if (!status) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
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
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (statusLower.includes('rejected') || statusLower.includes('مرفوض') || statusLower === 'rejected') {
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
    if (statusLower.includes('pending') || statusLower.includes('قيد') || statusLower === 'pending') {
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
    return <Info className="h-5 w-5 text-slate-600" />;
};

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ requestId, onRefresh }) => {
    const dispatch = useDispatch<AppDispatch>();
    const approvals = useSelector(selectTimelineApprovals);
    const loading = useSelector(selectTimelineLoading);
    const error = useSelector(selectTimelineError);

    // REFACTOR-PHASE-2: Use Redux thunk instead of direct API call
    useEffect(() => {
        if (!requestId) return;
        
        dispatch(fetchApprovalsByRequestId(requestId));
    }, [requestId, dispatch]);

    // REFACTOR-PHASE-2: Handle errors via Redux state
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // REFACTOR-PHASE-2: Call onRefresh callback when approvals change (if provided)
    useEffect(() => {
        if (onRefresh && !loading && approvals.length > 0) {
            // Optional: call onRefresh when data is loaded
            // onRefresh();
        }
    }, [approvals, loading, onRefresh]);

    // Sort approvals by sequence or created_at
    const sortedApprovals = useMemo(() => {
        return [...approvals].sort((a, b) => {
            if (a.sequence && b.sequence) {
                return a.sequence - b.sequence;
            }
            if (a.created_at && b.created_at) {
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return 0;
        });
    }, [approvals]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500 dark:text-slate-400 mr-3">جاري التحميل...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    if (sortedApprovals.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-slate-500 dark:text-slate-400">لا يوجد سجل موافقات</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                {/* Timeline Items */}
                <div className="space-y-6">
                    {sortedApprovals.map((approval, index) => {
                        const isLast = index === sortedApprovals.length - 1;
                        const statusLower = (approval.status || '').toLowerCase();
                        const isPending = statusLower.includes('pending') || statusLower.includes('قيد');
                        const isApproved = statusLower.includes('approved') || statusLower.includes('موافق');
                        const isRejected = statusLower.includes('rejected') || statusLower.includes('مرفوض');

                        return (
                            <div key={approval.id || index} className="relative flex items-start gap-4">
                                {/* Timeline Marker */}
                                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                                    {getStatusIcon(approval.status || 'Pending')}
                                </div>

                                {/* Timeline Content */}
                                <div className="flex-1 pb-6">
                                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                                    {approval.step_name || approval.title || 'Approval Step'}
                                                </h4>
                                                {approval.created_name && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        بواسطة: {approval.created_name}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className={getStatusColor(approval.status || 'Pending')}>
                                                {approval.status || 'Pending'}
                                            </Badge>
                                        </div>

                                        {/* Remarks */}
                                        {approval.remarks && (
                                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">النكات:</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                                    {approval.remarks}
                                                </p>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            {approval.created_at && (
                                                <span className="flex items-center gap-1">
                                                    <span className="font-medium">التاريخ:</span>
                                                    <span>{formatDateTime(approval.created_at)}</span>
                                                </span>
                                            )}
                                            {approval.sequence && (
                                                <span className="flex items-center gap-1">
                                                    <span className="font-medium">التسلسل:</span>
                                                    <span className="font-mono">{approval.sequence}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

