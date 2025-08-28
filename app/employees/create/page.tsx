/* eslint-disable @next/next/no-img-element */
/* =========================================================
   src/app/employees/create/page.tsx
   Create a new employee
========================================================= */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';

/* ---------- Types ---------- */
type EmployeePayload = {
    name: string;
    surname: string;
    job_title: string;
    hire_date: string;
    salary_grade: string;
    role: string;
    notes?: string;
    avatar?: string;
};

/* ---------- Initial-state template ---------- */
const EMPTY: EmployeePayload = {
    name: '',
    surname: '',
    job_title: '',
    hire_date: '',
    salary_grade: '',
    role: '',
    notes: '',
    avatar: '',
};

/* =========================================================
   Component
========================================================= */
const CreateEmployeePage: React.FC = () => {
    const router = useRouter();

    /* ---------- Local state ---------- */
    const [form, setForm] = useState<EmployeePayload>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ---------- Helpers ---------- */
    const updateField = useCallback(
        (name: keyof EmployeePayload, value: string) => {
            setForm((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                const clone = { ...prev };
                delete clone[name];
                return clone;
            });
        },
        []
    );

    /* ---------- Handle File Upload ---------- */
    const handleFileUpload = async (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            updateField('avatar', base64);
        };
        reader.readAsDataURL(file);
    };

    /* ---------- Validation ---------- */
    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        const required: (keyof EmployeePayload)[] = [
            'name',
            'surname',
            'job_title',
            'hire_date',
            'salary_grade',
            'role',
        ];

        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') errs[f] = 'Required';
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    /* ---------- Strip empty ---------- */
    const payload = useMemo(() => {
        const p: any = { ...form };
        Object.keys(p).forEach((k) => p[k] === '' && delete p[k]);
        return p as EmployeePayload;
    }, [form]);

    /* ---------- Submit handler ---------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/employees/create', { params: payload });

            console.log(res);
            if (res?.data?.header.success) {
                toast.success('Employee created successfully!');
                setForm(EMPTY);
            } else {
                toast.error(res?.data?.header.messages[0].message || 'Failed to create employee.');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Network error.');
        } finally {
            setLoading(false);
        }
    };

    /* ---------- Reset handler ---------- */
    const handleReset = () => {
        setForm(EMPTY);
        setErrors({});
        toast.message('Form cleared.');
    };

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">
            {/* Page header */}
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Create Employee
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Fill the form and submit to register a new employee.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/employees')}>
                    Back&nbsp;to&nbsp;Employees
                </Button>
            </div>

            {/* Form card */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Information</CardTitle>
                        <CardDescription>Core profile details.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field
                                id="name"
                                label="First Name *"
                                value={form.name}
                                placeholder="e.g. Ahmed"
                                error={errors.name}
                                onChange={(v) => updateField('name', v)}
                            />
                            <Field
                                id="surname"
                                label="Last Name *"
                                value={form.surname}
                                placeholder="e.g. Saleh"
                                error={errors.surname}
                                onChange={(v) => updateField('surname', v)}
                            />
                            <Field
                                id="job_title"
                                label="Job Title *"
                                value={form.job_title}
                                placeholder="e.g. Senior Software Engineer"
                                error={errors.job_title}
                                onChange={(v) => updateField('job_title', v)}
                            />
                            <Field
                                id="hire_date"
                                label="Hire Date *"
                                value={form.hire_date}
                                placeholder="2025-08-17"
                                error={errors.hire_date}
                                onChange={(v) => updateField('hire_date', v)}
                            />
                            <Field
                                id="salary_grade"
                                label="Salary *"
                                value={form.salary_grade}
                                placeholder="e.g. 750000"
                                error={errors.salary_grade}
                                inputMode="numeric"
                                onChange={(v) => updateField('salary_grade', v)}
                            />

                            {/* Role Select */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={form.role}
                                    onValueChange={(v) => updateField('role', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Manager">Manager</SelectItem>
                                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                                        <SelectItem value="Employee">Employee</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <ErrorText>{errors.role}</ErrorText>}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                placeholder="e.g. New hire with 5 years of fintech experience"
                                value={form.notes ?? ''}
                                onChange={(e) => updateField('notes', e.target.value)}
                            />
                        </div>

                        {/* Avatar Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar</Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    e.target.files?.[0] && handleFileUpload(e.target.files[0])
                                }
                            />
                            {form.avatar && (
                                <img
                                    src={form.avatar}
                                    alt="Preview"
                                    className="h-20 w-20 rounded-full mt-2 object-cover border"
                                />
                            )}
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
                            {loading ? 'Saving...' : 'Create Employee'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateEmployeePage;

/* =========================================================
   Reusable sub-components
========================================================= */
interface FieldProps {
    id: string;
    label: string;
    value: string | number;
    placeholder: string;
    error?: string;
    inputMode?: 'text' | 'numeric';
    onChange: (v: string) => void;
}

function Field({
    id,
    label,
    value,
    placeholder,
    error,
    inputMode = 'text',
    onChange,
}: FieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                inputMode={inputMode}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && <ErrorText>{error}</ErrorText>}
        </div>
    );
}

const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs text-red-500">{children}</p>
);
