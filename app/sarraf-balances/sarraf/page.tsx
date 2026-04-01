'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchSarrafBalancesBySarraf,
    deleteSarrafBalance,
    selectBalancesBySarraf,
    selectSelectedSarrafInfo,
    selectSarrafBalancesLoading,
} from '@/stores/slices/sarraf-balances';
import type { SarrafBalance } from '@/stores/types/sarraf-balances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Plus, Building2, Trash2 } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

function SarrafBalancesBySarrafContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sarrafId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();

    const balances = useSelector(selectBalancesBySarraf);
    const sarrafInfo = useSelector(selectSelectedSarrafInfo);
    const loading = useSelector(selectSarrafBalancesLoading);
    const [deleteTarget, setDeleteTarget] = useState<SarrafBalance | null>(null);

    useEffect(() => {
        if (sarrafId) dispatch(fetchSarrafBalancesBySarraf(sarrafId));
    }, [dispatch, sarrafId]);

    const list = Array.isArray(balances) ? balances : [];

    const handleDeleteConfirm = async () => {
        if (!deleteTarget?.balance_id) return;
        try {
            const result = await dispatch(deleteSarrafBalance(deleteTarget.balance_id));
            if (deleteSarrafBalance.rejected.match(result)) {
                toast.error(result.payload || 'Failed to delete balance');
                return;
            }
            toast.success('Balance deleted');
            setDeleteTarget(null);
            dispatch(fetchSarrafBalancesBySarraf(sarrafId));
        } catch {
            toast.error('Failed to delete balance');
        } finally {
            setDeleteTarget(null);
        }
    };

    if (!sarrafId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">Missing exchange ID. <Button variant="link" onClick={() => router.push('/sarraf-balances')}>Back to balances</Button></p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-sky-500" />
                        Balances for: {sarrafInfo?.sarraf_name ?? sarrafInfo?.sarraf_no ?? sarrafId}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Exchange ID: {sarrafId}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/sarraf-balances')}>All balances</Button>
                    <Button variant="outline" onClick={() => router.push(`/sarrafat/details?id=${encodeURIComponent(sarrafId)}`)}>View exchange</Button>
                    <Button onClick={() => router.push(`/sarraf-balances/create?sarraf_id=${encodeURIComponent(sarrafId)}`)} className="bg-sky-600 hover:bg-sky-700 text-white"><Plus className="h-4 w-4 mr-2" />Add balance</Button>
                </div>
            </div>

            <EnhancedCard title="Balances" description={`${list.length} balance(s)`} variant="default" size="sm">
                {loading ? (
                    <div className="py-8 text-center text-slate-500">Loading...</div>
                ) : list.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">No balances for this exchange. <Button variant="link" onClick={() => router.push(`/sarraf-balances/create?sarraf_id=${encodeURIComponent(sarrafId)}`)}>Add balance</Button></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Currency</th>
                                    <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Balance</th>
                                    <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Last updated</th>
                                    <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Notes</th>
                                    <th className="text-right py-2 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((b) => (
                                    <tr key={b.balance_id} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="py-2"><Badge variant="outline" className="font-mono">{b.currency}</Badge></td>
                                        <td className="py-2 font-mono font-semibold">{Number(b.balance).toLocaleString()}</td>
                                        <td className="py-2 text-slate-600 dark:text-slate-400">{b.last_updated ? new Date(b.last_updated).toLocaleString() : '-'}</td>
                                        <td className="py-2 text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={b.notes ?? ''}>{b.notes ?? '-'}</td>
                                        <td className="py-2 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/sarraf-balances/details?id=${encodeURIComponent(b.balance_id)}`)}><Eye className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/sarraf-balances/update?id=${encodeURIComponent(b.balance_id)}`)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteTarget(b)}><Trash2 className="h-4 w-4" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </EnhancedCard>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete balance</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this balance ({deleteTarget?.currency})? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function SarrafBalancesBySarrafPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <SarrafBalancesBySarrafContent />
        </Suspense>
    );
}
