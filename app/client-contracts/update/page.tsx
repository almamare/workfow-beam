'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchContract, updateContract, selectSelectedContract, selectContractsLoading, clearSelectedContract } from '@/stores/slices/client-contracts';
import { fetchClients, selectClients } from '@/stores/slices/clients';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { DatePicker } from '@/components/DatePicker';
import type { UpdateContractRequest } from '@/stores/types/client-contracts';

function UpdateContractFormContent() {
    const params = useSearchParams();
    const router = useRouter();
    const contractId = params.get('id') || '';

    const dispatch = useReduxDispatch<AppDispatch>();
    const contract = useSelector(selectSelectedContract);
    const loading = useSelector(selectContractsLoading);
    const clients = useSelector(selectClients);

    const [form, setForm] = useState<UpdateContractRequest>({
        contract_no: '',
        title: '',
        description: '',
        contract_date: '',
        start_date: '',
        end_date: '',
        contract_value: 0,
        currency: 'IQD',
        guarantee_percent: 0,
        retention_percent: 0,
        status: 'Active',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchContractData = useCallback(async () => {
        if (!contractId) {
            toast.error('Contract ID is required');
            router.push('/client-contracts');
            return;
        }
        try {
            await dispatch(fetchContract(contractId)).unwrap();
            dispatch(fetchClients({ limit: 1000 }));
        } catch (err: any) {
            toast.error(err || 'Failed to load contract data.');
            router.push('/client-contracts');
        }
    }, [contractId, dispatch, router]);

    useEffect(() => {
        fetchContractData();
        return () => {
            dispatch(clearSelectedContract());
        };
    }, [fetchContractData, dispatch]);

    useEffect(() => {
        if (contract) {
            setForm({
                contract_no: contract.contract_no || '',
                title: contract.title || '',
                description: contract.description || '',
                contract_date: contract.contract_date || '',
                start_date: contract.start_date || '',
                end_date: contract.end_date || '',
                contract_value: typeof contract.contract_value === 'string' ? parseFloat(contract.contract_value) : (contract.contract_value || 0),
                currency: contract.currency || 'IQD',
                guarantee_percent: contract.guarantee_percent || 0,
                retention_percent: contract.retention_percent || 0,
                status: contract.status || 'Active',
                notes: contract.notes || '',
            });
        }
    }, [contract]);

    const updateField = useCallback(
        (name: keyof UpdateContractRequest, value: any) => {
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
        const required: (keyof UpdateContractRequest)[] = [
            'contract_no',
            'title',
            'contract_date',
            'contract_value',
        ];

        required.forEach((f) => {
            if (!form[f] || (typeof form[f] === 'string' && String(form[f]).trim() === '')) {
                errs[f] = 'Required';
            }
        });

        if (form.contract_no && form.contract_no.length < 3) {
            errs.contract_no = 'Must be at least 3 characters';
        }

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
        return p as UpdateContractRequest;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(updateContract({ id: contractId, data: payload })).unwrap();
            toast.success('Contract updated successfully!');
            router.push(`/client-contracts/details?id=${contractId}`);
        } catch (err: any) {
            toast.error(err || 'Failed to update contract.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = useCallback(() => {
        if (contract) {
            setForm({
                contract_no: contract.contract_no || '',
                title: contract.title || '',
                description: contract.description || '',
                contract_date: contract.contract_date || '',
                start_date: contract.start_date || '',
                end_date: contract.end_date || '',
                contract_value: typeof contract.contract_value === 'string' ? parseFloat(contract.contract_value) : (contract.contract_value || 0),
                currency: contract.currency || 'IQD',
                guarantee_percent: contract.guarantee_percent || 0,
                retention_percent: contract.retention_percent || 0,
                status: contract.status || 'Active',
                notes: contract.notes || '',
            });
        }
        setErrors({});
        toast.message('Form reset to original contract data.');
    }, [contract]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400 ml-3">Loading contract...</p>
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-rose-600 dark:text-rose-400 text-lg font-semibold mb-4">Contract not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/client-contracts')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Contracts
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Update Contract
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Modify the details below to update the contract information.
                    </p>
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push('/client-contracts')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    Back to Contracts
                </Button>
            </div>

            {/* Contract Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Contract Information"
                    description="Update the details for the contract."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Contract No */}
                            <div className="space-y-2">
                                <Label htmlFor="contract_no" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Contract No *
                                </Label>
                                <Input
                                    id="contract_no"
                                    value={form.contract_no}
                                    onChange={(e) => updateField('contract_no', e.target.value)}
                                    placeholder="Enter contract number"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.contract_no ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                />
                                {errors.contract_no && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.contract_no}</p>
                                )}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Title *
                                </Label>
                                <Input
                                    id="title"
                                    value={form.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    placeholder="Enter contract title"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.title ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                />
                                {errors.title && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.title}</p>
                                )}
                            </div>

                            {/* Contract Date */}
                            <div className="space-y-2">
                                <Label htmlFor="contract_date" className="text-slate-700 dark:text-slate-300 font-medium">
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
                                <Label htmlFor="start_date" className="text-slate-700 dark:text-slate-300 font-medium">
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
                                <Label htmlFor="end_date" className="text-slate-700 dark:text-slate-300 font-medium">
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
                                <Label htmlFor="contract_value" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Contract Value *
                                </Label>
                                <Input
                                    id="contract_value"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.contract_value}
                                    onChange={(e) => updateField('contract_value', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.contract_value ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                />
                                {errors.contract_value && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.contract_value}</p>
                                )}
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Currency
                                </Label>
                                <Select
                                    value={form.currency}
                                    onValueChange={(v) => updateField('currency', v as 'IQD' | 'USD' | 'EUR')}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Currency" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="IQD" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">IQD</SelectItem>
                                        <SelectItem value="USD" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">USD</SelectItem>
                                        <SelectItem value="EUR" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">EUR</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Guarantee Percent */}
                            <div className="space-y-2">
                                <Label htmlFor="guarantee_percent" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Guarantee %
                                </Label>
                                <Input
                                    id="guarantee_percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.guarantee_percent}
                                    onChange={(e) => updateField('guarantee_percent', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.guarantee_percent ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                />
                                {errors.guarantee_percent && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.guarantee_percent}</p>
                                )}
                            </div>

                            {/* Retention Percent */}
                            <div className="space-y-2">
                                <Label htmlFor="retention_percent" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Retention %
                                </Label>
                                <Input
                                    id="retention_percent"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={form.retention_percent}
                                    onChange={(e) => updateField('retention_percent', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                        errors.retention_percent ? 'border-red-500 dark:border-red-500' : ''
                                    }`}
                                />
                                {errors.retention_percent && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{errors.retention_percent}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(v) => updateField('status', v as 'Active' | 'Expired' | 'Cancelled')}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">Active</SelectItem>
                                        <SelectItem value="Expired" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">Expired</SelectItem>
                                        <SelectItem value="Cancelled" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                placeholder="Enter contract description"
                                rows={4}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 font-medium">
                                Notes
                            </Label>
                            <Textarea
                                id="notes"
                                value={form.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Enter additional notes"
                                rows={3}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={isSubmitting}
                            className="border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700 hover:text-sky-700 dark:hover:text-sky-300 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {isSubmitting ? 'Updating...' : 'Update Contract'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

export default function UpdateContractPage() {
    return (
        <Suspense
            fallback={
                <div className="space-y-4">
                    <Breadcrumb />
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                        <p className="text-slate-500 dark:text-slate-400 ml-3">Loading...</p>
                    </div>
                </div>
            }
        >
            <UpdateContractFormContent />
        </Suspense>
    );
}

