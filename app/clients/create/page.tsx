'use client';

import React, { useState, useCallback, useMemo } from 'react';      
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

type ClientPayload = {
    name: string;
    state: string;
    city: string;
    budget: number | string;
    client_type?: 'Government' | 'Private';
    notes?: string;
};

const initialValues: ClientPayload = {
    name: '',
    state: '',
    city: '',
    budget: '',
    client_type: undefined,
    notes: ''
};

const numberFields: (keyof ClientPayload)[] = ['budget'];

const CreateClientPage: React.FC = () => {
    const [form, setForm] = useState<ClientPayload>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

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

    // Update select field
    const updateSelectField = useCallback(
        (name: keyof ClientPayload, value: string) => {
            setForm(prev => ({ ...prev, [name]: value as any }));
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
        const required: (keyof ClientPayload)[] = ['name', 'state', 'city', 'budget'];

        required.forEach(f => {
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
        // Remove client_type if not selected
        if (!payload.client_type) {
            delete payload.client_type;
        }
        // Remove notes if empty (optional field)
        if (!payload.notes || payload.notes.trim() === '') {
            delete payload.notes;
        }
        return payload as ClientPayload;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the validation errors.');
            return;
        }
        setLoading(true);
        try {
            // POST to your clients create endpoint
            const result = await axios.post('/clients/create', { params: formattedPayload });

            const success =
                result?.data?.header?.success === true ||
                !!result?.data?.success ||
                !!result?.data?.body?.client;

            if (success) {
                toast.success('Client created successfully!');
                setForm(initialValues);
                // Optional: navigate back to list
                router.push('/clients');
            } else {
                const msg =
                    result?.data?.header?.messages?.[0]?.message ||
                    result?.data?.header?.message ||
                    result?.data?.message ||
                    'Failed to create client.';
                toast.error(msg);
            }
        } catch (error: any) {
            const msg =
                error?.response?.data?.header?.message ||
                error?.response?.data?.message ||
                error?.message ||
                'Failed to create client. Please try again.';
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
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Create Client</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Enter client details below, then submit to create a new client.
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

            {/* Form */}
            <form id="client-create-form" onSubmit={handleSubmit} className="space-y-4">
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.budget && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.budget}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="client_type" className="text-slate-700 dark:text-slate-200">Client Type</Label>
                                <Select
                                    value={form.client_type || ''}
                                    onValueChange={(value) => updateSelectField('client_type', value)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="Select client type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="Government">Government</SelectItem>
                                        <SelectItem value="Private">Private</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldErrors.client_type && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.client_type}</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">Request Notes</Label>
                            <Textarea
                                id="notes"
                                value={form.notes || ''}
                                onChange={e => updateField('notes', e.target.value)}
                                placeholder="Enter notes or additional information (optional)..."
                                rows={4}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            {fieldErrors.notes && (
                                <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.notes}</p>
                            )}
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
                            {loading ? 'Saving...' : 'Create Client'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default CreateClientPage;
