'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchApprovalHistory,
    selectHistoryItems,
    selectHistoryLoading,
    selectHistoryTotal,
    selectHistoryPages,
    selectHistoryError,
} from '@/stores/slices/approvals';
import type { ApprovalHistoryItem } from '@/stores/slices/approvals';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import {
    History, RefreshCw, FileSpreadsheet,
    CheckCircle, XCircle, Clock, FileText,
    FolderOpen, Building, DollarSign, Shield, User,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
    Approved:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200',
    Rejected:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200',
    Pending:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200',
    Cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
    Client:          <Building className="h-4 w-4" />,
    Project:         <FolderOpen className="h-4 w-4" />,
    Task:            <FileText className="h-4 w-4" />,
    Financial:       <DollarSign className="h-4 w-4" />,
    Employment:      <User className="h-4 w-4" />,
    ProjectContracts:<Shield className="h-4 w-4" />,
};

const TYPE_COLORS: Record<string, string> = {
    Client:          'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200',
    Project:         'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200',
    Task:            'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200',
    Financial:       'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200',
    Employment:      'bg-brand-sky-50 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200',
    ProjectContracts:'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200',
};

function fmtDate(d?: string) {
    if (!d) return '—';
    try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return d; }
}

function escapeCsv(v: any) {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export default function HistoryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const items   = useSelector(selectHistoryItems);
    const loading = useSelector(selectHistoryLoading);
    const total   = useSelector(selectHistoryTotal);
    const pages   = useSelector(selectHistoryPages);
    const error   = useSelector(selectHistoryError);

    const [page, setPage]   = useState(1);
    const [limit, setLimit] = useState(15);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting]   = useState(false);

    useEffect(() => { if (error) toast.error(error); }, [error]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = `${page}-${limit}`;
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchApprovalHistory({ page, limit }));
    }, [dispatch, page, limit]);

    const filtered = statusFilter === 'All'
        ? items
        : items.filter(i => i.status === statusFilter);

    const refresh = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchApprovalHistory({ page, limit })).unwrap();
            toast.success('History refreshed');
        } catch { toast.error('Refresh failed'); }
        finally { setIsRefreshing(false); }
    };

    const exportCsv = () => {
        setIsExporting(true);
        try {
            const headers = ['ID', 'Request ID', 'Request Type', 'Step', 'Status', 'Remarks', 'Action Date'];
            const rows = filtered.map(i => [
                i.id, i.request_id, escapeCsv(i.request_type), escapeCsv(i.step_name),
                i.status, escapeCsv(i.remarks ?? ''), fmtDate(i.action_date),
            ].join(','));
            const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `approval_history_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(a.href);
            toast.success('Exported');
        } catch { toast.error('Export failed'); }
        finally { setIsExporting(false); }
    };

    const columns: Column<ApprovalHistoryItem>[] = [
        {
            key: 'request_type' as keyof ApprovalHistoryItem,
            header: 'Type',
            render: (v: any) => (
                <Badge variant="outline" className={TYPE_COLORS[v] || 'bg-slate-100 text-slate-700 border-slate-200'}>
                    <span className="mr-1 inline-flex items-center">{TYPE_ICONS[v] ?? <Shield className="h-3.5 w-3.5" />}</span>
                    {v}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'request_id' as keyof ApprovalHistoryItem,
            header: 'Request',
            render: (v: any) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{String(v).slice(0, 12)}…</span>,
            sortable: true,
        },
        {
            key: 'step_name' as keyof ApprovalHistoryItem,
            header: 'Step',
            render: (v: any, item: ApprovalHistoryItem) => (
                <div>
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{v}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Level {item.step_level} · {item.required_role}</div>
                </div>
            ),
            sortable: true,
        },
        {
            key: 'status' as keyof ApprovalHistoryItem,
            header: 'Decision',
            render: (v: any) => {
                const Icon = v === 'Approved' ? CheckCircle : v === 'Rejected' ? XCircle : Clock;
                return (
                    <Badge variant="outline" className={STATUS_COLORS[v] || 'bg-slate-100 text-slate-700 border-slate-200'}>
                        <Icon className="h-3.5 w-3.5 mr-1" />
                        {v}
                    </Badge>
                );
            },
            sortable: true,
        },
        {
            key: 'remarks' as keyof ApprovalHistoryItem,
            header: 'Remarks',
            render: (v: any) => <span className="text-sm text-slate-600 dark:text-slate-400">{v || '—'}</span>,
            sortable: false,
        },
        {
            key: 'action_date' as keyof ApprovalHistoryItem,
            header: 'Action Date',
            render: (v: any) => <span className="text-sm text-slate-500 dark:text-slate-400">{fmtDate(v)}</span>,
            sortable: true,
        },
    ];

    const approvedCount = items.filter(i => i.status === 'Approved').length;
    const rejectedCount = items.filter(i => i.status === 'Rejected').length;
    const pendingCount  = items.filter(i => i.status === 'Pending').length;

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                        <History className="h-8 w-8 text-brand-sky-500" />
                        Approval History
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Your approval actions and decisions</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50">
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCsv} disabled={isExporting}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Total Records" description="In current page" variant="default" size="sm"
                    stats={{ total, badge: 'Total', badgeColor: 'default' }}><></></EnhancedCard>
                <EnhancedCard title="Approved" description="Decisions approved" variant="default" size="sm"
                    stats={{ total: approvedCount, badge: 'Approved', badgeColor: 'success' }}><></></EnhancedCard>
                <EnhancedCard title="Rejected" description="Decisions rejected" variant="default" size="sm"
                    stats={{ total: rejectedCount, badge: 'Rejected', badgeColor: 'error' }}><></></EnhancedCard>
                <EnhancedCard title="Pending" description="Awaiting decision" variant="default" size="sm"
                    stats={{ total: pendingCount, badge: 'Pending', badgeColor: 'warning' }}><></></EnhancedCard>
            </div>

            <EnhancedCard
                title="Approval Records"
                description={`${total} record${total !== 1 ? 's' : ''}`}
                variant="default"
                size="sm"
                headerActions={
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v)}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={String(limit)} onValueChange={v => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Per page" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 15, 25, 50].map(n => (
                                    <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            >
                <EnhancedDataTable
                    data={filtered}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: pages || 1,
                        pageSize: limit,
                        totalItems: total,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No approval history found. Approval records appear here after you act on requests."
                />
            </EnhancedCard>
        </div>
    );
}
