'use client';

import React from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Info,
    CornerDownLeft,
    CalendarDays,
    MessageSquare,
    MinusCircle,
    RefreshCw,
    FileCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Approval } from '@/stores/types/approvals';

// ── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateString?: string | null): string | null {
    if (!dateString) return null;
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return null;
    }
}

function getInitials(name?: string | null): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
    return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

// ── status config — mirrors getStatusColor() in details pages exactly ────────

interface StatusConfig {
    /** Tailwind classes for the timeline dot background */
    dotBg: string;
    /** Tailwind classes for the card left border */
    cardBorder: string;
    /** Tailwind classes for the card background tint */
    cardBg: string;
    /** Tailwind classes for the status badge — identical to details getStatusColor() */
    badgeCls: string;
    /** Tailwind classes for the connector line */
    lineCls: string;
    /** Tailwind classes for the initials avatar */
    avatarBg: string;
    /** Whether the dot should pulse (in-progress) */
    pulse?: boolean;
    Icon: React.FC<{ className?: string }>;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    Approved: {
        dotBg: 'bg-green-500',
        cardBorder: 'border-l-green-500',
        cardBg: 'bg-green-50/50 dark:bg-green-950/10',
        badgeCls:
            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        lineCls: 'bg-green-300 dark:bg-green-700',
        avatarBg: 'bg-green-500',
        Icon: CheckCircle as React.FC<{ className?: string }>,
    },
    Rejected: {
        dotBg: 'bg-rose-500',
        cardBorder: 'border-l-rose-500',
        cardBg: 'bg-rose-50/50 dark:bg-rose-950/10',
        badgeCls:
            'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        lineCls: 'bg-rose-300 dark:bg-rose-700',
        avatarBg: 'bg-rose-500',
        Icon: XCircle as React.FC<{ className?: string }>,
    },
    Pending: {
        dotBg: 'bg-amber-400',
        cardBorder: 'border-l-amber-400',
        cardBg: 'bg-amber-50/50 dark:bg-amber-950/10',
        badgeCls:
            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        lineCls: 'bg-slate-200 dark:bg-slate-700',
        avatarBg: 'bg-amber-500',
        pulse: true,
        Icon: Clock as React.FC<{ className?: string }>,
    },
    'Pre-Approved': {
        dotBg: 'bg-yellow-500',
        cardBorder: 'border-l-yellow-500',
        cardBg: 'bg-yellow-50/50 dark:bg-yellow-950/10',
        badgeCls:
            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        lineCls: 'bg-yellow-300 dark:bg-yellow-700',
        avatarBg: 'bg-yellow-500',
        Icon: FileCheck as React.FC<{ className?: string }>,
    },
    Resubmission: {
        dotBg: 'bg-orange-500',
        cardBorder: 'border-l-orange-500',
        cardBg: 'bg-orange-50/50 dark:bg-orange-950/10',
        badgeCls:
            'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        lineCls: 'bg-orange-300 dark:bg-orange-700',
        avatarBg: 'bg-orange-500',
        Icon: CornerDownLeft as React.FC<{ className?: string }>,
    },
    Revision: {
        dotBg: 'bg-purple-500',
        cardBorder: 'border-l-purple-500',
        cardBg: 'bg-purple-50/50 dark:bg-purple-950/10',
        badgeCls:
            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        lineCls: 'bg-purple-300 dark:bg-purple-700',
        avatarBg: 'bg-purple-500',
        Icon: RefreshCw as React.FC<{ className?: string }>,
    },
    Skipped: {
        dotBg: 'bg-slate-400',
        cardBorder: 'border-l-slate-400',
        cardBg: '',
        badgeCls:
            'bg-slate-100 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        lineCls: 'bg-slate-200 dark:bg-slate-700',
        avatarBg: 'bg-slate-400',
        Icon: MinusCircle as React.FC<{ className?: string }>,
    },
    Completed: {
        dotBg: 'bg-blue-500',
        cardBorder: 'border-l-blue-500',
        cardBg: 'bg-blue-50/50 dark:bg-blue-950/10',
        badgeCls:
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        lineCls: 'bg-blue-300 dark:bg-blue-700',
        avatarBg: 'bg-blue-500',
        Icon: CheckCircle as React.FC<{ className?: string }>,
    },
};

/** Default config for unknown statuses */
const DEFAULT_CFG: StatusConfig = {
    dotBg: 'bg-slate-400',
    cardBorder: 'border-l-slate-400',
    cardBg: '',
    badgeCls:
        'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    lineCls: 'bg-slate-200 dark:bg-slate-700',
    avatarBg: 'bg-slate-400',
    Icon: Info as React.FC<{ className?: string }>,
};

function getStatusConfig(status?: string | null): StatusConfig {
    if (!status) return DEFAULT_CFG;
    // Exact match first
    if (STATUS_CONFIG[status]) return STATUS_CONFIG[status];
    // Case-insensitive fallback
    const key = Object.keys(STATUS_CONFIG).find(
        (k) => k.toLowerCase() === status.toLowerCase()
    );
    return key ? STATUS_CONFIG[key] : DEFAULT_CFG;
}

