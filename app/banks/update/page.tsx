'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchBank, updateBank, selectSelectedBank, selectBanksLoading, clearSelectedBank } from '@/stores/slices/banks';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { UpdateBankPayload } from '@/stores/types/banks';

// Validation functions
const validateIBAN = (iban: string): boolean => {
    if (!iban) return true;
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;
    return ibanRegex.test(iban.toUpperCase()) && iban.length <= 34;
};

const validateSWIFT = (swift: string): boolean => {
    if (!swift) return true;
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(swift.toUpperCase()) && swift.length <= 11;
};

const validateEmail = (email: string): boolean => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
    if (!phone) return true;
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(phone);
};

const validateAccountNumber = (account: string): boolean => {
    if (!account) return true;
    const accountRegex = /^\d+$/;
    return accountRegex.test(account);
};

// Default form values
const initialValues: Omit<UpdateBankPayload, 'id'> = {
    name: '',
    account_number: '',
    iban: '',
    swift_code: '',
    branch_name: '',
    address: '',
    phone: '',
    email: '',
    status: 'Active',
};

const UpdateBankPageContent: React.FC = () => {
    const [form, setForm] = useState<Omit<UpdateBankPayload, 'id'>>(initialValues);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const params = useSearchParams();
    const bankId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedBank = useSelector(selectSelectedBank);
    const bankLoading = useSelector(selectBanksLoading);

    /**
     * Fetch bank data by ID
     */
    const fetchBankData = useCallback(async () => {
        if (!bankId) {
            toast.error('Bank ID is required');
            router.push('/banks');
            return;
        }
        try {
            await dispatch(fetchBank({ id: bankId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load bank data.');
            router.push('/banks');
        }
    }, [bankId, dispatch, router]);

    // Fetch bank when component mounts
    useEffect(() => {
        fetchBankData();
        return () => {
            dispatch(clearSelectedBank());
        };
    }, [fetchBankData, dispatch]);

    // Update form when selectedBank changes
    useEffect(() => {
        if (selectedBank) {
            setForm({
                name: selectedBank.name,
                account_number: selectedBank.account_number || '',
                iban: selectedBank.iban || '',
                swift_code: selectedBank.swift_code || '',
                branch_name: selectedBank.branch_name || '',
                address: selectedBank.address || '',
                phone: selectedBank.phone || '',
                email: selectedBank.email || '',
                status: selectedBank.status || 'Active',
            });
        }
    }, [selectedBank]);

    // Update field value
    const updateField = useCallback((name: keyof Omit<UpdateBankPayload, 'id'>, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Validation function
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!form.name || form.name.trim() === '') {
            errors.name = 'Name is required';
        } else if (form.name.length < 3) {
            errors.name = 'Name must be at least 3 characters';
        }

        if (form.account_number && !validateAccountNumber(form.account_number)) {
            errors.account_number = 'Account number must contain only numbers';
        }

        if (form.iban && !validateIBAN(form.iban)) {
            errors.iban = 'Invalid IBAN format (e.g., SA1234567890123456789012)';
        }

        if (form.swift_code && !validateSWIFT(form.swift_code)) {
            errors.swift_code = 'Invalid SWIFT code format (e.g., ABCBSARI)';
        }

        if (form.email && !validateEmail(form.email)) {
            errors.email = 'Invalid email format';
        }

        if (form.phone && !validatePhone(form.phone)) {
            errors.phone = 'Invalid phone format';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form]);

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        if (!bankId) {
            toast.error('Bank ID is required');
            return;
        }

        setLoading(true);
        try {
            const payload: UpdateBankPayload = {
                id: bankId,
                name: form.name,
                account_number: form.account_number || undefined,
                iban: form.iban ? form.iban.toUpperCase() : undefined,
                swift_code: form.swift_code ? form.swift_code.toUpperCase() : undefined,
                branch_name: form.branch_name || undefined,
                address: form.address || undefined,
                phone: form.phone || undefined,
                email: form.email || undefined,
                status: form.status || undefined,
            };
            await dispatch(updateBank(payload)).unwrap();
            toast.success('Bank updated successfully!');
            router.push('/banks');
        } catch (error: any) {
            toast.error(error || 'Server error.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form handler
    const handleReset = () => {
        if (selectedBank) {
            setForm({
                name: selectedBank.name,
                account_number: selectedBank.account_number || '',
                iban: selectedBank.iban || '',
                swift_code: selectedBank.swift_code || '',
                branch_name: selectedBank.branch_name || '',
                address: selectedBank.address || '',
                phone: selectedBank.phone || '',
                email: selectedBank.email || '',
                status: selectedBank.status || 'Active',
            });
        } else {
            setForm(initialValues);
        }
        setFieldErrors({});
        toast.message('Form reset to original data.');
    };

    if (bankLoading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    if (!selectedBank) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400">Bank not found</p>
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
                        Update Bank
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Modify the details below to update the bank.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/banks')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Banks
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <EnhancedCard
                    title="Bank Information"
                    description="Update the details for the bank."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Name */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Bank Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={e => updateField('name', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    minLength={3}
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.name}</p>
                                )}
                            </div>

                            {/* Account Number */}
                            <div className="space-y-2">
                                <Label htmlFor="account_number" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Account Number
                                </Label>
                                <Input
                                    id="account_number"
                                    value={form.account_number || ''}
                                    onChange={e => updateField('account_number', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.account_number && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.account_number}</p>
                                )}
                            </div>

                            {/* IBAN */}
                            <div className="space-y-2">
                                <Label htmlFor="iban" className="text-slate-700 dark:text-slate-300 font-medium">
                                    IBAN
                                </Label>
                                <Input
                                    id="iban"
                                    value={form.iban || ''}
                                    onChange={e => updateField('iban', e.target.value.toUpperCase())}
                                    maxLength={34}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                                />
                                {fieldErrors.iban && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.iban}</p>
                                )}
                            </div>

                            {/* SWIFT Code */}
                            <div className="space-y-2">
                                <Label htmlFor="swift_code" className="text-slate-700 dark:text-slate-300 font-medium">
                                    SWIFT Code
                                </Label>
                                <Input
                                    id="swift_code"
                                    value={form.swift_code || ''}
                                    onChange={e => updateField('swift_code', e.target.value.toUpperCase())}
                                    maxLength={11}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                                />
                                {fieldErrors.swift_code && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.swift_code}</p>
                                )}
                            </div>

                            {/* Branch Name */}
                            <div className="space-y-2">
                                <Label htmlFor="branch_name" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Branch Name
                                </Label>
                                <Input
                                    id="branch_name"
                                    value={form.branch_name || ''}
                                    onChange={e => updateField('branch_name', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={form.phone || ''}
                                    onChange={e => updateField('phone', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.phone && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.phone}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email || ''}
                                    onChange={e => updateField('email', e.target.value)}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.email}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={form.status || 'Active'}
                                    onValueChange={(val) => updateField('status', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="Inactive" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Address */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Address
                                </Label>
                                <Textarea
                                    id="address"
                                    value={form.address || ''}
                                    onChange={e => updateField('address', e.target.value)}
                                    rows={3}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading}
                            className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {loading ? 'Updating...' : 'Update Bank'}
                        </Button>
                    </div>
                </EnhancedCard>
            </form>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading update bank...</div>}>
            <UpdateBankPageContent />
        </Suspense>
    );
}

