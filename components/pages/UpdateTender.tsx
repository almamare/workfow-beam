'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw, Calculator } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';

type TenderItem = {
    name: string;
    price: number | string;
    quantity: number | string;
    amount: number | string;
};

const initialItem: TenderItem = {
    name: '',
    price: '',
    quantity: '',
    amount: ''
};

const UpdateTenderPage: React.FC = () => {
    const [item, setItem] = useState<TenderItem>(initialItem);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const tenderId = params.get('id') || '';
    const [projectId, setProjectId] = useState<string | null>(null);

    useEffect(() => {
        if (!tenderId) return;
        const fetchData = async () => {
            try {
                const res = await axios.get(`/projects/fetch/tender/${tenderId}`);
                const tender = res.data.body?.tender;
                setProjectId(tender.project_id);
                setItem({
                    name: tender.name,
                    price: tender.price,
                    quantity: tender.quantity,
                    amount: tender.amount
                });
            } catch {
                toast.error('Failed to fetch tender item data.');
            }
        };
        fetchData();
    }, [tenderId]);

    const updateField = (field: keyof TenderItem, value: string) => {
        if (['price', 'quantity'].includes(field)) {
            value = value.replace(/,/g, '');
            if (value === '' || /^\d+(\.\d+)?$/.test(value)) {
                setItem(prev => {
                    const updated = { ...prev, [field]: value };
                    const priceNum = Number(updated.price);
                    const qtyNum = Number(updated.quantity);
                    updated.amount = !isNaN(priceNum) && !isNaN(qtyNum) ? +(priceNum * qtyNum).toFixed(2) : '';
                    return updated;
                });
            }
        } else {
            setItem(prev => ({ ...prev, [field]: value }));
        }
        setErrors(prev => {
            const cp = { ...prev };
            delete cp[field];
            return cp;
        });
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!item.name.trim()) errs.name = 'Required';
        const priceNum = Number(String(item.price).replace(/,/g, ''));
        if (item.price === '' || isNaN(priceNum) || priceNum < 0) errs.price = '>= 0';
        const qtyNum = Number(item.quantity);
        if (item.quantity === '' || isNaN(qtyNum) || qtyNum <= 0) errs.quantity = '> 0';
        if (item.amount === '' || isNaN(Number(item.amount))) errs.amount = 'Invalid';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Fix validation errors.');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.put(`/projects/tenders/update/${tenderId}`, {
                params: {
                    name: item.name.trim(),
                    price: Number(String(item.price).replace(/,/g, '')) || 0,
                    quantity: Number(item.quantity) || 0,
                    amount: Number(item.amount) || 0
                }
            });
            if (res.data?.header?.success) {
                toast.success('Tender item updated successfully!');
                router.push('/projects/details?id=' + projectId);
            } else {
                toast.error(res.data?.header?.messages?.[0]?.message || 'Failed to update tender item.');
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update tender item.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setItem(initialItem);
        setErrors({});
        toast.message('Form cleared.');
    };

    return (
        <div className="space-y-4">

            <Breadcrumb />
            <div className="flex justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Update Tender
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Update the details of the tender item.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/projects/details?id=' + projectId)}
                    >
                        Back to Details
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tender Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <InputGroup label="Name *" value={item.name} onChange={val => updateField('name', val)} error={errors.name} />
                            <InputGroup label="Price *" value={item.price} onChange={val => updateField('price', val)} error={errors.price} />
                            <InputGroup label="Quantity *" value={item.quantity} onChange={val => updateField('quantity', val)} error={errors.quantity} />
                            <InputGroup label="Amount" value={item.amount} readOnly error={errors.amount} />
                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            <RotateCcw className="h-4 w-4 mr-2" /> Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Update Tender'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default UpdateTenderPage;

const InputGroup = ({
    label,
    value,
    onChange,
    error,
    readOnly = false
}: {
    label: string;
    value: any;
    onChange?: (v: string) => void;
    error?: string;
    readOnly?: boolean;
}) => (
    <div className="space-y-1">
        <Label>{label}</Label>
        <Input
            value={value}
            onChange={e => onChange?.(e.target.value)}
            readOnly={readOnly}
            className={readOnly ? 'bg-muted cursor-not-allowed' : ''}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);
