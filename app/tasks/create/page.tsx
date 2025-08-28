/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from '@/components/ui/select';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { DatePicker } from "@/components/DatePicker";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, Plus, Trash2, FileUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import {
    fetchContractors,
    selectContractors,
    selectContractorsLoading,
    selectContractorsError,
} from '@/stores/slices/contractors';
import type { Contractor } from '@/stores/types/contractors';
import {
    fetchProjects,
    selectProjects,
    selectLoading as selectProjectsLoading,
    selectError as selectProjectsError,
} from '@/stores/slices/projects';
import type { Project } from '@/stores/types/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';

// Type definitions
type ContractTerm = {
    title: string;
    description: string;
};

type TaskOrderDocument = {
    title: string;
    file: string;       // base64 encoded string
    name?: string;      // Original filename
    type?: string;      // MIME type
    size?: number;      // File size in bytes
};

type TaskOrderPayload = {
    contractor_id: string;
    project_id: string;
    title: string;
    description?: string;
    issue_date: string;       // ISO format (YYYY-MM-DD)
    est_cost: string;         // Numeric string representation
    notes: string;
    status: 'Active' | 'Closed' | 'Cancelled' | 'Pending' | 'Onhold';
    contract_terms: ContractTerm[];
    documents: TaskOrderDocument[];
};

// Initial form state
const initialValues: TaskOrderPayload = {
    contractor_id: '',
    project_id: '',
    title: '',
    description: '',
    issue_date: '',
    est_cost: '',
    notes: '',
    status: 'Active',
    contract_terms: [{ title: '', description: '' }],
    documents: [{ title: '', file: '' }]
};

// Available status options
const statuses: TaskOrderPayload['status'][] = [
    'Active', 'Pending', 'Onhold', 'Closed', 'Cancelled'
];

// Project types
const projectTypes = ['Public', 'Communications', 'Restoration', 'Referral'];

// Allowed file types for upload
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Special values for placeholder items
const EMPTY_CONTRACTOR_VALUE = "no-contractors-available";
const EMPTY_PROJECT_VALUE = "no-projects-available";

