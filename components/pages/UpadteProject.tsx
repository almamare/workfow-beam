'use client';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
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
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';


type ProjectPayload = {
    project_id?: string;
    project_code: string;
    name: string;
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

const UpdateProjectPageContent: React.FC = () => {
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
                    type: project.type,
                    fiscal_year: budget.fiscal_year,
                    original_budget: budget.original_budget || '',
                    revised_budget: budget.revised_budget || '',
                    committed_cost: budget.committed_cost || '',
                    actual_cost: budget.actual_cost || '',
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
            'project_code', 'name', 'type', 'fiscal_year'
        ];

        required.forEach(f => {
            if (!form[f] || String(form[f]).trim() === '') {
                errors[f] = 'Required';
            }
        });

        numberFields.forEach(f => {
            const val = form[f];
            if (val === '' || val === null || val === undefined) return; // optional
            const num = Number(String(val).replace(/,/g, ''));
            if (Number.isNaN(num)) errors[f] = 'Invalid number';
            else if (num < 0) errors[f] = 'Must be ≥ 0';
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    const formattedPayload = useMemo(() => {
        const payload: Record<string, any> = { ...form };
        numberFields.forEach(nf => {
            const v = form[nf];
            if (v === '' || v === null || v === undefined) {
                delete payload[nf];
            } else {
                payload[nf] = Number(String(v).replace(/,/g, ''));
            }
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
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Update Project</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Update the project details below, then save.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/projects')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Projects
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <EnhancedCard 
                        title="Basic Information" 
                        description="Core identifying information for the project." 
                        variant="default" 
                        size="sm" 
                        className="md:col-span-2"
                    >
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <InputGroup label="Project Code *" value={form.project_code} name="project_code" error={fieldErrors.project_code} onChange={updateField} />
                                <InputGroup label="Name *" value={form.name} name="name" error={fieldErrors.name} onChange={updateField} />
                                <SelectGroup label="Type *" value={form.type} options={projectTypes} name="type" error={fieldErrors.type} onChange={updateField} />
                                <SelectGroup label="Fiscal Year *" value={form.fiscal_year} options={fiscalYears} name="fiscal_year" error={fieldErrors.fiscal_year} onChange={updateField} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description (Optional)</Label>
                                <textarea 
                                    id="description" 
                                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100 dark:focus-visible:ring-orange-900/50 focus:border-orange-300 dark:focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                                    value={form.description} 
                                    onChange={e => updateField('description', e.target.value)} 
                                    placeholder="Short description..." 
                                />
                            </div>
                        </div>
                    </EnhancedCard>

                    {/* Budget & Costs (REPLACES DATES) */}
                    <EnhancedCard 
                        title="Budget & Costs (Optional)" 
                        description="Leave any field blank if not applicable. Numbers must be ≥ 0 when provided." 
                        variant="default" 
                        size="sm"
                    >
                        <div className="grid gap-4 md:grid-cols-1">
                            {numberFields.map(f => (
                                <InputGroup 
                                    key={f} 
                                    label={f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                                    inputMode="numeric" 
                                    value={form[f]} 
                                    name={f} 
                                    error={fieldErrors[f]} 
                                    onChange={updateField} 
                                />
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleReset} 
                                disabled={loading}
                                className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" /> Reset
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : 'Update Project'}
                            </Button>
                        </div>
                    </EnhancedCard>
                </div>
            </form>
        </div>
    );
};

export default function UpdateProjectPage() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading project...</div>}>
            <UpdateProjectPageContent />
        </Suspense>
    );
}

const InputGroup = ({ label, value, name, error, onChange, type = 'text', inputMode }: any) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-slate-700 dark:text-slate-200">{label}</Label>
        <Input 
            id={name} 
            type={type} 
            inputMode={inputMode} 
            value={value} 
            onChange={e => onChange(name, e.target.value)}
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700  focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
);

const SelectGroup = ({ label, value, options, name, error, onChange }: any) => (
    <div className="space-y-2">
        <Label htmlFor={name} className="text-slate-700 dark:text-slate-200">{label}</Label>
        <Select value={value} onValueChange={val => onChange(name, val)}>
            <SelectTrigger 
                id={name}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
            >
                <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                {options.map((o: string) => (
                    <SelectItem 
                        value={o} 
                        key={o}
                        className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200"
                    >
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
);
