'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchBankBalance,
    selectSelectedBalance,
    selectBankBalancesLoading,
    clearSelectedBalance,
} from '@/stores/slices/bank-balances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';

// Currency options with colors
const CURRENCIES = [
    { code: 'SAR', name: 'Saudi Riyal', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
    { code: 'USD', name: 'US Dollar', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    { code: 'EUR', name: 'Euro', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
    { code: 'GBP', name: 'British Pound', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
    { code: 'AED', name: 'UAE Dirham', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { code: 'KWD', name: 'Kuwaiti Dinar', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
    { code: 'BHD', name: 'Bahraini Dinar', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    { code: 'OMR', name: 'Omani Rial', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
    { code: 'JOD', name: 'Jordanian Dinar', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800' },
    { code: 'EGP', name: 'Egyptian Pound', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
];

// Helper function to get currency badge
const getCurrencyBadge = (currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency) || {
        code: currency,
        name: currency,
        color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
    };
    return (
        <Badge
            variant="outline"
            className={`${currencyInfo.color} font-medium text-lg`}
        >
            {currencyInfo.code}
        </Badge>
    );
};

// Format currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const BalanceDetailsPage: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const balanceId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedBalance = useSelector(selectSelectedBalance);
    const loading = useSelector(selectBankBalancesLoading);

    /**
     * Fetch balance data by ID
     */
    const fetchBalanceData = useCallback(async () => {
        if (!balanceId) {
            toast.error('Balance ID is required');
            router.push('/bank-balances');
            return;
        }
        try {
            await dispatch(fetchBankBalance({ id: balanceId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load balance data.');
            router.push('/bank-balances');
        }
    }, [balanceId, dispatch, router]);

    // Fetch balance when component mounts
    useEffect(() => {
        fetchBalanceData();
        return () => {
            dispatch(clearSelectedBalance());
        };
    }, [fetchBalanceData, dispatch]);

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

    if (!selectedBalance) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Balance not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/bank-balances')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Balances
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
                        Balance Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete balance information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/bank-balances')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Balances
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push(`/bank-balances/update?id=${balanceId}`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Balance
                    </Button>
                </div>
            </div>

            {/* Balance Details */}
            <div className="grid gap-4 md:grid-cols-2">
                <EnhancedCard
                    title="Bank Information"
                    description="Bank details for this balance"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Bank Number</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {selectedBalance.bank_no || selectedBalance.bank?.bank_no || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Bank Name</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg mt-1">
                                {selectedBalance.bank_name || selectedBalance.bank?.name || '-'}
                            </p>
                        </div>
                        {selectedBalance.bank?.account_number && (
                            <div>
                                <Label className="text-slate-500 dark:text-slate-400 text-sm">Account Number</Label>
                                <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                    {selectedBalance.bank.account_number}
                                </p>
                            </div>
                        )}
                        {selectedBalance.bank?.iban && (
                            <div>
                                <Label className="text-slate-500 dark:text-slate-400 text-sm">IBAN</Label>
                                <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                    {selectedBalance.bank.iban}
                                </p>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Balance Information"
                    description="Balance details and amounts"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Balance ID</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {selectedBalance.id}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Currency</Label>
                            <div className="mt-1">
                                {getCurrencyBadge(selectedBalance.currency)}
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Balance</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                                {formatCurrency(selectedBalance.balance || 0, selectedBalance.currency)}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Last Updated</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedBalance.last_updated
                                    ? new Date(selectedBalance.last_updated).toLocaleString('en-US', {
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

            {/* Notes */}
            {selectedBalance.notes && (
                <EnhancedCard
                    title="Notes"
                    description="Additional notes"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-2">
                        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                            {selectedBalance.notes}
                        </p>
                    </div>
                </EnhancedCard>
            )}

            {/* Timestamps */}
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
                            {selectedBalance.created_at
                                ? new Date(selectedBalance.created_at).toLocaleString('en-US', {
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
                            {selectedBalance.updated_at
                                ? new Date(selectedBalance.updated_at).toLocaleString('en-US', {
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
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading balance details...</div>}>
            <BalanceDetailsPage />
        </Suspense>
    );
}

