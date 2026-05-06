'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjectContract,
    selectSelectedProjectContract,
    selectProjectContractsLoading,
    clearSelectedProjectContract,
    deleteProjectContract,
} from '@/stores/slices/project-contracts';
import { Badge } from '@/components/ui/badge';
import { approvalBadgeVariant } from '@/lib/project-contract-badges';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProjectContract } from '@/stores/types/project-contracts';

function fmtDate(s?: string | null) {
    if (!s) return '—';
    try {
        return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return s;
    }
}

function fmtMoney(v: string | number, c: string) {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (Number.isNaN(n)) return `0 ${c}`;
    return `${new Intl.NumberFormat('en-US').format(n)} ${c}`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-slate-600 dark:text-slate-400">{label}</span>
            <span className="text-slate-900 dark:text-slate-100 text-right">{value ?? '—'}</span>
        </div>
    );
}

function DetailsInner() {
    const params = useSearchParams();
    const router = useRouter();
    const contractId = params.get('id') || '';
    const dispatch = useDispatch<AppDispatch>();
    const contract = useSelector(selectSelectedProjectContract);
    const loading = useSelector(selectProjectContractsLoading);
    const [delOpen, setDelOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        if (!contractId) {
            router.push('/project-contracts');
            return;
        }
        try {
            await dispatch(fetchProjectContract(contractId)).unwrap();
        } catch (e) {
            toast.error(typeof e === 'string' ? e : 'Failed to load');
            router.push('/project-contracts');
        }
    }, [contractId, dispatch, router]);

    useEffect(() => {
        load();
        return () => {
            dispatch(clearSelectedProjectContract());
        };
    }, [load, dispatch]);

    const onDelete = async () => {
        if (!contract) return;
        setDeleting(true);
        try {
            await dispatch(deleteProjectContract(contract.id)).unwrap();
            toast.success('Deleted');
            router.push('/project-contracts');
        } catch (e) {
            toast.error(typeof e === 'string' ? e : 'Delete failed');
        } finally {
            setDeleting(false);
            setDelOpen(false);
        }
    };

    if (loading || !contract) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500">Loading…</p>
            </div>
        );
    }

    const p = contract as ProjectContract;
    const proj = p.project as { name?: string; number?: string } | undefined;
    const cli = p.client as { name?: string; client_no?: string } | undefined;

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{p.title}</h1>
                    <p className="text-slate-500 font-mono text-sm mt-1">{p.contract_no}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/project-contracts')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        List
                    </Button>
                    {p.approval_status !== 'Approved' && (
                        <>
                            <Button variant="outline" onClick={() => router.push(`/project-contracts/update?id=${p.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="destructive" onClick={() => setDelOpen(true)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <EnhancedCard title="Summary" size="sm">
                    <Row label="Project" value={proj?.name || p.project_name || p.project_id} />
                    <Row label="Project ref" value={proj?.number || p.project_number || '—'} />
                    <Row label="Client" value={cli?.name || p.client_name || '—'} />
                    <Row label="Type" value={p.contract_type} />
                    <Row
                        label="Status"
                        value={
                            <Badge variant="outline" className="font-normal">
                                {p.status}
                            </Badge>
                        }
                    />
                    <Row
                        label="Approval"
                        value={
                            <Badge variant={approvalBadgeVariant(p.approval_status)} className="font-normal">
                                {p.approval_status}
                            </Badge>
                        }
                    />
                    <Row label="Value" value={fmtMoney(p.contract_value, p.currency)} />
                    <Row label="Contract date" value={fmtDate(p.contract_date)} />
                    <Row label="Start" value={fmtDate(p.start_date)} />
                    <Row label="End" value={fmtDate(p.end_date)} />
                </EnhancedCard>
                <EnhancedCard title="Terms & notes" size="sm">
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Description</span>
                            <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{p.description || '—'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Scope</span>
                            <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{p.scope || '—'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Payment terms</span>
                            <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{p.payment_terms || '—'}</p>
                        </div>
                        <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Notes</span>
                            <p className="mt-1 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{p.notes || '—'}</p>
                        </div>
                    </div>
                </EnhancedCard>
            </div>

            <Dialog open={delOpen} onOpenChange={setDelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete contract?</DialogTitle>
                        <DialogDescription>This cannot be undone for non-approved records.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDelOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={onDelete} disabled={deleting}>
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ProjectContractDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            }
        >
            <DetailsInner />
        </Suspense>
    );
}
