'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchSarrafBalances,
    deleteSarrafBalance,
    selectSarrafBalances,
    selectSarrafBalancesLoading,
    selectSarrafBalancesPages,
    selectSarrafBalancesTotal,
} from '@/stores/slices/sarraf-balances';
import { fetchSarrafat, selectSarrafat } from '@/stores/slices/sarrafat';
import type { SarrafBalance } from '@/stores/types/sarraf-balances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Edit, Eye, Plus, RefreshCw, Trash2, Building2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
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

const CURRENCIES = ['USD', 'IQD', 'EUR', 'GBP', 'SAR', 'AED', 'KWD', 'BHD', 'OMR', 'JOD', 'EGP'];

function getCurrencyBadge(currency: string) {
    return (
        <Badge variant="outline" className="font-mono text-xs">
            {currency}
        </Badge>
    );
}

function SarrafBalancesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sarrafIdFromQuery = searchParams.get('sarraf_id') ?? '';

    const list = useSelector(selectSarrafBalances);
    const loading = useSelector(selectSarrafBalancesLoading);
    const totalPages = useSelector(selectSarrafBalancesPages);
    const totalItems = useSelector(selectSarrafBalancesTotal);
    const sarrafatList = useSelector(selectSarrafat);
    const dispatch = useReduxDispatch<AppDispatch>();

    const [sarrafFilter, setSarrafFilter] = useState<string>(sarrafIdFromQuery || 'All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<SarrafBalance | null>(null);

    useEffect(() => {
        dispatch(fetchSarrafat({ page: 1, limit: 500, status: 'Active' }));
    }, [dispatch]);

    useEffect(() => {
        if (sarrafIdFromQuery && sarrafFilter === 'All') setSarrafFilter(sarrafIdFromQuery);
    }, [sarrafIdFromQuery]);

    useEffect(() => {
        dispatch(
            fetchSarrafBalances({
                page,
                limit,
                sarraf_id: sarrafFilter !== 'All' ? sarrafFilter : undefined,
                currency: currencyFilter !== 'All' ? currencyFilter : undefined,
            })
        );
    }, [dispatch, page, limit, sarrafFilter, currencyFilter]);

    const balancesList = Array.isArray(list) ? list : [];
    const sarrafOptions = Array.isArray(sarrafatList) ? sarrafatList : [];

    const columns: Column<SarrafBalance>[] = [
        { key: 'sarraf_no', header: 'Exchange No', sortable: true, render: (v: unknown, row: SarrafBalance) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{String(row.sarraf_no ?? row.sarraf_name ?? row.sarraf_id ?? '-')}</span> },
        { key: 'sarraf_name', header: 'Exchange Name', sortable: true, render: (v: unknown, row: SarrafBalance) => <span className="font-medium text-slate-800 dark:text-slate-200">{String(v ?? row.sarraf_no ?? row.sarraf_id ?? '-')}</span> },
        { key: 'sarraf_id', header: 'Exchange ID', sortable: true, render: (v: unknown) => <span className="font-mono text-xs text-slate-500">{String(v ?? '-')}</span> },
        { key: 'currency', header: 'Currency', sortable: true, render: (v: unknown) => getCurrencyBadge(String(v ?? '-')) },
        { key: 'balance', header: 'Balance', sortable: true, render: (v: unknown) => <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{Number(v ?? 0).toLocaleString()}</span> },
        { key: 'last_updated', header: 'Last Updated', sortable: true, render: (v: unknown) => <span className="text-slate-600 dark:text-slate-400">{v ? new Date(String(v)).toLocaleString() : '-'}</span> },
        { key: 'notes', header: 'Notes', sortable: false, render: (v: unknown) => <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px] block" title={String(v ?? '')}>{String(v ?? '-')}</span> },
    ];

    const handleDeleteClick = (row: SarrafBalance) => setDeleteTarget(row);

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
            dispatch(fetchSarrafBalances({ page, limit, sarraf_id: sarrafFilter !== 'All' ? sarrafFilter : undefined, currency: currencyFilter !== 'All' ? currencyFilter : undefined }));
        } catch {
            toast.error('Failed to delete balance');
        } finally {
            setDeleteTarget(null);
        }
    };

    const actions: Action<SarrafBalance>[] = [
        { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row) => router.push(`/sarraf-balances/details?id=${encodeURIComponent(row.balance_id)}`), variant: 'info' },
        { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row) => router.push(`/sarraf-balances/update?id=${encodeURIComponent(row.balance_id)}`), variant: 'warning' },
        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row) => handleDeleteClick(row), variant: 'destructive', hidden: (row) => deleteTarget?.balance_id === row.balance_id },
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (sarrafFilter !== 'All') {
            const s = sarrafOptions.find((x) => x.sarraf_id === sarrafFilter);
            arr.push(`Exchange: ${s?.sarraf_name ?? sarrafFilter}`);
        }
        if (currencyFilter !== 'All') arr.push(`Currency: ${currencyFilter}`);
        return arr;
    }, [sarrafFilter, currencyFilter, sarrafOptions]);

    const refreshTable = () => {
        setIsRefreshing(true);
        dispatch(fetchSarrafBalances({ page, limit, sarraf_id: sarrafFilter !== 'All' ? sarrafFilter : undefined, currency: currencyFilter !== 'All' ? currencyFilter : undefined })).finally(() => setIsRefreshing(false));
        toast.success('List refreshed');
    };

    const sarrafFilterOptions = [
        { key: 'All', value: 'All', label: 'All Exchanges' },
        ...sarrafOptions.map((s) => ({ key: s.sarraf_id, value: s.sarraf_id, label: `${s.sarraf_no ?? s.sarraf_id} - ${s.sarraf_name}` })),
    ];
    const currencyFilterOptions = [
        { key: 'All', value: 'All', label: 'All' },
        ...CURRENCIES.map((c) => ({ key: c, value: c, label: c })),
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Exchange Balance</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage balances per exchange and currency.</p>
                </div>
                <Button onClick={() => router.push('/sarraf-balances/create' + (sarrafFilter !== 'All' ? `?sarraf_id=${encodeURIComponent(sarrafFilter)}` : ''))} className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Balance
                </Button>
            </div>

            <FilterBar
                searchPlaceholder=""
                searchValue=""
                onSearchChange={() => {}}
                filters={[
                    { key: 'sarraf', label: 'Exchange', value: sarrafFilter, options: sarrafFilterOptions, onValueChange: (v) => { setSarrafFilter(v); setPage(1); } },
                    { key: 'currency', label: 'Currency', value: currencyFilter, options: currencyFilterOptions, onValueChange: (v) => { setCurrencyFilter(v); setPage(1); } },
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => { setSarrafFilter(sarrafIdFromQuery || 'All'); setCurrencyFilter('All'); setPage(1); }}
                actions={<Button variant="outline" onClick={refreshTable} disabled={isRefreshing || loading} className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300"><RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />{isRefreshing ? 'Refreshing...' : 'Refresh'}</Button>}
            />

            {sarrafFilter !== 'All' && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building2 className="h-4 w-4" />
                    <span>Showing balances for exchange: {sarrafOptions.find((s) => s.sarraf_id === sarrafFilter)?.sarraf_name ?? sarrafFilter}</span>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/sarrafat')}>View Exchange</Button>
                </div>
            )}

            <EnhancedCard title="Balances list" description={`${totalItems} balance(s)`} variant="default" size="sm" headerActions={
                <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"><SelectValue placeholder="Per page" /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="5">5 per page</SelectItem><SelectItem value="10">10 per page</SelectItem><SelectItem value="20">20 per page</SelectItem><SelectItem value="50">50 per page</SelectItem><SelectItem value="100">100 per page</SelectItem></SelectContent>
                </Select>
            }>
                <EnhancedDataTable
                    data={balancesList}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{ currentPage: page, totalPages: totalPages || 1, pageSize: limit, totalItems, onPageChange: setPage }}
                    noDataMessage="No balances found"
                    searchPlaceholder="Search..."
                />
            </EnhancedCard>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete balance</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete this balance ({deleteTarget?.currency} – {deleteTarget?.balance_id})? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deleteTarget}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function SarrafBalancesPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-slate-500">Loading...</div>}>
            <SarrafBalancesPageContent />
        </Suspense>
    );
}
