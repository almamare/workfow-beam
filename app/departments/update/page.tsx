'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchDepartment,
    fetchDepartments,
    updateDepartment,
    selectSelectedDepartment,
    selectDepartments,
} from '@/stores/slices/departments';
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
    parent_id: string;
    level: number;
    status: string;
};

const emptyForm: FormPayload = {
    name_en: '',
    name_ar: '',
    dept_code: '',
    parent_id: '',
    level: 1,
    status: 'Active',
};

function UpdateDepartmentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const departmentId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();

    const department = useSelector(selectSelectedDepartment);
    const departments = useSelector(selectDepartments);

    const [form, setForm] = useState<FormPayload>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (departmentId) dispatch(fetchDepartment(departmentId));
    }, [dispatch, departmentId]);

    useEffect(() => {
        dispatch(fetchDepartments({}));
    }, [dispatch]);

    useEffect(() => {
        if (department && (department.department_id === departmentId || String(department.id) === departmentId)) {
            setForm({
                name_en: department.name_en ?? '',
                name_ar: department.name_ar ?? '',
                dept_code: department.dept_code ?? '',
                parent_id: department.parent_id ?? '',
                level: department.level ?? 1,
                status: department.status ?? 'Active',
            });
        }
        setInitialLoad(false);
    }, [department, departmentId]);

    const updateField = useCallback((name: keyof FormPayload, value: string | number) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.name_en?.trim()) errs.name_en = 'Required';
        if (!form.status) errs.status = 'Required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!departmentId) {
            toast.error('Missing department ID');
            return;
        }
        if (!validate()) {
            toast.error('Please fix the errors below.');
            return;
        }
        setLoading(true);
        try {
            const params = {
                name_en: form.name_en.trim(),
                name_ar: form.name_ar.trim(),
                dept_code: form.dept_code.trim(),
                parent_id: form.parent_id || undefined,
                level: form.level,
                status: form.status,
            };
            const result = await dispatch(updateDepartment({ departmentId, params }));
            if (updateDepartment.fulfilled.match(result)) {
                toast.success('Department updated successfully');
                router.push('/departments');
            } else {
                toast.error((result.payload as string) || 'Failed to update department');
            }
        } catch {
            toast.error('Failed to update department');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (department) {
            setForm({
                name_en: department.name_en ?? '',
                name_ar: department.name_ar ?? '',
                dept_code: department.dept_code ?? '',
                parent_id: department.parent_id ?? '',
                level: department.level ?? 1,
                status: department.status ?? 'Active',
            });
        }
        setErrors({});
        toast.message('Form reset to loaded values');
    };

    if (initialLoad && !department) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
            </div>
        );
    }

    if (!departmentId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing department ID. <Button variant="link" onClick={() => router.push('/departments')}>Back to list</Button>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Edit Department</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Update department details. Only changed fields are sent.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => router.push('/departments')} className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700">Back to list</Button>
            </div>

            <form onSubmit={handleSubmit}>
                <EnhancedCard title="Department details" description={'ID: ' + departmentId} variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="name_en">Name (EN) *</Label>
                            <Input id="name_en" value={form.name_en} onChange={(e) => updateField('name_en', e.target.value)} placeholder="English name" className="bg-white dark:bg-slate-800" />
                            {errors.name_en && <p className="text-xs text-red-500">{errors.name_en}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name_ar">Name (AR)</Label>
                            <Input id="name_ar" value={form.name_ar} onChange={(e) => updateField('name_ar', e.target.value)} placeholder="Arabic name" className="bg-white dark:bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dept_code">Dept code</Label>
                            <Input id="dept_code" value={form.dept_code} onChange={(e) => updateField('dept_code', e.target.value)} placeholder="e.g. FINANCE" className="bg-white dark:bg-slate-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Level</Label>
                            <Select value={String(form.level)} onValueChange={(v) => updateField('level', Number(v))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="1">1 - Top</SelectItem>
                                    <SelectItem value="2">2 - Mid</SelectItem>
                                    <SelectItem value="3">3 - Sub</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status *</Label>
                            <Select value={form.status} onValueChange={(v) => updateField('status', v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Parent department</Label>
                            <Select value={form.parent_id || 'none'} onValueChange={(v) => updateField('parent_id', v === 'none' ? '' : v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="none">None</SelectItem>
                                    {departments.filter((d) => (d.department_id ?? String(d.id)) !== departmentId).map((d) => (
                                        <SelectItem key={d.id} value={d.department_id}>{d.name_en ?? d.name_ar ?? d.department_id}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Update Department
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

export default function UpdateDepartmentPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <UpdateDepartmentContent />
        </Suspense>
    );
}
