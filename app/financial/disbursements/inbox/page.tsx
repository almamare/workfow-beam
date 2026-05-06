'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPendingMyAction,
    selectPendingDisbursements,
    selectPendingDisbursementsLoading,
    selectPendingDisbursementsPagination,
} from '@/stores/slices/financial-disbursements';
import type { Disbursement } from '@/stores/types/financial-disbursements';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function DisbursementsInboxPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const list = useSelector(selectPendingDisbursements);
    const loading = useSelector(selectPendingDisbursementsLoading);
    const pagination = useSelector(selectPendingDisbursementsPagination);

    useEffect(() => {
        dispatch(fetchPendingMyAction({ page: 1, per_page: 50 }));
    }, [dispatch]);

    const columns: Column<Disbursement>[] = [
        { key: 'id', header: 'ID', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
        { key: 'project_id', header: 'Project', render: (v) => String(v ?? '—') },
        { key: 'amount', header: 'Amount', render: (v, row) => `${row.currency ?? ''} ${Number(v ?? 0).toLocaleString()}` },
        { key: 'status', header: 'Status', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
        { key: 'payment_source', header: 'Source', render: (v) => String(v ?? '') },
    ];

    const actions: Action<Disbursement>[] = [
        {
            label: 'Review',
            icon: <Eye className="h-4 w-4" />,
            variant: 'info',
            onClick: (row) => router.push(`/financial/disbursements/${row.id}`),
        },
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex justify-between items-end flex-wrap gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Awaiting my action</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Disbursements pending your approval step</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/financial/disbursements')}>
                        All disbursements
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            dispatch(fetchPendingMyAction({ page: 1, per_page: 50 }))
                                .unwrap()
                                .then(() => toast.success('Refreshed'))
                                .catch((e) => toast.error(e || 'Failed'))
                        }
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <EnhancedCard title="Queue" description={pagination ? `${pagination.total} item(s)` : ''} variant="default" size="sm">
                <EnhancedDataTable
                    data={list}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    noDataMessage="No items pending your action"
                />
            </EnhancedCard>
        </div>
    );
}
