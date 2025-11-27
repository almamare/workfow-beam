'use client';

import React, { useEffect, useCallback, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchBankBalancesByBank,
    deleteBankBalance,
    selectBankBalancesByBank,
    selectSelectedBank,
    selectBankBalancesLoading,
    clearBankBalances,
} from '@/stores/slices/bank-balances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Edit, ArrowLeft, Plus, Trash2, Building2, Eye } from 'lucide-react';
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
            className={`${currencyInfo.color} font-medium`}
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

const BankBalancesViewPage: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const bankId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const balances = useSelector(selectBankBalancesByBank);
    const selectedBank = useSelector(selectSelectedBank);
    const loading = useSelector(selectBankBalancesLoading);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [balanceToDelete, setBalanceToDelete] = useState<{ id: string; currency: string; balance: number } | null>(null);

    /**
     * Fetch balances for bank
     */
    const fetchBalancesData = useCallback(async () => {
        if (!bankId) {
            toast.error('Bank ID is required');
            router.push('/bank-balances');
            return;
        }
        try {
            await dispatch(fetchBankBalancesByBank({ bankId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load bank balances.');
            router.push('/bank-balances');
        }
    }, [bankId, dispatch, router]);

    // Fetch balances when component mounts
    useEffect(() => {
        fetchBalancesData();
        return () => {
            dispatch(clearBankBalances());
        };
    }, [fetchBalancesData, dispatch]);

    // Calculate totals by currency
    const totalsByCurrency = balances.reduce((acc, balance) => {
        const currency = balance.currency;
        acc[currency] = (acc[currency] || 0) + (balance.balance || 0);
        return acc;
    }, {} as Record<string, number>);

    const handleDelete = async () => {
        if (!balanceToDelete) return;

        try {
            await dispatch(deleteBankBalance(balanceToDelete.id)).unwrap();
            setIsDeleteDialogOpen(false);
            setBalanceToDelete(null);
            toast.success('Balance deleted successfully');
            fetchBalancesData();
        } catch (err: any) {
            toast.error(err || 'Failed to delete balance');
        }
    };

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
                        Bank Balances
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View all balances for {selectedBank.name}
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
                        Back to All Balances
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push(`/bank-balances/create?bank_id=${bankId}`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Balance
                    </Button>
                </div>
            </div>

            {/* Bank Info Card */}
            <EnhancedCard
                title="Bank Information"
                description="Bank details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Total Balances</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg mt-1">
                            {balances.length} {balances.length === 1 ? 'Balance' : 'Balances'}
                        </p>
                    </div>
                </div>
            </EnhancedCard>

            {/* Total Balances Summary */}
            {Object.keys(totalsByCurrency).length > 0 && (
                <EnhancedCard
                    title="Total Balances by Currency"
                    description="Summary of all balances for this bank"
                    variant="default"
                    size="sm"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {Object.entries(totalsByCurrency).map(([currency, total]) => (
                            <div key={currency} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    {getCurrencyBadge(currency)}
                                </div>
                                <p className="font-mono font-bold text-xl text-slate-900 dark:text-slate-100">
                                    {formatCurrency(total, currency)}
                                </p>
                            </div>
                        ))}
                    </div>
                </EnhancedCard>
            )}

            {/* Balances Table */}
            <EnhancedCard
                title="Balances List"
                description={`${balances.length} balance(s) for this bank`}
                variant="default"
                size="sm"
            >
                {balances.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                        <p className="text-slate-600 dark:text-slate-400 mb-4">No balances found for this bank</p>
                        <Button
                            onClick={() => router.push(`/bank-balances/create?bank_id=${bankId}`)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Balance
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Currency</th>
                                    <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Balance</th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Last Updated</th>
                                    <th className="text-left p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Notes</th>
                                    <th className="text-center p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map((balance) => (
                                    <tr key={balance.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-3">
                                            {getCurrencyBadge(balance.currency)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className="font-mono font-semibold text-lg text-slate-900 dark:text-slate-100">
                                                {formatCurrency(balance.balance || 0, balance.currency)}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">
                                            {balance.last_updated
                                                ? new Date(balance.last_updated).toLocaleString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })
                                                : '-'}
                                        </td>
                                        <td className="p-3">
                                            <span className="text-slate-600 dark:text-slate-400" title={balance.notes || ''}>
                                                {balance.notes && balance.notes.length > 50
                                                    ? `${balance.notes.substring(0, 50)}...`
                                                    : balance.notes || '-'}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/bank-balances/details?id=${balance.id}`)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/bank-balances/update?id=${balance.id}`)}
                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setBalanceToDelete({ id: balance.id, currency: balance.currency, balance: balance.balance || 0 });
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </EnhancedCard>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Bank Balance</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this bank balance? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {balanceToDelete && (
                        <div className="py-4">
                            <p className="text-slate-900 dark:text-slate-100 font-semibold">
                                {getCurrencyBadge(balanceToDelete.currency)}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 font-mono">
                                {formatCurrency(balanceToDelete.balance, balanceToDelete.currency)}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading bank balances...</div>}>
            <BankBalancesViewPage />
        </Suspense>
    );
}

