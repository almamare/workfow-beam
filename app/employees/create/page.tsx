/* eslint-disable @next/next/no-img-element */
/* =========================================================
   src/app/employees/create/page.tsx
   Create a new employee
========================================================= */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchJobTitles, selectJobTitles } from '@/stores/slices/job-titles';
import { fetchDepartments, selectDepartments } from '@/stores/slices/departments';
import { fetchEmployees, selectEmployees } from '@/stores/slices/employees';

/* ---------- Types (BEAM: job_title_id, department_id, manager_id, status) ---------- */
type EmployeePayload = {
    name: string;
    surname: string;
    job_title: string;
    job_title_id?: number | null;
    hire_date: string;
    salary_grade: string;
    notes?: string;
    avatar?: string;
    department_id?: string | null;
    manager_id?: string | null;
    status?: string | null;
};

const LEGACY_JOB_TITLES = ['Accounts', 'Employment', 'Contracts', 'General', 'Financial'];

/* ---------- Initial-state template ---------- */
const EMPTY: EmployeePayload = {
    name: '',
    surname: '',
    job_title: '',
    hire_date: '',
    salary_grade: '',
    notes: '',
    avatar: '',
    department_id: undefined,
    manager_id: undefined,
    status: 'Active',
};

/* =========================================================
   Component
========================================================= */
const CreateEmployeePage: React.FC = () => {
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchJobTitles({ page: 1, limit: 500 }));
        dispatch(fetchDepartments());
        dispatch(fetchEmployees({ page: 1, limit: 500 }));
    }, [dispatch]);

    const jobTitlesList = useSelector(selectJobTitles);
    const departmentsList = useSelector(selectDepartments);
    const employeesList = useSelector(selectEmployees);

    /* ---------- Local state ---------- */
    const [form, setForm] = useState<EmployeePayload>(EMPTY);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ---------- Helpers ---------- */
    const updateField = useCallback(
        (name: keyof EmployeePayload, value: string | number | undefined) => {
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
            'hire_date',
            'salary_grade',
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
            const body: Record<string, unknown> = { ...payload };
            if (form.job_title_id != null) body.job_title_id = form.job_title_id;
            if (form.department_id) body.department_id = form.department_id;
            if (form.manager_id) body.manager_id = form.manager_id;
            if (form.status) body.status = form.status;
            const res = await axios.post('/employees/create', { params: body });

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
                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {errors.surname && <ErrorText>{errors.surname}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                    Job Title
                                </Label>
                                <Select
                                    value={form.job_title_id != null ? String(form.job_title_id) : form.job_title || ''}
                                    onValueChange={(v) => {
                                        const num = v ? parseInt(v, 10) : undefined;
                                        if (!isNaN(num as number)) {
                                            const jt = jobTitlesList.find((j) => Number(j.id) === num);
                                            updateField('job_title_id', num);
                                            updateField('job_title', jt ? (jt.title_en ?? jt.title_ar ?? '') : '');
                                        } else {
                                            updateField('job_title_id', undefined);
                                            updateField('job_title', v);
                                        }
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select job title" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {jobTitlesList?.length
                                            ? jobTitlesList.map((j) => (
                                                <SelectItem key={j.id} value={String(j.id)}>
                                                    {j.title_en ?? j.title_ar ?? String(j.id)}
                                                </SelectItem>
                                            ))
                                            : LEGACY_JOB_TITLES.map((title) => (
                                                <SelectItem key={title} value={title}>
                                                    {title}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.job_title && <ErrorText>{errors.job_title}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {errors.salary_grade && <ErrorText>{errors.salary_grade}</ErrorText>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Department</Label>
                                <Select
                                    value={form.department_id ?? ''}
                                    onValueChange={(v) => updateField('department_id', v || undefined)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {departmentsList?.map((d) => (
                                            <SelectItem key={d.id} value={d.department_id}>
                                                {d.name_en ?? d.name_ar ?? d.department_id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Manager</Label>
                                <Select
                                    value={form.manager_id ?? ''}
                                    onValueChange={(v) => updateField('manager_id', v || undefined)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select manager (employee)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        {employeesList?.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.employee_code ?? emp.id}>
                                                {emp.name} {emp.surname} {emp.employee_code ? `(${emp.employee_code})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                                <Select
                                    value={form.status ?? 'Active'}
                                    onValueChange={(v) => updateField('status', v)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Suspended">Suspended</SelectItem>
                                        <SelectItem value="Resigned">Resigned</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                className="min-h-[120px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50"
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