const CreateTaskOrderPage: React.FC = () => {
    // Form state and loading indicators
    const [form, setForm] = useState<TaskOrderPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [projectType, setProjectType] = useState<string>('Public');
    const router = useRouter();

    // Redux state management
    const dispatch = useDispatch<AppDispatch>();

    // Contractors state
    const contractors = useSelector(selectContractors);
    const contractorsLoading = useSelector(selectContractorsLoading);
    const contractorsError = useSelector(selectContractorsError);

    // Projects state
    const projects = useSelector(selectProjects);
    const projectsLoading = useSelector(selectProjectsLoading);
    const projectsError = useSelector(selectProjectsError);

    // Fetch initial data on component mount
    useEffect(() => {
        dispatch(fetchProjects({ page: 1, limit: 100, search: "", type: projectType }));
    }, [dispatch, projectType]);

    useEffect(() => {
        dispatch(fetchContractors());
    }, [dispatch]);

    // Convert file to base64 data URL
    const readFileAsDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    // Update form fields
    const updateField = useCallback(
        (name: keyof TaskOrderPayload, value: string) => {
            // Don't update if the value is from a placeholder option
            if (value === EMPTY_CONTRACTOR_VALUE || value === EMPTY_PROJECT_VALUE) {
                return;
            }

            setForm(prev => ({ ...prev, [name]: value }));
            // Clear field error when updating
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        },
        []
    );

    // Contract terms handlers
    const updateTermField = (index: number, key: keyof ContractTerm, value: string) => {
        setForm(prev => {
            const terms = [...prev.contract_terms];
            terms[index] = { ...terms[index], [key]: value };
            return { ...prev, contract_terms: terms };
        });
    };

    const addTerm = () => {
        setForm(prev => ({
            ...prev,
            contract_terms: [...prev.contract_terms, { title: '', description: '' }]
        }));
    };

    const removeTerm = (index: number) => {
        setForm(prev => ({
            ...prev,
            contract_terms: prev.contract_terms.filter((_, i) => i !== index)
        }));
    };

    // Document handlers
    const updateDocTitle = (index: number, value: string) => {
        setForm(prev => {
            const docs = [...prev.documents];
            docs[index] = { ...docs[index], title: value };
            return { ...prev, documents: docs };
        });
    };

    const updateDocFile = async (index: number, file?: File) => {
        if (!file) return;

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, and PDF files are allowed');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        try {
            const dataUrl = await readFileAsDataURL(file);
            setForm(prev => {
                const docs = [...prev.documents];
                docs[index] = {
                    ...docs[index],
                    file: dataUrl,
                    name: file.name,
                    type: file.type,
                    size: file.size
                };
                return { ...prev, documents: docs };
            });
        } catch (error) {
            toast.error('Failed to process file');
        }
    };

    const addDocument = () => {
        setForm(prev => ({
            ...prev,
            documents: [...prev.documents, { title: '', file: '' }]
        }));
    };

    const removeDocument = (index: number) => {
        setForm(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    // Form validation
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const requiredFields: (keyof TaskOrderPayload)[] = [
            'contractor_id', 'project_id', 'title',
            'issue_date', 'est_cost', 'status'
        ];

        // Required field validation
        requiredFields.forEach(field => {
            if (!form[field] || String(form[field]).trim() === '') {
                errors[field] = 'This field is required';
            }
        });

        // Numeric validation for estimated cost
        if (!errors.est_cost) {
            const value = Number(form.est_cost);
            if (isNaN(value)) {
                errors.est_cost = 'Must be a valid number';
            } else if (value < 0) {
                errors.est_cost = 'Must be greater than or equal to zero';
            }
        }

        // Date validation
        if (!errors.issue_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(form.issue_date)) {
                errors.issue_date = 'Invalid date format (YYYY-MM-DD required)';
            } else {
                const selectedDate = new Date(form.issue_date);
                const today = new Date();

                if (selectedDate > today) {
                    errors.issue_date = 'Future dates are not allowed';
                }
            }
        }

        // Contractor and project selection validation
        if (!form.contractor_id) {
            errors.contractor_id = 'Please select a contractor';
        }

        if (!form.project_id) {
            errors.project_id = 'Please select a project';
        }

        // Contract terms validation
        form.contract_terms.forEach((term, index) => {
            const hasTitle = term.title.trim() !== '';
            const hasDescription = term.description.trim() !== '';

            if ((hasTitle && !hasDescription) || (!hasTitle && hasDescription)) {
                errors[`contract_terms_${index}`] = 'Both title and description are required';
            }
        });

        // Documents validation
        form.documents.forEach((doc, index) => {
            const hasTitle = doc.title.trim() !== '';
            const hasFile = doc.file.trim() !== '';

            if ((hasTitle && !hasFile) || (!hasTitle && hasFile)) {
                errors[`documents_${index}`] = 'Both title and file are required';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // Prepare payload for submission
    const formattedPayload = useMemo((): TaskOrderPayload => {
        // Filter out empty terms
        const validTerms = form.contract_terms
            .filter(term => term.title.trim() && term.description.trim())
            .map(term => ({
                title: term.title.trim(),
                description: term.description.trim()
            }));

        // Filter out empty documents
        const validDocs = form.documents
            .filter(doc => doc.title.trim() && doc.file.trim())
            .map(doc => ({
                title: doc.title.trim(),
                file: doc.file.trim()
            }));

        return {
            ...form,
            contractor_id: form.contractor_id.trim(),
            project_id: form.project_id.trim(),
            title: form.title.trim(),
            description: form.description?.trim() || '',
            est_cost: Number(form.est_cost).toFixed(2), // Ensure 2 decimal places
            notes: form.notes.trim(),
            contract_terms: validTerms,
            documents: validDocs
        };
    }, [form]);

    // Form submission handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix form errors before submitting');
            return;
        }

        setLoading(true);

        try {
            // POST request with correct payload format
            const response = await axios.post('/task-orders/create', { params: formattedPayload });

            if (response.data?.header?.success) {
                toast.success('Task order created successfully!');
                router.push('/tasks'); // Redirect to task orders page
            } else {
                const errorMessage = response.data?.header?.messages?.[0]?.message ||
                    'Unknown error occurred';
                toast.error(`Creation failed: ${errorMessage}`);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.header?.message ||
                error.message ||
                'Network error';
            toast.error(`Failed to create task order: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Reset form to initial state
    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        setProjectType('Public');
        toast.info('Form has been reset');
    };

    // Helper functions for entity labels
    const getContractorLabel = (contractor: Contractor) => {
        return contractor.name ||
            contractor.number ||
            `Contractor ${contractor.id}`;
    };

    const getProjectLabel = (project: Project) => {
        return project.name ||
            project.client_name ||
            `Project ${project.id}`;
    };

    // Memoized options for performance
    const contractorOptions = useMemo(() => {
        return contractors?.map(contractor => ({
            id: contractor.id,
            label: getContractorLabel(contractor)
        })) || [];
    }, [contractors]);

    const projectOptions = useMemo(() => {
        return projects?.map(project => ({
            id: project.id,
            label: getProjectLabel(project)
        })) || [];
    }, [projects]);

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end mb-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Create Task Order
                    </h1>
                    <p className="text-muted-foreground">
                        Fill in task order details, attach required documents, and submit
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/tasks')}
                    >
                        Back Task Orders
                    </Button>
                </div>
            </div>

            {/* Main Form */}
            <form
                id="taskorder-create-form"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Left Column - Basic Information */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Core Information</CardTitle>
                            <CardDescription>
                                Essential details for the task order
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Contractor Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="contractor_id">Contractor *</Label>
                                    <Select
                                        value={form.contractor_id}
                                        onValueChange={value => updateField('contractor_id', value)}
                                    >
                                        <SelectTrigger id="contractor_id">
                                            {contractorsLoading ? (
                                                <div className="flex items-center">
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Loading contractors...
                                                </div>
                                            ) : (
                                                <SelectValue placeholder="Select contractor" />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contractorOptions.length === 0 ? (
                                                <SelectItem
                                                    value={EMPTY_CONTRACTOR_VALUE}
                                                    disabled
                                                >
                                                    No contractors available
                                                </SelectItem>
                                            ) : (
                                                contractorOptions.map(contractor => (
                                                    <SelectItem
                                                        key={contractor.id}
                                                        value={contractor.id}
                                                    >
                                                        {contractor.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.contractor_id && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.contractor_id}
                                        </p>
                                    )}
                                    {contractorsError && (
                                        <p className="text-xs text-red-500">
                                            Error loading contractors: {contractorsError}
                                        </p>
                                    )}
                                </div>

                                {/* Project Type and Project Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="project_type">Project Type *</Label>
                                    <Select
                                        value={projectType}
                                        onValueChange={setProjectType}
                                    >
                                        <SelectTrigger id="project_type">
                                            <SelectValue placeholder="Project Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectTypes.map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="project_id">Project *</Label>
                                    <Select
                                        value={form.project_id}
                                        onValueChange={value => updateField('project_id', value)}
                                    >
                                        <SelectTrigger id="project_id">
                                            {projectsLoading ? (
                                                <div className="flex items-center">
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Loading projects...
                                                </div>
                                            ) : (
                                                <SelectValue placeholder="Select project" />
                                            )}
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projectOptions.length === 0 ? (
                                                <SelectItem
                                                    value={EMPTY_PROJECT_VALUE}
                                                    disabled
                                                >
                                                    No projects available
                                                </SelectItem>
                                            ) : (
                                                projectOptions.map(project => (
                                                    <SelectItem
                                                        key={project.id}
                                                        value={project.id}
                                                    >
                                                        {project.label}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.project_id && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.project_id}
                                        </p>
                                    )}
                                    {projectsError && (
                                        <p className="text-xs text-red-500">
                                            Error loading projects: {projectsError}
                                        </p>
                                    )}
                                </div>

                                {/* Title Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={e => updateField('title', e.target.value)}
                                        placeholder="Task order title"
                                    />
                                    {fieldErrors.title && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.title}
                                        </p>
                                    )}
                                </div>

                                {/* Issue Date */}
                                <div className="flex flex-col">
                                    <Label htmlFor="issue_date" className="mb-3 mt-[6px]" >
                                        Issue Date *
                                    </Label>

                                    <DatePicker
                                        value={form.issue_date}
                                        onChange={(val) => updateField('issue_date', val)}
                                    />

                                    {fieldErrors.issue_date && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {fieldErrors.issue_date}
                                        </p>
                                    )}
                                </div>

                                {/* Status Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select
                                        value={form.status}
                                        onValueChange={value => updateField('status', value)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map(status => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.status && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.status}
                                        </p>
                                    )}
                                </div>

                                {/* Estimated Cost */}
                                <div className="space-y-2">
                                    <Label htmlFor="est_cost">Estimated Cost (IQD) *</Label>
                                    <Input
                                        id="est_cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.est_cost}
                                        onChange={e => updateField('est_cost', e.target.value)}
                                        placeholder="0"
                                    />
                                    {fieldErrors.est_cost && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors.est_cost}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={form.description}
                                    onChange={e => updateField('description', e.target.value)}
                                    placeholder="Detailed description of the task order..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column - Contract Terms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Terms</CardTitle>
                            <CardDescription>
                                Define terms and conditions for this task order
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.contract_terms.map((term, index) => (
                                <div key={index} className="rounded-lg border p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-medium">
                                            Term - ({index + 1})
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="xs"
                                            onClick={() => removeTerm(index)}
                                            disabled={form.contract_terms.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4 me-1" />
                                            Delete
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Term title"
                                        value={term.title}
                                        onChange={e => updateTermField(index, 'title', e.target.value)}
                                    />
                                    <textarea
                                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Term description"
                                        value={term.description}
                                        onChange={e => updateTermField(index, 'description', e.target.value)}
                                    />
                                    {fieldErrors[`contract_terms_${index}`] && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors[`contract_terms_${index}`]}
                                        </p>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="success"
                                size="sm"
                                onClick={addTerm}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Term
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Notes Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Order Notes</CardTitle>
                        <CardDescription>
                            Additional notes for this task order
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <textarea
                                id="notes"
                                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={form.notes}
                                onChange={e => updateField('notes', e.target.value)}
                                placeholder="Additional notes for the task order..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Supporting Documents</CardTitle>
                        <CardDescription>
                            Upload relevant files (PDF, JPG, PNG - max 5MB each)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {form.documents.map((doc, index) => (
                                <div key={index} className="rounded-lg border p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-medium">
                                            Document - ({index + 1})
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="xs"
                                            onClick={() => removeDocument(index)}
                                            disabled={form.documents.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4 me-1" />
                                            Delete
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Document title"
                                        value={doc.title}
                                        onChange={e => updateDocTitle(index, e.target.value)}
                                    />
                                    <div className="flex items-center gap-3">
                                        <label
                                            htmlFor={`file_${index}`}
                                            className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-accent"
                                        >
                                            <FileUp className="h-4 w-4" />
                                            {doc.name ? "Change File" : "Select File"}
                                        </label>
                                        <input
                                            id={`file_${index}`}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="hidden"
                                            onChange={e => updateDocFile(index, e.target.files?.[0])}
                                        />
                                        {doc.name ? (
                                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                {doc.name}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                No file selected
                                            </span>
                                        )}
                                    </div>

                                    {/* File Preview */}
                                    {doc.file && (
                                        <div className="mt-2">
                                            {doc.type?.startsWith('image/') ? (
                                                <img
                                                    src={doc.file}
                                                    alt="Preview"
                                                    className="h-24 object-contain border rounded"
                                                />
                                            ) : doc.type === 'application/pdf' ? (
                                                <div className="flex items-center text-blue-500">
                                                    <FileUp className="h-6 w-6 mr-2" />
                                                    <span>PDF Document</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    {fieldErrors[`documents_${index}`] && (
                                        <p className="text-xs text-red-500">
                                            {fieldErrors[`documents_${index}`]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="success"
                            size="sm"
                            onClick={addDocument}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Document
                        </Button>
                    </CardContent>

                    {/* Form Actions */}
                    <CardFooter className="justify-end gap-3 pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {loading ? 'Creating...' : 'Create Task Order'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateTaskOrderPage;