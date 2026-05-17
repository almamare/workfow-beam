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
    selectLoading as selectContractorsLoading,
    selectError as selectContractorsError,
} from '@/stores/slices/contractors';
import type { Contractor } from '@/stores/types/contractors';
import {
    fetchProjectContracts,
    selectProjectContracts,
    selectProjectContractsLoading,
    selectProjectContractsError,
} from '@/stores/slices/project-contracts';
import type { ProjectContract } from '@/stores/types/project-contracts';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

type TenderItem = {
    name: string;
    price: string;
    quantity: string;
    amount: string;
};

type TaskOrderDocument = {
    title: string;
    file: string;
    name?: string;
    type?: string;
    size?: number;
};

type TaskOrderPayload = {
    contractor_id: string;
    contract_id: string;
    title: string;
    description?: string;
    issue_date: string;
    notes: string;
    tender_items: TenderItem[];
    documents: TaskOrderDocument[];
};

const initialValues: TaskOrderPayload = {
    contractor_id: '',
    contract_id: '',
    title: '',
    description: '',
    issue_date: '',
    notes: '',
    tender_items: [{ name: '', price: '', quantity: '', amount: '' }],
    documents: [{ title: '', file: '' }],
};

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const EMPTY_CONTRACTOR_VALUE = 'no-contractors-available';
const EMPTY_CONTRACT_VALUE   = 'no-contracts-available';

