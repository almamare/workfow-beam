'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchSarrafat,
    deleteSarraf,
    selectSarrafat,
    selectSarrafatLoading,
    selectSarrafatPages,
    selectSarrafatTotal,
} from '@/stores/slices/sarrafat';
import type { Sarraf } from '@/stores/types/sarrafat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Edit, Eye, Plus, RefreshCw, Trash2, Building2, Wallet } from 'lucide-react';
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

export default function SarrafatPage() {
    const list = useSelector(selectSarrafat);
    const loading = useSelector(selectSarrafatLoading);
    const totalPages = useSelector(selectSarrafatPages);
    const totalItems = useSelector(selectSarrafatTotal);
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Sarraf | null>(null);

    useEffect(() => {
        dispatch(
            fetchSarrafat({
                page,
                limit,
                search: search || undefined,
                status: status !== 'All' ? status : undefined,
            })
        );
    }, [dispatch, page, limit, search, status]);

    const sarrafatList = Array.isArray(list) ? list : [];

    const columns: Column<Sarraf>[] = [
        { key: 'sarraf_no', header: 'Exchange No', sortable: true, render: (v: unknown) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{String(v ?? '-')}</span> },
        { key: 'sarraf_name', header: 'Exchange Name', sortable: true, render: (v: unknown, row: Sarraf) => <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-500 shrink-0" /><span className="font-medium text-slate-800 dark:text-slate-200">{String(v ?? row.sarraf_id ?? '-')}</span></div> },
        { key: 'owner_name', header: 'Owner', sortable: true, render: (v: unknown) => <span className="text-slate-700 dark:text-slate-300">{String(v ?? '-')}</span> },
        { key: 'phone', header: 'Phone', sortable: true, render: (v: unknown) => <span className="text-slate-600 dark:text-slate-400">{String(v ?? '-')}</span> },
        { key: 'governorate', header: 'Governorate', sortable: true, render: (v: unknown) => <span className="text-slate-600 dark:text-slate-400">{String(v ?? '-')}</span> },
        { key: 'city', header: 'City', sortable: true, render: (v: unknown) => <span className="text-slate-600 dark:text-slate-400">{String(v ?? '-')}</span> },
        { key: 'status', header: 'Status', sortable: true, render: (v: unknown) => <Badge variant="outline" className={String(v) === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-slate-100 text-slate-700'}>{String(v ?? '-')}</Badge> },
    ];

    const handleDeleteClick = (row: Sarraf) => {
        setDeleteTarget(row);
        setDeletingId(row.sarraf_id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        const sarrafId = deleteTarget.sarraf_id;
        setDeletingId(sarrafId);
        try {
            const result = await dispatch(deleteSarraf(sarrafId));
            if (deleteSarraf.rejected.match(result)) {
                toast.error(result.payload || 'Failed to delete exchange');
                return;
            }
            toast.success('Exchange deleted successfully');
            setDeleteTarget(null);
            setDeletingId(null);
            dispatch(fetchSarrafat({ page, limit, search: search || undefined, status: status !== 'All' ? status : undefined }));
        } catch {
            toast.error('Failed to delete exchange');
        } finally {
            setDeletingId(null);
            setDeleteTarget(null);
        }
    };

    const actions: Action<Sarraf>[] = [
        { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (row) => router.push(`/sarrafat/details?id=${encodeURIComponent(row.sarraf_id)}`), variant: 'info' },
        { label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: (row) => router.push(`/sarrafat/update?id=${encodeURIComponent(row.sarraf_id)}`), variant: 'warning' },
        { label: 'Balances', icon: <Wallet className="h-4 w-4" />, onClick: (row) => router.push(`/sarraf-balances?sarraf_id=${encodeURIComponent(row.sarraf_id)}`), variant: 'default' },
        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: (row) => handleDeleteClick(row), variant: 'destructive', hidden: (row) => deletingId === row.sarraf_id },
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        return arr;
    }, [search, status]);

    const refreshTable = () => {
        setIsRefreshing(true);
        dispatch(fetchSarrafat({ page, limit, search: search || undefined, status: status !== 'All' ? status : undefined })).finally(() => setIsRefreshing(false));
        toast.success('List refreshed');
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Exchange</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage exchanges and their balances.</p>
                </div>
                <Button onClick={() => router.push('/sarrafat/create')} className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exchange
                </Button>
            </div>

            <FilterBar
                searchPlaceholder="Search exchanges..."
                searchValue={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                filters={[
                    { key: 'status', label: 'Status', value: status, options: [{ key: 'All', value: 'All', label: 'All' }, { key: 'Active', value: 'Active', label: 'Active' }, { key: 'Inactive', value: 'Inactive', label: 'Inactive' }], onValueChange: (v) => { setStatus(v as typeof status); setPage(1); } },
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => { setSearch(''); setStatus('All'); setPage(1); }}
                actions={<Button variant="outline" onClick={refreshTable} disabled={isRefreshing || loading} className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300"><RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />{isRefreshing ? 'Refreshing...' : 'Refresh'}</Button>}
            />

            <EnhancedCard title="Exchange list" description={`${totalItems} exchange(s)`} variant="default" size="sm" headerActions={
                <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"><SelectValue placeholder="Per page" /></SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800"><SelectItem value="5">5 per page</SelectItem><SelectItem value="10">10 per page</SelectItem><SelectItem value="20">20 per page</SelectItem><SelectItem value="50">50 per page</SelectItem><SelectItem value="100">100 per page</SelectItem></SelectContent>
                </Select>
            }>
                <EnhancedDataTable
                    data={sarrafatList}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{ currentPage: page, totalPages: totalPages || 1, pageSize: limit, totalItems, onPageChange: setPage }}
                    noDataMessage="No exchanges found"
                    searchPlaceholder="Search..."
                />
            </EnhancedCard>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete exchange</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete &quot;{deleteTarget?.sarraf_name ?? deleteTarget?.sarraf_id}&quot;? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-red-600 hover:bg-red-700" disabled={!!deletingId}>{deletingId ? 'Deleting...' : 'Delete'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
