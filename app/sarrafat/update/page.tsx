'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchSarraf, updateSarraf, selectSelectedSarraf } from '@/stores/slices/sarrafat';
import type { UpdateSarrafParams } from '@/stores/types/sarrafat';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

type FormPayload = UpdateSarrafParams & { status?: string };

const emptyForm: FormPayload = {
    sarraf_name: '',
    owner_name: '',
    phone: '',
    email: '',
    governorate: '',
    city: '',
    district: '',
    address: '',
    status: 'Active',
    notes: '',
};

function UpdateSarrafContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sarrafId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const sarraf = useSelector(selectSelectedSarraf);

    const [form, setForm] = useState<FormPayload>(emptyForm);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        if (sarrafId) dispatch(fetchSarraf(sarrafId));
    }, [dispatch, sarrafId]);

    useEffect(() => {
        if (sarraf && sarraf.sarraf_id === sarrafId) {
            setForm({
                sarraf_name: sarraf.sarraf_name ?? '',
                owner_name: sarraf.owner_name ?? '',
                phone: sarraf.phone ?? '',
                email: sarraf.email ?? '',
                governorate: sarraf.governorate ?? '',
                city: sarraf.city ?? '',
                district: sarraf.district ?? '',
                address: sarraf.address ?? '',
                status: sarraf.status ?? 'Active',
                notes: sarraf.notes ?? '',
            });
        }
        setInitialLoad(false);
    }, [sarraf, sarrafId]);

    const updateField = useCallback((name: keyof FormPayload, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }, []);

    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (!form.sarraf_name?.trim()) errs.sarraf_name = 'Required';
        if (!form.owner_name?.trim()) errs.owner_name = 'Required';
        if (!form.phone?.trim()) errs.phone = 'Required';
        if (!form.email?.trim()) errs.email = 'Required';
        if (!form.governorate?.trim()) errs.governorate = 'Required';
        if (!form.city?.trim()) errs.city = 'Required';
        if (!form.district?.trim()) errs.district = 'Required';
        if (!form.address?.trim()) errs.address = 'Required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sarrafId) {
            toast.error('Missing sarraf ID');
            return;
        }
        if (!validate()) {
            toast.error('Please fix the errors below.');
            return;
        }
        setLoading(true);
        try {
            const params: UpdateSarrafParams = {
                sarraf_name: form.sarraf_name?.trim(),
                owner_name: form.owner_name?.trim(),
                phone: form.phone?.trim(),
                email: form.email?.trim(),
                governorate: form.governorate?.trim(),
                city: form.city?.trim(),
                district: form.district?.trim(),
                address: form.address?.trim(),
                status: form.status,
                notes: form.notes?.trim(),
            };
            const result = await dispatch(updateSarraf({ sarrafId, params }));
            if (updateSarraf.rejected.match(result)) {
                toast.error(result.payload || 'Failed to update sarraf');
                return;
            }
            toast.success('Sarraf updated successfully');
            router.push(`/sarrafat/details?id=${encodeURIComponent(sarrafId)}`);
        } catch {
            toast.error('Failed to update sarraf');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (sarraf && sarraf.sarraf_id === sarrafId) {
            setForm({
                sarraf_name: sarraf.sarraf_name ?? '',
                owner_name: sarraf.owner_name ?? '',
                phone: sarraf.phone ?? '',
                email: sarraf.email ?? '',
                governorate: sarraf.governorate ?? '',
                city: sarraf.city ?? '',
                district: sarraf.district ?? '',
                address: sarraf.address ?? '',
                status: sarraf.status ?? 'Active',
                notes: sarraf.notes ?? '',
            });
        }
        setErrors({});
    };

    if (!sarrafId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">Missing sarraf ID. <Button variant="link" onClick={() => router.push('/sarrafat')}>Back to list</Button></p>
            </div>
        );
    }

    if (initialLoad && !sarraf) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Edit Sarraf</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">Update sarraf information. ID: {sarrafId}</p>
            </div>

            <form onSubmit={handleSubmit}>
                <EnhancedCard title="Sarraf details" description="Name, contact, location, and status" variant="default" size="sm">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="sarraf_name">Sarraf name *</Label>
                            <Input id="sarraf_name" value={form.sarraf_name} onChange={(e) => updateField('sarraf_name', e.target.value)} placeholder="Sarraf name" className="bg-white dark:bg-slate-800" />
                            {errors.sarraf_name && <p className="text-xs text-red-500">{errors.sarraf_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="owner_name">Owner name *</Label>
                            <Input id="owner_name" value={form.owner_name} onChange={(e) => updateField('owner_name', e.target.value)} placeholder="Owner name" className="bg-white dark:bg-slate-800" />
                            {errors.owner_name && <p className="text-xs text-red-500">{errors.owner_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input id="phone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Phone" className="bg-white dark:bg-slate-800" />
                            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" className="bg-white dark:bg-slate-800" />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="governorate">Governorate *</Label>
                            <Input id="governorate" value={form.governorate} onChange={(e) => updateField('governorate', e.target.value)} placeholder="Governorate" className="bg-white dark:bg-slate-800" />
                            {errors.governorate && <p className="text-xs text-red-500">{errors.governorate}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input id="city" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City" className="bg-white dark:bg-slate-800" />
                            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">District *</Label>
                            <Input id="district" value={form.district} onChange={(e) => updateField('district', e.target.value)} placeholder="District" className="bg-white dark:bg-slate-800" />
                            {errors.district && <p className="text-xs text-red-500">{errors.district}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Address *</Label>
                            <Input id="address" value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Full address" className="bg-white dark:bg-slate-800" />
                            {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.status ?? 'Active'} onValueChange={(v) => updateField('status', v)}>
                                <SelectTrigger className="bg-white dark:bg-slate-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" value={form.notes ?? ''} onChange={(e) => updateField('notes', e.target.value)} placeholder="Notes" className="bg-white dark:bg-slate-800" rows={3} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.push('/sarrafat')}>Back to list</Button>
                        <Button type="button" variant="outline" onClick={handleReset} disabled={loading}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                        <Button type="submit" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
}

export default function UpdateSarrafPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <UpdateSarrafContent />
        </Suspense>
    );
}
