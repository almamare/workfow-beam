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
import { fetchBankBalance, updateBankBalance, selectSelectedBalance, selectBankBalancesLoading, clearSelectedBalance } from '@/stores/slices/bank-balances';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { UpdateBankBalancePayload } from '@/stores/types/bank-balances';
import { Badge } from '@/components/ui/badge';

// Format currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const UpdateBankBalancePage: React.FC = () => {
    const [form, setForm] = useState<Omit<UpdateBankBalancePayload, 'id'>>({
        balance: 0,
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const params = useSearchParams();
    const balanceId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedBalance = useSelector(selectSelectedBalance);
    const balanceLoading = useSelector(selectBankBalancesLoading);

    /**
     * Fetch balance data by ID
     */
    const fetchBalanceData = useCallback(async () => {
        if (!balanceId) {
            toast.error('Balance ID is required');
            router.push('/bank-balances');
            return;
        }
        try {
            await dispatch(fetchBankBalance({ id: balanceId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load balance data.');
            router.push('/bank-balances');
        }
    }, [balanceId, dispatch, router]);

    // Fetch balance when component mounts
    useEffect(() => {
        fetchBalanceData();
        return () => {
            dispatch(clearSelectedBalance());
        };
    }, [fetchBalanceData, dispatch]);

    // Update form when selectedBalance changes
    useEffect(() => {
        if (selectedBalance) {
            setForm({
                balance: selectedBalance.balance || 0,
                notes: selectedBalance.notes || '',
            });
        }
    }, [selectedBalance]);

    // Update field value
    const updateField = useCallback((name: keyof Omit<UpdateBankBalancePayload, 'id'>, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Validation function
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        if (form.balance === undefined || form.balance === null) {
            errors.balance = 'Balance is required';
        } else if (form.balance < 0) {
            errors.balance = 'Balance cannot be negative';
        }

        if (form.notes && form.notes.length > 500) {
            errors.notes = 'Notes must not exceed 500 characters';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        if (!balanceId) {
            toast.error('Balance ID is required');
            return;
        }

        setLoading(true);
        try {
            const payload: UpdateBankBalancePayload = {
                id: balanceId,
                balance: form.balance,
                notes: form.notes || undefined,
            };
            await dispatch(updateBankBalance(payload)).unwrap();
            toast.success('Bank balance updated successfully!');
            router.push('/bank-balances');
        } catch (error: any) {
            toast.error(error || 'Server error.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form handler
    const handleReset = () => {
        if (selectedBalance) {
            setForm({
                balance: selectedBalance.balance || 0,
                notes: selectedBalance.notes || '',
            });
        }
        setFieldErrors({});
        toast.message('Form reset to original data.');
    };

    if (balanceLoading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    if (!selectedBalance) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400">Balance not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Update Bank Balance
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Modify the balance details below.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/bank-balances')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Balances
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Balance Information */}
                <EnhancedCard
                    title="Balance Information"
                    description="Update balance details. Bank and currency cannot be changed."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Bank (Read-only) */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                    Bank
                                </Label>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-900 dark:text-slate-100 font-semibold">
                                        {selectedBalance.bank_name || selectedBalance.bank?.name || '-'}
                                    </p>
                                    {selectedBalance.bank_no && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                            {selectedBalance.bank_no}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Currency (Read-only) */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                    Currency
                                </Label>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <Badge
                                        variant="outline"
                                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium text-lg"
                                    >
                                        {selectedBalance.currency}
                                    </Badge>
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="space-y-2">
                                <Label htmlFor="balance" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Balance *
                                </Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.balance || ''}
                                    onChange={e => updateField('balance', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                                />
                                {fieldErrors.balance && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.balance}</p>
                                )}
                                {form.balance !== undefined && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Current: {formatCurrency(form.balance, selectedBalance.currency)}
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={form.notes || ''}
                                    placeholder="Enter notes (optional, max 500 characters)"
                                    onChange={e => updateField('notes', e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {(form.notes || '').length} / 500 characters
                                </p>
                                {fieldErrors.notes && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                            className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? 'Updating...' : 'Update Balance'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading update balance...</div>}>
            <UpdateBankBalancePage />
        </Suspense>
    );
}

