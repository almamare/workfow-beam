/* =========================================================
   src/app/contractors/create/page.tsx
   Create a new contractor
========================================================= */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

/* ---------- Types ---------- */
type ContractorPayload = {
    name: string;
    phone: string;
    status: string;
    province: string;
    address?: string;
    email?: string;
    bank_name?: string;
    bank_account?: string | number;
    note?: string;
};

/* ---------- Initial-state template ---------- */
const EMPTY: ContractorPayload = {
    name: '',
    phone: '',
    status: '',
    province: '',
    address: '',
    email: '',
    bank_name: '',
    bank_account: '',
    note: '',
};

const STATUS_OPTIONS = ['Active', 'Inactive', 'Close'];

/* =========================================================
   Component
========================================================= */
const CreateContractorPage: React.FC = () => {
    const router = useRouter();

    /* ---------- Local state ---------- */
    const [form, setForm] = useState<ContractorPayload>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ---------- Helpers ---------- */
    const updateField = useCallback(
        (name: keyof ContractorPayload, value: string) => {
            setForm((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                const clone = { ...prev };
                delete clone[name];
                return clone;
            });
        },
        []
    );

    /* ---------- Validation ---------- */
    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        const required: (keyof ContractorPayload)[] = [
            'name',
            'phone',
            'status',
            'province',
        ];

        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') errs[f] = 'Required';
        });

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = 'Invalid e-mail format';

        if (
            form.bank_account !== '' &&
            form.bank_account !== undefined &&
            isNaN(Number(form.bank_account))
        )
            errs.bank_account = 'Must be numeric';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    /* ---------- Strip empty + cast numbers ---------- */
    const payload = useMemo(() => {
        const p: any = { ...form };
        if (p.bank_account === '') delete p.bank_account;
        else if (p.bank_account !== undefined) p.bank_account = Number(p.bank_account);

        Object.keys(p).forEach((k) => p[k] === '' && delete p[k]);
        return p as ContractorPayload;
    }, [form]);

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/contractors/create', { params: payload });
            const ok =
                res?.data?.header?.success ||
                res?.data?.success ||
                !!res?.data?.body?.contractor_id;

            if (ok) {
                toast.success('Contractor created successfully!');
                setForm(EMPTY);
            } else {
                toast.error(
                    res?.data?.header?.messages?.[0]?.message ||
                    res?.data?.header?.message ||
                    res?.data?.message ||
                    'Failed to create contractor.'
                );
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.header?.message ||
                err?.response?.data?.message ||
                err?.message ||
                'Network error. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------- Reset handler ---------- */
    const handleReset = () => {
        setForm(EMPTY);
        setErrors({});
        toast.message('Form cleared.');
    };

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Contractor
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill the form and submit to register a new contractor.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/contractors')}
                    className="border-sky-200 dark:border-sky-800 hover:border-sky-300 hover:text-sky-700 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    Back to Contractors
                </Button>
            </div>

            {/* Form card */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Contractor Information"
                    description="Core profile details for the contractor."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Name */}
                            <Field
                                id="name"
                                label="Name *"
                                value={form.name}
                                placeholder="e.g. Shuaa Al-Ranou Trade & General Contracting"
                                error={errors.name}
                                onChange={(v) => updateField('name', v)}
                            />

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700  dark:text-slate-200">Status *</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v) => updateField('status', v)}
                                >
                                    <SelectTrigger 
                                        id="status"
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                                    >
                                        <SelectValue placeholder="Choose status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem 
                                                key={s} 
                                                value={s}
                                                className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                            >
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <ErrorText>{errors.status}</ErrorText>
                                )}
                            </div>

                            {/* Phone */}
                            <Field
                                id="phone"
                                label="Phone *"
                                value={form.phone}
                                placeholder="e.g. +964-770-123-4567"
                                error={errors.phone}
                                onChange={(v) => updateField('phone', v)}
                            />

                            {/* Email */}
                            <Field
                                id="email"
                                label="Email"
                                value={form.email ?? ''}
                                placeholder="e.g. info@shuarano.com"
                                error={errors.email}
                                onChange={(v) => updateField('email', v)}
                            />

                            {/* Province */}
                            <Field
                                id="province"
                                label="Province *"
                                value={form.province}
                                placeholder="e.g. Baghdad"
                                error={errors.province}
                                onChange={(v) => updateField('province', v)}
                            />

                            {/* Address */}
                            <Field
                                id="address"
                                label="Address"
                                value={form.address ?? ''}
                                placeholder="Street / Area / Building"
                                onChange={(v) => updateField('address', v)}
                            />

                            {/* Bank Name */}
                            <Field
                                id="bank_name"
                                label="Bank Name"
                                value={form.bank_name ?? ''}
                                placeholder="e.g. Rafidain Bank"
                                onChange={(v) => updateField('bank_name', v)}
                            />

                            {/* Bank Account */}
                            <Field
                                id="bank_account"
                                label="Bank Account"
                                value={form.bank_account ?? ''}
                                placeholder="Account number"
                                inputMode="numeric"
                                error={errors.bank_account}
                                onChange={(v) => updateField('bank_account', v)}
                            />

                            {/* Note */}
                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="note" className="text-slate-700 dark:text-slate-200">Note</Label>
                                <textarea
                                    id="note"
                                    className="min-h-[90px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/50 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder="Additional comments..."
                                    value={form.note}
                                    onChange={(e) => updateField('note', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                            className="border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-300 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Create Contractor'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default CreateContractorPage;

/* =========================================================
   Reusable sub-components
========================================================= */

/* Single-line input with error helper */
interface FieldProps {
    id: string;
    label: string;
    value: string | number;
    placeholder: string;
    error?: string;
    inputMode?: 'text' | 'numeric';
    onChange: (v: string) => void;
}

function Field({
    id,
    label,
    value,
    placeholder,
    error,
    inputMode = 'text',
    onChange,
}: FieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-slate-700 dark:text-slate-200">{label}</Label>
            <Input
                id={id}
                inputMode={inputMode}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {error && <ErrorText>{error}</ErrorText>}
        </div>
    );
}

/* Red error helper text */
const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs text-red-500 dark:text-red-400">{children}</p>
);
