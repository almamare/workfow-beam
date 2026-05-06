'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';      
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, Upload, X, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { validateFile, formatFileSize, fileToBase64WithProgress } from '@/utils/fileUtils';

type ClientPayload = {
    name: string;
    state: string;
    city: string;
    budget: number | string;
    client_type?: 'Government' | 'Private';
    notes?: string;
};

const initialValues: ClientPayload = {
    name: '',
    state: '',
    city: '',
    budget: '',
    client_type: undefined,
    notes: ''
};

const numberFields: (keyof ClientPayload)[] = ['budget'];

interface PendingFile {
    file: File;
    title: string;
    id: string;
}

const CreateClientPage: React.FC = () => {
    const [form, setForm] = useState<ClientPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Update field
    const updateField = useCallback(
        (name: keyof ClientPayload, value: string) => {
            if (numberFields.includes(name)) {
                if (value === '') {
                    setForm(prev => ({ ...prev, [name]: '' }));
                } else if (/^\d+(\.\d+)?$/.test(value)) {
                    setForm(prev => ({ ...prev, [name]: value }));
                }
            } else {
                setForm(prev => ({ ...prev, [name]: value }));
            }
            setFieldErrors(prev => {
                const clone = { ...prev };
                delete clone[name as string];
                return clone;
            });
        },
        []
    );

    // Update select field
    const updateSelectField = useCallback(
        (name: keyof ClientPayload, value: string) => {
            setForm(prev => ({ ...prev, [name]: value as any }));
            setFieldErrors(prev => {
                const clone = { ...prev };
                delete clone[name as string];
                return clone;
            });
        },
        []
    );

    // Validation
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof ClientPayload)[] = ['name', 'state', 'city', 'budget'];

        required.forEach(f => {
            const v = form[f];
            if (v === undefined || v === null || String(v).trim() === '') {
                errors[f] = 'Required';
            }
        });

        if (!errors.budget) {
            const num = Number(form.budget);
            if (Number.isNaN(num)) errors.budget = 'Invalid number';
            else if (num < 0) errors.budget = 'Must be ≥ 0';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        setLoading(true);
        try {
            // Prepare payload with attachments
            const basePayload: any = { ...form };
            basePayload.budget = form.budget === '' ? 0 : Number(form.budget);
            // Remove client_type if not selected
            if (!basePayload.client_type) {
                delete basePayload.client_type;
            }
            // Remove notes if empty (optional field)
            if (!basePayload.notes || basePayload.notes.trim() === '') {
                delete basePayload.notes;
            }
            
            // Add attachments if any
            if (pendingFiles.length > 0) {
                console.log('Preparing attachments:', pendingFiles.length);
                const attachments = await Promise.all(
                    pendingFiles.map(async (pendingFile, index) => {
                        try {
                            console.log(`Processing attachment ${index + 1}: ${pendingFile.title}`);
                            const base64 = await fileToBase64WithProgress(pendingFile.file, () => {});
                            // Get MIME type from file
                            const mimeType = pendingFile.file.type || 'application/octet-stream';
                            // Format base64 with MIME type prefix (as required by API)
                            const base64WithMime = `data:${mimeType};base64,${base64}`;
                            
                            const attachmentData = {
                                title: pendingFile.title.trim(),
                                file: base64WithMime,
                                status: 'Active',
                                version: '1.0',
                            };
                            
                            console.log(`Attachment ${index + 1} prepared:`, {
                                title: attachmentData.title,
                                fileLength: attachmentData.file.length,
                                status: attachmentData.status,
                                version: attachmentData.version
                            });
                            
                            return attachmentData;
                        } catch (error) {
                            console.error(`Error processing attachment ${index + 1}:`, error);
                            throw error;
                        }
                    })
                );
                basePayload.attachments = attachments;
                console.log('All attachments prepared:', attachments.length);
            }
            
            // POST to clients create endpoint with attachments
            // The endpoint creates client, generates approval request, and uploads attachments in one transaction
            console.log('Sending request with payload structure:', {
                name: basePayload.name,
                state: basePayload.state,
                city: basePayload.city,
                budget: basePayload.budget,
                client_type: basePayload.client_type,
                notes: basePayload.notes,
                attachments: basePayload.attachments 
                    ? basePayload.attachments.map((att: any, idx: number) => ({
                        index: idx + 1,
                        title: att.title,
                        file: `${att.file.substring(0, 50)}... (length: ${att.file.length})`,
                        status: att.status,
                        version: att.version
                    }))
                    : 'none'
            });
            
            const result = await axios.post('/clients/create', { params: basePayload });
            
            console.log('Response received:', result?.data);

            const success =
                result?.data?.header?.success === true ||
                result?.data?.success === true ||
                !!result?.data?.client_id ||
                !!result?.data?.data?.client_id;

            if (success) {
                // Extract client ID from response
                const clientId = 
                    result?.data?.client_id ||
                    result?.data?.data?.client_id ||
                    result?.data?.body?.client_id ||
                    result?.data?.body?.client?.id ||
                    result?.data?.data?.client?.id;
                
                console.log('Client creation response:', result?.data);
                console.log('Extracted client ID:', clientId);
                
                toast.success(result?.data?.message || 'Client created successfully with attachments!');
                setForm(initialValues);
                setPendingFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                
                // Navigate to client details if we have an ID, otherwise to list
                if (clientId) {
                    router.push(`/clients/details?id=${clientId}`);
                } else {
                    router.push('/clients');
                }
            } else {
                const msg =
                    result?.data?.header?.messages?.[0]?.message ||
                    result?.data?.header?.message ||
                    result?.data?.message ||
                    result?.data?.error ||
                    'Failed to create client.';
                toast.error(msg);
            }
        } catch (error: any) {
            console.error('Error creating client:', error);
            const msg =
                error?.response?.data?.header?.messages?.[0]?.message ||
                error?.response?.data?.header?.message ||
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                'Failed to create client. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        setPendingFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.message('Form reset to initial defaults.');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        Array.from(selectedFiles).forEach((file) => {
            const validation = validateFile(file);
            if (!validation.valid) {
                toast.error(`${file.name}: ${validation.error || 'Invalid file'}`);
                return;
            }

            const fileId = `${Date.now()}-${Math.random()}`;
            const title = file.name.replace(/\.[^/.]+$/, '');
            
            setPendingFiles(prev => [...prev, { file, title, id: fileId }]);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveFile = (fileId: string) => {
        setPendingFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleUpdateFileTitle = (fileId: string, newTitle: string) => {
        setPendingFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, title: newTitle } : f
        ));
    };


    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Create Client</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter client details below, then submit to create a new client.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/clients')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        Back to Clients
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form id="client-create-form" onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Client Information"
                    description="Core identifying information for the client."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    placeholder="Client Name"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-slate-700 dark:text-slate-200">State *</Label>
                                <Input
                                    id="state"
                                    value={form.state}
                                    onChange={e => updateField('state', e.target.value)}
                                    placeholder="e.g., Nineveh"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.state && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.state}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">City *</Label>
                                <Input
                                    id="city"
                                    value={form.city}
                                    onChange={e => updateField('city', e.target.value)}
                                    placeholder="e.g., Mosul"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.city && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.city}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget" className="text-slate-700 dark:text-slate-200">Budget *</Label>
                                <Input
                                    id="budget"
                                    inputMode="decimal"
                                    value={form.budget}
                                    onChange={e => updateField('budget', e.target.value)}
                                    placeholder="0"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.budget && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.budget}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="client_type" className="text-slate-700 dark:text-slate-200">Client Type</Label>
                                <Select
                                    value={form.client_type || ''}
                                    onValueChange={(value) => updateSelectField('client_type', value)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="Select client type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.client_type && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.client_type}</p>
                                )}
                            </div>
                        </div>

                    </div>
                </EnhancedCard>

                {/* Notes Section */}
                <EnhancedCard
                    title="Request Notes"
                    description="Notes for client approval request"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">Notes</Label>
                            <Textarea
                                id="notes"
                                value={form.notes || ''}
                                onChange={e => updateField('notes', e.target.value)}
                                placeholder="Province for client approval request"
                                rows={6}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            {fieldErrors.notes && (
                                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.notes}</p>
                            )}
                        </div>
                    </div>
                </EnhancedCard>

                {/* Attachments Section */}
                <EnhancedCard
                    title="Documents"
                    description="Attach documents to the client"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* File Upload Input */}
                        <div className="space-y-2">
                            <Label htmlFor="attachments" className="text-slate-700 dark:text-slate-200">Upload Documents</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    ref={fileInputRef}
                                    id="attachments"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Select Files
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max 10MB per file)
                            </p>
                        </div>

                        {/* Pending Files List */}
                        {pendingFiles.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-200">Selected Files ({pendingFiles.length})</Label>
                                <div className="space-y-2">
                                    {pendingFiles.map((pendingFile) => (
                                        <div
                                            key={pendingFile.id}
                                            className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg"
                                        >
                                            <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <Input
                                                    value={pendingFile.title}
                                                    onChange={(e) => handleUpdateFileTitle(pendingFile.id, e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
                                                    placeholder="File title"
                                                />
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {formatFileSize(pendingFile.file.size)}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveFile(pendingFile.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleReset} 
                            disabled={loading}
                            className="border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-300 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Creating Client...' : 'Create Client'}
                        </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateClientPage;
