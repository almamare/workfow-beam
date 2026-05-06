'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchContractorPayment,
    updateContractorPayment,
    clearSelectedPayment,
    selectSelectedContractorPayment,
    selectContractorPaymentsLoading,
    selectContractorPaymentsSubmitting,
} from '@/stores/slices/contractor-payments';
import { fetchContractors, selectContractors } from '@/stores/slices/contractors';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { fetchBanks, selectBanks } from '@/stores/slices/banks';
import type { ContractorPayment } from '@/stores/types/contractor-payments';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

const CURRENCIES = ['IQD', 'USD', 'EUR', 'AED', 'SAR', 'TRY'];

function ContractorPaymentUpdateInner() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const payment = useSelector(selectSelectedContractorPayment) as ContractorPayment | null;
    const loading = useSelector(selectContractorPaymentsLoading);
    const submitting = useSelector(selectContractorPaymentsSubmitting);
    const contractors = useSelector(selectContractors);
    const projects = useSelector(selectProjects);
    const banks = useSelector(selectBanks);

    // Form state
    const [contractorId, setContractorId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState('1');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Bank' | 'Cash' | 'Check' | 'Other'>('Bank');
    const [paymentRef, setPaymentRef] = useState('');
    const [bankId, setBankId] = useState('');
    const [purpose, setPurpose] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (id) dispatch(fetchContractorPayment(id));
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
        dispatch(fetchBanks({ page: 1, limit: 500, status: 'Active' }));
        return () => { dispatch(clearSelectedPayment()); };
    }, [dispatch, id]);

    // Populate form from loaded payment
    useEffect(() => {
        if (!payment) return;
        setContractorId(payment.contractor_id || '');
        setProjectId(payment.project_id || '');
        setCurrency(payment.currency || 'USD');
        setAmount(String(payment.amount || ''));
        setExchangeRate(String(payment.exchange_rate || 1));
        setPaymentDate(payment.payment_date || '');
        setPaymentMethod(payment.payment_method || 'Bank');
        setPaymentRef(payment.payment_ref || '');
        setBankId(payment.bank_id || '');
        setPurpose(payment.purpose || '');
        setNotes(payment.notes || '');
    }, [payment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contractorId || !amount || !paymentDate || !purpose) {
            toast.error('Contractor, amount, payment date, and purpose are required.');
            return;
        }
        try {
            await dispatch(updateContractorPayment({
                paymentId: id,
                payload: {
                    contractor_id: contractorId,
                    project_id: projectId || undefined,
                    currency,
                    amount: Number(amount),
                    exchange_rate: currency !== 'IQD' ? Number(exchangeRate) : 1,
                    payment_date: paymentDate,
                    payment_method: paymentMethod,
                    payment_ref: paymentRef.trim() || undefined,
                    bank_id: paymentMethod === 'Bank' && bankId ? bankId : undefined,
                    purpose: purpose.trim(),
                    notes: notes.trim() || undefined,
                }
            })).unwrap();
            toast.success('Payment updated successfully');
            router.push(`/financial/contractor-payments/details?id=${id}`);
        } catch (err: any) {
            toast.error(typeof err === 'string' ? err : err?.message || 'Update failed');
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

    if (payment.status !== 'Draft') {
        return (
            <div className="p-6 space-y-3">
                <p className="text-slate-600 dark:text-slate-400">
                    Only Draft payments can be edited. This payment is <strong>{payment.status}</strong>.
                </p>
                <Button variant="outline" onClick={() => router.push(`/financial/contractor-payments/details?id=${id}`)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to details
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Edit Payment</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{payment.payment_no}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/financial/contractor-payments/details?id=${id}`)}>
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Cancel
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard title="Contractor & Project" variant="default" size="sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Contractor *</Label>
                            <Select value={contractorId} onValueChange={setContractorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contractor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(contractors || []).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Select value={projectId || 'none'} onValueChange={v => setProjectId(v === 'none' ? '' : v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select project (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No project</SelectItem>
                                    {(projects || []).map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Payment Details" variant="default" size="sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Currency *</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CURRENCIES.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Amount *</Label>
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>

                        {currency !== 'IQD' && (
                            <div className="space-y-2">
                                <Label>Exchange Rate (to IQD)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    placeholder="1"
                                    value={exchangeRate}
                                    onChange={e => setExchangeRate(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Payment Date *</Label>
                            <Input
                                type="date"
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={v => setPaymentMethod(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bank">Bank</SelectItem>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Check">Check</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {paymentMethod === 'Bank' && (
                            <div className="space-y-2">
                                <Label>Bank Account</Label>
                                <Select value={bankId || 'none'} onValueChange={v => setBankId(v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select bank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {(banks || []).map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Reference / Receipt No.</Label>
                            <Input
                                placeholder="e.g. TXN-001234"
                                value={paymentRef}
                                onChange={e => setPaymentRef(e.target.value)}
                            />
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Description" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Purpose *</Label>
                            <Textarea
                                placeholder="What is this payment for?"
                                value={purpose}
                                onChange={e => setPurpose(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                placeholder="Additional notes (optional)"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                </EnhancedCard>

                <div className="flex gap-3 justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/financial/contractor-payments/details?id=${id}`)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function ContractorPaymentUpdatePage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-sky-500" /></div>}>
            <ContractorPaymentUpdateInner />
        </Suspense>
    );
}
