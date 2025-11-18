'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import {
    Loader2,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Calculator
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';


type TenderItem = {
    project_id: string;
    name: string;
    price: number | string;
    quantity: number | string;
    amount: number | string;
};

type TenderFormState = {
    project_id: string;
    items: TenderItem[];
};

const emptyItem = (project_id: string): TenderItem => ({
    project_id,
    name: '',
    price: '',
    quantity: '',
    amount: ''
});

const initialForm: TenderFormState = {
    project_id: '',
    items: [emptyItem('')]
};

const CreateTenderPage: React.FC = () => {
    const [form, setForm] = useState<TenderFormState>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const params = useSearchParams();
    const paramProjectId = params.get('id') || '';

    // Initialize project_id from query param if present
    useEffect(() => {
        if (paramProjectId && !form.project_id) {
            setForm(prev => ({
                project_id: paramProjectId,
                items: prev.items.map(i => ({ ...i, project_id: paramProjectId }))
            }));
        }
    }, [paramProjectId, form.project_id]);

    /** Add a new line item */
    const addItem = () => {
        if (!form.project_id) {
            toast.error('Please set Project ID first.');
            return;
        }
        setForm(prev => ({
            ...prev,
            items: [...prev.items, emptyItem(prev.project_id)]
        }));
    };

    /** Remove item */
    const removeItem = (index: number) => {
        setForm(prev => {
            const copy = [...prev.items];
            copy.splice(index, 1);
            return {
                ...prev,
                items: copy.length ? copy : [emptyItem(prev.project_id)]
            };
        });
    };

    /** Update project_id globally */
    const updateProjectId = (value: string) => {
        setForm(prev => ({
            project_id: value,
            items: prev.items.map(i => ({ ...i, project_id: value }))
        }));
        setErrors(prev => {
            const cp = { ...prev };
            delete cp.project_id;
            return cp;
        });
    };

    /** Update an item field */
    const updateItemField = (
        index: number,
        field: keyof TenderItem,
        value: string
    ) => {
        setForm(prev => {
            const items = [...prev.items];
            const current = { ...items[index] };

            if (['price', 'quantity'].includes(field)) {
                if (value === '' || /^\d+(\.\d+)?$/.test(value)) {
                    (current as any)[field] = value;
                }
            } else if (field === 'name') {
                current.name = value;
            }
            // auto calculate amount
            const priceNum = Number(current.price);
            const qtyNum = Number(current.quantity);
            if (
                !Number.isNaN(priceNum) &&
                !Number.isNaN(qtyNum) &&
                current.price !== '' &&
                current.quantity !== ''
            ) {
                current.amount = +(priceNum * qtyNum).toFixed(2);
            } else {
                current.amount = '';
            }

            items[index] = current;
            return { ...prev, items };
        });

        setErrors(prev => {
            const cp = { ...prev };
            delete cp[`items.${index}.${field}`];
            delete cp[`items.${index}.amount`];
            return cp;
        });
    };

    /** Recalculate all amounts manually */
    const recalcAll = () => {
        setForm(prev => ({
            ...prev,
            items: prev.items.map(it => {
                const p = Number(it.price);
                const q = Number(it.quantity);
                if (
                    it.price !== '' &&
                    it.quantity !== '' &&
                    !Number.isNaN(p) &&
                    !Number.isNaN(q)
                ) {
                    return { ...it, amount: +(p * q).toFixed(2) };
                }
                return { ...it, amount: '' };
            })
        }));
    };

    /** Subtotal */
    const subtotal = useMemo(() => {
        return form.items.reduce((acc, it) => {
            const a = Number(it.amount);
            if (!Number.isNaN(a)) acc += a;
            return acc;
        }, 0);
    }, [form.items]);

    /** Validation */
    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.project_id.trim()) errs.project_id = 'Project ID is required';

        form.items.forEach((item, idx) => {
            if (!item.name.trim()) errs[`items.${idx}.name`] = 'Required';
            const priceNum = Number(item.price);
            if (item.price === '' || Number.isNaN(priceNum) || priceNum < 0) {
                errs[`items.${idx}.price`] = '>= 0';
            }
            const qtyNum = Number(item.quantity);
            if (item.quantity === '' || Number.isNaN(qtyNum) || qtyNum <= 0) {
                errs[`items.${idx}.quantity`] = '> 0';
            }
            if (item.amount === '' || Number.isNaN(Number(item.amount))) {
                errs[`items.${idx}.amount`] = 'Invalid';
            }
        });

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    /** Prepare API payload */
    const apiPayload = useMemo(() => {
        return {
            params: form.items.map(it => ({
                project_id: form.project_id,
                name: it.name.trim(),
                price: Number(it.price) || 0,
                quantity: it.quantity || 0,
                amount: Number(it.amount) || 0
            }))
        };
    }, [form]);

    /** Submit */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        recalcAll(); // ensure recalculated
        if (!validate()) {
            toast.error('Fix validation errors.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post('/projects/tenders/create', apiPayload);
            if (res.data?.header?.success) {
                toast.success('Tender created successfully!');
                setForm({
                    project_id: form.project_id, // keep project id for new entries
                    items: [emptyItem(form.project_id)]
                });
                setErrors({});
            } else {
                toast.error(
                    res.data?.header?.messages?.[0]?.message || 'Failed to create tender.'
                );
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create tender.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    /** Reset entire form */
    const handleReset = () => {
        setForm({
            project_id: form.project_id, // keep ID if already set
            items: [emptyItem(form.project_id)]
        });
        setErrors({});
        toast.message('Form cleared.');
    };

    /** Format number display */
    const fmt = (n: number) =>
        new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(n);

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create Tender
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Add unlimited tender line items, one per row, then submit.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/projects/details?id=' + paramProjectId)}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Tenders
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project & Global Controls */}
                <EnhancedCard
                    title="Tender Items"
                    description="Enter project ID and add line items (Name, Price, Quantity)."
                    variant="default"
                    size="sm"
                >
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 flex-wrap justify-between">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={recalcAll}
                                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Recalculate
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addItem}
                                    disabled={!form.project_id}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-md"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Total: {fmt(subtotal)}
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                            {form.items.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 flex flex-col gap-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Item - ({index + 1})
                                            </span>
                                            {form.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            )}
                                        </div>

                                        {/* Row fields */}
                                        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
                                            {/* Name */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`name_${index}`} className="text-slate-700 dark:text-slate-200">Name *</Label>
                                                <Input
                                                    id={`name_${index}`}
                                                    value={item.name}
                                                    onChange={e =>
                                                        updateItemField(index, 'name', e.target.value)
                                                    }
                                                    placeholder="Steel Beams"
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                />
                                                {errors[`items.${index}.name`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400">
                                                        {errors[`items.${index}.name`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`price_${index}`} className="text-slate-700 dark:text-slate-200">Price *</Label>
                                                <Input
                                                    id={`price_${index}`}
                                                    inputMode="numeric"
                                                    value={item.price}
                                                    onChange={e =>
                                                        updateItemField(index, 'price', e.target.value)
                                                    }
                                                    placeholder="0.00"
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                />
                                                {errors[`items.${index}.price`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400">
                                                        {errors[`items.${index}.price`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`qty_${index}`} className="text-slate-700 dark:text-slate-200">Qty *</Label>
                                                <Input
                                                    id={`qty_${index}`}
                                                    inputMode="numeric"
                                                    value={item.quantity}
                                                    onChange={e =>
                                                        updateItemField(index, 'quantity', e.target.value)
                                                    }
                                                    placeholder="0"
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                />
                                                {errors[`items.${index}.quantity`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400">
                                                        {errors[`items.${index}.quantity`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Amount */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`amount_${index}`} className="text-slate-700 dark:text-slate-200">
                                                    Amount
                                                </Label>
                                                <Input
                                                    id={`amount_${index}`}
                                                    value={item.amount}
                                                    readOnly
                                                    className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                                    placeholder="0.00"
                                                />
                                                {errors[`items.${index}.amount`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400">
                                                        {errors[`items.${index}.amount`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </EnhancedCard>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={loading}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || !form.project_id} 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Create Tender'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateTenderPage;
