'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchRole, updateRole, selectSelectedRole } from '@/stores/slices/roles';
import type { UpdateRoleParams } from '@/stores/types/roles';
import { fetchDepartments, selectDepartments } from '@/stores/slices/departments';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

type FormPayload = { role_key: string; role_name: string; department_id: string; description: string };
const emptyForm: FormPayload = { role_key: '', role_name: '', department_id: '', description: '' };

function UpdateRoleContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id') ?? '';
    const roleId = idParam ? parseInt(idParam, 10) : NaN;
    const dispatch = useReduxDispatch<AppDispatch>();
    const role = useSelector(selectSelectedRole);
    const departments = useSelector(selectDepartments);
    const departmentsList = Array.isArray(departments) ? departments : [];

    const [form, setForm] = useState<FormPayload>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (!isNaN(roleId)) dispatch(fetchRole(roleId));
    }, [dispatch, roleId]);
    useEffect(() => {
        dispatch(fetchDepartments({}));
    }, [dispatch]);
    useEffect(() => {
        if (role && role.id === roleId) {
            setForm({
                role_key: role.role_key ?? '',
                role_name: role.role_name ?? '',
                department_id: role.department_id ?? '',
                description: role.description ?? '',
            });
        }
        setInitialLoad(false);
    }, [role, roleId]);

    const updateField = useCallback((name: keyof FormPayload, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.role_key?.trim()) errs.role_key = 'Required';
        if (!form.role_name?.trim()) errs.role_name = 'Required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNaN(roleId)) { toast.error('Invalid role ID'); return; }
        if (!validate()) { toast.error('Please fix the errors below.'); return; }
        setLoading(true);
        try {
            const params: UpdateRoleParams = {
                role_key: form.role_key.trim(),
                role_name: form.role_name.trim(),
                department_id: form.department_id || null,
                description: form.description?.trim() || null,
            };
            const result = await dispatch(updateRole({ id: roleId, params }));
            if (updateRole.fulfilled.match(result)) {
                toast.success('Role updated successfully');
                router.push('/roles');
            } else {
                toast.error((result.payload as string) || 'Failed to update role');
            }
        } catch {
            toast.error('Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (role && role.id === roleId) {
            setForm({
                role_key: role.role_key ?? '',
                role_name: role.role_name ?? '',
                department_id: role.department_id ?? '',
                description: role.description ?? '',
            });
        }
        setErrors({});
        toast.message('Form reset to loaded values');
    };

    if (initialLoad && !role) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
            </div>
        );
    }
    if (!idParam || isNaN(roleId)) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Missing role ID. <Button variant="link" onClick={() => router.push('/roles')}>Back to list</Button>
                </p>
            </div>
        );
    }
    if (!role || role.id !== roleId) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Edit Role</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Update role details.</p>
                </div>
                <Button type="button" variant="outline" onClick={() => router.push('/roles')}>Back to list</Button>
            </div>
            <form onSubmit={handleSubmit}>
                <EnhancedCard title="Role details" description={`ID: ${roleId}`} variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="role_key">Role Key *</Label>
                            <Input id="role_key" value={form.role_key} onChange={(e) => updateField('role_key', e.target.value)} placeholder="e.g. CFO" className="bg-white dark:bg-slate-800 font-mono" />
                            {errors.role_key && <p className="text-xs text-red-500">{errors.role_key}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role_name">Role Name *</Label>
                            <Input id="role_name" value={form.role_name} onChange={(e) => updateField('role_name', e.target.value)} className="bg-white dark:bg-slate-800" />
                            {errors.role_name && <p className="text-xs text-red-500">{errors.role_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Department</Label>
                            <Select value={form.department_id || 'none'} onValueChange={(v) => updateField('department_id', v === 'none' ? '' : v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue placeholder="None" /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="none">None</SelectItem>
                                    {departmentsList.map((d) => (
                                        <SelectItem key={d.id} value={d.department_id ?? String(d.id)}>
                                            {d.name_en ?? d.name_ar ?? d.department_id ?? String(d.id)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3} className="bg-white dark:bg-slate-800" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Update Role
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

export default function UpdateRolePage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <UpdateRoleContent />
        </Suspense>
    );
}
