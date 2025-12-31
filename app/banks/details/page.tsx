'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchBank,
    selectSelectedBank,
    selectBanksLoading,
    clearSelectedBank,
} from '@/stores/slices/banks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';

const BankDetailsPageContent: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const bankId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedBank = useSelector(selectSelectedBank);
    const loading = useSelector(selectBanksLoading);

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

    if (loading) {
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
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Bank not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/banks')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Banks
                    </Button>
                </div>
            </div>
        );
    }

    const isActive = selectedBank.status === 'Active';

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Bank Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete bank information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/banks')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Banks
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push(`/banks/update?id=${bankId}`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Bank
                    </Button>
                </div>
            </div>

            {/* Bank Details */}
            <div className="grid gap-4 md:grid-cols-2">
                <EnhancedCard
                    title="Basic Information"
                    description="Bank identification and basic details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Bank Number</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {selectedBank.bank_no || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Bank Name</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg mt-1">
                                {selectedBank.name}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Account Number</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                {selectedBank.account_number || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">IBAN</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                {selectedBank.iban || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">SWIFT Code</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                {selectedBank.swift_code || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Branch Name</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedBank.branch_name || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Status</Label>
                            <div className="mt-1">
                                <Badge
                                    variant="outline"
                                    className={`${
                                        isActive
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                                    } font-medium`}
                                >
                                    {selectedBank.status || 'Active'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Contact Information"
                    description="Bank contact details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Phone</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedBank.phone || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Email</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedBank.email || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Address</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1 whitespace-pre-wrap">
                                {selectedBank.address || '-'}
                            </p>
                        </div>
                    </div>
                </EnhancedCard>
            </div>

            {/* Timestamps Card */}
            <EnhancedCard
                title="Additional Information"
                description="Timestamps and metadata"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Created At</Label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {selectedBank.created_at
                                ? new Date(selectedBank.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Updated At</Label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {selectedBank.updated_at
                                ? new Date(selectedBank.updated_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : '-'}
                        </p>
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading bank details...</div>}>
            <BankDetailsPageContent />
        </Suspense>
    );
}

