'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { createRole } from '@/stores/slices/roles';
import type { CreateRoleParams } from '@/stores/types/roles';
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
    role_key: string;
    role_name: string;
    department_id: string;
    description: string;
};

const initialValues: FormPayload = {
    role_key: '',
    role_name: '',
    department_id: '',
    description: '',
};

export default function CreateRolePage() {
    const [form, setForm] = useState<FormPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchDepartments({}));
    }, [dispatch]);

    const departments = useSelector(selectDepartments);
    const departmentsList = Array.isArray(departments) ? departments : [];

    const updateField = useCallback(
        (name: keyof FormPayload, value: string) => {
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
        if (!form.role_key?.trim()) errs.role_key = 'Required';
        if (!form.role_name?.trim()) errs.role_name = 'Required';
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
            const params: CreateRoleParams = {
                role_key: form.role_key.trim(),
                role_name: form.role_name.trim(),
            };
            if (form.department_id) params.department_id = form.department_id;
            if (form.description?.trim()) params.description = form.description.trim();
            const result = await dispatch(createRole(params));
            if (createRole.fulfilled.match(result)) {
                toast.success('Role created successfully');
                const role = result.payload?.body?.role;
                if (role?.id) {
                    router.push(`/roles/details?id=${role.id}`);
                } else {
                    router.push('/roles');
                }
            } else {
                toast.error((result.payload as string) || 'Failed to create role');
            }
        } catch {
            toast.error('Failed to create role');
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
                        Create Role
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Add a new role. role_key must be unique (e.g. CFO, HR_DIR).
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/roles')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700"
                >
                    Back to list
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <EnhancedCard
                    title="Role details"
                    description="Key, name, department, and description"
                    variant="default"
                    size="sm"
                >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="role_key">Role Key *</Label>
                            <Input
                                id="role_key"
                                value={form.role_key}
                                onChange={(e) => updateField('role_key', e.target.value)}
                                placeholder="e.g. CFO, HR_DIR"
                                className="bg-white dark:bg-slate-800 font-mono"
                            />
                            {errors.role_key && (
                                <p className="text-xs text-red-500">{errors.role_key}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role_name">Role Name *</Label>
                            <Input
                                id="role_name"
                                value={form.role_name}
                                onChange={(e) => updateField('role_name', e.target.value)}
                                placeholder="Display name"
                                className="bg-white dark:bg-slate-800"
                            />
                            {errors.role_name && (
                                <p className="text-xs text-red-500">{errors.role_name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select
                                value={form.department_id || 'none'}
                                onValueChange={(v) => updateField('department_id', v === 'none' ? '' : v)}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue placeholder="None" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="none">None</SelectItem>
                                    {departmentsList.map((d) => (
                                        <SelectItem
                                            key={d.id}
                                            value={d.department_id ?? String(d.id)}
                                        >
                                            {d.name_en ?? d.name_ar ?? d.department_id ?? String(d.id)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Optional description"
                                rows={3}
                                className="bg-white dark:bg-slate-800"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Create Role
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}
