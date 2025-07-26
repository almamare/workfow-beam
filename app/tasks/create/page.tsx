'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, Plus, Trash2, FileUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ContractTerm = {
    title: string;
    description: string;
};

type TaskOrderDocument = {
    title: string;
    file: string;      // data:*/*;base64,....
    name?: string;     // UI only
    type?: string;     // UI only
    size?: number;     // UI only
};

type TaskOrderPayload = {
    contractor_id: string;
    project_id: string;
    title: string;
    description?: string;
    issue_date: string;      // YYYY-MM-DD
    est_cost: string;        // as string e.g. "12000.50"
    status: 'Active' | 'Closed' | 'Cancelled' | 'Pending' | 'Onhold';
    contract_terms: ContractTerm[];
    documents: TaskOrderDocument[];
};

const initialValues: TaskOrderPayload = {
    contractor_id: '',
    project_id: '',
    title: '',
    description: '',
    issue_date: '',
    est_cost: '',
    status: 'Active',
    contract_terms: [
        { title: '', description: '' }
    ],
    documents: [
        { title: '', file: '' }
    ]
};

const statuses: TaskOrderPayload['status'][] = [
    'Active', 'Pending', 'Onhold', 'Closed', 'Cancelled'
];

const CreateTaskOrderPage: React.FC = () => {
    const [form, setForm] = useState<TaskOrderPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    // Base64 helper
    const readFileAsDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    // Update simple fields
    const updateField = useCallback(
        (name: keyof TaskOrderPayload, value: string) => {
            setForm(prev => ({ ...prev, [name]: value }));
            setFieldErrors(prev => {
                const clone = { ...prev };
                delete clone[name as string];
                return clone;
            });
        },
        []
    );

    // Terms handlers
    const updateTermField = (index: number, key: keyof ContractTerm, value: string) => {
        setForm(prev => {
            const next = [...prev.contract_terms];
            next[index] = { ...next[index], [key]: value };
            return { ...prev, contract_terms: next };
        });
    };
    const addTerm = () => {
        setForm(prev => ({ ...prev, contract_terms: [...prev.contract_terms, { title: '', description: '' }] }));
    };
    const removeTerm = (index: number) => {
        setForm(prev => {
            const next = prev.contract_terms.filter((_, i) => i !== index);
            return { ...prev, contract_terms: next.length ? next : [{ title: '', description: '' }] };
        });
    };

    // Documents handlers
    const updateDocTitle = (index: number, value: string) => {
        setForm(prev => {
            const next = [...prev.documents];
            next[index] = { ...next[index], title: value };
            return { ...prev, documents: next };
        });
    };
    const updateDocFile = async (index: number, file?: File) => {
        if (!file) return;
        try {
            const dataUrl = await readFileAsDataURL(file);
            setForm(prev => {
                const next = [...prev.documents];
                next[index] = { ...next[index], file: dataUrl, name: file.name, type: file.type, size: file.size };
                return { ...prev, documents: next };
            });
        } catch (e) {
            toast.error('Failed to read file.');
        }
    };
    const addDocument = () => {
        setForm(prev => ({ ...prev, documents: [...prev.documents, { title: '', file: '' }] }));
    };
    const removeDocument = (index: number) => {
        setForm(prev => {
            const next = prev.documents.filter((_, i) => i !== index);
            return { ...prev, documents: next.length ? next : [{ title: '', file: '' }] };
        });
    };

    // Validation
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

        required.forEach(f => {
            const v = form[f];
            if (!v || String(v).trim() === '') errors[f] = 'Required';
        });

        // est_cost numeric >= 0
        if (!errors.est_cost) {
            const num = Number(form.est_cost);
            if (Number.isNaN(num)) errors.est_cost = 'Invalid number';
            else if (num < 0) errors.est_cost = 'Must be ≥ 0';
        }

        // issue_date basic check (YYYY-MM-DD)
        if (!errors.issue_date) {
            const ok = /^\d{4}-\d{2}-\d{2}$/.test(form.issue_date);
            if (!ok) errors.issue_date = 'Invalid date (YYYY-MM-DD)';
        }

        // Validate terms (if provided, require both fields)
        form.contract_terms.forEach((t, i) => {
            const bothEmpty = !t.title.trim() && !t.description.trim();
            const oneEmpty = (!!t.title.trim() && !t.description.trim()) || (!t.title.trim() && !!t.description.trim());
            if (oneEmpty) {
                errors[`contract_terms_${i}`] = 'Term title and description are both required or leave both empty.';
            }
            // We allow completely empty row; it will be filtered out before submit.
            if (!bothEmpty && (!t.title.trim() || !t.description.trim())) {
                errors[`contract_terms_${i}`] = 'Both fields required.';
            }
        });

        // Validate documents (title & file should be together)
        form.documents.forEach((d, i) => {
            const title = d.title?.trim();
            const file = d.file?.trim();
            const bothEmpty = !title && !file;
            const oneEmpty = (!!title && !file) || (!title && !!file);
            if (oneEmpty) {
                errors[`documents_${i}`] = 'Document title and file are both required or leave both empty.';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // Prepare payload (filter empty rows)
    const formattedPayload = useMemo(() => {
        const terms = form.contract_terms
            .filter(t => t.title.trim() && t.description.trim())
            .map(t => ({ title: t.title.trim(), description: t.description.trim() }));

        const docs = form.documents
            .filter(d => d.title.trim() && d.file.trim())
            .map(d => ({ title: d.title.trim(), file: d.file.trim() }));

        const payload: TaskOrderPayload = {
            contractor_id: form.contractor_id.trim(),
            project_id: form.project_id.trim(),
            title: form.title.trim(),
            description: form.description?.trim() || '',
            issue_date: form.issue_date,                 // assume already YYYY-MM-DD
            est_cost: String(Number(form.est_cost).toFixed(2)), // normalize to "####.##"
            status: form.status,
            contract_terms: terms,
            documents: docs
        };
        return payload;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        setLoading(true);
        try {
            const result = await axios.post('/task-orders/create', { params: formattedPayload });

            if (result.data?.header?.success) {
                toast.success('Task Order created successfully!');
                setForm(initialValues);
            } else {
                toast.error(result.data?.header?.messages?.[0]?.message || 'Failed to create task order.');
                return;
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.header?.messages?.[0]?.message ||
                error?.response?.data?.header?.message ||
                error?.message ||
                'Failed to create task order. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        toast.message('Form reset to initial defaults.');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Create Task Order
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Enter the task order details, attach documents, then submit to create a new task order.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/task-orders')}>
                        Back to Task Orders
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form id="taskorder-create-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Basic Info */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Core details for the task order.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contractor_id">Contractor ID *</Label>
                                    <Input
                                        id="contractor_id"
                                        value={form.contractor_id}
                                        onChange={e => updateField('contractor_id', e.target.value)}
                                        placeholder="12345678abcdef01"
                                    />
                                    {fieldErrors.contractor_id && <p className="text-xs text-red-500">{fieldErrors.contractor_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="project_id">Project ID *</Label>
                                    <Input
                                        id="project_id"
                                        value={form.project_id}
                                        onChange={e => updateField('project_id', e.target.value)}
                                        placeholder="abcdef0123456789"
                                    />
                                    {fieldErrors.project_id && <p className="text-xs text-red-500">{fieldErrors.project_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={e => updateField('title', e.target.value)}
                                        placeholder="Task Order Title"
                                    />
                                    {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="issue_date">Issue Date *</Label>
                                    <Input
                                        id="issue_date"
                                        type="date"
                                        value={form.issue_date}
                                        onChange={e => updateField('issue_date', e.target.value)}
                                    />
                                    {fieldErrors.issue_date && <p className="text-xs text-red-500">{fieldErrors.issue_date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={form.status} onValueChange={(val) => updateField('status', val)}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map(s => (
                                                <SelectItem value={s} key={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.status && <p className="text-xs text-red-500">{fieldErrors.status}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="est_cost">Estimated Cost *</Label>
                                    <Input
                                        id="est_cost"
                                        inputMode="decimal"
                                        value={form.est_cost}
                                        onChange={e => updateField('est_cost', e.target.value)}
                                        placeholder="12000.50"
                                    />
                                    {fieldErrors.est_cost && <p className="text-xs text-red-500">{fieldErrors.est_cost}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
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

                    {/* Contract Terms */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Terms</CardTitle>
                            <CardDescription>Add one or more terms.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {form.contract_terms.map((t, i) => (
                                <div key={i} className="rounded-lg border p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-medium">Term #{i + 1}</Label>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTerm(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Title"
                                        value={t.title}
                                        onChange={e => updateTermField(i, 'title', e.target.value)}
                                    />
                                    <textarea
                                        className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        placeholder="Description"
                                        value={t.description}
                                        onChange={e => updateTermField(i, 'description', e.target.value)}
                                    />
                                    {fieldErrors[`contract_terms_${i}`] && (
                                        <p className="text-xs text-red-500">{fieldErrors[`contract_terms_${i}`]}</p>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addTerm}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Term
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Documents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>Attach blueprints, signed contracts, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {form.documents.map((d, i) => (
                            <div key={i} className="rounded-lg border p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="font-medium">Document #{i + 1}</Label>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(i)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Title (e.g., Blueprint Drawing)"
                                    value={d.title}
                                    onChange={e => updateDocTitle(i, e.target.value)}
                                />
                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor={`file_${i}`}
                                        className="inline-flex items-center gap-2 cursor-pointer rounded-md border px-3 py-2 text-sm"
                                    >
                                        <FileUp className="h-4 w-4" />
                                        Choose file
                                    </label>
                                    <input
                                        id={`file_${i}`}
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="hidden"
                                        onChange={(e) => updateDocFile(i, e.target.files?.[0])}
                                    />
                                    {d.name ? (
                                        <span className="text-sm text-muted-foreground truncate">{d.name}</span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No file selected</span>
                                    )}
                                </div>
                                {fieldErrors[`documents_${i}`] && (
                                    <p className="text-xs text-red-500">{fieldErrors[`documents_${i}`]}</p>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addDocument}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Document
                        </Button>
                    </CardContent>

                    <CardFooter className="justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Create Task Order'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateTaskOrderPage;
