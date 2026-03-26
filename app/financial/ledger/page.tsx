'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchFinancialLedger,
    selectFinancialLedgerItems,
    selectFinancialLedgerLoading,
    selectFinancialLedgerPagination,
} from '@/stores/slices/financial-ledger-api';
import type { LedgerEntry } from '@/stores/types/financial-disbursements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SOURCES = ['Bank', 'Sarraf', 'Petty_Cash'];

export default function FinancialLedgerPage() {
    const dispatch = useDispatch<AppDispatch>();
    const items = useSelector(selectFinancialLedgerItems);
    const loading = useSelector(selectFinancialLedgerLoading);
    const pagination = useSelector(selectFinancialLedgerPagination);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [projectId, setProjectId] = useState('');
    const [paymentSource, setPaymentSource] = useState<string>('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        dispatch(
            fetchFinancialLedger({
                page,
                per_page: perPage,
                project_id: projectId.trim() || undefined,
                payment_source: paymentSource !== 'All' ? paymentSource : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            })
        );
    }, [dispatch, page, perPage, projectId, paymentSource, dateFrom, dateTo]);

    const columns: Column<LedgerEntry>[] = [
        {
            key: 'id',
            header: 'Row',
            render: (_v, row) => (
                <pre className="text-xs max-w-2xl overflow-x-auto whitespace-pre-wrap font-mono text-slate-700 dark:text-slate-300">
                    {JSON.stringify(row, null, 2)}
                </pre>
            ),
        },
    ];

    const totalPages = pagination?.last_page ?? 1;
    const totalItems = pagination?.total ?? items.length;

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex justify-between items-end flex-wrap gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Financial ledger</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Read-only ledger from API</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() =>
                        dispatch(
                            fetchFinancialLedger({
                                page,
                                per_page: perPage,
                                project_id: projectId.trim() || undefined,
                                payment_source: paymentSource !== 'All' ? paymentSource : undefined,
                                date_from: dateFrom || undefined,
                                date_to: dateTo || undefined,
                            })
                        )
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

            <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                    <Label className="text-xs">Project ID</Label>
                    <Input value={projectId} onChange={(e) => { setProjectId(e.target.value); setPage(1); }} className="w-40" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Payment source</Label>
                    <Select value={paymentSource} onValueChange={(v) => { setPaymentSource(v); setPage(1); }}>
                        <SelectTrigger className="w-40" />
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            {SOURCES.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
                </div>
            </div>

            <EnhancedCard title="Ledger entries" description={`${totalItems} rows`} variant="default" size="sm">
                <EnhancedDataTable
                    data={items}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages || 1,
                        pageSize: perPage,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No ledger entries"
                />
            </EnhancedCard>
        </div>
    );
}
