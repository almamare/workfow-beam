/* eslint-disable @next/next/no-img-element */
/* =========================================================================
   Task Orders - Update Page
   - Uses `useSearchParams` to read taskId from URL: /tasks/update?taskId=123
   - Fetches the existing task order and pre-fills the form
   - Submits an update via PUT /task-orders/update/:id
   - Includes robust field validation and file handling (base64)
   ========================================================================= */
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
import { DatePicker } from '@/components/DatePicker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, Plus, Trash2, FileUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import {
    fetchContractors,
    selectContractors,
    selectContractorsLoading,
    selectContractorsError
} from '@/stores/slices/contractors';
import type { Contractor } from '@/stores/types/contractors';
import {
    fetchProjects,
    selectProjects,
    selectLoading as selectProjectsLoading,
    selectError as selectProjectsError
} from '@/stores/slices/projects';
import type { Project } from '@/stores/types/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';

/* ============================== Types ============================== */
type ContractTerm = {
    title: string;
    description: string;
};

type TaskOrderDocument = {
    title: string;
    file: string; // base64 or URL
    name?: string; // original filename (for UI)
    type?: string; // MIME type
    size?: number; // bytes
};

type TaskOrderPayload = {
    contractor_id: string;
    project_id: string;
    title: string;
    description?: string;
    issue_date: string; // YYYY-MM-DD
    est_cost: string; // numeric string
    notes: string;
    status: 'Active' | 'Closed' | 'Cancelled' | 'Pending' | 'Onhold';
    contract_terms: ContractTerm[];
    documents: TaskOrderDocument[];
};

/* ======================== Initial Form State ======================= */
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

const statuses: TaskOrderPayload['status'][] = [
    'Active',
    'Pending',
    'Onhold',
    'Closed',
    'Cancelled'
];

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const EMPTY_CONTRACTOR_VALUE = 'no-contractors-available';
const EMPTY_PROJECT_VALUE = 'no-projects-available';

