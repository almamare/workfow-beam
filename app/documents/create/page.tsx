'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { createDocument } from '@/stores/slices/documents';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { CreateDocumentPayload } from '@/stores/types/documents';

// Helper function to convert file to Base64
const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
};

// Initial form values
const initialValues: CreateDocumentPayload = {
    title: '',
    description: '',
    file: '',
};

const CreateDocumentPage: React.FC = () => {
    const [form, setForm] = useState<CreateDocumentPayload & { fileObject?: File }>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    // Update a single field in the form
    const updateField = useCallback((name: keyof CreateDocumentPayload, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Handle file selection
    const handleFileChange = async (file: File) => {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('File type not supported. Please upload PDF, JPG, PNG, or GIF files.');
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('File size is too large. Maximum size is 10MB.');
            return;
        }

        try {
            const base64 = await convertFileToBase64(file);
            setForm(prev => ({
                ...prev,
                file: base64,
                fileObject: file
            }));
            setFieldErrors(prev => {
                const clone = { ...prev };
                delete clone.file;
                return clone;
            });
            toast.success('File selected successfully');
        } catch (error: any) {
            toast.error('Failed to process file. Please try again.');
            console.error('Error converting file:', error);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileChange(file);
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange(file);
        }
    };

    // Remove file
    const handleRemoveFile = () => {
        setForm(prev => ({
            ...prev,
            file: '',
            fileObject: undefined
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Get file type icon
    const getFileIcon = () => {
        if (!form.fileObject) return null;
        const type = form.fileObject.type;
        if (type === 'application/pdf') {
            return <FileText className="h-8 w-8 text-red-500" />;
        } else if (type.startsWith('image/')) {
            return <ImageIcon className="h-8 w-8 text-blue-500" />;
        }
        return <FileText className="h-8 w-8 text-gray-500" />;
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Validate the form
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!form.title || form.title.trim() === '') {
            errors.title = 'Title is required';
        } else if (form.title.length < 3) {
            errors.title = 'Title must be at least 3 characters';
        }

        if (!form.file || form.file.trim() === '') {
            errors.file = 'File is required';
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
            await dispatch(createDocument({
                title: form.title,
                description: form.description || undefined,
                file: form.file,
            })).unwrap();
            toast.success('Document created successfully!');
            setForm(initialValues);
            router.push('/documents');
        } catch (error: any) {
            toast.error(error || 'Failed to create document.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form to initial values
    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.message('Form reset to defaults.');
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Add New Document
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill in the details below to upload a new document.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/documents')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Documents
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Document Information"
                    description="Enter document details and upload file."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Title */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Title *
                                </Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    placeholder="Enter document title"
                                    onChange={e => updateField('title', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    minLength={3}
                                />
                                {fieldErrors.title && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.title}</p>
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
                                    placeholder="Enter document description (optional)"
                                    onChange={e => updateField('description', e.target.value)}
                                    rows={4}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                    File *
                                </Label>
                                {!form.file ? (
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                            isDragging
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-slate-300 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500'
                                        }`}
                                    >
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                                            Drag and drop a file here, or click to select
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                                            Supported formats: PDF, JPG, PNG, GIF (Max 10MB)
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Select File
                                        </Button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.gif"
                                            onChange={handleFileInputChange}
                                            className="hidden"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {getFileIcon()}
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-slate-100">
                                                        {form.fileObject?.name || 'File'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {form.fileObject ? formatFileSize(form.fileObject.size) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveFile}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {fieldErrors.file && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.file}</p>
                                )}
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
                            {loading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default CreateDocumentPage;

