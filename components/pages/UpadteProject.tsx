'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';
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
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { DatePicker } from "@/components/DatePicker";


type ProjectPayload = {
    project_id?: string;
    project_code: string;
    name: string;
    start_date: string;
    end_date: string;
    type: string;
    fiscal_year: string;
    original_budget: number | string;
    revised_budget: number | string;
    committed_cost: number | string;
    actual_cost: number | string;
    description?: string;
};

const initialValues: ProjectPayload = {
    project_id: '',
    project_code: '',
    name: '',
    start_date: '',
    end_date: '',
    type: '',
    fiscal_year: '',
    original_budget: 0,
    revised_budget: 0,
    committed_cost: 0,
    actual_cost: 0,
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

const UpdateProjectPage: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const projectId = params.get('id') || '';
    const [form, setForm] = useState<ProjectPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!projectId) return;
        const fetchData = async () => {
            try {
                const result = await axios.get(`/projects/fetch/project/${projectId}`);
                const project = result.data.body.project;
                const budget = result.data.body.budget;
                setForm({
                    project_id: project.id,
                    project_code: project.project_code,
                    name: project.name,
                    start_date: project.start_date.slice(0, 10),
                    end_date: project.end_date.slice(0, 10),
                    type: project.type,
                    fiscal_year: budget.fiscal_year,
                    original_budget: budget.original_budget,
                    revised_budget: budget.revised_budget,
                    committed_cost: budget.committed_cost,
                    actual_cost: budget.actual_cost,
                    description: project.description || ''
                });
            } catch {
                toast.error('Failed to fetch project data');
            }
        };
        fetchData();
    }, [projectId]);

    const updateField = useCallback((name: keyof ProjectPayload, value: string) => {
        if (numberFields.includes(name)) {
            value = value.replace(/,/g, ''); // Prevent , input
            setForm(prev => ({ ...prev, [name]: value }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name as string];
            return clone;
        });
    }, []);

    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof ProjectPayload)[] = [
            'project_code', 'name', 'start_date', 'end_date', 'type', 'fiscal_year'
        ];

        required.forEach(f => {
            if (!form[f] || String(form[f]).trim() === '') {
                errors[f] = 'Required';
            }
        });

        if (form.start_date && form.end_date) {
            const sd = new Date(form.start_date);
            const ed = new Date(form.end_date);
            if (ed < sd) errors.end_date = 'End date must be after or equal to start date';
        }

        if (!errors.original_budget && !errors.revised_budget) {
            const original = Number(String(form.original_budget).replace(/,/g, ''));
            const revised = Number(String(form.revised_budget).replace(/,/g, ''));
            if (!(original > revised)) {
                errors.revised_budget = 'Revised budget must be LESS than Original Budget';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    const formattedPayload = useMemo(() => {
        const payload: any = { ...form };
        numberFields.forEach(nf => {
            const cleanValue = String(form[nf]).replace(/,/g, '').trim();
            payload[nf] = cleanValue === '' ? 0 : Number(cleanValue);
        });
        return payload as ProjectPayload;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        setLoading(true);
        try {
            const result = await axios.put(`/projects/update/${projectId}`, { params: formattedPayload });
            if (result.data?.header?.success) {
                toast.success('Project updated successfully!');
                router.push('/projects');
            } else {
                toast.error(result.data?.header?.messages?.[0]?.message || 'Failed to update project.');
            }
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to update project. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFieldErrors({});
        router.refresh();
        toast.message('Reloaded current project data.');
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Update Project</h1>
                    <p className="text-muted-foreground mt-2">Update the project details below, then save.</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/projects')}>Back to Projects</Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <InputGroup label="Project Code *" value={form.project_code} name="project_code" error={fieldErrors.project_code} onChange={updateField} />
                                <InputGroup label="Name *" value={form.name} name="name" error={fieldErrors.name} onChange={updateField} />
                                <SelectGroup label="Type *" value={form.type} options={projectTypes} name="type" error={fieldErrors.type} onChange={updateField} />
                                <SelectGroup label="Fiscal Year *" value={form.fiscal_year} options={fiscalYears} name="fiscal_year" error={fieldErrors.fiscal_year} onChange={updateField} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <textarea id="description" className="w-full rounded-md border px-3 py-2 text-sm shadow-sm" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="Short description..." />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Dates</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date">Start Date *</Label>
                                <DatePicker value={form.start_date} onChange={(val) => updateField('start_date', val)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date">End Date *</Label>
                                <DatePicker value={form.end_date} onChange={(val) => updateField('end_date', val)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle>Budget & Costs</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {numberFields.map(f => (
                                <InputGroup key={f} label={`${f.replace('_', ' ')} *`} inputMode="numeric" value={form[f]} name={f} error={fieldErrors[f]} onChange={updateField} />
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
                        <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Save className="h-4 w-4 mr-2" />{loading ? 'Saving...' : 'Update Project'}</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default UpdateProjectPage;

const InputGroup = ({ label, value, name, error, onChange, type = 'text', inputMode }: any) => (
    <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} type={type} inputMode={inputMode} value={value} onChange={e => onChange(name, e.target.value)} />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const SelectGroup = ({ label, value, options, name, error, onChange }: any) => (
    <div className="space-y-2">
        <Label htmlFor={name}>{label}</Label>
        <Select value={value} onValueChange={val => onChange(name, val)}>
            <SelectTrigger id={name}><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{options.map((o: string) => <SelectItem value={o} key={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);
