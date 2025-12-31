/* =========================================================
   src/app/contractors/update/page.tsx
   Update contractor (same layout as "Create Contractor")
========================================================= */

'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';

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
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

/* ---------- Types ---------- */
type ContractorForm = {
    name: string;
    phone: string;
    status: string;
    province: string;
    address: string;
    email: string;
    bank_name: string;
    bank_account: string | number;
    note?: string;
};

/* ---------- Initial (blank) ----------- */
const BLANK: ContractorForm = {
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
function UpdateContractorPageContent() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const [form, setForm] = useState<ContractorForm>(BLANK);
    const [loadedForm, setLoaded] = useState<ContractorForm>(BLANK);
    const [contractorNo, setNo] = useState<string>(''); // read-only number
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ---------- Field helper ---------- */
    const updateField = useCallback(
        (k: keyof ContractorForm, v: string) => {
            setForm((prev) => ({ ...prev, [k]: v }));
            setErrors((prev) => {
                const clone = { ...prev };
                delete clone[k];
                return clone;
            });
        },
        []
    );

    /* ---------- Validation ---------- */
    const validate = useCallback(() => {
        const err: Record<string, string> = {};
        const required: (keyof ContractorForm)[] = ['name', 'phone', 'status', 'province'];

        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') err[f] = 'Required';
        });

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            err.email = 'Invalid e-mail';

        if (form.bank_account !== '' && isNaN(Number(form.bank_account)))
            err.bank_account = 'Must be numeric';

        setErrors(err);
        return Object.keys(err).length === 0;
    }, [form]);

    /* ---------- Sanitised payload ---------- */
    const payload = useMemo(() => {
        const p: any = { ...form };
        if (p.bank_account === '') delete p.bank_account;
        else p.bank_account = Number(p.bank_account);
        Object.keys(p).forEach((k) => p[k] === '' && delete p[k]);
        return p;
    }, [form]);

    /* ---------- Load existing contractor ---------- */
    useEffect(() => {
        (async () => {
            if (!id) {
                toast.error('Missing contractor id');
                router.push('/contractors');
                return;
            }

            try {
                setPageLoading(true);
                const res = await axios.get(`/contractors/fetch/contractor/${id}`);
                const c = res?.data?.contractor || res?.data?.body?.contractor || res?.data?.data;
                if (!c?.id) throw new Error('Contractor not found');

                const next: ContractorForm = {
                    name: c.name ?? '',
                    phone: c.phone ?? '',
                    status: c.status ?? '',
                    province: c.province ?? '',
                    address: c.address ?? '',
                    email: c.email ?? '',
                    bank_name: c.bank_name ?? '',
                    bank_account: c.bank_account ?? '',
                    note: c.note ?? '',
                };

                setForm(next);
                setLoaded(next);
                setNo(c.number ?? '');
            } catch (err: any) {
                toast.error(err?.response?.data?.message || err?.message || 'Failed to load contractor');
                router.push('/contractors');
            } finally {
                setPageLoading(false);
            }
        })();
    }, [id, router]);

    /* ---------- Submit ---------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }
        if (!id) {
            toast.error('Missing contractor id');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.put(`/contractors/update/${id}`, { params: payload });
            const ok =
                res?.data?.header?.success ||
                res?.data?.success ||
                res?.data?.body?.updated;
            if (ok) {
                toast.success('Contractor updated successfully!');
                setLoaded(form);
            } else {
                toast.error(
                    res?.data?.header?.messages?.[0]?.message ||
                    res?.data?.header?.message ||
                    res?.data?.message ||
                    'Update failed.'
                );
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    /* ---------- Reset ---------- */
    const handleReset = () => {
        setForm(loadedForm);
        setErrors({});
        toast.message('Form reset to loaded values.');
    };

    /* ---------- Loading skeleton ---------- */
    if (pageLoading) {
        return (
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading contractor...</span>
            </div>
        );
    }

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Update Contractor
                    </h1>
                    {contractorNo && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">No. {contractorNo}</p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Update the contractor details, then save your changes.
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/contractors')}
                    className="border-orange-200 dark:border-orange-800 hover:border-orange-300 hover:text-orange-700 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Contractors
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Contractor Information"
                    description="Update contractor profile details."
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
                                disabled={pageLoading}
                            />

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-200">Status *</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v) => updateField('status', v)}
                                    disabled={pageLoading}
                                >
                                    <SelectTrigger 
                                        id="status"
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400 transition-colors duration-200"
                                        disabled={pageLoading}
                                    >
                                        <SelectValue placeholder="Choose status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem 
                                                key={s} 
                                                value={s}
                                                className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200"
                                            >
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.status && <ErrorText>{errors.status}</ErrorText>}
                            </div>

                            {/* Phone */}
                            <Field
                                id="phone"
                                label="Phone *"
                                value={form.phone}
                                placeholder="+964-770-123-4567"
                                error={errors.phone}
                                onChange={(v) => updateField('phone', v)}
                                disabled={pageLoading}
                            />

                            {/* Email */}
                            <Field
                                id="email"
                                label="Email"
                                value={form.email}
                                placeholder="info@shuarano.com"
                                error={errors.email}
                                onChange={(v) => updateField('email', v)}
                                disabled={pageLoading}
                            />

                            {/* Province */}
                            <Field
                                id="province"
                                label="Province *"
                                value={form.province}
                                placeholder="Baghdad"
                                error={errors.province}
                                onChange={(v) => updateField('province', v)}
                                disabled={pageLoading}
                            />

                            {/* Address */}
                            <Field
                                id="address"
                                label="Address"
                                value={form.address}
                                placeholder="Street / Area / Building"
                                onChange={(v) => updateField('address', v)}
                                disabled={pageLoading}
                            />

                            {/* Bank Name */}
                            <Field
                                id="bank_name"
                                label="Bank Name"
                                value={form.bank_name}
                                placeholder="Rafidain Bank"
                                onChange={(v) => updateField('bank_name', v)}
                                disabled={pageLoading}
                            />

                            {/* Bank Account */}
                            <Field
                                id="bank_account"
                                label="Bank Account"
                                value={form.bank_account}
                                placeholder="Account number"
                                inputMode="numeric"
                                error={errors.bank_account}
                                onChange={(v) => updateField('bank_account', v)}
                                disabled={pageLoading}
                            />

                            {/* Note */}
                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="note" className="text-slate-700 dark:text-slate-200">Note</Label>
                                <textarea
                                    id="note"
                                    className="min-h-[90px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100 dark:focus-visible:ring-orange-900/50 focus:border-orange-300 dark:focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                                    placeholder="Additional comments..."
                                    value={form.note}
                                    onChange={(e) => updateField('note', e.target.value)}
                                    disabled={pageLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading || pageLoading}
                            className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || pageLoading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            )}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Update Contractor'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

/* =========================================================
   Reusable sub-components
========================================================= */

/* Single-line field with error helper */
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
    disabled,
}: FieldProps & { disabled?: boolean }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-slate-700 dark:text-slate-200">{label}</Label>
            <Input
                id={id}
                inputMode={inputMode}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
            />
            {error && <ErrorText>{error}</ErrorText>}
        </div>
    );
}

/* Red error helper text */
const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs text-red-500 dark:text-red-400">{children}</p>
);

export default function UpdateContractorPage() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading contractor...</div>}>
            <UpdateContractorPageContent />
        </Suspense>
    );
}