const CreateTaskOrderPage: React.FC = () => {
    const [form, setForm] = useState<TaskOrderPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();

    const contractors       = useSelector(selectContractors);
    const contractorsLoading = useSelector(selectContractorsLoading);
    const contractorsError   = useSelector(selectContractorsError);

    const contracts        = useSelector(selectProjectContracts);
    const contractsLoading = useSelector(selectProjectContractsLoading);
    const contractsError   = useSelector(selectProjectContractsError);

    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchProjectContracts({ limit: 200, status: 'Active', approval_status: 'Approved' }));
    }, [dispatch]);

    const readFileAsDataURL = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const updateField = useCallback((name: keyof TaskOrderPayload, value: string) => {
        if (value === EMPTY_CONTRACTOR_VALUE || value === EMPTY_CONTRACT_VALUE) return;
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }, []);

    // ── Tender item handlers ────────────────────────────────────────────────
    const updateTenderField = (index: number, key: keyof TenderItem, value: string) => {
        setForm(prev => {
            const items = [...prev.tender_items];
            const updated = { ...items[index], [key]: value };
            if (key === 'price' || key === 'quantity') {
                const p = parseFloat(key === 'price' ? value : updated.price) || 0;
                const q = parseFloat(key === 'quantity' ? value : updated.quantity) || 0;
                updated.amount = (p * q).toFixed(2);
            }
            items[index] = updated;
            return { ...prev, tender_items: items };
        });
    };

    const addTenderItem = () => {
        setForm(prev => ({
            ...prev,
            tender_items: [...prev.tender_items, { name: '', price: '', quantity: '', amount: '' }],
        }));
    };

    const removeTenderItem = (index: number) => {
        setForm(prev => ({
            ...prev,
            tender_items: prev.tender_items.filter((_, i) => i !== index),
        }));
    };

    // ── Document handlers ───────────────────────────────────────────────────
    const updateDocTitle = (index: number, value: string) => {
        setForm(prev => {
            const docs = [...prev.documents];
            docs[index] = { ...docs[index], title: value };
            return { ...prev, documents: docs };
        });
    };

    const updateDocFile = async (index: number, file?: File) => {
        if (!file) return;
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
            setForm(prev => {
                const docs = [...prev.documents];
                docs[index] = { ...docs[index], file: dataUrl, name: file.name, type: file.type, size: file.size };
                return { ...prev, documents: docs };
            });
        } catch {
            toast.error('Failed to process file');
        }
    };

    const addDocument = () => {
        setForm(prev => ({ ...prev, documents: [...prev.documents, { title: '', file: '' }] }));
    };

    const removeDocument = (index: number) => {
        setForm(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== index) }));
    };

    // ── Validation ──────────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!form.contractor_id) errors.contractor_id = 'Please select a contractor';
        if (!form.contract_id)   errors.contract_id   = 'Please select a contract';
        if (!form.title.trim()) errors.title      = 'This field is required';
        if (!form.issue_date)   errors.issue_date = 'This field is required';

        if (!errors.issue_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(form.issue_date)) {
                errors.issue_date = 'Invalid date format (YYYY-MM-DD required)';
            } else if (new Date(form.issue_date) > new Date()) {
                errors.issue_date = 'Future dates are not allowed';
            }
        }

        form.tender_items.forEach((item, i) => {
            const hasName  = item.name.trim() !== '';
            const hasPrice = item.price.trim() !== '';
            const hasQty   = item.quantity.trim() !== '';
            if (hasName && (!hasPrice || !hasQty)) {
                errors[`tender_${i}`] = 'Price and quantity are required when name is set';
            }
        });

        form.documents.forEach((doc, i) => {
            const hasTitle = doc.title.trim() !== '';
            const hasFile  = doc.file.trim()  !== '';
            if ((hasTitle && !hasFile) || (!hasTitle && hasFile)) {
                errors[`documents_${i}`] = 'Both title and file are required';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // ── Payload ─────────────────────────────────────────────────────────────
    const formattedPayload = useMemo((): TaskOrderPayload => {
        const validItems = form.tender_items
            .filter(item => item.name.trim() && item.price.trim() && item.quantity.trim())
            .map(item => ({
                name:     item.name.trim(),
                price:    item.price.trim(),
                quantity: item.quantity.trim(),
                amount:   item.amount || '0.00',
            }));

        const validDocs = form.documents
            .filter(doc => doc.title.trim() && doc.file.trim())
            .map(doc => ({ title: doc.title.trim(), file: doc.file.trim() }));

        return {
            ...form,
            contractor_id: form.contractor_id.trim(),
            contract_id:   form.contract_id.trim(),
            title:         form.title.trim(),
            description:   form.description?.trim() || '',
            notes:         form.notes.trim(),
            tender_items:  validItems,
            documents:     validDocs,
        };
    }, [form]);

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix form errors before submitting');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post('/task-orders/create', { params: formattedPayload });
            if (response.data?.header?.success) {
                toast.success('Task order created successfully!');
                router.push('/contracts/task-orders');
            } else {
                const msg = response.data?.header?.messages?.[0]?.message || 'Unknown error occurred';
                toast.error(`Creation failed: ${msg}`);
            }
        } catch (error: any) {
            const msg = error.response?.data?.header?.message || error.message || 'Network error';
            toast.error(`Failed to create task order: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setFieldErrors({});
        toast.info('Form has been reset');
    };

    // ── Options ─────────────────────────────────────────────────────────────
    const contractorOptions = useMemo(() =>
        contractors?.map(c => ({ id: c.id, label: c.name || c.number || `Contractor ${c.id}` })) || []
    , [contractors]);

    const contractOptions = useMemo(() =>
        contracts?.map((c: ProjectContract) => ({
            id: c.id,
            label: `${c.contract_no} — ${c.title}`,
        })) || []
    , [contracts]);

    const inputCls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';
    const selectTriggerCls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50 text-slate-900 dark:text-slate-100';
    const selectContentCls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg';
    const selectItemCls    = 'text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-brand-sky-600 dark:hover:text-brand-sky-400';
    const textareaCls = 'min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky-100 dark:focus-visible:ring-brand-sky-900/50 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end mb-2 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Task Order
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Fill in task order details, attach required documents, and submit
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/contracts/task-orders')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                >
                    Back to Task Orders
                </Button>
            </div>

            <form id="taskorder-create-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    {/* ── Left: Core Information ── */}
                    <EnhancedCard
                        title="Core Information"
                        description="Essential details for the task order"
                        variant="default"
                        size="sm"
                        className="md:col-span-2"
                    >
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* Contractor */}
                                <div className="space-y-2">
                                    <Label htmlFor="contractor_id">Contractor *</Label>
                                    <Select value={form.contractor_id} onValueChange={v => updateField('contractor_id', v)}>
                                        <SelectTrigger id="contractor_id" className={selectTriggerCls}>
                                            {contractorsLoading
                                                ? <div className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</div>
                                                : <SelectValue placeholder="Select contractor" />}
                                        </SelectTrigger>
                                        <SelectContent className={selectContentCls}>
                                            {contractorOptions.length === 0
                                                ? <SelectItem value={EMPTY_CONTRACTOR_VALUE} disabled className="text-slate-500">No contractors available</SelectItem>
                                                : contractorOptions.map(c => <SelectItem key={c.id} value={c.id} className={selectItemCls}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.contractor_id && <p className="text-xs text-red-500">{fieldErrors.contractor_id}</p>}
                                    {contractorsError && <p className="text-xs text-red-500">Error: {contractorsError}</p>}
                                </div>

                                {/* Contract (Active + Approved) */}
                                <div className="space-y-2">
                                    <Label htmlFor="contract_id">Contract *</Label>
                                    <Select value={form.contract_id} onValueChange={v => updateField('contract_id', v)}>
                                        <SelectTrigger id="contract_id" className={selectTriggerCls}>
                                            {contractsLoading
                                                ? <div className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</div>
                                                : <SelectValue placeholder="Select contract" />}
                                        </SelectTrigger>
                                        <SelectContent className={selectContentCls}>
                                            {contractOptions.length === 0
                                                ? <SelectItem value={EMPTY_CONTRACT_VALUE} disabled className="text-slate-500">No active contracts available</SelectItem>
                                                : contractOptions.map(c => <SelectItem key={c.id} value={c.id} className={selectItemCls}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.contract_id && <p className="text-xs text-red-500">{fieldErrors.contract_id}</p>}
                                    {contractsError && <p className="text-xs text-red-500">Error loading contracts</p>}
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        value={form.title}
                                        onChange={e => updateField('title', e.target.value)}
                                        placeholder="Task order title"
                                        className={inputCls}
                                    />
                                    {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
                                </div>

                                {/* Issue Date */}
                                <div className="flex flex-col">
                                    <Label className="mb-3 mt-[6px]">Issue Date *</Label>
                                    <DatePicker value={form.issue_date} onChange={v => updateField('issue_date', v)} />
                                    {fieldErrors.issue_date && <p className="mt-1 text-xs text-red-500">{fieldErrors.issue_date}</p>}
                                </div>

                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className={textareaCls}
                                    value={form.description}
                                    onChange={e => updateField('description', e.target.value)}
                                    placeholder="Detailed description of the task order..."
                                />
                            </div>
                        </div>
                    </EnhancedCard>

                    {/* ── Right: Tender ── */}
                    <EnhancedCard title="Tender" description="Tender items for this task order" variant="default" size="sm">
                        <div className="space-y-4">
                            {form.tender_items.map((item, index) => (
                                <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-medium text-slate-700 dark:text-slate-200">
                                            Item ({index + 1})
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            onClick={() => removeTenderItem(index)}
                                            disabled={form.tender_items.length <= 1}
                                            className="border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                        >
                                            <Trash2 className="h-4 w-4 me-1" />
                                            Delete
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Item name"
                                        value={item.name}
                                        onChange={e => updateTenderField(index, 'name', e.target.value)}
                                        className={inputCls}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Price</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={item.price}
                                                onChange={e => updateTenderField(index, 'price', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-500">Quantity</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="0"
                                                value={item.quantity}
                                                onChange={e => updateTenderField(index, 'quantity', e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between px-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                                        <span className="text-xs text-slate-500 dark:text-slate-400">Amount</span>
                                        <span className="text-sm font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">
                                            {item.amount ? Number(item.amount).toLocaleString('en-US') : '0'} IQD
                                        </span>
                                    </div>
                                    {fieldErrors[`tender_${index}`] && (
                                        <p className="text-xs text-red-500">{fieldErrors[`tender_${index}`]}</p>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addTenderItem}
                                className="border-brand-sky-200 dark:border-brand-sky-800 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:text-brand-sky-700 dark:hover:text-brand-sky-300 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </EnhancedCard>
                </div>

                {/* Notes */}
                <EnhancedCard title="Task Order Notes" description="Additional notes for this task order" variant="default" size="sm">
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <textarea
                            id="notes"
                            className={textareaCls}
                            value={form.notes}
                            onChange={e => updateField('notes', e.target.value)}
                            placeholder="Additional notes for the task order..."
                        />
                    </div>
                </EnhancedCard>

                {/* Documents */}
                <EnhancedCard title="Supporting Documents" description="Upload relevant files (PDF, JPG, PNG - max 5MB each)" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            {form.documents.map((doc, index) => (
                                <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-medium text-slate-700 dark:text-slate-200">
                                            Document ({index + 1})
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="xs"
                                            onClick={() => removeDocument(index)}
                                            disabled={form.documents.length <= 1}
                                            className="border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                                        >
                                            <Trash2 className="h-4 w-4 me-1" />
                                            Delete
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Document title"
                                        value={doc.title}
                                        onChange={e => updateDocTitle(index, e.target.value)}
                                        className={inputCls}
                                    />
                                    <div className="flex items-center gap-3">
                                        <label
                                            htmlFor={`file_${index}`}
                                            className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <FileUp className="h-4 w-4" />
                                            {doc.name ? 'Change File' : 'Select File'}
                                        </label>
                                        <input
                                            id={`file_${index}`}
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="hidden"
                                            onChange={e => updateDocFile(index, e.target.files?.[0])}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                                            {doc.name || 'No file selected'}
                                        </span>
                                    </div>
                                    {doc.file && (
                                        <div className="mt-2">
                                            {doc.type?.startsWith('image/') ? (
                                                <img src={doc.file} alt="Preview" className="h-24 object-contain border rounded" />
                                            ) : doc.type === 'application/pdf' ? (
                                                <div className="flex items-center text-blue-600 dark:text-blue-400">
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
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addDocument}
                            className="border-brand-sky-200 dark:border-brand-sky-800 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 hover:text-brand-sky-700 dark:hover:text-brand-sky-300 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Document
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6">
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
                            {loading
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <Save className="h-4 w-4 mr-2" />}
                            {loading ? 'Creating...' : 'Create Task Order'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default CreateTaskOrderPage;
