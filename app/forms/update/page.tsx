'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchForm, updateForm, selectSelectedForm, selectFormsLoading, clearSelectedForm } from '@/stores/slices/forms';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { DatePicker } from '@/components/DatePicker';
import type { UpdateFormPayload } from '@/stores/types/forms';

// Default form values
const initialValues: Omit<UpdateFormPayload, 'id'> = {
    name: '',
    description: '',
    status: 'Active',
    date_issue: '',
};

const UpdateFormPage: React.FC = () => {
    const [form, setForm] = useState<Omit<UpdateFormPayload, 'id'>>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const params = useSearchParams();
    const formId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedForm = useSelector(selectSelectedForm);
    const formLoading = useSelector(selectFormsLoading);

    /**
     * Fetch form data by ID
     */
    const fetchFormData = useCallback(async () => {
        if (!formId) {
            toast.error('Form ID is required');
            router.push('/forms');
            return;
        }
        try {
            await dispatch(fetchForm({ id: formId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load form data.');
            router.push('/forms');
        }
    }, [formId, dispatch, router]);

    // Fetch form when component mounts
    useEffect(() => {
        fetchFormData();
        return () => {
            dispatch(clearSelectedForm());
        };
    }, [fetchFormData, dispatch]);

    // Update form when selectedForm changes
    useEffect(() => {
        if (selectedForm) {
            setForm({
                name: selectedForm.name,
                description: selectedForm.description || '',
                status: selectedForm.status || 'Active',
                date_issue: selectedForm.date_issue || '',
            });
        }
    }, [selectedForm]);

    // Update field value
    const updateField = useCallback((name: keyof Omit<UpdateFormPayload, 'id'>, value: string) => {
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

        if (!form.name || form.name.trim() === '') {
            errors.name = 'Name is required';
        } else if (form.name.length < 3) {
            errors.name = 'Name must be at least 3 characters';
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

        if (!formId) {
            toast.error('Form ID is required');
            return;
        }

        setLoading(true);
        try {
            await dispatch(updateForm({
                id: formId,
                ...form
            })).unwrap();
            toast.success('Form updated successfully!');
            router.push('/forms');
        } catch (error: any) {
            toast.error(error || 'Server error.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form handler
    const handleReset = () => {
        if (selectedForm) {
            setForm({
                name: selectedForm.name,
                description: selectedForm.description || '',
                status: selectedForm.status || 'Active',
                date_issue: selectedForm.date_issue || '',
            });
        } else {
            setForm(initialValues);
        }
        setFieldErrors({});
        toast.message('Form reset to original data.');
    };

    if (formLoading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    if (!selectedForm) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400">Form not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Update Form
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Modify the details below to update the form.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/forms')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Forms
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Form Information"
                    description="Update the details for the form."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Name */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    minLength={3}
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={form.description || ''}
                                    onChange={e => updateField('description', e.target.value)}
                                    rows={4}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Date Issue */}
                            <div className="space-y-2">
                                <Label htmlFor="date_issue" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Date Issue
                                </Label>
                                <DatePicker
                                    value={form.date_issue}
                                    onChange={(value) => updateField('date_issue', value)}
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={form.status || 'Active'}
                                    onValueChange={(val) => updateField('status', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="Inactive" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            Inactive
                                        </SelectItem>
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
                            className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? 'Updating...' : 'Update Form'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading update form...</div>}>
            <UpdateFormPage />
        </Suspense>
    );
}

