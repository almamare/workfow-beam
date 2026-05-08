'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { createDepartment, type CreateDepartmentParams } from '@/stores/slices/departments';
import { fetchDepartments, selectDepartments } from '@/stores/slices/departments';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

type FormPayload = {
    name_en: string;
    name_ar: string;
    dept_code: string;
    level: number;
    status: string;
    department_id: string;
    parent_id: string;
};

const initialValues: FormPayload = {
    name_en: '',
    name_ar: '',
    dept_code: '',
    level: 1,
    status: 'Active',
    department_id: '',
    parent_id: '',
};

export default function CreateDepartmentPage() {
    const [form, setForm] = useState<FormPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchDepartments({}));
    }, [dispatch]);

    const departments = useSelector(selectDepartments);

    const updateField = useCallback(
        (name: keyof FormPayload, value: string | number) => {
            setForm((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        },
        []
    );

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.name_en?.trim()) errs.name_en = 'Required';
        if (!form.status) errs.status = 'Required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the errors below.');
            return;
        }
        setLoading(true);
        try {
            const params: CreateDepartmentParams = {
                name_en: form.name_en.trim(),
                level: form.level,
                status: form.status,
            };
            if (form.name_ar.trim()) params.name_ar = form.name_ar.trim();
            if (form.dept_code.trim()) params.dept_code = form.dept_code.trim();
            if (form.department_id) params.department_id = form.department_id;
            if (form.parent_id) params.parent_id = form.parent_id;
            const result = await dispatch(createDepartment(params));
            if (createDepartment.fulfilled.match(result)) {
                toast.success('Department created successfully');
                router.push('/departments');
            } else {
                toast.error((result.payload as string) || 'Failed to create department');
            }
        } catch {
            toast.error('Failed to create department');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setErrors({});
        toast.message('Form reset');
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Department
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Add a new department. Level: 1 = Top, 2 = Mid, 3 = Sub.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/departments')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700"
                >
                    Back to list
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <EnhancedCard
                    title="Department details"
                    description="Name, code, level, and status"
                    variant="default"
                    size="sm"
                >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="name_en">Name (EN) *</Label>
                            <Input
                                id="name_en"
                                value={form.name_en}
                                onChange={(e) => updateField('name_en', e.target.value)}
                                placeholder="English name"
                                className="bg-white dark:bg-slate-800"
                            />
                            {errors.name_en && (
                                <p className="text-xs text-red-500">{errors.name_en}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name_ar">Name (AR)</Label>
                            <Input
                                id="name_ar"
                                value={form.name_ar}
                                onChange={(e) => updateField('name_ar', e.target.value)}
                                placeholder="Arabic name"
                                className="bg-white dark:bg-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dept_code">Dept code</Label>
                            <Input
                                id="dept_code"
                                value={form.dept_code}
                                onChange={(e) => updateField('dept_code', e.target.value)}
                                placeholder="e.g. FINANCE"
                                className="bg-white dark:bg-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select
                                value={String(form.level)}
                                onValueChange={(v) => updateField('level', Number(v))}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="1">1 - Top</SelectItem>
                                    <SelectItem value="2">2 - Mid</SelectItem>
                                    <SelectItem value="3">3 - Sub</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <Select
                                value={form.status}
                                onValueChange={(v) => updateField('status', v)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-xs text-red-500">{errors.status}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Parent department</Label>
                            <Select
                                value={form.parent_id || 'none'}
                                onValueChange={(v) => updateField('parent_id', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="none">None</SelectItem>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={d.department_id}>
                                            {d.name_en ?? d.name_ar ?? d.department_id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Create Department
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}
