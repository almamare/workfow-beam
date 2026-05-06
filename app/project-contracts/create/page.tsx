'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import { createProjectContract } from '@/stores/slices/project-contracts';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { DatePicker } from '@/components/DatePicker';
import type { CreateProjectContractRequest } from '@/stores/types/project-contracts';

const initialValues: CreateProjectContractRequest = {
    project_id: '',
    title: '',
    contract_type: 'Main',
    description: '',
    scope: '',
    payment_terms: '',
    contract_date: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    contract_value: 0,
    currency: 'IQD',
    notes: '',
};

export default function CreateProjectContractPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const projects = useSelector(selectProjects);
    const [form, setForm] = useState<CreateProjectContractRequest>(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        dispatch(fetchProjects({ limit: 500 }));
    }, [dispatch]);

    const updateField = useCallback((name: keyof CreateProjectContractRequest, value: unknown) => {
        setForm((prev) => ({ ...prev, [name]: value as never }));
        setErrors((prev) => {
            const c = { ...prev };
            delete c[name as string];
            return c;
        });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.project_id) errs.project_id = 'Required';
        if (!form.title?.trim()) errs.title = 'Required';
        if (!form.contract_date) errs.contract_date = 'Required';
        if (form.contract_value === undefined || form.contract_value < 0) errs.contract_value = 'Invalid';
        if (form.start_date && form.contract_date && new Date(form.start_date) < new Date(form.contract_date)) {
            errs.start_date = 'Must be on or after contract date';
        }
        if (form.end_date && form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
            errs.end_date = 'Must be on or after start date';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const payload = useMemo(() => {
        const p: CreateProjectContractRequest = { ...form };
        if (!p.description?.trim()) delete p.description;
        if (!p.scope?.trim()) delete p.scope;
        if (!p.payment_terms?.trim()) delete p.payment_terms;
        if (!p.start_date?.trim()) delete p.start_date;
        if (!p.end_date?.trim()) delete p.end_date;
        if (!p.notes?.trim()) delete p.notes;
        return p;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Fix validation errors');
            return;
        }
        setLoading(true);
        try {
            await dispatch(createProjectContract(payload)).unwrap();
            toast.success('Contract created; sent for approval.');
            router.push('/project-contracts');
        } catch (err: unknown) {
            toast.error(typeof err === 'string' ? err : 'Create failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">New project contract</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Reference number is generated when you save. An approval request is created automatically.
                    </p>
                </div>
                <Button type="button" variant="outline" onClick={() => router.push('/project-contracts')}>
                    Back to list
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard title="Contract" description="Link a project and enter commercial terms." size="sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Project *</Label>
                            <Select value={form.project_id} onValueChange={(v) => updateField('project_id', v)}>
                                <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} ({p.number})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.project_id && <p className="text-sm text-red-500">{errors.project_id}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Title *</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                className={errors.title ? 'border-red-500' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={form.contract_type}
                                onValueChange={(v) => updateField('contract_type', v as CreateProjectContractRequest['contract_type'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(['Main', 'Subcontract', 'Amendment', 'Framework', 'Other'] as const).map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={form.currency} onValueChange={(v) => updateField('currency', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['IQD', 'USD', 'EUR'].map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Contract date *</Label>
                            <DatePicker value={form.contract_date} onChange={(v) => updateField('contract_date', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Value *</Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.contract_value}
                                onChange={(e) => updateField('contract_value', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Start</Label>
                            <DatePicker value={form.start_date || ''} onChange={(v) => updateField('start_date', v)} />
                            {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>End</Label>
                            <DatePicker value={form.end_date || ''} onChange={(v) => updateField('end_date', v)} />
                            {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Scope of work</Label>
                            <Textarea value={form.scope} onChange={(e) => updateField('scope', e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Payment terms</Label>
                            <Textarea value={form.payment_terms} onChange={(e) => updateField('payment_terms', e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Notes</Label>
                            <Textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={2} />
                        </div>
                    </div>
                </EnhancedCard>
                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setForm(initialValues)}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
}
