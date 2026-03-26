'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPettyCashBoxes,
    createPettyCashBox,
    topUpPettyCash,
    selectPettyCashList,
    selectPettyCashLoading,
    selectPettyCashPagination,
} from '@/stores/slices/petty-cash';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import type { PettyCashBox } from '@/stores/types/financial-disbursements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, RefreshCw, Wallet } from 'lucide-react';

export default function PettyCashPage() {
    const dispatch = useDispatch<AppDispatch>();
    const list = useSelector(selectPettyCashList);
    const loading = useSelector(selectPettyCashLoading);
    const pagination = useSelector(selectPettyCashPagination);
    const projects = useSelector(selectProjects);

    const [page, setPage] = useState(1);
    const [createOpen, setCreateOpen] = useState(false);
    const [topUpOpen, setTopUpOpen] = useState<PettyCashBox | null>(null);
    const [name, setName] = useState('');
    const [projectId, setProjectId] = useState('');
    const [currency, setCurrency] = useState('IQD');
    const [topUpAmount, setTopUpAmount] = useState('');

    useEffect(() => {
        dispatch(fetchProjects({ page: 1, limit: 300 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchPettyCashBoxes({ page, per_page: 20 }));
    }, [dispatch, page]);

    const columns: Column<PettyCashBox>[] = [
        { key: 'name', header: 'Name', render: (v) => String(v ?? '') },
        { key: 'project_id', header: 'Project', render: (v) => String(v ?? '—') },
        { key: 'currency', header: 'CCY', render: (v) => String(v ?? '') },
        {
            key: 'balance',
            header: 'Balance',
            render: (v) => <span className="font-mono">{String(v ?? '—')}</span>,
        },
    ];

    const actions: Action<PettyCashBox>[] = [
        {
            label: 'Top up',
            icon: <Wallet className="h-4 w-4" />,
            variant: 'default',
            onClick: (row) => {
                setTopUpOpen(row);
                setTopUpAmount('');
            },
        },
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex justify-between items-end flex-wrap gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Petty cash</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Cash boxes per project</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => dispatch(fetchPettyCashBoxes({ page, per_page: 20 }))}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button className="bg-sky-600 text-white" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New box
                    </Button>
                </div>
            </div>

            <EnhancedCard title="Boxes" description={pagination ? `${pagination.total} total` : ''} variant="default" size="sm">
                <EnhancedDataTable
                    data={list}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={
                        pagination
                            ? {
                                  currentPage: pagination.current_page,
                                  totalPages: pagination.last_page,
                                  pageSize: pagination.per_page,
                                  totalItems: pagination.total,
                                  onPageChange: setPage,
                              }
                            : undefined
                    }
                    noDataMessage="No petty cash boxes"
                />
            </EnhancedCard>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create petty cash box</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <div>
                            <Label>Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <Label>Project *</Label>
                            <select
                                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-slate-900"
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                            >
                                <option value="">Select…</option>
                                {(projects || []).map((p) => (
                                    <option key={String(p.id)} value={String(p.id)}>
                                        {p.name ?? p.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Currency *</Label>
                            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-sky-600 text-white"
                            onClick={async () => {
                                if (!name.trim() || !projectId || !currency.trim()) {
                                    toast.error('Fill required fields');
                                    return;
                                }
                                try {
                                    await dispatch(
                                        createPettyCashBox({ name: name.trim(), project_id: projectId, currency: currency.trim() })
                                    ).unwrap();
                                    toast.success('Created');
                                    setCreateOpen(false);
                                    setName('');
                                    setProjectId('');
                                    dispatch(fetchPettyCashBoxes({ page, per_page: 20 }));
                                } catch (e: any) {
                                    toast.error(e?.message || 'Failed');
                                }
                            }}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!topUpOpen} onOpenChange={(o) => !o && setTopUpOpen(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Top up</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Label>Amount *</Label>
                        <Input type="number" step="any" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTopUpOpen(null)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!topUpOpen || !topUpAmount) return;
                                try {
                                    await dispatch(
                                        topUpPettyCash({ id: topUpOpen.id, amount: Number(topUpAmount) })
                                    ).unwrap();
                                    toast.success('Top-up recorded');
                                    setTopUpOpen(null);
                                    dispatch(fetchPettyCashBoxes({ page, per_page: 20 }));
                                } catch (e: any) {
                                    toast.error(e?.message || 'Failed');
                                }
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
