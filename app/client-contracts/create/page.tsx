'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { createContract } from '@/stores/slices/client-contracts';
import { fetchClients, selectClients } from '@/stores/slices/clients';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { DatePicker } from '@/components/DatePicker';
import type { CreateContractRequest } from '@/stores/types/client-contracts';

const initialValues: CreateContractRequest = {
    client_id: '',
    contract_no: '',
    title: '',
    description: '',
    contract_date: new Date().toISOString().split('T')[0],
    start_date: '',
    end_date: '',
    contract_value: 0,
    currency: 'IQD',
    guarantee_percent: 0,
    retention_percent: 0,
    status: 'Active',
    notes: '',
};

export default function CreateContractPage() {
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    const clients = useSelector(selectClients);

    const [form, setForm] = useState<CreateContractRequest>(initialValues);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        dispatch(fetchClients({ limit: 1000 }));
    }, [dispatch]);

    const updateField = useCallback(
        (name: keyof CreateContractRequest, value: any) => {
            setForm((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                const clone = { ...prev };
                delete clone[name as string];
                return clone;
            });
        },
        []
    );

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        const required: (keyof CreateContractRequest)[] = [
            'client_id',
            'title',
            'contract_date',
            'contract_value',
        ];

        required.forEach((f) => {
            if (!form[f] || String(form[f]).trim() === '') {
                errs[f] = 'Required';
            }
        });


        if (form.title && form.title.length < 3) {
            errs.title = 'Must be at least 3 characters';
        }

        if (form.contract_value !== undefined && form.contract_value < 0) {
            errs.contract_value = 'Must be a positive number';
        }

        if (form.guarantee_percent !== undefined && (form.guarantee_percent < 0 || form.guarantee_percent > 100)) {
            errs.guarantee_percent = 'Must be between 0 and 100';
        }

        if (form.retention_percent !== undefined && (form.retention_percent < 0 || form.retention_percent > 100)) {
            errs.retention_percent = 'Must be between 0 and 100';
        }

        if (form.start_date && form.contract_date && new Date(form.start_date) < new Date(form.contract_date)) {
            errs.start_date = 'Start date must be after contract date';
        }

        if (form.end_date && form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
            errs.end_date = 'End date must be after start date';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const payload = useMemo(() => {
        const p: any = { ...form };
        // Remove empty optional fields
        if (!p.description || p.description.trim() === '') delete p.description;
        if (!p.start_date || p.start_date.trim() === '') delete p.start_date;
        if (!p.end_date || p.end_date.trim() === '') delete p.end_date;
        if (!p.notes || p.notes.trim() === '') delete p.notes;
        if (p.guarantee_percent === 0) p.guarantee_percent = 0;
        if (p.retention_percent === 0) p.retention_percent = 0;
        return p as CreateContractRequest;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            await dispatch(createContract(payload));
            toast.success('Contract created successfully!');
            // router.push('/client-contracts');
        } catch (err: any) {
            toast.error(err || 'Failed to create contract.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(initialValues);
        setErrors({});
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Create New Contract
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter contract details below, then submit to create a new contract.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/client-contracts')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Contracts
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form id="contract-create-form" onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Contract Information"
                    description="Core identifying information for the contract."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Client */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="client_id" className="text-slate-700 dark:text-slate-200">
                                    Client *
                                </Label>
                                <Select
                                    value={form.client_id}
                                    onValueChange={(v) => updateField('client_id', v)}
                                >
                                    <SelectTrigger
                                        className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 ${
                                            errors.client_id ? 'border-red-500' : ''
                                        }`}
                                    >
                                        <SelectValue placeholder="Select a client" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name} ({client.client_no})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.client_id && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.client_id}</p>
                                )}
                            </div>


                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-700 dark:text-slate-200">
                                    Title *
                                </Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="Enter contract title"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.title ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.title}</p>
                                )}
                            </div>

                            {/* Contract Date */}
                            <div className="space-y-2">
                                <Label htmlFor="contract_date" className="text-slate-700 dark:text-slate-200">
                                    Contract Date *
                                </Label>
                                <DatePicker
                                    value={form.contract_date}
                                    onChange={(value) => updateField('contract_date', value)}
                                />
                                {errors.contract_date && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.contract_date}</p>
                                )}
                            </div>

                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-slate-700 dark:text-slate-200">
                                    Start Date
                                </Label>
                                <DatePicker
                                    value={form.start_date || ''}
                                    onChange={(value) => updateField('start_date', value)}
                                />
                                {errors.start_date && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.start_date}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-slate-700 dark:text-slate-200">
                                    End Date
                                </Label>
                                <DatePicker
                                    value={form.end_date || ''}
                                    onChange={(value) => updateField('end_date', value)}
                                />
                                {errors.end_date && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.end_date}</p>
                                )}
                            </div>

                            {/* Contract Value */}
                            <div className="space-y-2">
                                <Label htmlFor="contract_value" className="text-slate-700 dark:text-slate-200">
                                    Contract Value *
                                </Label>
                                <Input
                                    id="contract_value"
                                    type="text"
                                    inputMode="decimal"
                                    value={form.contract_value}
                                    onChange={(e) => updateField('contract_value', e.target.value)}
                                    placeholder="0.00"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.contract_value ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.contract_value && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.contract_value}</p>
                                )}
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-200">
                                    Currency
                                </Label>
                                <Select
                                    value={form.currency}
                                    onValueChange={(v) => updateField('currency', v as 'IQD' | 'USD' | 'EUR')}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="IQD">IQD</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Guarantee Percent */}
                            <div className="space-y-2">
                                <Label htmlFor="guarantee_percent" className="text-slate-700 dark:text-slate-200">
                                    Guarantee %
                                </Label>
                                <Input
                                    id="guarantee_percent"
                                    type="text"
                                    inputMode="decimal"
                                    value={form.guarantee_percent}
                                    onChange={(e) => updateField('guarantee_percent', e.target.value)}
                                    placeholder="0.00"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.guarantee_percent ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.guarantee_percent && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.guarantee_percent}</p>
                                )}
                            </div>

                            {/* Retention Percent */}
                            <div className="space-y-2">
                                <Label htmlFor="retention_percent" className="text-slate-700 dark:text-slate-200">
                                    Retention %
                                </Label>
                                <Input
                                    id="retention_percent"
                                    type="text"
                                    inputMode="decimal"
                                    value={form.retention_percent}
                                    onChange={(e) => updateField('retention_percent', e.target.value)}
                                    placeholder="0.00"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.retention_percent ? 'border-red-500' : ''
                                    }`}
                                />
                                {errors.retention_percent && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.retention_percent}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-200">
                                    Status
                                </Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v) => updateField('status', v as 'Active' | 'Expired' | 'Cancelled')}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Expired">Expired</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    placeholder="Enter contract description"
                                    rows={4}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={form.notes}
                                    onChange={(e) => updateField('notes', e.target.value)}
                                    placeholder="Enter additional notes"
                                    rows={3}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleReset} 
                            disabled={loading}
                            className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Create Contract'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

