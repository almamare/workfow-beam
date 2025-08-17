'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
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

type UserPayload = {
    employee_id: string;
    username: string;
    email: string;
    password: string;
    name: string;
    surname: string;
    phone: string;
    type: string;
    status: string;
};

// Initial form values
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

const CreateUserPage: React.FC = () => {
    const [form, setForm] = useState<UserPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const dispatch = useReduxDispatch();

    // Fetch employees on mount
    useEffect(() => {
        dispatch(fetchEmployees({ page: 1, limit: 100, search: '' }) as any);
    }, [dispatch]);

    // Select employees and loading state from Redux
    const employees = useSelector(selectEmployees);
    const empLoading = useSelector(selectLoading);

    // Update a single field in the form
    const updateField = useCallback((name: keyof UserPayload, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Validate the form
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof UserPayload)[] = [
            'employee_id',
            'username',
            'email',
            'password',
            'name',
            'surname',
            'phone',
            'type',
            'status',
        ];

        required.forEach(f => {
            const v = form[f];
            if (!v || String(v).trim() === '') {
                errors[f] = 'Required';
            }
        });

        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
            errors.email = 'Invalid email';
        }

        if (form.password && form.password.length < 6) {
            errors.password = 'Minimum 6 characters';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            const result = await axios.post('/users/create', { params: form });
            const success =
                result?.data?.success === true || result?.data?.header?.success === true;

            if (success) {
                toast.success('User account created successfully!');
                setForm(initialValues);
                router.push('/users');
            } else {
                toast.error(result?.data?.message || 'Failed to create user account.');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form to initial values
    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        toast.message('Form reset to defaults.');
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Create User Account
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Fill in the details below to create a new system user account.
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
                            Enter basic details for the system account.
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
                                    placeholder="Enter username"
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
                                    placeholder="Enter email"
                                    onChange={e => updateField('email', e.target.value)}
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-500">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    placeholder="Enter password"
                                    onChange={e => updateField('password', e.target.value)}
                                />
                                {fieldErrors.password && (
                                    <p className="text-xs text-red-500">{fieldErrors.password}</p>
                                )}
                            </div>

                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">First Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    placeholder="Enter first name"
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
                                    placeholder="Enter last name"
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
                                    placeholder="+9647712345678"
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

                    {/* Form Actions */}
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
                            {loading ? 'Saving...' : 'Create User'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateUserPage;
