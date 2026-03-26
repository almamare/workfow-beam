'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import { createDisbursement } from '@/stores/slices/financial-disbursements';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { fetchBanks, selectBanks } from '@/stores/slices/banks';
import { fetchSarrafat, selectSarrafat } from '@/stores/slices/sarrafat';
import { fetchPettyCashBoxes, selectPettyCashList } from '@/stores/slices/petty-cash';
import type { PaymentSource, BeneficiaryType, CostCategory } from '@/stores/types/financial-disbursements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { formatFinancialErrors } from '@/utils/financialEnvelopeApi';

export default function NewDisbursementPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const projects = useSelector(selectProjects);
    const banks = useSelector(selectBanks);
    const sarrafat = useSelector(selectSarrafat);
    const pettyBoxes = useSelector(selectPettyCashList);

    const [loading, setLoading] = useState(false);
    const [projectId, setProjectId] = useState('');
    const [budgetId, setBudgetId] = useState('');
    const [paymentSource, setPaymentSource] = useState<PaymentSource>('Bank');
    const [sourceRefId, setSourceRefId] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    const [exchangeRate, setExchangeRate] = useState('1');
    const [beneficiaryType, setBeneficiaryType] = useState<BeneficiaryType>('Contractor');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [costCategory, setCostCategory] = useState<CostCategory>('Materials');
    const [purpose, setPurpose] = useState('');

    useEffect(() => {
        dispatch(fetchProjects({ page: 1, limit: 500 }));
        dispatch(fetchBanks({ page: 1, limit: 500, status: 'Active' }));
        dispatch(fetchSarrafat({ page: 1, limit: 500, status: 'Active' }));
        dispatch(fetchPettyCashBoxes({ page: 1, per_page: 500 }));
    }, [dispatch]);

    const sourceOptions = useMemo(() => {
        if (paymentSource === 'Bank') {
            return (banks || []).map((b) => ({ id: b.id, label: `${b.bank_no ?? b.id} — ${b.name}` }));
        }
        if (paymentSource === 'Sarraf') {
            return (sarrafat || []).map((s) => ({ id: s.sarraf_id, label: `${s.sarraf_no ?? s.sarraf_id} — ${s.sarraf_name}` }));
        }
        return (pettyBoxes || []).map((p) => ({ id: p.id, label: `${p.name} (${p.currency})` }));
    }, [paymentSource, banks, sarrafat, pettyBoxes]);

    useEffect(() => {
        setSourceRefId('');
    }, [paymentSource]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !sourceRefId || !currency || !amount) {
            toast.error('Project, source account, currency, and amount are required.');
            return;
        }
        setLoading(true);
        try {
            const params: Record<string, unknown> = {
                project_id: projectId,
                payment_source: paymentSource,
                source_ref_id: sourceRefId,
                currency,
                amount: Number(amount),
                beneficiary_type: beneficiaryType,
                cost_category: costCategory,
                purpose: purpose || undefined,
            };
            if (budgetId.trim()) params.budget_id = budgetId.trim();
            if (exchangeRate && Number(exchangeRate) !== 1) params.exchange_rate = Number(exchangeRate);
            if (beneficiaryName.trim()) params.beneficiary_name = beneficiaryName.trim();

            const result = await dispatch(createDisbursement(params)).unwrap();
            toast.success('Disbursement created');
            router.push(`/financial/disbursements/${result.id}`);
        } catch (err: any) {
            const msg = err?.message || 'Failed to create';
            toast.error(msg);
            const errors = (err as { errors?: unknown })?.errors;
            if (errors) toast.error(formatFinancialErrors(errors));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/financial/disbursements')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">New disbursement</h1>

            <form onSubmit={handleSubmit}>
                <EnhancedCard title="Request" description="Balances must exist for the source + currency in the backend." variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Project *</Label>
                            <Select value={projectId || 'none'} onValueChange={(v) => setProjectId(v === 'none' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select…</SelectItem>
                                    {(projects || []).map((p) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name ?? p.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Budget (optional)</Label>
                            <Input value={budgetId} onChange={(e) => setBudgetId(e.target.value)} placeholder="Same project as disbursement" />
                        </div>
                        <div className="space-y-2">
                            <Label>Payment source *</Label>
                            <Select value={paymentSource} onValueChange={(v) => setPaymentSource(v as PaymentSource)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bank">Bank</SelectItem>
                                    <SelectItem value="Sarraf">Sarraf</SelectItem>
                                    <SelectItem value="Petty_Cash">Petty cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Source account *</Label>
                            <Select value={sourceRefId || 'none'} onValueChange={(v) => setSourceRefId(v === 'none' ? '' : v)}>
                                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select…</SelectItem>
                                    {sourceOptions.map((o) => (
                                        <SelectItem key={o.id} value={o.id}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Currency *</Label>
                            <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} placeholder="USD" />
                        </div>
                        <div className="space-y-2">
                            <Label>Amount *</Label>
                            <Input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Exchange rate</Label>
                            <Input type="number" step="any" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Beneficiary type</Label>
                            <Select value={beneficiaryType} onValueChange={(v) => setBeneficiaryType(v as BeneficiaryType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(['Contractor', 'Supplier', 'Employee', 'Other'] as const).map((b) => (
                                        <SelectItem key={b} value={b}>
                                            {b}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Beneficiary name</Label>
                            <Input value={beneficiaryName} onChange={(e) => setBeneficiaryName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Cost category</Label>
                            <Select value={costCategory} onValueChange={(v) => setCostCategory(v as CostCategory)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(['Labor', 'Materials', 'Equipment', 'Services', 'Admin', 'Other'] as const).map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Purpose</Label>
                            <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={3} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700 text-white">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save draft
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}
