'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchEmployees,
    selectEmployees,
    selectLoading,
} from '@/stores/slices/employees';
import type { Employee } from '@/stores/types/employees';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';

// User payload type
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
    type: 'General',
    status: 'Active',
};

const UpdateUserPage: React.FC = () => {
    const [form, setForm] = useState<UserPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const params = useSearchParams();
    const userId = params.get('id') || '';
    const dispatch = useReduxDispatch();

    // Redux: Fetch employees list for dropdown
    useEffect(() => {
        dispatch(fetchEmployees({ page: 1, limit: 100, search: '' }) as any);
    }, [dispatch]);

    const employees = useSelector(selectEmployees);
    const empLoading = useSelector(selectLoading);

    /**
     * Fetch user data by ID
     * (Made it reusable so we can call inside Reset)
     */
    const fetchUser = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`/users/fetch/${userId}`);
            if (res.data?.body?.user) {
                setForm(res.data.body.user);
            }
        } catch (err) {
            toast.error('Failed to load user data.');
        }
    }, [userId]);

    // Fetch user when component mounts
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Update field value
    const updateField = useCallback((name: keyof UserPayload, value: string) => {
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
            // Send PUT request with form data
            const result = await axios.put(`/users/update/${userId}`, form);
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
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Update User Account
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Modify the details below to update the system user account.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/users')}>
                        Back to Users
                    </Button>
                </div>
            </div>

            {/* User Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                        <CardDescription>
                            Update the details for the system account.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Employee Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Employee *</Label>
                                <Select
                                    value={form.employee_id}
                                    onValueChange={(val) => updateField('employee_id', val)}
                                    disabled={empLoading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees?.map((emp: Employee) => (
                                            <SelectItem key={emp.id} value={emp.id}>
                                                {emp.name} {emp.surname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldErrors.employee_id && (
                                    <p className="text-xs text-red-500">{fieldErrors.employee_id}</p>
                                )}
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    value={form.username}
                                    onChange={e => updateField('username', e.target.value)}
                                />
                                {fieldErrors.username && (
                                    <p className="text-xs text-red-500">{fieldErrors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => updateField('email', e.target.value)}
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-500">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Password (Optional Update) */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password (optional)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password || ''}
                                    onChange={e => updateField('password', e.target.value)}
                                />
                            </div>

                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">First Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label htmlFor="surname">Last Name *</Label>
                                <Input
                                    id="surname"
                                    value={form.surname}
                                    onChange={e => updateField('surname', e.target.value)}
                                />
                                {fieldErrors.surname && (
                                    <p className="text-xs text-red-500">{fieldErrors.surname}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={e => updateField('phone', e.target.value)}
                                />
                                {fieldErrors.phone && (
                                    <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                                )}
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={form.type}
                                    onValueChange={(val) => updateField('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Accounts">Accounts</SelectItem>
                                        <SelectItem value="Employment">Employment</SelectItem>
                                        <SelectItem value="Contracts">Contracts</SelectItem>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Financial">Financial</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.type && (
                                    <p className="text-xs text-red-500">{fieldErrors.type}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(val) => updateField('status', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.status && (
                                    <p className="text-xs text-red-500">{fieldErrors.status}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>

                    {/* Footer buttons */}
                    <CardFooter className="justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Update User'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading update user...</div>}>
            <UpdateUserPage />
        </Suspense>
    );
}

