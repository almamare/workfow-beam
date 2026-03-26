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
import { fetchSarrafBalance, updateSarrafBalance, selectSelectedSarrafBalance } from '@/stores/slices/sarraf-balances';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { UpdateSarrafBalanceParams } from '@/stores/types/sarraf-balances';

type FormPayload = { balance: number; notes: string };

function UpdateSarrafBalanceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const balanceId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const balance = useSelector(selectSelectedSarrafBalance);

    const [form, setForm] = useState<FormPayload>({ balance: 0, notes: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (balanceId) dispatch(fetchSarrafBalance(balanceId));
    }, [dispatch, balanceId]);

    useEffect(() => {
        if (balance && balance.balance_id === balanceId) {
            setForm({ balance: Number(balance.balance) || 0, notes: balance.notes ?? '' });
        }
        setInitialLoad(false);
    }, [balance, balanceId]);

    const updateField = useCallback((name: keyof FormPayload, value: number | string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (typeof form.balance !== 'number' && isNaN(Number(form.balance))) errs.balance = 'Balance must be a number';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!balanceId) {
            toast.error('Missing balance ID');
            return;
        }
        if (!validate()) {
            toast.error('Please fix the errors below.');
            return;
        }
        setLoading(true);
        try {
            const params: UpdateSarrafBalanceParams = {
                balance: Number(form.balance) || 0,
                notes: form.notes,
            };
            const result = await dispatch(updateSarrafBalance({ balanceId, params }));
            if (updateSarrafBalance.rejected.match(result)) {
                toast.error(result.payload || 'Failed to update balance');
                return;
            }
            toast.success('Balance updated successfully');
            router.push(`/sarraf-balances/details?id=${encodeURIComponent(balanceId)}`);
        } catch {
            toast.error('Failed to update balance');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (balance && balance.balance_id === balanceId) {
            setForm({ balance: Number(balance.balance) || 0, notes: balance.notes ?? '' });
        }
        setErrors({});
    };

    if (!balanceId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">Missing balance ID. <Button variant="link" onClick={() => router.push('/sarraf-balances')}>Back to list</Button></p>
            </div>
        );
    }

    if (initialLoad && !balance) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Edit Sarraf Balance</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Update balance and notes. Balance ID: {balanceId}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <EnhancedCard title="Balance details" description={`Currency: ${balance?.currency ?? '-'}`} variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="balance">Balance *</Label>
                            <Input id="balance" type="number" step="any" value={form.balance === 0 ? '' : form.balance} onChange={(e) => updateField('balance', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" className="bg-white dark:bg-slate-800" />
                            {errors.balance && <p className="text-xs text-red-500">{errors.balance}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Notes" className="bg-white dark:bg-slate-800" rows={3} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.push('/sarraf-balances')}>Back to list</Button>
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

export default function UpdateSarrafBalancePage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <UpdateSarrafBalanceContent />
        </Suspense>
    );
}
