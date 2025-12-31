'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

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

const UpdateTenderPageContent: React.FC = () => {
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
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Update Tender
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Update the details of the tender item.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/projects/details?id=' + projectId)}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Details
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <EnhancedCard
                    title="Tender Item"
                    description="Update the tender item details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <InputGroup label="Name *" value={item.name} onChange={val => updateField('name', val)} error={errors.name} />
                            <InputGroup label="Price *" value={item.price} onChange={val => updateField('price', val)} error={errors.price} />
                            <InputGroup label="Quantity *" value={item.quantity} onChange={val => updateField('quantity', val)} error={errors.quantity} />
                            <InputGroup label="Amount" value={item.amount} readOnly error={errors.amount} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleReset} 
                            disabled={loading}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" /> Reset
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Update Tender'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default function UpdateTenderPage() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading tender...</div>}>
            <UpdateTenderPageContent />
        </Suspense>
    );
}

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
        <Label className="text-slate-700 dark:text-slate-200">{label}</Label>
        <Input
            value={value}
            onChange={e => onChange?.(e.target.value)}
            readOnly={readOnly}
            className={
                readOnly
                    ? 'bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'
            }
        />
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
);
