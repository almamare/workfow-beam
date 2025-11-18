'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';


type ClientPayload = {
    name: string;
    state: string;
    city: string;
    budget: number | string;
};

type ClientFromApi = {
    id: string;
    name: string;
    state: string;
    city: string;
    budget: number | string;
    client_no?: string;
    sequence?: number;
    created_at?: string;
    updated_at?: string;
};

const emptyValues: ClientPayload = {
    name: '',
    state: '',
    city: '',
    budget: ''
};

const numberFields: (keyof ClientPayload)[] = ['budget'];

const EditClientPage: React.FC = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id'); // expects /clients/edit?id=xxxx
    const router = useRouter();

    const [form, setForm] = useState<ClientPayload>(emptyValues);
    const [loadedForm, setLoadedForm] = useState<ClientPayload>(emptyValues); // for reset-to-loaded
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [clientMeta, setClientMeta] = useState<{ client_no?: string; sequence?: number }>({});

    // Update field
    const updateField = useCallback(
        (name: keyof ClientPayload, value: string) => {
            if (numberFields.includes(name)) {
                if (value === '') {
                    setForm(prev => ({ ...prev, [name]: '' }));
                } else if (/^\d+(\.\d+)?$/.test(value)) {
                    setForm(prev => ({ ...prev, [name]: value }));
                }
            } else {
                setForm(prev => ({ ...prev, [name]: value }));
            }
            setFieldErrors(prev => {
                const clone = { ...prev };
                delete clone[name as string];
                return clone;
            });
        },
        []
    );

    // Validation
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};
        (['name', 'state', 'city', 'budget'] as (keyof ClientPayload)[]).forEach(f => {
            const v = form[f];
            if (v === undefined || v === null || String(v).trim() === '') {
                errors[f] = 'Required';
            }
        });

        if (!errors.budget) {
            const num = Number(form.budget);
            if (Number.isNaN(num)) errors.budget = 'Invalid number';
            else if (num < 0) errors.budget = 'Must be ≥ 0';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    const formattedPayload = useMemo(() => {
        const payload: any = { ...form };
        payload.budget = form.budget === '' ? 0 : Number(form.budget);
        return payload as ClientPayload;
    }, [form]);

    // Load existing client
    const loadClient = useCallback(async () => {
        if (!id) {
            toast.error('Client id is missing.');
            router.push('/clients');
            return;
        }
        setInitialLoading(true);
        try {
            // Adjust this endpoint/shape to your backend
            const res = await axios.get(`/clients/fetch/client/${id}`);
            const client: ClientFromApi =
                res?.data?.body?.client || res?.data?.client || res?.data?.data || {};

            if (!client?.id) {
                toast.error('Client not found.');
                router.push('/clients');
                return;
            }

            const nextForm: ClientPayload = {
                name: client.name ?? '',
                state: client.state ?? '',
                city: client.city ?? '',
                budget: client.budget ?? ''
            };

            setForm(nextForm);
            setLoadedForm(nextForm);
            setClientMeta({ client_no: client.client_no, sequence: client.sequence });
        } catch (e: any) {
            const msg =
                e?.response?.data?.header?.message ||
                e?.response?.data?.message ||
                e?.message ||
                'Failed to load client.';
            toast.error(msg);
            router.push('/clients');
        } finally {
            setInitialLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        loadClient();
    }, [loadClient]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        if (!id) {
            toast.error('Client id is missing.');
            return;
        }
        setLoading(true);
        try {
            // Adjust endpoint/method as your backend expects
            const result = await axios.put(`/clients/update/${id}`, {
                params: formattedPayload
            });

            const success =
                result?.data?.header?.success === true ||
                !!result?.data?.success ||
                !!result?.data?.body?.updated;

            if (success) {
                toast.success('Client updated successfully!');
                setLoadedForm(form); // current form becomes the loaded baseline
                // router.push(`/clients/details?id=${id}`); // Optional navigation
            } else {
                const msg =
                    result?.data?.header?.messages?.[0]?.message ||
                    result?.data?.header?.message ||
                    result?.data?.message ||
                    'Failed to update client.';
                toast.error(msg);
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.header?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update client. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm(loadedForm); // reset to last loaded values
        setFieldErrors({});
        toast.message('Form reset to loaded values.');
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Update Client</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Update the client details, then save your changes.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push('/clients')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Clients
                    </Button>
                </div>
            </div>

            {/* Meta (read-only) */}
            {(clientMeta.client_no || clientMeta.sequence !== undefined) && (
                <EnhancedCard
                    title="Client Meta"
                    description="Read-only identifiers."
                    variant="default"
                    size="sm"
                >
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {clientMeta.client_no && (
                            <div className="space-y-2">
                                <Label htmlFor="client_no" className="text-slate-700 dark:text-slate-200">Client No</Label>
                                <Input 
                                    id="client_no" 
                                    value={clientMeta.client_no} 
                                    disabled 
                                    className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        )}
                        {clientMeta.sequence !== undefined && (
                            <div className="space-y-2">
                                <Label htmlFor="sequence" className="text-slate-700 dark:text-slate-200">Sequence</Label>
                                <Input 
                                    id="sequence" 
                                    value={String(clientMeta.sequence)} 
                                    disabled 
                                    className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        )}
                    </div>
                </EnhancedCard>
            )}

            {/* Form */}
            <form id="client-edit-form" onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Client Information"
                    description="Core identifying information for the client."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    placeholder="Client Name"
                                    disabled={initialLoading || loading}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-slate-700 dark:text-slate-200">State *</Label>
                                <Input
                                    id="state"
                                    value={form.state}
                                    onChange={e => updateField('state', e.target.value)}
                                    placeholder="e.g., Nineveh"
                                    disabled={initialLoading || loading}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                                />
                                {fieldErrors.state && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.state}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">City *</Label>
                                <Input
                                    id="city"
                                    value={form.city}
                                    onChange={e => updateField('city', e.target.value)}
                                    placeholder="e.g., Mosul"
                                    disabled={initialLoading || loading}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                                />
                                {fieldErrors.city && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.city}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget" className="text-slate-700 dark:text-slate-200">Budget *</Label>
                                <Input
                                    id="budget"
                                    inputMode="decimal"
                                    value={form.budget}
                                    onChange={e => updateField('budget', e.target.value)}
                                    placeholder="0"
                                    disabled={initialLoading || loading}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 dark:disabled:bg-slate-900/50 disabled:cursor-not-allowed disabled:text-slate-500 dark:disabled:text-slate-400"
                                />
                                {fieldErrors.budget && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.budget}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleReset} 
                            disabled={loading || initialLoading}
                            className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || initialLoading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Update Client'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default EditClientPage;
