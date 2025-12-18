'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchContract, updateContract, selectSelectedContract, selectContractsLoading } from '@/stores/slices/client-contracts';
import { fetchClients, selectClients } from '@/stores/slices/clients';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { UpdateContractRequest } from '@/stores/types/client-contracts';

export default function EditContractPage() {
    const params = useParams();
    const router = useRouter();
    const contractId = params.id as string;

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

    useEffect(() => {
        if (contractId) {
            dispatch(fetchContract(contractId));
            dispatch(fetchClients({ limit: 1000 }));
        }
    }, [dispatch, contractId]);

    useEffect(() => {
        if (contract) {
            setForm({
                contract_no: contract.contract_no,
                title: contract.title,
                description: contract.description || '',
                contract_date: contract.contract_date,
                start_date: contract.start_date || '',
                end_date: contract.end_date || '',
                contract_value: typeof contract.contract_value === 'string' ? parseFloat(contract.contract_value) : contract.contract_value,
                currency: contract.currency,
                guarantee_percent: contract.guarantee_percent,
                retention_percent: contract.retention_percent,
                status: contract.status,
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
            await dispatch(updateContract({ id: contractId, data: payload }));
            toast.success('Contract updated successfully!');
            router.push(`/client-contracts/${contractId}`);
        } catch (err: any) {
            toast.error(err || 'Failed to update contract.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    Loading contract...
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    Contract not found
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-slate-200 dark:border-slate-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Edit Contract
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Update the contract details below
                    </p>
                </div>
            </div>

            <EnhancedCard
                title="Contract Information"
                description="Update contract details"
                variant="default"
                size="sm"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Contract No */}
                        <div>
                            <Label htmlFor="contract_no" className="text-slate-700 dark:text-slate-200">
                                Contract No *
                            </Label>
                            <Input
                                id="contract_no"
                                value={form.contract_no}
                                onChange={(e) => updateField('contract_no', e.target.value)}
                                placeholder="Enter contract number"
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.contract_no ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.contract_no && (
                                <p className="text-sm text-red-500 mt-1">{errors.contract_no}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <Label htmlFor="title" className="text-slate-700 dark:text-slate-200">
                                Title *
                            </Label>
                            <Input
                                id="title"
                                value={form.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                placeholder="Enter contract title"
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.title ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Contract Date */}
                        <div>
                            <Label htmlFor="contract_date" className="text-slate-700 dark:text-slate-200">
                                Contract Date *
                            </Label>
                            <Input
                                id="contract_date"
                                type="date"
                                value={form.contract_date}
                                onChange={(e) => updateField('contract_date', e.target.value)}
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.contract_date ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.contract_date && (
                                <p className="text-sm text-red-500 mt-1">{errors.contract_date}</p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <Label htmlFor="start_date" className="text-slate-700 dark:text-slate-200">
                                Start Date
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={form.start_date}
                                onChange={(e) => updateField('start_date', e.target.value)}
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.start_date ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.start_date && (
                                <p className="text-sm text-red-500 mt-1">{errors.start_date}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <Label htmlFor="end_date" className="text-slate-700 dark:text-slate-200">
                                End Date
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={form.end_date}
                                onChange={(e) => updateField('end_date', e.target.value)}
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.end_date ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.end_date && (
                                <p className="text-sm text-red-500 mt-1">{errors.end_date}</p>
                            )}
                        </div>

                        {/* Contract Value */}
                        <div>
                            <Label htmlFor="contract_value" className="text-slate-700 dark:text-slate-200">
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
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.contract_value ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.contract_value && (
                                <p className="text-sm text-red-500 mt-1">{errors.contract_value}</p>
                            )}
                        </div>

                        {/* Currency */}
                        <div>
                            <Label htmlFor="currency" className="text-slate-700 dark:text-slate-200">
                                Currency
                            </Label>
                            <Select
                                value={form.currency}
                                onValueChange={(v) => updateField('currency', v as 'IQD' | 'USD' | 'EUR')}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IQD">IQD</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Guarantee Percent */}
                        <div>
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
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.guarantee_percent ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.guarantee_percent && (
                                <p className="text-sm text-red-500 mt-1">{errors.guarantee_percent}</p>
                            )}
                        </div>

                        {/* Retention Percent */}
                        <div>
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
                                className={`bg-white dark:bg-slate-800 ${
                                    errors.retention_percent ? 'border-red-500' : ''
                                }`}
                            />
                            {errors.retention_percent && (
                                <p className="text-sm text-red-500 mt-1">{errors.retention_percent}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-200">
                                Status
                            </Label>
                            <Select
                                value={form.status}
                                onValueChange={(v) => updateField('status', v as 'Active' | 'Expired' | 'Cancelled')}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Enter contract description"
                            rows={4}
                            className="bg-white dark:bg-slate-800"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">
                            Notes
                        </Label>
                        <Textarea
                            id="notes"
                            value={form.notes}
                            onChange={(e) => updateField('notes', e.target.value)}
                            placeholder="Enter additional notes"
                            rows={3}
                            className="bg-white dark:bg-slate-800"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Contract
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </EnhancedCard>
        </div>
    );
}

