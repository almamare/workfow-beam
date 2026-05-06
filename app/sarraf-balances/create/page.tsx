'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { createSarrafBalance } from '@/stores/slices/sarraf-balances';
import { fetchSarrafat, selectSarrafat } from '@/stores/slices/sarrafat';
import type { CreateSarrafBalanceParams } from '@/stores/types/sarraf-balances';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

const CURRENCIES = ['USD', 'IQD', 'EUR', 'GBP', 'SAR', 'AED', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP'];

const initialValues = {
    sarraf_id: '',
    currency: '',
    balance: 0,
    notes: '',
};

function CreateSarrafBalanceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sarrafIdFromQuery = searchParams.get('sarraf_id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const sarrafatList = useSelector(selectSarrafat);

    const [form, setForm] = useState(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        dispatch(fetchSarrafat({ page: 1, limit: 500, status: 'Active' }));
    }, [dispatch]);

    useEffect(() => {
        if (sarrafIdFromQuery) setForm((prev) => ({ ...prev, sarraf_id: sarrafIdFromQuery }));
    }, [sarrafIdFromQuery]);

    const updateField = useCallback((name: string, value: string | number) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.sarraf_id?.trim()) errs.sarraf_id = 'Exchange is required';
        if (!form.currency?.trim()) errs.currency = 'Currency is required';
        else if (form.currency.length !== 3) errs.currency = 'Currency must be 3 letters (e.g. USD, IQD)';
        if (typeof form.balance !== 'number' && isNaN(Number(form.balance))) errs.balance = 'Balance must be a number';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the errors below.');
            return;
        }
        setLoading(true);
        try {
            const params: CreateSarrafBalanceParams = {
                sarraf_id: form.sarraf_id.trim(),
                currency: form.currency.trim().toUpperCase(),
                balance: Number(form.balance) || 0,
            };
            if (form.notes?.trim()) params.notes = form.notes.trim();
            const result = await dispatch(createSarrafBalance(params));
            if (createSarrafBalance.rejected.match(result)) {
                const msg = result.payload || 'Failed to create balance';
                toast.error(String(msg));
                if (typeof msg === 'string' && msg.toLowerCase().includes('already exists')) {
                    toast.info('Edit the existing balance for this exchange and currency instead.');
                }
                return;
            }
            toast.success('Balance created successfully');
            const payload = result.payload as { body?: { balance?: { balance_id: string; sarraf_id: string } } };
            const balance = payload?.body?.balance;
            if (balance?.balance_id) router.push(`/sarraf-balances/details?id=${encodeURIComponent(balance.balance_id)}`);
            else if (balance?.sarraf_id) router.push(`/sarraf-balances?sarraf_id=${encodeURIComponent(balance.sarraf_id)}`);
            else router.push('/sarraf-balances');
        } catch {
            toast.error('Failed to create balance');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({ ...initialValues, sarraf_id: sarrafIdFromQuery || '' });
        setErrors({});
    };

    const sarrafOptions = Array.isArray(sarrafatList) ? sarrafatList : [];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Add Exchange Balance</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Create a new balance for an exchange. One balance per exchange + currency.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <EnhancedCard title="Balance details" description="Exchange, currency, and amount" variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Exchange *</Label>
                            <Select value={form.sarraf_id || 'none'} onValueChange={(v) => updateField('sarraf_id', v === 'none' ? '' : v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue placeholder="Select exchange" /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="none">-- Select exchange --</SelectItem>
                                    {sarrafOptions.map((s) => (
                                        <SelectItem key={s.sarraf_id} value={s.sarraf_id}>{s.sarraf_no ?? s.sarraf_id} – {s.sarraf_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.sarraf_id && <p className="text-xs text-red-500">{errors.sarraf_id}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Currency * (3-letter code)</Label>
                            <Select value={form.currency || 'none'} onValueChange={(v) => updateField('currency', v === 'none' ? '' : v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue placeholder="e.g. USD, IQD" /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="none">-- Select --</SelectItem>
                                    {CURRENCIES.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.currency && <p className="text-xs text-red-500">{errors.currency}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balance">Balance *</Label>
                            <Input id="balance" type="number" step="any" value={form.balance === 0 ? '' : form.balance} onChange={(e) => updateField('balance', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" className="bg-white dark:bg-slate-800" />
                            {errors.balance && <p className="text-xs text-red-500">{errors.balance}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Notes" className="bg-white dark:bg-slate-800" rows={2} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Create Balance</Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

export default function CreateSarrafBalancePage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <CreateSarrafBalanceContent />
        </Suspense>
    );
}
