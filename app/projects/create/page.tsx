'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, Upload, X, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { validateFile, formatFileSize, fileToBase64WithProgress } from '@/utils/fileUtils';

/* =========================
   Types
========================= */
type ProjectPayload = {
    project_code: string;
    name: string;
    client_id?: string;
    client_name?: string;
    start_date?: string;
    end_date?: string;
    type: string;
    fiscal_year: string;
    original_budget?: number | string;
    description?: string;
    notes?: string;
};

type ClientOption = {
    id: string;
    name: string;
    client_no?: string;
};

interface PendingFile {
    file: File;
    title: string;
    id: string;
}

/* =========================
   Constants & Initial State
========================= */
const initialValues: ProjectPayload = {
    project_code: '',
    name: '',
    client_id: '',
    client_name: '',
    start_date: '',
    end_date: '',
    type: '',
    fiscal_year: '',
    original_budget: '',
    description: '',
    notes: '',
};

const projectTypes = ['Public', 'Communications', 'Restoration', 'Referral'];
const fiscalYears = Array.from({ length: 6 }).map((_, i) => `${2024 + i}`);

const INPUT_CLS =
    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';
const SELECT_CLS =
    'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200';
const SELECT_ITEM_CLS =
    'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200';
const SELECT_CONTENT_CLS = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg';

/* =========================
   Component
========================= */
const CreateProjectPage: React.FC = () => {
    const [form, setForm] = useState<ProjectPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    /* ---- Fetch clients ---- */
    useEffect(() => {
        let canceled = false;
        (async () => {
            try {
                setClientsLoading(true);
                const res = await axios.get('/clients/fetch', {
                    params: { page: 1, limit: 1000, search: '', status: 'Active' },
                });
                const items: any[] =
                    res?.data?.body?.clients?.items ||
                    res?.data?.clients ||
                    res?.data?.data ||
                    [];
                if (!canceled) {
                    const mapped = items
                        .filter((c) => c.status === 'Active')
                        .map((c) => ({ id: c.id, name: c.name, client_no: c.client_no }));
                    setClients(mapped);
                }
            } catch (e: any) {
                if (!canceled)
                    toast.error(e?.response?.data?.header?.message || e?.message || 'Failed to load clients');
            } finally {
                if (!canceled) setClientsLoading(false);
            }
        })();
        return () => { canceled = true; };
    }, []);

    /* ---- Field updates ---- */
    const updateField = useCallback((name: keyof ProjectPayload, value: string) => {
        if (name === 'original_budget') {
            if (value === '' || /^\d+(\.\d+)?$/.test(value)) {
                setForm((prev) => ({ ...prev, [name]: value }));
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        setFieldErrors((prev) => {
            const clone = { ...prev };
            delete clone[name as string];
            return clone;
        });
    }, []);

    /* ---- Validation ---- */
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof ProjectPayload)[] = ['project_code', 'name', 'client_id', 'type', 'fiscal_year'];
        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') errors[f] = 'Required';
        });
        if (form.original_budget !== '' && form.original_budget !== undefined) {
            const num = Number(form.original_budget);
            if (Number.isNaN(num)) errors.original_budget = 'Invalid number';
            else if (num < 0) errors.original_budget = 'Must be ≥ 0';
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    /* ---- Formatted payload ---- */
    const formattedPayload = useMemo(() => {
        const payload: Record<string, any> = { ...form };
        if (form.original_budget === '' || form.original_budget === null || form.original_budget === undefined) {
            delete payload.original_budget;
        } else {
            payload.original_budget = Number(form.original_budget);
        }
        if (form.client_id && !form.client_name) {
            const c = clients.find((x) => x.id === form.client_id);
            if (c) payload.client_name = c.name;
        }
        return payload as ProjectPayload;
    }, [form, clients]);

    /* ---- File handlers ---- */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files;
        if (!selected || selected.length === 0) return;
        Array.from(selected).forEach((file) => {
            const validation = validateFile(file);
            if (!validation.valid) {
                toast.error(`${file.name}: ${validation.error || 'Invalid file'}`);
                return;
            }
            const id = `${Date.now()}-${Math.random()}`;
            const title = file.name.replace(/\.[^/.]+$/, '');
            setPendingFiles((prev) => [...prev, { file, title, id }]);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveFile = (id: string) =>
        setPendingFiles((prev) => prev.filter((f) => f.id !== id));

    const handleUpdateFileTitle = (id: string, newTitle: string) =>
        setPendingFiles((prev) => prev.map((f) => (f.id === id ? { ...f, title: newTitle } : f)));

    /* ---- Submit ---- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        setLoading(true);
        try {
            const basePayload: any = { ...formattedPayload };

            if (pendingFiles.length > 0) {
                const attachments = await Promise.all(
                    pendingFiles.map(async (pf) => {
                        const base64 = await fileToBase64WithProgress(pf.file, () => {});
                        const mimeType = pf.file.type || 'application/octet-stream';
                        return {
                            title: pf.title.trim(),
                            file: `data:${mimeType};base64,${base64}`,
                            status: 'Active',
                            version: '1.0',
                        };
                    })
                );
                basePayload.attachments = attachments;
            }

            const result = await axios.post('/projects/create', { params: basePayload });

            if (result?.data?.header?.success) {
                toast.success('Project created successfully!');
                setForm(initialValues);
                setPendingFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
                const projectId =
                    result?.data?.body?.project_id ||
                    result?.data?.body?.project?.id ||
                    result?.data?.data?.project_id;
                if (projectId) {
                    router.push(`/projects/details?id=${projectId}`);
                } else {
                    router.push('/projects');
                }
            } else {
                toast.error(
                    result?.data?.header?.messages?.[0]?.message ||
                    result?.data?.header?.message ||
                    result?.data?.message ||
                    'Failed to create project.'
                );
            }
        } catch (error: any) {
            toast.error(
                error?.response?.data?.header?.messages?.[0]?.message ||
                error?.response?.data?.header?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create project. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        setPendingFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.message('Form reset to initial defaults.');
    };

    /* ---- Render ---- */
    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Project
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter the project details below, then submit to create a new project.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/projects')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                >
                    Back to Projects
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Basic Information ── */}
                <EnhancedCard
                    title="Basic Information"
                    description="Core identifying information for the project."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                            {/* Project Code */}
                            <div className="space-y-2">
                                <Label htmlFor="project_code" className="text-slate-700 dark:text-slate-200">
                                    Project Code *
                                </Label>
                                <Input
                                    id="project_code"
                                    value={form.project_code}
                                    onChange={(e) => updateField('project_code', e.target.value)}
                                    placeholder="XXX-XXX-XXX"
                                    className={INPUT_CLS}
                                />
                                {fieldErrors.project_code && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.project_code}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">
                                    Project Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder="Project Name"
                                    className={INPUT_CLS}
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Client */}
                            <div className="space-y-2">
                                <Label htmlFor="client_id" className="text-slate-700 dark:text-slate-200">
                                    Client *
                                </Label>
                                <Select
                                    value={form.client_id || ''}
                                    onValueChange={(val) => {
                                        updateField('client_id', val);
                                        const c = clients.find((x) => x.id === val);
                                        updateField('client_name', c?.name || '');
                                    }}
                                    disabled={clientsLoading}
                                >
                                    <SelectTrigger id="client_id" className={SELECT_CLS}>
                                        <SelectValue
                                            placeholder={clientsLoading ? 'Loading clients...' : 'Select client'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent className={SELECT_CONTENT_CLS}>
                                        {clients.map((c) => (
                                            <SelectItem key={c.id} value={c.id} className={SELECT_ITEM_CLS}>
                                                {c.name}
                                                {c.client_no ? ` (${c.client_no})` : ''}
                                            </SelectItem>
                                        ))}
                                        {!clientsLoading && clients.length === 0 && (
                                            <SelectItem value="__no__" disabled className="text-slate-500 dark:text-slate-400">
                                                No clients found
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.client_id && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.client_id}</p>
                                )}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-slate-700 dark:text-slate-200">
                                    Type *
                                </Label>
                                <Select value={form.type} onValueChange={(val) => updateField('type', val)}>
                                    <SelectTrigger id="type" className={SELECT_CLS}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className={SELECT_CONTENT_CLS}>
                                        {projectTypes.map((t) => (
                                            <SelectItem value={t} key={t} className={SELECT_ITEM_CLS}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.type && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.type}</p>
                                )}
                            </div>

                            {/* Fiscal Year */}
                            <div className="space-y-2">
                                <Label htmlFor="fiscal_year" className="text-slate-700 dark:text-slate-200">
                                    Fiscal Year *
                                </Label>
                                <Select
                                    value={form.fiscal_year}
                                    onValueChange={(val) => updateField('fiscal_year', val)}
                                >
                                    <SelectTrigger id="fiscal_year" className={SELECT_CLS}>
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className={SELECT_CONTENT_CLS}>
                                        {fiscalYears.map((y) => (
                                            <SelectItem value={y} key={y} className={SELECT_ITEM_CLS}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.fiscal_year && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.fiscal_year}</p>
                                )}
                            </div>

                            {/* Original Budget */}
                            <div className="space-y-2">
                                <Label htmlFor="original_budget" className="text-slate-700 dark:text-slate-200">
                                    Original Budget (Optional)
                                </Label>
                                <Input
                                    id="original_budget"
                                    inputMode="numeric"
                                    value={form.original_budget ?? ''}
                                    onChange={(e) => updateField('original_budget', e.target.value)}
                                    placeholder="0"
                                    className={INPUT_CLS}
                                />
                                {fieldErrors.original_budget && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.original_budget}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={form.description || ''}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Short project description..."
                                className={`min-h-[90px] w-full ${INPUT_CLS}`}
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">
                                Request Notes (Optional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={form.notes || ''}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Add any notes or comments for the project request..."
                                className={`min-h-[90px] w-full ${INPUT_CLS}`}
                            />
                        </div>
                    </div>
                </EnhancedCard>

                {/* ── Documents ── */}
                <EnhancedCard
                    title="Documents"
                    description="Attach supporting documents to the project request."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Upload input */}
                        <div className="space-y-2">
                            <Label htmlFor="attachments" className="text-slate-700 dark:text-slate-200">
                                Upload Documents
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={fileInputRef}
                                    id="attachments"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                    className={INPUT_CLS}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-shrink-0 border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select Files
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG — max 10 MB per file
                            </p>
                        </div>

                        {/* Pending files list */}
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
                                                    onChange={(e) => handleUpdateFileTitle(pf.id, e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
                                                    placeholder="File title"
                                                />
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {formatFileSize(pf.file.size)}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(pf.id)}
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

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={loading}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
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
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateProjectPage;
