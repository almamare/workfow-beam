'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from '@/components/ui/select';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { DatePicker } from "@/components/DatePicker";
import { EnhancedCard } from '@/components/ui/enhanced-card';


/* =========================
   Types
========================= */
type ProjectPayload = {
    project_code: string;
    name: string;
    client_id?: string;      // ← نرسل ID العميل
    client_name?: string;    // ← اختياري (اسم العميل المقروء)
    start_date: string;
    end_date: string;
    type: string;
    fiscal_year: string;
    original_budget?: number | string;  // ← اختياري
    revised_budget?: number | string;   // ← اختياري
    committed_cost?: number | string;   // ← اختياري
    actual_cost?: number | string;      // ← اختياري
    description?: string;
};

type ClientOption = {
    id: string;
    name: string;
    client_no?: string;
};

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
    revised_budget: '',
    committed_cost: '',
    actual_cost: '',
    description: ''
};

const projectTypes = ['Public', 'Communications', 'Restoration', 'Referral'];
const fiscalYears = Array.from({ length: 6 }).map((_, i) => `${2024 + i}`);
const numberFields: (keyof ProjectPayload)[] = [
    'original_budget',
    'revised_budget',
    'committed_cost',
    'actual_cost'
];

/* =========================
   Component
========================= */
const CreateProjectPage: React.FC = () => {
    const [form, setForm] = useState<ProjectPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [clientsLoading, setClientsLoading] = useState<boolean>(true);

    const router = useRouter();

    /* ---- Fetch clients for dropdown ---- */
    useEffect(() => {
        let canceled = false;
        (async () => {
            try {
                setClientsLoading(true);
                const res = await axios.get('/clients/fetch', {
                    params: { page: 1, limit: 1000, search: '' }
                });
                const items: any[] =
                    res?.data?.body?.clients?.items ||
                    res?.data?.clients ||
                    res?.data?.data ||
                    [];
                if (!canceled) {
                    const mapped = items.map((c) => ({
                        id: c.id,
                        name: c.name,
                        client_no: c.client_no,
                    })) as ClientOption[];
                    setClients(mapped);
                }
            } catch (e: any) {
                if (!canceled) {
                    toast.error(
                        e?.response?.data?.header?.message ||
                        e?.response?.data?.message ||
                        e?.message ||
                        'Failed to load clients'
                    );
                }
            } finally {
                if (!canceled) setClientsLoading(false);
            }
        })();
        return () => {
            canceled = true;
        };
    }, []);

    /* ---- Update field ---- */
    const updateField = useCallback(
        (name: keyof ProjectPayload, value: string) => {
            if (numberFields.includes(name)) {
                if (value === '') {
                    setForm((prev) => ({ ...prev, [name]: '' }));
                } else if (/^\d+(\.\d+)?$/.test(value)) {
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
        },
        []
    );


    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof ProjectPayload)[] = [
            'project_code',
            'name',
            'client_id',
            'type',
            'fiscal_year',
        ];

        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') {
                errors[f] = 'Required';
            }
        });

        numberFields.forEach((f) => {
            const val = form[f];
            if (val === '' || val === null || val === undefined) return; // ← اختياري
            const num = Number(val);
            if (Number.isNaN(num)) errors[f] = 'Invalid number';
            else if (num < 0) errors[f] = 'Must be ≥ 0';
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    const formattedPayload = useMemo(() => {
        const payload: Record<string, any> = { ...form };

        numberFields.forEach((nf) => {
            const v = form[nf];
            if (v === '' || v === null || v === undefined) {
                delete payload[nf];
            } else {
                payload[nf] = Number(v);
            }
        });

        if (form.client_id && !form.client_name) {
            const c = clients.find((x) => x.id === form.client_id);
            if (c) payload.client_name = c.name;
        }

        return payload as ProjectPayload;
    }, [form, clients]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        setLoading(true);
        try {
            const result = await axios.post('/projects/create', { params: formattedPayload });

            if (result?.data?.header?.success) {
                toast.success('Project created successfully!');
                setForm(initialValues);
            } else {
                toast.error(
                    result?.data?.header?.messages?.[0]?.message ||
                    result?.data?.header?.message ||
                    result?.data?.message ||
                    'Failed to create project.'
                );
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.header?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create project. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        toast.message('Form reset to initial defaults.');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Create Project</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter the project details below, then submit to create a new project.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/projects')} 
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        Back to Projects
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form id="project-create-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Basic Information */}
                    <EnhancedCard title="Basic Information" description="Core identifying information for the project." variant="default" size="sm" className="md:col-span-2">
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="project_code" className="text-slate-700 dark:text-slate-200">Project Code *</Label>
                                    <Input
                                        id="project_code"
                                        value={form.project_code}
                                        onChange={(e) => updateField('project_code', e.target.value)}
                                        placeholder="XXX-XXX-XXX"
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                    {fieldErrors.project_code && (
                                        <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.project_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="Project Name"
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    />
                                    {fieldErrors.name && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>}
                                </div>

                                {/* Client dropdown from server */}
                                <div className="space-y-2">
                                    <Label htmlFor="client_id" className="text-slate-700 dark:text-slate-200">Client *</Label>
                                    <Select
                                        value={form.client_id || ''}
                                        onValueChange={(val) => {
                                            updateField('client_id', val);
                                            const c = clients.find((x) => x.id === val);
                                            updateField('client_name', c?.name || '');
                                        }}
                                        disabled={clientsLoading}
                                    >
                                        <SelectTrigger 
                                            id="client_id" 
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                                        >
                                            <SelectValue placeholder={clientsLoading ? 'Loading clients...' : 'Select client'} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                            {clients.map((c) => (
                                                <SelectItem 
                                                    key={c.id} 
                                                    value={c.id}
                                                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                                >
                                                    {c.name} {c.client_no ? `(${c.client_no})` : ''}
                                                </SelectItem>
                                            ))}
                                            {!clientsLoading && clients.length === 0 && (
                                                <SelectItem value="__no__" disabled className="text-slate-500 dark:text-slate-400 cursor-not-allowed">
                                                    No clients found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.client_id && (
                                        <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.client_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-slate-700 dark:text-slate-200">Type *</Label>
                                    <Select value={form.type} onValueChange={(val) => updateField('type', val)}>
                                        <SelectTrigger 
                                            id="type" 
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                                        >
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                            {projectTypes.map((t) => (
                                                <SelectItem 
                                                    value={t} 
                                                    key={t}
                                                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                                >
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.type && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fiscal_year" className="text-slate-700 dark:text-slate-200">Fiscal Year *</Label>
                                    <Select
                                        value={form.fiscal_year}
                                        onValueChange={(val) => updateField('fiscal_year', val)}
                                    >
                                        <SelectTrigger 
                                            id="fiscal_year" 
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                                        >
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                            {fiscalYears.map((y) => (
                                                <SelectItem 
                                                    value={y} 
                                                    key={y}
                                                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                                >
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.fiscal_year && (
                                        <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.fiscal_year}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description (Optional)</Label>
                                <textarea
                                    id="description"
                                    className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/50 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    value={form.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Short project description..."
                                />
                            </div>
                        </div>
                    </EnhancedCard>

                    {/* Budget & Costs (REPLACES DATES) */}
                    <EnhancedCard title="Budget & Costs (Optional)" description="Leave any field blank if not applicable. Numbers must be ≥ 0 when provided." variant="default" size="sm">
                        <div className="grid gap-4 md:grid-cols-1">
                            <div className="space-y-2">
                                <Label htmlFor="original_budget" className="text-slate-700 dark:text-slate-200">Original Budget</Label>
                                <Input
                                    id="original_budget"
                                    inputMode="numeric"
                                    value={form.original_budget ?? ''}
                                    onChange={(e) => updateField('original_budget', e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.original_budget && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.original_budget}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="revised_budget" className="text-slate-700 dark:text-slate-200">Revised Budget</Label>
                                <Input
                                    id="revised_budget"
                                    inputMode="numeric"
                                    value={form.revised_budget ?? ''}
                                    onChange={(e) => updateField('revised_budget', e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.revised_budget && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.revised_budget}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="committed_cost" className="text-slate-700 dark:text-slate-200">Committed Cost</Label>
                                <Input
                                    id="committed_cost"
                                    inputMode="numeric"
                                    value={form.committed_cost ?? ''}
                                    onChange={(e) => updateField('committed_cost', e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.committed_cost && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.committed_cost}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="actual_cost" className="text-slate-700 dark:text-slate-200">Actual Cost</Label>
                                <Input
                                    id="actual_cost"
                                    inputMode="numeric"
                                    value={form.actual_cost ?? ''}
                                    onChange={(e) => updateField('actual_cost', e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.actual_cost && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.actual_cost}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
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
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Create Project'}
                            </Button>
                        </div>
                    </EnhancedCard>
                </div>

                {/* Removed the separate Budget card below */}
            </form>
        </div>
    );
};

export default CreateProjectPage;
