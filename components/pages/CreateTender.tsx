'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import {
    Loader2,
    Save,
    RotateCcw,
    Plus,
    Trash2,
    Calculator
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Create Tender
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Add unlimited tender line items, one per row, then submit.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/projects/details?id=' + paramProjectId)}
                    >
                        Back to Tenders
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project & Global Controls */}
                <Card>
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                        <div>
                            <CardTitle>Tender Items</CardTitle>
                            <CardDescription>
                                Enter project ID and add line items (Name, Price, Quantity).
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={recalcAll}
                            >
                                <Calculator className="h-4 w-4 mr-2" />
                                Recalculate
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={addItem}
                                disabled={!form.project_id}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Items List */}
                        <div className="space-y-3">
                            {form.items.map((item, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="rounded-md border p-3 bg-muted/20 flex flex-col gap-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                Item #{index + 1}
                                            </span>
                                            {form.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        {/* Row fields */}
                                        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
                                            {/* Name */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`name_${index}`}>Name *</Label>
                                                <Input
                                                    id={`name_${index}`}
                                                    value={item.name}
                                                    onChange={e =>
                                                        updateItemField(index, 'name', e.target.value)
                                                    }
                                                    placeholder="Steel Beams"
                                                />
                                                {errors[`items.${index}.name`] && (
                                                    <p className="text-xs text-red-500">
                                                        {errors[`items.${index}.name`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`price_${index}`}>Price *</Label>
                                                <Input
                                                    id={`price_${index}`}
                                                    inputMode="numeric"
                                                    value={item.price}
                                                    onChange={e =>
                                                        updateItemField(index, 'price', e.target.value)
                                                    }
                                                    placeholder="0.00"
                                                />
                                                {errors[`items.${index}.price`] && (
                                                    <p className="text-xs text-red-500">
                                                        {errors[`items.${index}.price`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Quantity */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`qty_${index}`}>Qty *</Label>
                                                <Input
                                                    id={`qty_${index}`}
                                                    inputMode="numeric"
                                                    value={item.quantity}
                                                    onChange={e =>
                                                        updateItemField(index, 'quantity', e.target.value)
                                                    }
                                                    placeholder="0"
                                                />
                                                {errors[`items.${index}.quantity`] && (
                                                    <p className="text-xs text-red-500">
                                                        {errors[`items.${index}.quantity`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Amount */}
                                            <div className="space-y-1">
                                                <Label htmlFor={`amount_${index}`}>
                                                    Amount
                                                </Label>
                                                <Input
                                                    id={`amount_${index}`}
                                                    value={item.amount}
                                                    readOnly
                                                    className="bg-muted/50 cursor-not-allowed"
                                                    placeholder="0.00"
                                                />
                                                {errors[`items.${index}.amount`] && (
                                                    <p className="text-xs text-red-500">
                                                        {errors[`items.${index}.amount`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addItem}
                                disabled={!form.project_id}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={recalcAll}
                            >
                                <Calculator className="h-4 w-4 mr-2" />
                                Recalculate
                            </Button>
                        </div>
                        <div className="text-sm flex flex-col items-end gap-1">
                            <div className="font-semibold text-base">
                                Total: {fmt(subtotal)}
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    <Button type="submit" disabled={loading || !form.project_id}>
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