/* ============================== Page =============================== */
const UpdateTaskOrderPage: React.FC = () => {
    // Form state
    const [form, setForm] = useState<TaskOrderPayload>(initialValues);

    // UI and errors
    const [loading, setLoading] = useState(false); // submit loading
    const [initialLoading, setInitialLoading] = useState(true); // initial fetch loading
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const router = useRouter();

    // Read taskId from query string using useSearchParams
    const searchParams = useSearchParams();
    const taskId = searchParams.get('id');

    // Redux
    const dispatch = useDispatch<AppDispatch>();
    const contractors = useSelector(selectContractors);
    const contractorsLoading = useSelector(selectContractorsLoading);
    const contractorsError = useSelector(selectContractorsError);
    const projects = useSelector(selectProjects);
    const projectsLoading = useSelector(selectProjectsLoading);
    const projectsError = useSelector(selectProjectsError);

    /* ---------------------- Helpers (labels) ---------------------- */
    // Safely build labels for selects (fallbacks included)
    const getContractorLabel = (c: Contractor) =>
        (c as any).name || (c as any).number || `Contractor ${(c as any).id}`;

    const getProjectLabel = (p: Project) =>
        (p as any).name || (p as any).client_name || `Project ${(p as any).id}`;

    // Select options (ensure IDs are strings)
    const contractorOptions = useMemo(
        () =>
            (contractors || []).map((c) => ({
                id: String((c as any).id),
                label: getContractorLabel(c)
            })),
        [contractors]
    );

    const projectOptions = useMemo(
        () =>
            (projects || []).map((p) => ({
                id: String((p as any).id),
                label: getProjectLabel(p)
            })),
        [projects]
    );

    /* ---------------------- File to Base64 ----------------------- */
    const readFileAsDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    /* ---------------------- Field Updaters ----------------------- */
    const updateField = useCallback((name: keyof TaskOrderPayload, value: string) => {
        // Avoid updating from disabled placeholder values
        if (value === EMPTY_CONTRACTOR_VALUE || value === EMPTY_PROJECT_VALUE) return;
        setForm((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }, []);

    // Contract terms handlers
    const updateTermField = (index: number, key: keyof ContractTerm, value: string) => {
        setForm((prev) => {
            const terms = [...prev.contract_terms];
            terms[index] = { ...terms[index], [key]: value };
            return { ...prev, contract_terms: terms };
        });
    };

    const addTerm = () => {
        setForm((prev) => ({
            ...prev,
            contract_terms: [...prev.contract_terms, { title: '', description: '' }]
        }));
    };

    const removeTerm = (index: number) => {
        setForm((prev) => ({
            ...prev,
            contract_terms: prev.contract_terms.filter((_, i) => i !== index)
        }));
    };

    // Documents handlers
    const updateDocTitle = (index: number, value: string) => {
        setForm((prev) => {
            const docs = [...prev.documents];
            docs[index] = { ...docs[index], title: value };
            return { ...prev, documents: docs };
        });
    };

    const updateDocFile = async (index: number, file?: File) => {
        if (!file) return;

        // Basic validation
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            toast.error('Only JPG, PNG, and PDF files are allowed');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size exceeds 5MB limit');
            return;
        }

        try {
            const dataUrl = await readFileAsDataURL(file);
            setForm((prev) => {
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
        } catch (err) {
            toast.error('Failed to process file');
        }
    };

    const addDocument = () => {
        setForm((prev) => ({
            ...prev,
            documents: [...prev.documents, { title: '', file: '' }]
        }));
    };

    const removeDocument = (index: number) => {
        setForm((prev) => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    /* -------------------------- Validation -------------------------- */
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        const required: (keyof TaskOrderPayload)[] = [
            'contractor_id',
            'project_id',
            'title',
            'issue_date',
            'est_cost',
            'status'
        ];

        // Required checks
        required.forEach((field) => {
            if (!form[field] || String(form[field]).trim() === '') {
                errors[field] = 'This field is required';
            }
        });

        // Number check for cost
        if (!errors.est_cost) {
            const value = Number(form.est_cost);
            if (isNaN(value)) errors.est_cost = 'Must be a valid number';
            else if (value < 0) errors.est_cost = 'Must be >= 0';
        }

        // Terms paired fields check
        form.contract_terms.forEach((t, i) => {
            const hasTitle = t.title.trim() !== '';
            const hasDescription = t.description.trim() !== '';
            if ((hasTitle && !hasDescription) || (!hasTitle && hasDescription)) {
                errors[`contract_terms_${i}`] = 'Both title and description are required';
            }
        });

        // Documents paired fields check
        form.documents.forEach((d, i) => {
            const hasTitle = d.title.trim() !== '';
            const hasFile = d.file.trim() !== '';
            if ((hasTitle && !hasFile) || (!hasTitle && hasFile)) {
                errors[`documents_${i}`] = 'Both title and file are required';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    /* ---------------------- Format Payload ---------------------- */
    const formattedPayload = useMemo((): TaskOrderPayload => {
        // Keep only fully filled terms/documents
        const validTerms = form.contract_terms
            .filter((t) => t.title.trim() && t.description.trim())
            .map((t) => ({ title: t.title.trim(), description: t.description.trim() }));

        const validDocs = form.documents
            .filter((d) => d.title.trim() && d.file.trim())
            .map((d) => ({
                title: d.title.trim(),
                file: d.file.trim(),
                // Optionally keep name/type/size if your backend accepts them
                name: d.name,
                type: d.type,
                size: d.size
            }));

        // Force 2 decimal places for cost
        return {
            ...form,
            contractor_id: form.contractor_id.trim(),
            project_id: form.project_id.trim(),
            title: form.title.trim(),
            description: form.description?.trim() || '',
            est_cost: Number(form.est_cost).toFixed(2),
            notes: form.notes?.trim() || '',
            contract_terms: validTerms,
            documents: validDocs
        };
    }, [form]);

    /* -------------------------- Data Fetch -------------------------- */
    // Normalize API shape into our form shape safely
    const normalizeTaskOrder = (payload: any): TaskOrderPayload => {
        const issueRaw: string = String(payload?.issue_date ?? '');
        const issueDate = issueRaw.includes('T') ? issueRaw.slice(0, 10) : issueRaw;

        return {
            contractor_id: String(payload?.contractor_id ?? ''),
            project_id: String(payload?.project_id ?? ''),
            title: String(payload?.title ?? ''),
            description: String(payload?.description ?? ''),
            issue_date: issueDate,
            est_cost: String(payload?.est_cost ?? ''),
            notes: String(payload?.notes ?? ''),
            status: (payload?.status as TaskOrderPayload['status']) ?? 'Active',
            contract_terms:
                Array.isArray(payload?.contract_terms) && payload.contract_terms.length
                    ? payload.contract_terms.map((t: any) => ({
                        title: String(t?.title ?? ''),
                        description: String(t?.description ?? '')
                    }))
                    : [{ title: '', description: '' }],
            documents:
                Array.isArray(payload?.documents) && payload.documents.length
                    ? payload.documents.map((d: any) => ({
                        title: String(d?.title ?? ''),
                        file: String(d?.file ?? ''),
                        name: d?.name ? String(d.name) : undefined,
                        type: d?.type ? String(d.type) : undefined,
                        size: typeof d?.size === 'number' ? d.size : undefined
                    }))
                    : [{ title: '', file: '' }]
        };
    };

    useEffect(() => {
        // If no taskId, show error and prevent rendering the form
        if (!taskId) {
            toast.error('Missing taskId in the URL');
            setInitialLoading(false);
            return;
        }

        // Load dropdown data
        dispatch(fetchContractors());
        dispatch(fetchProjects({ page: 1, limit: 100, search: '', type: 'Public' }));

        // Load existing task order
        const fetchTaskOrder = async () => {
            setInitialLoading(true);
            try {
                const res = await axios.get(`/task-orders/${taskId}`);
                if (res?.data?.header?.success) {
                    const dto = res.data?.body?.taskOrder ?? res.data?.body ?? res.data;
                    setForm(normalizeTaskOrder(dto));
                } else {
                    toast.error(
                        res?.data?.header?.messages?.[0]?.message || 'Failed to load task order data'
                    );
                }
            } catch (err: any) {
                toast.error(err?.message || 'Error fetching task order details');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchTaskOrder();
    }, [dispatch, taskId]);

    /* -------------------------- Submit Update -------------------------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskId) {
            toast.error('Missing taskId');
            return;
        }
        if (!validate()) {
            toast.error('Please fix form errors before updating');
            return;
        }
        setLoading(true);
        try {
            // NOTE: Using { params: ... } because your original code does that.
            // If your backend expects JSON body, change to: axios.put(`/task-orders/update/${taskId}`, formattedPayload)
            const res = await axios.put(`/task-orders/update/${taskId}`, {
                params: formattedPayload
            });

            if (res?.data?.header?.success) {
                toast.success('Task order updated successfully!');
                router.push('/tasks');
            } else {
                const msg =
                    res?.data?.header?.messages?.[0]?.message || res?.data?.header?.message || 'Update failed';
                toast.error(msg);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error updating task order');
        } finally {
            setLoading(false);
        }
    };

    /* ------------------------------ Reset ------------------------------ */
    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        toast.info('Form has been reset');
    };

    /* ============================== Render ============================== */
    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-end mb-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Update Task Order</h1>
                    <p className="text-muted-foreground">
                        Edit the task order details, manage supporting documents, and save changes
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/tasks')}>
                    Back Task Orders
                </Button>
            </div>

            {/* Initial loading overlay */}
            {initialLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading task order...</span>
                </div>
            ) : (
                <form id="taskorder-update-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* ================= Left Column - Basic Info ================= */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Core Information</CardTitle>
                                <CardDescription>Essential details for the task order</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Contractor */}
                                    <div className="space-y-2">
                                        <Label htmlFor="contractor_id">Contractor *</Label>
                                        <Select
                                            value={form.contractor_id}
                                            onValueChange={(value) => updateField('contractor_id', value)}
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
                                                    <SelectItem value={EMPTY_CONTRACTOR_VALUE} disabled>
                                                        No contractors available
                                                    </SelectItem>
                                                ) : (
                                                    contractorOptions.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.label}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldErrors.contractor_id && (
                                            <p className="text-xs text-red-500">{fieldErrors.contractor_id}</p>
                                        )}
                                        {contractorsError && (
                                            <p className="text-xs text-red-500">
                                                Error loading contractors: {contractorsError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Project */}
                                    <div className="space-y-2">
                                        <Label htmlFor="project_id">Project *</Label>
                                        <Select
                                            value={form.project_id}
                                            onValueChange={(value) => updateField('project_id', value)}
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
                                                    <SelectItem value={EMPTY_PROJECT_VALUE} disabled>
                                                        No projects available
                                                    </SelectItem>
                                                ) : (
                                                    projectOptions.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.label}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {fieldErrors.project_id && (
                                            <p className="text-xs text-red-500">{fieldErrors.project_id}</p>
                                        )}
                                        {projectsError && (
                                            <p className="text-xs text-red-500">
                                                Error loading projects: {projectsError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(e) => updateField('title', e.target.value)}
                                            placeholder="Task order title"
                                        />
                                        {fieldErrors.title && (
                                            <p className="text-xs text-red-500">{fieldErrors.title}</p>
                                        )}
                                    </div>

                                    {/* Issue Date */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="issue_date" className="mb-3 mt-[6px]">
                                            Issue Date *
                                        </Label>
                                        <DatePicker
                                            value={form.issue_date}
                                            onChange={(val: any) => updateField('issue_date', String(val))}
                                        />
                                        {fieldErrors.issue_date && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.issue_date}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status *</Label>
                                        <Select
                                            value={form.status}
                                            onValueChange={(value) => updateField('status', value)}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldErrors.status && (
                                            <p className="text-xs text-red-500">{fieldErrors.status}</p>
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
                                            onChange={(e) => updateField('est_cost', e.target.value)}
                                            placeholder="0"
                                        />
                                        {fieldErrors.est_cost && (
                                            <p className="text-xs text-red-500">{fieldErrors.est_cost}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={form.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        placeholder="Detailed description of the task order..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ================= Right Column - Contract Terms ================= */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contract Terms</CardTitle>
                                <CardDescription>Define terms and conditions for this task order</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {form.contract_terms.map((term, index) => (
                                    <div key={index} className="rounded-lg border p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-medium">Term - ({index + 1})</Label>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
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
                                            onChange={(e) => updateTermField(index, 'title', e.target.value)}
                                        />
                                        <textarea
                                            className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="Term description"
                                            value={term.description}
                                            onChange={(e) => updateTermField(index, 'description', e.target.value)}
                                        />
                                        {fieldErrors[`contract_terms_${index}`] && (
                                            <p className="text-xs text-red-500">
                                                {fieldErrors[`contract_terms_${index}`]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                                <Button type="button" variant="success" size="sm" onClick={addTerm}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Term
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ================= Notes Section ================= */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes Task Order Requests</CardTitle>
                            <CardDescription>Additional notes or instructions for this task order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={form.notes}
                                    onChange={(e) => updateField('notes', e.target.value)}
                                    placeholder="Detailed notes of the task order..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ================= Documents Section ================= */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Supporting Documents</CardTitle>
                            <CardDescription>Upload relevant files (PDF, JPG, PNG - max 5MB each)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {form.documents.map((doc, index) => (
                                    <div key={index} className="rounded-lg border p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-medium">Document - ({index + 1})</Label>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
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
                                            onChange={(e) => updateDocTitle(index, e.target.value)}
                                        />

                                        <div className="flex items-center gap-3">
                                            <label
                                                htmlFor={`file_${index}`}
                                                className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-accent"
                                            >
                                                <FileUp className="h-4 w-4" />
                                                {doc.name ? 'Change File' : 'Select File'}
                                            </label>
                                            <input
                                                id={`file_${index}`}
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                className="hidden"
                                                onChange={(e) => updateDocFile(index, e.target.files?.[0])}
                                            />
                                            {doc.name ? (
                                                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                    {doc.name}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No file selected</span>
                                            )}
                                        </div>

                                        {/* Preview */}
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
                                            <p className="text-xs text-red-500">{fieldErrors[`documents_${index}`]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <Button type="button" variant="success" size="sm" onClick={addDocument}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Document
                            </Button>
                        </CardContent>

                        {/* ================= Form Actions (Update) ================= */}
                        <CardFooter className="justify-end gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset Form
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {loading ? 'Updating...' : 'Update Task Order'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            )}
        </div>
    );
};

export default UpdateTaskOrderPage;
