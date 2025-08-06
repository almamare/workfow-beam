'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ClientPayload = {
    name: string;
    state: string;
    city: string;
    budget: number | string;
};

const initialValues: ClientPayload = {
    name: '',
    state: '',
    city: '',
    budget: ''
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
                // router.push('/clients');
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create Client</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter client details below, then submit to create a new client.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/clients')}>
                        Back to Clients
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form id="client-create-form" onSubmit={handleSubmit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                        <CardDescription>Core identifying information for the client.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    placeholder="Client Name"
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500">{fieldErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                    id="state"
                                    value={form.state}
                                    onChange={e => updateField('state', e.target.value)}
                                    placeholder="e.g., Nineveh"
                                />
                                {fieldErrors.state && (
                                    <p className="text-xs text-red-500">{fieldErrors.state}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    value={form.city}
                                    onChange={e => updateField('city', e.target.value)}
                                    placeholder="e.g., Mosul"
                                />
                                {fieldErrors.city && (
                                    <p className="text-xs text-red-500">{fieldErrors.city}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget *</Label>
                                <Input
                                    id="budget"
                                    inputMode="decimal"
                                    value={form.budget}
                                    onChange={e => updateField('budget', e.target.value)}
                                    placeholder="0"
                                />
                                {fieldErrors.budget && (
                                    <p className="text-xs text-red-500">{fieldErrors.budget}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="justify-end gap-3">
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Saving...' : 'Create Client'}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default CreateClientPage;
