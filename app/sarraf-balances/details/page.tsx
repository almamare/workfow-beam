'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchSarrafBalance, selectSelectedSarrafBalance } from '@/stores/slices/sarraf-balances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Wallet, Building2 } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

function SarrafBalanceDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const balanceId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const balance = useSelector(selectSelectedSarrafBalance);

    useEffect(() => {
        if (balanceId) dispatch(fetchSarrafBalance(balanceId));
    }, [dispatch, balanceId]);

    if (!balanceId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">Missing balance ID. <Button variant="link" onClick={() => router.push('/sarraf-balances')}>Back to list</Button></p>
            </div>
        );
    }

    if (!balance || balance.balance_id !== balanceId) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
            </div>
        );
    }

    const sarraf = balance.sarraf ?? { sarraf_id: balance.sarraf_id, sarraf_name: balance.sarraf_name, sarraf_no: balance.sarraf_no };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Wallet className="h-8 w-8 text-brand-sky-500" />
                        Balance: {balance.currency} – {balance.balance_id}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Balance details (read-only)</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/sarraf-balances')}>Back to list</Button>
                    {balance.sarraf_id && (
                        <Button variant="outline" onClick={() => router.push(`/sarraf-balances?sarraf_id=${encodeURIComponent(balance.sarraf_id)}`)}>
                            <Building2 className="h-4 w-4 mr-2" />Exchange balances
                        </Button>
                    )}
                    <Button onClick={() => router.push(`/sarraf-balances/update?id=${encodeURIComponent(balance.balance_id)}`)} className="bg-brand-sky-600 hover:bg-brand-sky-700 text-white"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                </div>
            </div>

            <EnhancedCard title="Balance information" description={`Balance ID: ${balance.balance_id}`} variant="default" size="sm">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Balance ID</dt><dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{balance.balance_id}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exchange ID</dt><dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{balance.sarraf_id}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exchange</dt><dd className="mt-1 text-slate-900 dark:text-slate-100">{sarraf?.sarraf_name ?? sarraf?.sarraf_no ?? balance.sarraf_id}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Currency</dt><dd className="mt-1"><Badge variant="outline" className="font-mono">{balance.currency}</Badge></dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Balance</dt><dd className="mt-1 font-mono font-semibold text-slate-900 dark:text-slate-100">{Number(balance.balance).toLocaleString()}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Last updated</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{balance.last_updated ? new Date(balance.last_updated).toLocaleString() : '-'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Notes</dt><dd className="mt-1 text-slate-700 dark:text-slate-300">{balance.notes ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created at</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{balance.created_at ? new Date(balance.created_at).toLocaleString() : '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Updated at</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{balance.updated_at ? new Date(balance.updated_at).toLocaleString() : '-'}</dd></div>
                </dl>
            </EnhancedCard>
        </div>
    );
}

export default function SarrafBalanceDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <SarrafBalanceDetailsContent />
        </Suspense>
    );
}
