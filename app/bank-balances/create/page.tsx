'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { createBankBalance, fetchBankBalances, selectBankBalances } from '@/stores/slices/bank-balances';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { CreateBankBalancePayload } from '@/stores/types/bank-balances';
import axios from '@/utils/axios';

// Currency options
const CURRENCIES = [
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'KWD', name: 'Kuwaiti Dinar' },
    { code: 'BHD', name: 'Bahraini Dinar' },
    { code: 'OMR', name: 'Omani Rial' },
    { code: 'JOD', name: 'Jordanian Dinar' },
    { code: 'EGP', name: 'Egyptian Pound' },
];

// Initial form values
const initialValues: CreateBankBalancePayload = {
    bank_id: '',
    currency: '',
    balance: 0,
    notes: '',
};

const CreateBankBalancePageContent: React.FC = () => {
    const [form, setForm] = useState<CreateBankBalancePayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [banks, setBanks] = useState<Array<{ id: string; name: string; bank_no?: string }>>([]);
    const [banksLoading, setBanksLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const dispatch = useReduxDispatch<AppDispatch>();
    const existingBalances = useSelector(selectBankBalances);
    
    // Get bank_id from query params if available
    const bankIdFromQuery = params.get('bank_id');

    // Fetch banks
    useEffect(() => {
        setBanksLoading(true);
        axios.get('/banks/fetch', { params: { page: 1, limit: 1000, status: 'Active' } })
            .then(res => {
                const items: any[] = res?.data?.body?.banks?.items || [];
                setBanks(items.map(b => ({ id: b.id, name: b.name, bank_no: b.bank_no })));
            })
            .catch(() => toast.error('Failed to load banks'))
            .finally(() => setBanksLoading(false));
    }, []);

    // Set bank_id from query if available
    useEffect(() => {
        if (bankIdFromQuery) {
            setForm(prev => ({ ...prev, bank_id: bankIdFromQuery }));
        }
    }, [bankIdFromQuery]);

    // Check for duplicate balance when bank or currency changes
    useEffect(() => {
        if (form.bank_id && form.currency) {
            const duplicate = existingBalances.find(
                b => b.bank_id === form.bank_id && b.currency === form.currency
            );
            if (duplicate) {
                setFieldErrors(prev => ({
                    ...prev,
                    currency: 'A balance already exists for this bank with this currency'
                }));
            } else {
                setFieldErrors(prev => {
                    const clone = { ...prev };
                    delete clone.currency;
                    return clone;
                });
            }
        }
    }, [form.bank_id, form.currency, existingBalances]);

    // Update a single field in the form
    const updateField = useCallback((name: keyof CreateBankBalancePayload, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Validate the form
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!form.bank_id || form.bank_id.trim() === '') {
            errors.bank_id = 'Bank is required';
        }

        if (!form.currency || form.currency.trim() === '') {
            errors.currency = 'Currency is required';
        } else if (form.currency.length !== 3) {
            errors.currency = 'Currency must be 3 characters';
        }

        // Check for duplicate
        const duplicate = existingBalances.find(
            b => b.bank_id === form.bank_id && b.currency === form.currency
        );
        if (duplicate) {
            errors.currency = 'A balance already exists for this bank with this currency';
        }

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
    }, [form, existingBalances]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            await dispatch(createBankBalance({
                bank_id: form.bank_id,
                currency: form.currency.toUpperCase(),
                balance: form.balance,
                notes: form.notes || undefined,
            })).unwrap();
            toast.success('Bank balance created successfully!');
            setForm(initialValues);
            router.push('/bank-balances');
        } catch (error: any) {
            toast.error(error || 'Failed to create bank balance.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form to initial values
    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        toast.message('Form reset to defaults.');
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Add New Bank Balance
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill in the details below to add a new bank balance.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/bank-balances')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    Back to Balances
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Balance Information"
                    description="Enter bank balance details."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Bank */}
                            <div className="space-y-2">
                                <Label htmlFor="bank_id" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Bank *
                                </Label>
                                <Select
                                    value={form.bank_id}
                                    onValueChange={(val) => updateField('bank_id', val)}
                                    disabled={banksLoading}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder={banksLoading ? "Loading..." : "Select Bank"} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {banks.map(bank => (
                                            <SelectItem key={bank.id} value={bank.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                                {bank.name} {bank.bank_no ? `(${bank.bank_no})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.bank_id && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.bank_id}</p>
                                )}
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Currency *
                                </Label>
                                <Select
                                    value={form.currency}
                                    onValueChange={(val) => updateField('currency', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Currency" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {CURRENCIES.map(currency => (
                                            <SelectItem key={currency.code} value={currency.code} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                                {currency.code} - {currency.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.currency && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.currency}</p>
                                )}
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                                />
                                {fieldErrors.balance && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.balance}</p>
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                            className="border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-300 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? 'Creating...' : 'Create Balance'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default function CreateBankBalancePage() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading create balance...</div>}>
            <CreateBankBalancePageContent />
        </Suspense>
    );
}

