'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchContractorPayment,
    updateContractorPayment,
    deleteContractorPayment,
    clearSelectedPayment,
    selectSelectedContractorPayment,
    selectContractorPaymentsLoading,
    selectContractorPaymentsSubmitting,
} from '@/stores/slices/contractor-payments';
import type { ContractorPayment } from '@/stores/types/contractor-payments';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2, Trash2, Send, CheckCircle, XCircle, Banknote,
    SquarePen, ArrowLeft, CreditCard, Calendar, Building2,
    FileText, Hash, Globe, BadgeDollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
    Submitted: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    Approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    Paid: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700',
    Cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600',
};

function fmt(n: number | string | undefined) {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="mt-0.5 text-slate-400 dark:text-slate-500 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-800 dark:text-slate-200">{value || '—'}</dd>
            </div>
        </div>
    );
}

function ContractorPaymentDetailInner() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const payment = useSelector(selectSelectedContractorPayment) as ContractorPayment | null;
    const loading = useSelector(selectContractorPaymentsLoading);
    const submitting = useSelector(selectContractorPaymentsSubmitting);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [payOpen, setPayOpen] = useState(false);
    const [payRef, setPayRef] = useState('');
    const [payDate, setPayDate] = useState('');

    useEffect(() => {
        if (id) dispatch(fetchContractorPayment(id));
        return () => { dispatch(clearSelectedPayment()); };
    }, [dispatch, id]);

    const reload = async () => {
        if (id) await dispatch(fetchContractorPayment(id)).unwrap();
    };

    const runUpdate = async (payload: object, successMsg: string) => {
        try {
            await dispatch(updateContractorPayment({ paymentId: id, payload })).unwrap();
            toast.success(successMsg);
            await reload();
        } catch (e: any) {
            toast.error(typeof e === 'string' ? e : e?.message || 'Action failed');
        }
    };

    if (!id) return <p className="p-6 text-slate-500">Invalid payment ID.</p>;

    if (loading && !payment) {
        return (
            <div className="flex justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="p-6 space-y-3">
                <p className="text-slate-600 dark:text-slate-400">Payment not found.</p>
                <Button variant="outline" onClick={() => router.push('/financial/contractor-payments')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to list
                </Button>
            </div>
        );
    }

    const s = payment.status;
    const canEdit = s === 'Draft';
    const canSubmit = s === 'Draft';
    const canApproveReject = s === 'Submitted';
    const canPay = s === 'Approved';
    const canCancel = s === 'Draft' || s === 'Submitted';
    const canDelete = s === 'Draft' || s === 'Cancelled';

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Payment {payment.payment_no}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className={STATUS_COLORS[s] || ''}>
                            {s}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200">
                            {payment.payment_method}
                        </Badge>
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                            {payment.currency} {fmt(payment.amount)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/financial/contractor-payments')}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        List
                    </Button>
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300"
                            onClick={() => router.push(`/financial/contractor-payments/update?id=${payment.payment_id}`)}
                        >
                            <SquarePen className="h-4 w-4 mr-1.5" />
                            Edit
                        </Button>
                    )}
                    {canSubmit && (
                        <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setSubmitOpen(true)}>
                            <Send className="h-4 w-4 mr-1.5" />
                            Submit
                        </Button>
                    )}
                    {canApproveReject && (
                        <>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setApproveOpen(true)}>
                                <CheckCircle className="h-4 w-4 mr-1.5" />
                                Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Reject
                            </Button>
                        </>
                    )}
                    {canPay && (
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setPayOpen(true)}>
                            <Banknote className="h-4 w-4 mr-1.5" />
                            Mark Paid
                        </Button>
                    )}
                    {canCancel && (
                        <Button size="sm" variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => setCancelOpen(true)}>
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Cancel
                        </Button>
                    )}
                    {canDelete && (
                        <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-1.5" />
                            Delete
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Payment Info */}
                <EnhancedCard title="Payment Information" variant="default" size="sm">
                    <dl>
                        <DetailRow icon={<Hash className="h-4 w-4" />} label="Payment Number" value={<span className="font-mono">{payment.payment_no}</span>} />
                        <DetailRow icon={<BadgeDollarSign className="h-4 w-4" />} label="Amount" value={
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                {payment.currency} {fmt(payment.amount)}
                            </span>
                        } />
                        {payment.currency !== 'IQD' && (
                            <DetailRow icon={<Globe className="h-4 w-4" />} label="Local Amount (IQD)" value={
                                <span className="font-medium">IQD {fmt(payment.amount_local)} <span className="text-xs text-slate-400">(rate: {payment.exchange_rate})</span></span>
                            } />
                        )}
                        <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Payment Method" value={payment.payment_method} />
                        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Payment Date" value={payment.payment_date} />
                        {payment.payment_ref && (
                            <DetailRow icon={<FileText className="h-4 w-4" />} label="Reference" value={<span className="font-mono text-xs">{payment.payment_ref}</span>} />
                        )}
                        <DetailRow icon={<FileText className="h-4 w-4" />} label="Purpose" value={payment.purpose} />
                        {payment.notes && (
                            <DetailRow icon={<FileText className="h-4 w-4" />} label="Notes" value={<span className="whitespace-pre-wrap">{payment.notes}</span>} />
                        )}
                    </dl>
                </EnhancedCard>

                {/* Parties */}
                <EnhancedCard title="Parties & Project" variant="default" size="sm">
                    <dl>
                        <DetailRow icon={<Building2 className="h-4 w-4" />} label="Contractor" value={
                            <div>
                                <div className="font-semibold">{payment.contractor_name || '—'}</div>
                                {payment.contractor_phone && <div className="text-xs text-slate-500">{payment.contractor_phone}</div>}
                                {payment.contractor_email && <div className="text-xs text-slate-500">{payment.contractor_email}</div>}
                            </div>
                        } />
                        <DetailRow icon={<Building2 className="h-4 w-4" />} label="Project" value={payment.project_name || '—'} />
                        <DetailRow icon={<Hash className="h-4 w-4" />} label="Contractor ID" value={<span className="font-mono text-xs">{payment.contractor_id}</span>} />
                        {payment.project_id && (
                            <DetailRow icon={<Hash className="h-4 w-4" />} label="Project ID" value={
                                <button
                                    className="font-mono text-xs text-sky-600 hover:underline"
                                    onClick={() => router.push(`/projects/details?id=${payment.project_id}`)}
                                >
                                    {payment.project_id}
                                </button>
                            } />
                        )}
                    </dl>
                </EnhancedCard>

                {/* Metadata */}
                <EnhancedCard title="Record Info" variant="default" size="sm">
                    <dl>
                        <DetailRow icon={<Hash className="h-4 w-4" />} label="Payment ID" value={<span className="font-mono text-xs">{payment.payment_id}</span>} />
                        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Created At" value={payment.created_at} />
                        <DetailRow icon={<Calendar className="h-4 w-4" />} label="Last Updated" value={payment.updated_at} />
                    </dl>
                </EnhancedCard>
            </div>

            {/* ── Dialogs ─────────────────────────────────────────────── */}

            {/* Submit */}
            <AlertDialog open={submitOpen} onOpenChange={setSubmitOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit for approval?</AlertDialogTitle>
                        <AlertDialogDescription>The payment will be sent for review and cannot be edited once submitted.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-sky-600 hover:bg-sky-700"
                            disabled={submitting}
                            onClick={async (e) => {
                                e.preventDefault();
                                await runUpdate({ status: 'Submitted' }, 'Submitted for approval');
                                setSubmitOpen(false);
                            }}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approve */}
            <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve payment?</AlertDialogTitle>
                        <AlertDialogDescription>Status will change to Approved and it can be marked as Paid.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-emerald-600 hover:bg-emerald-700"
                            disabled={submitting}
                            onClick={async (e) => {
                                e.preventDefault();
                                await runUpdate({ status: 'Approved' }, 'Payment approved');
                                setApproveOpen(false);
                            }}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Reject payment</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                        <Label>Reason *</Label>
                        <Textarea
                            placeholder="Enter reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            disabled={!rejectReason.trim() || submitting}
                            onClick={async () => {
                                await runUpdate({ status: 'Cancelled', notes: rejectReason.trim() }, 'Payment rejected');
                                setRejectOpen(false);
                                setRejectReason('');
                            }}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Mark Paid */}
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
                    <div className="grid gap-3">
                        <div>
                            <Label>Payment reference</Label>
                            <Input
                                placeholder="e.g. TXN-001234"
                                value={payRef}
                                onChange={(e) => setPayRef(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Payment date *</Label>
                            <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            disabled={!payDate || submitting}
                            onClick={async () => {
                                await runUpdate(
                                    { status: 'Paid', payment_ref: payRef.trim() || undefined, payment_date: payDate },
                                    'Marked as paid'
                                );
                                setPayOpen(false);
                                setPayRef('');
                                setPayDate('');
                            }}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel */}
            <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel payment?</AlertDialogTitle>
                        <AlertDialogDescription>The payment will be cancelled. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={submitting}
                            onClick={async (e) => {
                                e.preventDefault();
                                await runUpdate({ status: 'Cancelled' }, 'Payment cancelled');
                                setCancelOpen(false);
                            }}
                        >
                            Cancel payment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete payment?</AlertDialogTitle>
                        <AlertDialogDescription>Only Draft or Cancelled payments can be deleted. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            disabled={submitting}
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    await dispatch(deleteContractorPayment(payment.payment_id)).unwrap();
                                    toast.success('Payment deleted');
                                    router.push('/financial/contractor-payments');
                                } catch (err: any) {
                                    toast.error(typeof err === 'string' ? err : err?.message || 'Delete failed');
                                }
                                setDeleteOpen(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function ContractorPaymentDetailPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-sky-500" /></div>}>
            <ContractorPaymentDetailInner />
        </Suspense>
    );
}
