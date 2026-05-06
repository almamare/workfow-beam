'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchSarraf, selectSelectedSarraf } from '@/stores/slices/sarrafat';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Building2, Wallet } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';

function SarrafDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sarrafId = searchParams.get('id') ?? '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const sarraf = useSelector(selectSelectedSarraf);

    useEffect(() => {
        if (sarrafId) dispatch(fetchSarraf(sarrafId));
    }, [dispatch, sarrafId]);

    if (!sarrafId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">Missing exchange ID. <Button variant="link" onClick={() => router.push('/sarrafat')}>Back to list</Button></p>
            </div>
        );
    }

    if (!sarraf || sarraf.sarraf_id !== sarrafId) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
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
                        {sarraf.sarraf_name}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Exchange details (read-only)</p>
                </div>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.push('/sarrafat')}>Back to list</Button>
                    <Button onClick={() => router.push(`/sarraf-balances?sarraf_id=${encodeURIComponent(sarraf.sarraf_id)}`)} className="bg-sky-600 hover:bg-sky-700 text-white"><Wallet className="h-4 w-4 mr-2" />Balances</Button>
                    <Button onClick={() => router.push(`/sarrafat/update?id=${encodeURIComponent(sarraf.sarraf_id)}`)} className="bg-sky-600 hover:bg-sky-700 text-white"><Edit className="h-4 w-4 mr-2" />Edit</Button>
                </div>
            </div>

            <EnhancedCard title="Exchange information" description={`No: ${sarraf.sarraf_no ?? sarraf.sarraf_id}`} variant="default" size="sm">
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exchange ID</dt><dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{sarraf.sarraf_id}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exchange No</dt><dd className="mt-1 font-mono text-slate-800 dark:text-slate-200">{sarraf.sarraf_no ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Exchange Name</dt><dd className="mt-1 text-slate-900 dark:text-slate-100">{sarraf.sarraf_name}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Owner Name</dt><dd className="mt-1 text-slate-900 dark:text-slate-100">{sarraf.owner_name}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{sarraf.phone ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{sarraf.email ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Governorate</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{sarraf.governorate ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">City</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{sarraf.city ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">District</dt><dd className="mt-1 text-slate-800 dark:text-slate-200">{sarraf.district ?? '-'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</dt><dd className="mt-1 text-slate-700 dark:text-slate-300">{sarraf.address ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</dt><dd className="mt-1"><Badge variant="outline">{sarraf.status ?? '-'}</Badge></dd></div>
                    <div className="sm:col-span-2"><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Notes</dt><dd className="mt-1 text-slate-700 dark:text-slate-300">{sarraf.notes ?? '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Created at</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{sarraf.created_at ? new Date(sarraf.created_at).toLocaleString() : '-'}</dd></div>
                    <div><dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Updated at</dt><dd className="mt-1 text-slate-600 dark:text-slate-400">{sarraf.updated_at ? new Date(sarraf.updated_at).toLocaleString() : '-'}</dd></div>
                </dl>
            </EnhancedCard>
        </div>
    );
}

export default function SarrafDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <SarrafDetailsContent />
        </Suspense>
    );
}
