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
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/DatePicker';

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

const JOB_TITLE_OPTIONS = ['Accounts', 'Employment', 'Contracts', 'General', 'Financial'];

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
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Employee
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill in the details below to add a new employee profile.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/employees')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    Back to Employees
                </Button>
            </div>

            {/* Employee Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Employee Information"
                    description="Enter core profile details for the employee."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                                    First Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    placeholder="e.g. Ahmed"
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {errors.name && <ErrorText>{errors.name}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="surname" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Last Name *
                                </Label>
                                <Input
                                    id="surname"
                                    value={form.surname}
                                    placeholder="e.g. Saleh"
                                    onChange={(e) => updateField('surname', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {errors.surname && <ErrorText>{errors.surname}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_title" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Job Title *
                                </Label>
                                <Select
                                    value={form.job_title}
                                    onValueChange={(v) => updateField('job_title', v)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select job title" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {JOB_TITLE_OPTIONS.map((title) => (
                                            <SelectItem
                                                key={title}
                                                value={title}
                                                className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                            >
                                                {title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.job_title && <ErrorText>{errors.job_title}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hire_date" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Hire Date *
                                </Label>
                                <DatePicker
                                    value={form.hire_date}
                                    onChange={(value) => updateField('hire_date', value)}
                                />
                                {errors.hire_date && <ErrorText>{errors.hire_date}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary_grade" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Salary *
                                </Label>
                                <Input
                                    id="salary_grade"
                                    inputMode="numeric"
                                    value={form.salary_grade}
                                    placeholder="e.g. 750000"
                                    onChange={(e) => updateField('salary_grade', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {errors.salary_grade && <ErrorText>{errors.salary_grade}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Role *
                                </Label>
                                <Select
                                    value={form.role}
                                    onValueChange={(v) => updateField('role', v)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Manager" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Manager
                                        </SelectItem>
                                        <SelectItem value="Supervisor" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Supervisor
                                        </SelectItem>
                                        <SelectItem value="Employee" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Employee
                                        </SelectItem>
                                        <SelectItem value="Admin" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <ErrorText>{errors.role}</ErrorText>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 font-medium">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder="e.g. New hire with 5 years of fintech experience"
                                value={form.notes ?? ''}
                                onChange={(e) => updateField('notes', e.target.value)}
                                className="min-h-[120px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar" className="text-slate-700 dark:text-slate-300 font-medium">
                                Avatar
                            </Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50"
                            />
                            {form.avatar && (
                                <img
                                    src={form.avatar}
                                    alt="Preview"
                                    className="h-20 w-20 rounded-full mt-2 object-cover border border-slate-200 dark:border-slate-700"
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                disabled={loading}
                                className="border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-300 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset Form
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                {loading ? 'Creating...' : 'Create Employee'}
                            </Button>
                        </div>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default CreateEmployeePage;

const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs text-red-500">{children}</p>
);
