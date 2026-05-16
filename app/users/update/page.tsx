'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, KeyRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchEmployees,
    selectEmployees,
    selectLoading,
} from '@/stores/slices/employees';
import { fetchRoles, selectRoles } from '@/stores/slices/roles';
import { fetchDepartments, selectDepartments } from '@/stores/slices/departments';
import type { Employee } from '@/stores/types/employees';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

// User payload type (BEAM: role_id, department_id)
type UserPayload = {
    employee_id: string;
    username: string;
    email: string;
    password?: string;
    name: string;
    surname: string;
    phone: string;
    type: string;
    status: string;
    role_id?: number | null;
    department_id?: string | null;
};

// Default form values
const initialValues: UserPayload = {
    employee_id: '',
    username: '',
    email: '',
    password: '',
    name: '',
    surname: '',
    phone: '',
    type: 'Admin',
    status: 'Active',
};

const UpdateUserPageContent: React.FC = () => {
    const [form, setForm] = useState<UserPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const params = useSearchParams();
    const userId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchEmployees({ page: 1, limit: 100, search: '' }));
        dispatch(fetchRoles());
        dispatch(fetchDepartments());
    }, [dispatch]);

    const employees = useSelector(selectEmployees);
    const empLoading = useSelector(selectLoading);
    const roles = useSelector(selectRoles);
    const departments = useSelector(selectDepartments);

    /**
     * Fetch user data by ID
     * (Made it reusable so we can call inside Reset)
     */
    const fetchUser = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`/users/fetch/${userId}`);
            if (res.data?.body?.user) {
                const u = res.data.body.user as Record<string, unknown>;
                setForm({
                    employee_id: String(u.employee_id ?? ''),
                    username: String(u.username ?? ''),
                    email: String(u.email ?? ''),
                    password: '',
                    name: String(u.name ?? ''),
                    surname: String(u.surname ?? ''),
                    phone: String(u.phone ?? ''),
                    type: String(u.type ?? 'Admin'),
                    status: String(u.status ?? 'Active'),
                    role_id: u.role_id != null ? Number(u.role_id) : undefined,
                    department_id: u.department_id != null ? String(u.department_id) : undefined,
                });
            }
        } catch (err) {
            toast.error('Failed to load user data.');
        }
    }, [userId]);

    // Fetch user when component mounts
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const updateField = useCallback((name: keyof UserPayload, value: string | number | undefined) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Validation function
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof UserPayload)[] = [
            'employee_id',
            'username',
            'email',
            'name',
            'surname',
            'phone',
            'type',
            'status',
        ];

        // Check required fields
        required.forEach(f => {
            const v = form[f];
            if (!v || String(v).trim() === '') {
                errors[f] = 'Required';
            }
        });

        // Check email format
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Invalid email';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            const body: Record<string, unknown> = { ...form };
            if (form.role_id != null) body.role_id = form.role_id;
            if (form.department_id != null) body.department_id = form.department_id;
            const result = await axios.put(`/users/update/${userId}`, body);
            const success =
                result?.data?.success === true || result?.data?.header?.success === true;

            if (success) {
                toast.success('User updated successfully!');
                router.push('/users');
            } else {
                toast.error(result?.data?.message || 'Failed to update user.');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Server error.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form handler
    const handleReset = () => {
        fetchUser(); // reload original user data
        setFieldErrors({});
        toast.message('Form reset to original user data.');
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Update User Account
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Modify the details below to update the system user account.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/users/permissions?id=${userId}`)}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <KeyRound className="h-4 w-4 mr-2" />
                        صلاحيات المستخدم
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/users')}
                        className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        Back to Users
                    </Button>
                </div>
            </div>

            {/* User Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="User Information"
                    description="Update the details for the system account."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Employee Dropdown */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Employee *</Label>
                                <Select
                                    value={form.employee_id}
                                    onValueChange={(val) => updateField('employee_id', val)}
                                    disabled={empLoading}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {employees?.map((emp: Employee) => (
                                            <SelectItem key={emp.id} value={emp.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200">
                                                {emp.name} {emp.surname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.employee_id && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.employee_id}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium">Username *</Label>
                                <Input
                                    id="username"
                                    value={form.username}
                                    onChange={e => updateField('username', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.username && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => updateField('email', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Password (Optional Update) */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password (optional)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password || ''}
                                    placeholder="Leave empty to keep current password"
                                    onChange={e => updateField('password', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>

                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">First Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label htmlFor="surname" className="text-slate-700 dark:text-slate-300 font-medium">Last Name *</Label>
                                <Input
                                    id="surname"
                                    value={form.surname}
                                    onChange={e => updateField('surname', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.surname && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.surname}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-medium">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={e => updateField('phone', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.phone && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.phone}</p>
                                )}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Type *</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(val) => updateField('type', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {['Executive','Finance','HR','IT','Legal','Procurement','Operations','Quality','Fleet','Warehouse','Contracts','Audit','Admin'].map((t) => (
                                            <SelectItem key={t} value={t} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.type && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.type}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status *</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(val) => updateField('status', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200">Active</SelectItem>
                                        <SelectItem value="Disabled" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-brand-sky-600 dark:focus:text-brand-sky-400 cursor-pointer transition-colors duration-200">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.status && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.status}</p>
                                )}
                            </div>

                            {/* Role (BEAM) */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Role</Label>
                                <Select
                                    value={form.role_id != null ? String(form.role_id) : ''}
                                    onValueChange={(val) => updateField('role_id', val ? Number(val) : undefined)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {roles?.map((r) => (
                                            <SelectItem key={r.id} value={String(r.id)}>
                                                {r.role_name ?? r.role_key}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Department (BEAM) */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Department</Label>
                                <Select
                                    value={form.department_id ?? ''}
                                    onValueChange={(val) => updateField('department_id', val || undefined)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {departments?.map((d) => (
                                            <SelectItem key={d.id} value={d.department_id}>
                                                {d.name_en ?? d.name_ar ?? d.department_id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                            className="border-brand-sky-200 dark:border-brand-sky-800 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:text-brand-sky-700 dark:hover:text-brand-sky-300 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? 'Updating...' : 'Update User'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading update user...</div>}>
            <UpdateUserPageContent />
        </Suspense>
    );
}
