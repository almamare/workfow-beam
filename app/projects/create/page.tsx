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
            'start_date',
            'end_date',
            'type',
            'fiscal_year',
        ];

        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') {
                errors[f] = 'Required';
            }
        });

        if (form.start_date && form.end_date) {
            const sd = new Date(form.start_date);
            const ed = new Date(form.end_date);
            if (ed < sd) errors.end_date = 'End date must be after or equal to start date';
        }

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
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create Project</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter the project details below, then submit to create a new project.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/projects')}>
                        Back to Projects
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form id="project-create-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Basic Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core identifying information for the project.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="project_code">Project Code *</Label>
                                    <Input
                                        id="project_code"
                                        value={form.project_code}
                                        onChange={(e) => updateField('project_code', e.target.value)}
                                        placeholder="XXX-XXX-XXX"
                                    />
                                    {fieldErrors.project_code && (
                                        <p className="text-xs text-red-500">{fieldErrors.project_code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        placeholder="Project Name"
                                    />
                                    {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
                                </div>

                                {/* Client dropdown from server */}
                                <div className="space-y-2">
                                    <Label htmlFor="client_id">Client *</Label>
                                    <Select
                                        value={form.client_id || ''}
                                        onValueChange={(val) => {
                                            updateField('client_id', val);
                                            const c = clients.find((x) => x.id === val);
                                            updateField('client_name', c?.name || '');
                                        }}
                                        disabled={clientsLoading}
                                    >
                                        <SelectTrigger id="client_id">
                                            <SelectValue placeholder={clientsLoading ? 'Loading clients...' : 'Select client'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name} {c.client_no ? `(${c.client_no})` : ''}
                                                </SelectItem>
                                            ))}
                                            {!clientsLoading && clients.length === 0 && (
                                                <SelectItem value="__no__" disabled>
                                                    No clients found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.client_id && (
                                        <p className="text-xs text-red-500">{fieldErrors.client_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select value={form.type} onValueChange={(val) => updateField('type', val)}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectTypes.map((t) => (
                                                <SelectItem value={t} key={t}>
                                                    {t}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.type && <p className="text-xs text-red-500">{fieldErrors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fiscal_year">Fiscal Year *</Label>
                                    <Select
                                        value={form.fiscal_year}
                                        onValueChange={(val) => updateField('fiscal_year', val)}
                                    >
                                        <SelectTrigger id="fiscal_year">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fiscalYears.map((y) => (
                                                <SelectItem value={y} key={y}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.fiscal_year && (
                                        <p className="text-xs text-red-500">{fieldErrors.fiscal_year}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <textarea
                                    id="description"
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={form.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Short project description..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dates */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dates</CardTitle>
                            <CardDescription>Define the planned start and end dates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <DatePicker
                                    value={form.start_date}
                                    onChange={(val) => updateField('start_date', val)}
                                />
                                {fieldErrors.start_date && (
                                    <p className="text-xs text-red-500">{fieldErrors.start_date}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date *</Label>
                                <DatePicker
                                    value={form.end_date}
                                    onChange={(val) => updateField('end_date', val)}
                                />
                                {fieldErrors.end_date && (
                                    <p className="text-xs text-red-500">{fieldErrors.end_date}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Budget & Costs (OPTIONAL) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Budget & Costs (Optional)</CardTitle>
                        <CardDescription>
                            Leave any field blank if not applicable. Numbers must be ≥ 0 when provided.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="original_budget">Original Budget</Label>
                                <Input
                                    id="original_budget"
                                    inputMode="numeric"
                                    value={form.original_budget ?? ''}
                                    onChange={(e) => updateField('original_budget', e.target.value)}
                                    placeholder="0"
                                />
                                {fieldErrors.original_budget && (
                                    <p className="text-xs text-red-500">{fieldErrors.original_budget}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="revised_budget">Revised Budget</Label>
                                <Input
                                    id="revised_budget"
                                    inputMode="numeric"
                                    value={form.revised_budget ?? ''}
                                    onChange={(e) => updateField('revised_budget', e.target.value)}
                                    placeholder="0"
                                />
                                {fieldErrors.revised_budget && (
                                    <p className="text-xs text-red-500">{fieldErrors.revised_budget}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="committed_cost">Committed Cost</Label>
                                <Input
                                    id="committed_cost"
                                    inputMode="numeric"
                                    value={form.committed_cost ?? ''}
                                    onChange={(e) => updateField('committed_cost', e.target.value)}
                                    placeholder="0"
                                />
                                {fieldErrors.committed_cost && (
                                    <p className="text-xs text-red-500">{fieldErrors.committed_cost}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="actual_cost">Actual Cost</Label>
                                <Input
                                    id="actual_cost"
                                    inputMode="numeric"
                                    value={form.actual_cost ?? ''}
                                    onChange={(e) => updateField('actual_cost', e.target.value)}
                                    placeholder="0"
                                />
                                {fieldErrors.actual_cost && (
                                    <p className="text-xs text-red-500">{fieldErrors.actual_cost}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Create Project'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateProjectPage;
