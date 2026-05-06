'use client';

import React, { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjectContract,
    updateProjectContract,
    selectSelectedProjectContract,
    selectProjectContractsLoading,
    clearSelectedProjectContract,
} from '@/stores/slices/project-contracts';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { DatePicker } from '@/components/DatePicker';
import type { UpdateProjectContractRequest, ProjectContract } from '@/stores/types/project-contracts';

function toForm(c: ProjectContract): UpdateProjectContractRequest & { project_id: string } {
    return {
        project_id: c.project_id,
        title: c.title,
        contract_type: c.contract_type,
        description: c.description || '',
        scope: c.scope || '',
        payment_terms: c.payment_terms || '',
        contract_date: c.contract_date,
        start_date: c.start_date || '',
        end_date: c.end_date || '',
        contract_value: typeof c.contract_value === 'string' ? parseFloat(c.contract_value) : c.contract_value,
        currency: c.currency,
        status: c.status,
        notes: c.notes || '',
    };
}

function UpdateInner() {
    const params = useSearchParams();
    const contractId = params.get('id') || '';
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const contract = useSelector(selectSelectedProjectContract);
    const loading = useSelector(selectProjectContractsLoading);
    const projects = useSelector(selectProjects);
    const [form, setForm] = useState<(UpdateProjectContractRequest & { project_id: string }) | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        dispatch(fetchProjects({ limit: 500 }));
    }, [dispatch]);

    const load = useCallback(async () => {
        if (!contractId) {
            toast.error('Missing id');
            router.push('/project-contracts');
            return;
        }
        try {
            await dispatch(fetchProjectContract(contractId)).unwrap();
        } catch (e) {
            toast.error(typeof e === 'string' ? e : 'Load failed');
            router.push('/project-contracts');
        }
    }, [contractId, dispatch, router]);

    useEffect(() => {
        load();
        return () => {
            dispatch(clearSelectedProjectContract());
        };
    }, [load, dispatch]);

    useEffect(() => {
        if (contract) {
            if (contract.approval_status === 'Approved') {
                toast.error('Approved contracts cannot be edited.');
                router.push(`/project-contracts/details?id=${contract.id}`);
                return;
            }
            setForm(toForm(contract));
        }
    }, [contract, router]);

    const updateField = useCallback((name: keyof UpdateProjectContractRequest, value: unknown) => {
        setForm((prev) => (prev ? { ...prev, [name]: value as never } : prev));
    }, []);

    const payload = useMemo(() => {
        if (!form) return null;
        const p: UpdateProjectContractRequest = { ...form };
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
        if (!contractId || !payload) return;
        setSaving(true);
        try {
            await dispatch(updateProjectContract({ id: contractId, data: payload })).unwrap();
            toast.success('Saved');
            router.push(`/project-contracts/details?id=${contractId}`);
        } catch (err: unknown) {
            toast.error(typeof err === 'string' ? err : 'Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500">Loading…</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex justify-between items-end">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Edit project contract</h1>
                <Button type="button" variant="outline" onClick={() => router.push('/project-contracts')}>
                    Back
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard title="Details" size="sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Project</Label>
                            <Select
                                value={form.project_id}
                                onValueChange={(v) => setForm((prev) => (prev ? { ...prev, project_id: v } : prev))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Title</Label>
                            <Input value={form.title} onChange={(e) => updateField('title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={form.contract_type}
                                onValueChange={(v) => updateField('contract_type', v as ProjectContract['contract_type'])}
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
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={(v) => updateField('status', v as ProjectContract['status'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(['Draft', 'Active', 'Expired', 'Cancelled', 'Suspended'] as const).map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Contract date</Label>
                            <DatePicker value={form.contract_date || ''} onChange={(v) => updateField('contract_date', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={form.contract_value}
                                onChange={(e) => updateField('contract_value', parseFloat(e.target.value) || 0)}
                            />
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
                            <Label>Start</Label>
                            <DatePicker value={form.start_date || ''} onChange={(v) => updateField('start_date', v)} />
                        </div>
                        <div className="space-y-2">
                            <Label>End</Label>
                            <DatePicker value={form.end_date || ''} onChange={(v) => updateField('end_date', v)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Scope</Label>
                            <Textarea value={form.scope} onChange={(e) => updateField('scope', e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Payment terms</Label>
                            <Textarea
                                value={form.payment_terms}
                                onChange={(e) => updateField('payment_terms', e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Notes</Label>
                            <Textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={2} />
                        </div>
                    </div>
                </EnhancedCard>
                <Button type="submit" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save changes
                </Button>
            </form>
        </div>
    );
}

export default function UpdateProjectContractPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            }
        >
            <UpdateInner />
        </Suspense>
    );
}
