'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import { createProjectContract } from '@/stores/slices/project-contracts';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { fetchContractors, selectContractors } from '@/stores/slices/contractors';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { DatePicker } from '@/components/DatePicker';
import type { CreateProjectContractRequest } from '@/stores/types/project-contracts';
import { validateFile, formatFileSize, fileToBase64WithProgress } from '@/utils/fileUtils';

interface PendingFile {
    file: File;
    title: string;
    id: string;
}

type FormState = CreateProjectContractRequest;

const initialValues: FormState = {
    project_id: '',
    contractor_id: '',
    title: '',
    contract_type: 'Main',
    description: '',
    scope: '',
    payment_terms: '',
    contract_date: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    notes: '',
};

const CONTRACT_TYPES = ['Main', 'Subcontract', 'Amendment', 'Framework', 'Other'] as const;

const INPUT_CLS =
    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';

const Err = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-red-500 dark:text-red-400">{msg}</p> : null;

export default function CreateProjectContractPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const allProjects = useSelector(selectProjects);
    const allContractors = useSelector(selectContractors);

    const activeProjects = useMemo(() => allProjects.filter((p: any) => p.status === 'Active'), [allProjects]);
    const activeContractors = useMemo(() => allContractors.filter((c: any) => c.status === 'Active'), [allContractors]);

    const [form, setForm] = useState<FormState>(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchProjects({ limit: 500 }));
        dispatch(fetchContractors({ limit: 500, status: 'Active' }));
    }, [dispatch]);

    const updateField = useCallback((name: keyof FormState, value: unknown) => {
        setForm((prev) => ({ ...prev, [name]: value as never }));
        setErrors((prev) => { const c = { ...prev }; delete c[name as string]; return c; });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.project_id) errs.project_id = 'Required';
        if (!form.title?.trim()) errs.title = 'Required';
        if (!form.contract_date) errs.contract_date = 'Required';
        if (form.start_date && form.contract_date && new Date(form.start_date) < new Date(form.contract_date))
            errs.start_date = 'Must be on or after contract date';
        if (form.end_date && form.start_date && new Date(form.end_date) < new Date(form.start_date))
            errs.end_date = 'Must be on or after start date';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        Array.from(files).forEach((file) => {
            const validation = validateFile(file);
            if (!validation.valid) { toast.error(`${file.name}: ${validation.error || 'Invalid file'}`); return; }
            const id = `${Date.now()}-${Math.random()}`;
            const title = file.name.replace(/\.[^/.]+$/, '');
            setPendingFiles((prev) => [...prev, { file, title, id }]);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) { toast.error('Please fix the validation errors.'); return; }
        setLoading(true);
        try {
            const payload: CreateProjectContractRequest = { ...form };
            if (!payload.contractor_id) delete payload.contractor_id;
            if (!payload.description?.trim()) delete payload.description;
            if (!payload.scope?.trim()) delete payload.scope;
            if (!payload.payment_terms?.trim()) delete payload.payment_terms;
            if (!payload.start_date?.trim()) delete payload.start_date;
            if (!payload.end_date?.trim()) delete payload.end_date;
            if (!payload.notes?.trim()) delete payload.notes;

            if (pendingFiles.length > 0) {
                payload.attachments = await Promise.all(
                    pendingFiles.map(async (pf) => {
                        const base64 = await fileToBase64WithProgress(pf.file, () => {});
                        const mime = pf.file.type || 'application/octet-stream';
                        return { title: pf.title.trim(), file: `data:${mime};base64,${base64}`, status: 'Active', version: '1.0' };
                    })
                );
            }

            await dispatch(createProjectContract(payload)).unwrap();
            toast.success('Contract created and sent for approval.');
            router.push('/contracts/contracts');
        } catch (err: unknown) {
            toast.error(typeof err === 'string' ? err : 'Failed to create contract');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setErrors({});
        setPendingFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.message('Form reset to initial defaults.');
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Contract
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter contract details below, then submit to create a new contract.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/contracts/contracts')}
                        className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        Back to Contracts
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Card 1: Contract Information ── */}
                <EnhancedCard
                    title="Contract Information"
                    description="Core identifying information for the contract."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                            {/* Project */}
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-slate-700 dark:text-slate-200">Project *</Label>
                                <Select value={form.project_id} onValueChange={(v) => updateField('project_id', v)}>
                                    <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Select active project…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeProjects.length === 0 ? (
                                            <div className="px-3 py-4 text-sm text-slate-500 text-center">No active projects found</div>
                                        ) : (
                                            activeProjects.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name} ({p.number})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Err msg={errors.project_id} />
                            </div>

                            {/* Contractor */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">Contractor</Label>
                                <Select value={form.contractor_id || ''} onValueChange={(v) => updateField('contractor_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select active contractor…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeContractors.length === 0 ? (
                                            <div className="px-3 py-4 text-sm text-slate-500 text-center">No active contractors found</div>
                                        ) : (
                                            activeContractors.map((c: any) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name} ({c.number})
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Title */}
                            <div className="space-y-2 lg:col-span-2">
                                <Label className="text-slate-700 dark:text-slate-200">Contract Title *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="e.g. Main Construction Contract — Phase 1"
                                    className={`${INPUT_CLS} ${errors.title ? 'border-red-500' : ''}`}
                                />
                                <Err msg={errors.title} />
                            </div>

                            {/* Contract Type */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">Contract Type</Label>
                                <Select
                                    value={form.contract_type}
                                    onValueChange={(v) => updateField('contract_type', v as FormState['contract_type'])}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {CONTRACT_TYPES.map((t) => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Contract Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">Contract Date *</Label>
                                <DatePicker value={form.contract_date} onChange={(v) => updateField('contract_date', v)} />
                                <Err msg={errors.contract_date} />
                            </div>

                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">Start Date</Label>
                                <DatePicker value={form.start_date || ''} onChange={(v) => updateField('start_date', v)} />
                                <Err msg={errors.start_date} />
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">End Date</Label>
                                <DatePicker value={form.end_date || ''} onChange={(v) => updateField('end_date', v)} />
                                <Err msg={errors.end_date} />
                            </div>

                        </div>
                    </div>
                </EnhancedCard>

                {/* ── Card 2: Contract Body ── */}
                <EnhancedCard
                    title="Contract Body"
                    description="Describe the scope, terms, and additional notes."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Description</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Brief overview of the contract…"
                                rows={3}
                                className={`${INPUT_CLS} resize-none`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Scope of Work</Label>
                            <Textarea
                                value={form.scope}
                                onChange={(e) => updateField('scope', e.target.value)}
                                placeholder="Detailed scope of deliverables and responsibilities…"
                                rows={4}
                                className={`${INPUT_CLS} resize-none`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Payment Terms</Label>
                            <Textarea
                                value={form.payment_terms}
                                onChange={(e) => updateField('payment_terms', e.target.value)}
                                placeholder="e.g. 30% on signing, 40% on milestone, 30% on completion…"
                                rows={3}
                                className={`${INPUT_CLS} resize-none`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Notes</Label>
                            <Textarea
                                value={form.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Notes for the approval request…"
                                rows={3}
                                className={`${INPUT_CLS} resize-none`}
                            />
                        </div>
                    </div>
                </EnhancedCard>

                {/* ── Card 3: Documents ── */}
                <EnhancedCard
                    title="Documents"
                    description="Attach supporting documents to the contract"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-200">Upload Documents</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className={INPUT_CLS}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select Files
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max 10MB per file)
                            </p>
                        </div>

                        {pendingFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">
                                    Selected Files ({pendingFiles.length})
                                </Label>
                                <div className="space-y-2">
                                    {pendingFiles.map((pf) => (
                                        <div
                                            key={pf.id}
                                            className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                                        >
                                            <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <Input
                                                    value={pf.title}
                                                    onChange={(e) =>
                                                        setPendingFiles((prev) =>
                                                            prev.map((f) => f.id === pf.id ? { ...f, title: e.target.value } : f)
                                                        )
                                                    }
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
                                                    placeholder="File title"
                                                />
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {pf.file.name} · {formatFileSize(pf.file.size)}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPendingFiles((prev) => prev.filter((f) => f.id !== pf.id))}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* ── Footer Actions ── */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={loading}
                        className="border-brand-sky-200 dark:border-brand-sky-800 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:text-brand-sky-700 dark:hover:text-brand-sky-300 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 dark:from-brand-sky-600 dark:to-brand-sky-700 dark:hover:from-brand-sky-700 dark:hover:to-brand-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Creating Contract...' : 'Create Contract'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