// ── component ────────────────────────────────────────────────────────────────

export interface ApprovalTimelineProps {
    approvals: Approval[];
    loading?: boolean;
    /** Legacy prop — kept for backward compat, data fetching handled by parent */
    requestId?: string;
    onRefresh?: () => void;
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ approvals, loading }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-brand-sky-400 border-t-transparent animate-spin" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading approvals timeline...
                </p>
            </div>
        );
    }

    if (!approvals || approvals.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <Info className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    No approval records found for this request.
                </p>
            </div>
        );
    }

    return (
        <div className="relative px-1 py-2">
            {approvals.map((approval, index) => {
                const isLast = index === approvals.length - 1;
                const cfg = getStatusConfig(approval.status);
                const { Icon } = cfg;

                const stepLabel =
                    (approval as any).step_name_display ||
                    approval.step_name ||
                    approval.title ||
                    `Step ${index + 1}`;

                const approverName =
                    approval.approver_name || approval.created_name || null;
                const roleName = approval.approver_role_name || null;
                const displayDate =
                    approval.action_date || approval.updated_at || approval.created_at || null;
                const initials = getInitials(approverName);
                const stepNum = approval.sequence ?? index + 1;

                return (
                    <div key={approval.id || index} className="relative flex gap-4">
                        {/* ── Left col: dot + connecting line ── */}
                        <div className="flex flex-col items-center flex-shrink-0 w-8">
                            {/* Status dot */}
                            <div
                                className={`
                                    relative z-10 flex items-center justify-center
                                    w-8 h-8 rounded-full shadow-md flex-shrink-0
                                    ${cfg.dotBg}
                                    ${cfg.pulse
                                        ? 'ring-2 ring-amber-300 ring-offset-2 dark:ring-amber-600 dark:ring-offset-slate-900'
                                        : ''}
                                `}
                            >
                                <Icon className="h-4 w-4 text-white" />
                                {cfg.pulse && (
                                    <span className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-25" />
                                )}
                            </div>
                            {/* Connector line */}
                            {!isLast && (
                                <div
                                    className={`w-0.5 flex-1 my-1 ${cfg.lineCls}`}
                                    style={{ minHeight: '1.5rem' }}
                                />
                            )}
                        </div>

                        {/* ── Right col: card ── */}
                        <div
                            className={`
                                flex-1 mb-5 rounded-xl border border-l-4 shadow-sm overflow-hidden
                                ${cfg.cardBorder}
                                ${cfg.cardBg}
                                bg-white dark:bg-slate-800/70
                                border-slate-200 dark:border-slate-700
                            `}
                        >
                            {/* Card header */}
                            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
                                <div className="flex items-center gap-2 min-w-0">
                                    {/* Step number chip */}
                                    <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 font-mono">
                                        {stepNum}
                                    </span>
                                    {/* Step name */}
                                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                                        {stepLabel}
                                    </h4>
                                </div>
                                {/* Status badge — same colors as Case History table */}
                                <Badge
                                    variant="outline"
                                    className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-2.5 py-0.5 font-medium ${cfg.badgeCls}`}
                                >
                                    <Icon className="h-3 w-3" />
                                    {approval.status}
                                </Badge>
                            </div>

                            {/* Card body */}
                            <div className="px-4 py-3 space-y-3">
                                {/* Approver info row */}
                                {approverName ? (
                                    <div className="flex items-center gap-3">
                                        {/* Initials avatar */}
                                        <div
                                            className={`
                                                flex-shrink-0 w-9 h-9 rounded-full
                                                flex items-center justify-center
                                                text-xs font-bold text-white select-none
                                                ${cfg.avatarBg}
                                            `}
                                        >
                                            {initials}
                                        </div>
                                        {/* Name + role */}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate">
                                                {approverName}
                                            </p>
                                            {roleName && (
                                                <span className="inline-block mt-0.5 text-[11px] leading-none text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded px-1.5 py-0.5">
                                                    {roleName}
                                                </span>
                                            )}
                                        </div>
                                        {/* Date — pushed to right */}
                                        {displayDate && (
                                            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0 whitespace-nowrap">
                                                <CalendarDays className="h-3 w-3" />
                                                <span>{formatDate(displayDate)}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Date only when no approver */
                                    displayDate && (
                                        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                                            <CalendarDays className="h-3 w-3" />
                                            <span>{formatDate(displayDate)}</span>
                                        </div>
                                    )
                                )}

                                {/* Remarks */}
                                {approval.remarks && (
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/50 px-3 py-2.5">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <MessageSquare className="h-3 w-3 text-slate-400" />
                                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                                Remarks
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                            {approval.remarks}
                                        </p>
                                    </div>
                                )}

                                {/* Pending: awaiting message */}
                                {approval.status === 'Pending' && !approval.remarks && (
                                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                                        <Clock className="h-3 w-3 animate-pulse" />
                                        <span>Awaiting action</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
