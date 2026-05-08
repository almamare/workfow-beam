'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchDisbursementDetail,
    submitDisbursement,
    approveDisbursement,
    rejectDisbursement,
    payDisbursement,
    deleteDisbursement,
    clearSelected,
    selectDisbursementDetail,
    selectDisbursementDetailLoading,
} from '@/stores/slices/financial-disbursements';
import type { Disbursement } from '@/stores/types/financial-disbursements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Send, CheckCircle, XCircle, Banknote } from 'lucide-react';
import { toast } from 'sonner';

function DisbursementDetailInner() {
    const params = useParams();
    const id = typeof params?.id === 'string' ? params.id : '';
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const d = useSelector(selectDisbursementDetail) as Disbursement | null;
    const loading = useSelector(selectDisbursementDetailLoading);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approveOpen, setApproveOpen] = useState(false);
    const [approveRemarks, setApproveRemarks] = useState('');
    const [payOpen, setPayOpen] = useState(false);
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentDate, setPaymentDate] = useState('');

    useEffect(() => {
        if (id) dispatch(fetchDisbursementDetail(id));
        return () => {
            dispatch(clearSelected());
        };
    }, [dispatch, id]);

    const status = d?.status;
    const canDelete = status === 'Draft' || status === 'Cancelled';
    const canSubmit = status === 'Draft';
    const canApproveReject = status === 'Submitted' || status === 'Under_Review';
    const canPay = status === 'Approved';

    const run = async (fn: () => Promise<unknown>, ok: string) => {
        try {
            await fn();
            toast.success(ok);
            if (id) await dispatch(fetchDisbursementDetail(id)).unwrap();
        } catch (e: any) {
            const msg = typeof e === 'string' ? e : e?.message || 'Action failed';
            toast.error(msg);
            if (String(msg).includes('403') || msg.toLowerCase().includes('forbidden')) {
                toast.info('Your role may not allow this action, or you cannot approve your own request.');
            }
        }
    };

    if (!id) return <p className="p-6">Invalid id</p>;

    if (loading && !d) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-brand-sky-500" />
            </div>
        );
    }

    if (!d) {
        return (
            <div className="p-6 space-y-2">
                <p>Disbursement not found.</p>
                <Button variant="outline" onClick={() => router.push('/financial/disbursements')}>
                    Back to list
                </Button>
            </div>
        );
    }

    const lineItems = Array.isArray(d.line_items) ? d.line_items : [];
    const approvals = Array.isArray(d.approvals) ? d.approvals : [];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Disbursement {d.id}</h1>
                    <div className="flex gap-2 mt-2 items-center flex-wrap">
                        <Badge variant="outline">{d.status}</Badge>
                        <Badge variant="outline">{d.payment_source}</Badge>
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                            {d.currency} {Number(d.amount ?? 0).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" onClick={() => router.push('/financial/disbursements')}>
                        List
                    </Button>
                    {d.project_id && (
                        <Button variant="outline" onClick={() => router.push(`/projects/details?id=${d.project_id}`)}>
                            Project
                        </Button>
                    )}
                    {canDelete && (
                        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    {canSubmit && (
                        <Button
                            className="bg-brand-sky-600 text-white"
                            onClick={() =>
                                run(() => dispatch(submitDisbursement(id)).unwrap(), 'Submitted for approval')
                            }
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Submit
                        </Button>
                    )}
                    {canApproveReject && (
                        <>
                            <Button className="bg-emerald-600 text-white" onClick={() => setApproveOpen(true)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </>
                    )}
                    {canPay && (
                        <Button className="bg-amber-600 text-white" onClick={() => setPayOpen(true)}>
                            <Banknote className="h-4 w-4 mr-2" />
                            Mark paid
                        </Button>
                    )}
                </div>
            </div>

            <EnhancedCard title="Details" variant="default" size="sm">
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                        <dt className="text-slate-500">Project</dt>
                        <dd className="font-medium">{String(d.project_id ?? '—')}</dd>
                    </div>
                    <div>
                        <dt className="text-slate-500">Source ref</dt>
                        <dd className="font-mono">{String(d.source_ref_id ?? '—')}</dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-slate-500">Purpose</dt>
                        <dd>{String(d.purpose ?? '—')}</dd>
                    </div>
                </dl>
            </EnhancedCard>

            {lineItems.length > 0 && (
                <EnhancedCard title="Line items" variant="default" size="sm">
                    <div className="overflow-x-auto text-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Description</th>
                                    <th className="text-right">Qty</th>
                                    <th className="text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lineItems.map((row: Record<string, unknown>, i: number) => (
                                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="py-2">{String(row.description ?? '')}</td>
                                        <td className="text-right">{String(row.quantity ?? '')}</td>
                                        <td className="text-right font-mono">{String(row.total ?? '')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </EnhancedCard>
            )}

            {approvals.length > 0 && (
                <EnhancedCard title="Approval chain" variant="default" size="sm">
                    <ul className="space-y-2 text-sm">
                        {approvals.map((a: Record<string, unknown>, i: number) => (
                            <li key={i} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-900/40">
                                <div className="font-medium">{String(a.role ?? a.status ?? 'Step')}</div>
                                <div className="text-slate-600 dark:text-slate-400">{String(a.remarks ?? a.reason ?? '')}</div>
                                <div className="text-xs text-slate-500">{String(a.decided_at ?? '')}</div>
                            </li>
                        ))}
                    </ul>
                </EnhancedCard>
            )}

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete disbursement?</AlertDialogTitle>
                        <AlertDialogDescription>Only draft or cancelled requests can be removed. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600"
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(deleteDisbursement(id))
                                    .unwrap()
                                    .then(() => {
                                        toast.success('Deleted');
                                        router.push('/financial/disbursements');
                                    })
                                    .catch((err) => toast.error(err || 'Failed'));
                                setDeleteOpen(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve step</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Remarks (optional)</Label>
                        <Textarea value={approveRemarks} onChange={(e) => setApproveRemarks(e.target.value)} rows={3} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-600 text-white"
                            onClick={async () => {
                                await run(
                                    () => dispatch(approveDisbursement({ id, remarks: approveRemarks })).unwrap(),
                                    'Approved'
                                );
                                setApproveOpen(false);
                                setApproveRemarks('');
                            }}
                        >
                            Confirm approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label>Reason *</Label>
                        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} required />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={!rejectReason.trim()}
                            onClick={async () => {
                                await run(
                                    () => dispatch(rejectDisbursement({ id, reason: rejectReason.trim() })).unwrap(),
                                    'Rejected'
                                );
                                setRejectOpen(false);
                                setRejectReason('');
                            }}
                        >
                            Confirm reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record payment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <div>
                            <Label>Payment reference *</Label>
                            <Input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
                        </div>
                        <div>
                            <Label>Payment date *</Label>
                            <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPayOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-amber-600 text-white"
                            disabled={!paymentRef.trim() || !paymentDate}
                            onClick={async () => {
                                await run(
                                    () =>
                                        dispatch(
                                            payDisbursement({ id, payment_ref: paymentRef.trim(), payment_date: paymentDate })
                                        ).unwrap(),
                                    'Marked as paid'
                                );
                                setPayOpen(false);
                                setPaymentRef('');
                                setPaymentDate('');
                            }}
                        >
                            Confirm payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function DisbursementDetailPage() {
    return (
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin m-10" />}>
            <DisbursementDetailInner />
        </Suspense>
    );
}
