'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchForm,
    downloadFormPDF,
    selectSelectedForm,
    selectFormsLoading,
    clearSelectedForm,
} from '@/stores/slices/forms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, Download, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';

const FormDetailsPageContent: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const formId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedForm = useSelector(selectSelectedForm);
    const loading = useSelector(selectFormsLoading);

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

    const handleDownloadPDF = async () => {
        if (!formId) return;
        try {
            const blob = await dispatch(downloadFormPDF(formId)).unwrap();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form_${selectedForm?.form_no || formId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (err: any) {
            toast.error(err || 'Failed to download PDF');
        }
    };

    const handleEdit = () => {
        if (formId) {
            router.push(`/forms/update?id=${formId}`);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            </div>
        );
    }

    if (!selectedForm) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Form not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/forms')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Forms
                    </Button>
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
                        Form Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete form information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/forms')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Forms
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownloadPDF}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </Button>
                    <Button
                        type="button"
                        onClick={handleEdit}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Form
                    </Button>
                </div>
            </div>

            {/* Form Details */}
            <div className="grid gap-4 md:grid-cols-2">
                <EnhancedCard
                    title="Basic Information"
                    description="Form identification and basic details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Form Number</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {selectedForm.form_no || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Name</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg mt-1">
                                {selectedForm.name}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Sequence</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedForm.sequence || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Date Issue</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedForm.date_issue
                                    ? new Date(selectedForm.date_issue).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Status</Label>
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className={`${
                                        selectedForm.status === 'Active'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                                    } font-medium`}
                                >
                                    {selectedForm.status === 'Active' ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Additional Information"
                    description="Timestamps and metadata"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Created At</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedForm.created_at
                                    ? new Date(selectedForm.created_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Updated At</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedForm.updated_at
                                    ? new Date(selectedForm.updated_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </EnhancedCard>
            </div>

            {/* Description Card */}
            {selectedForm.description && (
                <EnhancedCard
                    title="Description"
                    description="Full form description"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-2">
                        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                            {selectedForm.description}
                        </p>
                    </div>
                </EnhancedCard>
            )}
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading form details...</div>}>
            <FormDetailsPageContent />
        </Suspense>
    );
}

