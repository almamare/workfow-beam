'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDisbursements,
    selectDisbursementsList,
    selectDisbursementsPagination,
    selectDisbursementsLoading,
} from '@/stores/slices/financial-disbursements';
import type { Disbursement } from '@/stores/types/financial-disbursements';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, Inbox, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected', 'Paid', 'Cancelled'];
const SOURCE_OPTIONS = ['Bank', 'Sarraf', 'Petty_Cash'];

export default function DisbursementsListPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const list = useSelector(selectDisbursementsList);
    const pagination = useSelector(selectDisbursementsPagination);
    const loading = useSelector(selectDisbursementsLoading);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [status, setStatus] = useState<string>('All');
    const [paymentSource, setPaymentSource] = useState<string>('All');
    const [projectId, setProjectId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        dispatch(
            fetchDisbursements({
                page,
                per_page: perPage,
                project_id: projectId.trim() || undefined,
                status: status !== 'All' ? status : undefined,
                payment_source: paymentSource !== 'All' ? paymentSource : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            })
        );
    }, [dispatch, page, perPage, status, paymentSource, projectId, dateFrom, dateTo]);

    const columns: Column<Disbursement>[] = useMemo(
        () => [
            {
                key: 'id',
                header: 'ID',
                render: (v: unknown) => <span className="font-mono text-xs">{String(v ?? '')}</span>,
            },
            {
                key: 'project_id',
                header: 'Project',
                render: (v: unknown) => <span className="text-slate-700 dark:text-slate-300">{String(v ?? '—')}</span>,
            },
            {
                key: 'payment_source',
                header: 'Source',
                render: (v: unknown) => <Badge variant="outline">{String(v ?? '')}</Badge>,
            },
            {
                key: 'currency',
                header: 'CCY',
                render: (v: unknown) => <span className="font-mono">{String(v ?? '')}</span>,
            },
            {
                key: 'amount',
                header: 'Amount',
                render: (v: unknown) => <span className="font-mono text-right">{Number(v ?? 0).toLocaleString()}</span>,
            },
            {
                key: 'status',
                header: 'Status',
                render: (v: unknown) => <Badge variant="outline">{String(v ?? '')}</Badge>,
            },
            {
                key: 'created_at',
                header: 'Created',
                render: (v: unknown) => (
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {v ? String(v).slice(0, 16) : '—'}
                    </span>
                ),
            },
        ],
        []
    );

    const actions: Action<Disbursement>[] = [
        {
            label: 'Open',
            icon: <Eye className="h-4 w-4" />,
            variant: 'info',
            onClick: (row) => router.push(`/financial/disbursements/${row.id}`),
        },
    ];

    const totalPages = pagination?.last_page ?? 1;
    const totalItems = pagination?.total ?? list.length;

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Disbursements</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Project payment requests (Bank / Sarraf / Petty cash)</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => router.push('/financial/disbursements/inbox')}>
                        <Inbox className="h-4 w-4 mr-2" />
                        My queue
                    </Button>
                    <Button onClick={() => router.push('/financial/disbursements/new')} className="bg-sky-600 hover:bg-sky-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        New disbursement
                    </Button>
                </div>
            </div>

            <FilterBar
                searchPlaceholder="Filter by project ID…"
                searchValue={projectId}
                onSearchChange={(v) => {
                    setProjectId(v);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'status',
                        label: 'Status',
                        value: status,
                        options: [{ key: 'All', value: 'All', label: 'All' }, ...STATUS_OPTIONS.map((s) => ({ key: s, value: s, label: s }))],
                        onValueChange: (v) => {
                            setStatus(v);
                            setPage(1);
                        },
                    },
                    {
                        key: 'src',
                        label: 'Source',
                        value: paymentSource,
                        options: [{ key: 'All', value: 'All', label: 'All' }, ...SOURCE_OPTIONS.map((s) => ({ key: s, value: s, label: s }))],
                        onValueChange: (v) => {
                            setPaymentSource(v);
                            setPage(1);
                        },
                    },
                ]}
                activeFilters={[]}
                onClearFilters={() => {
                    setStatus('All');
                    setPaymentSource('All');
                    setProjectId('');
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                }}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            dispatch(fetchDisbursements({
                                page,
                                per_page: perPage,
                                project_id: projectId.trim() || undefined,
                                status: status !== 'All' ? status : undefined,
                                payment_source: paymentSource !== 'All' ? paymentSource : undefined,
                                date_from: dateFrom || undefined,
                                date_to: dateTo || undefined,
                            }))
                                .unwrap()
                                .then(() => toast.success('Refreshed'))
                                .catch((e) => toast.error(e || 'Failed'))
                        }
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                }
            />

            <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Date from</label>
                    <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="w-40" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Date to</label>
                    <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="w-40" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Per page</label>
                    <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {[10, 15, 25, 50].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <EnhancedCard title="Disbursements" description={`${totalItems} total`} variant="default" size="sm">
                <EnhancedDataTable
                    data={list}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages || 1,
                        pageSize: perPage,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No disbursements found"
                />
            </EnhancedCard>
        </div>
    );
}
