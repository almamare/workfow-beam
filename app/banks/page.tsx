'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchBanks,
    deleteBank,
    selectBanks,
    selectBanksLoading,
    selectBanksTotal,
    selectBanksPages,
} from '@/stores/slices/banks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Eye, Edit, Plus, RefreshCw, FileSpreadsheet, Trash2, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import type { Bank } from '@/stores/types/banks';

export default function BanksPage() {
    const banks = useSelector(selectBanks);
    const loading = useSelector(selectBanksLoading);
    const totalItems = useSelector(selectBanksTotal);
    const totalPages = useSelector(selectBanksPages);

    const dispatch = useReduxDispatch<AppDispatch>();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

    useEffect(() => {
        dispatch(fetchBanks({
            page,
            limit,
            search: search || undefined,
            status: status !== 'All' ? status : undefined,
        }));
    }, [dispatch, page, limit, search, status]);

    const columns: Column<Bank>[] = [
        {
            key: 'bank_no',
            header: 'Bank Number',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'name',
            header: 'Name',
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
            )
        },
        {
            key: 'account_number',
            header: 'Account Number',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'iban',
            header: 'IBAN',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'swift_code',
            header: 'SWIFT Code',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'branch_name',
            header: 'Branch Name',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value || '-'}</span>
            )
        },
        {
            key: 'phone',
            header: 'Phone',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value || '-'}</span>
            )
        },
        {
            key: 'email',
            header: 'Email',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value: any, bank: Bank) => {
                const isActive = bank.status === 'Active';
                return (
                    <Badge
                        variant="outline"
                        className={`${
                            isActive
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800'
                        } font-medium`}
                    >
                        {bank.status || 'Active'}
                    </Badge>
                );
            }
        },
        {
            key: 'created_at',
            header: 'Created At',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    }) : '-'}
                </span>
            )
        }
    ];

    const actions: Action<Bank>[] = [
        {
            label: 'View Details',
            onClick: (bank: Bank) => {
                router.push(`/banks/details?id=${bank.id}`);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Bank',
            onClick: (bank: Bank) => {
                router.push(`/banks/update?id=${bank.id}`);
            },
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Delete Bank',
            onClick: (bank: Bank) => {
                setBankToDelete(bank);
                setIsDeleteDialogOpen(true);
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        return arr;
    }, [search, status]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchBanks({
                page,
                limit,
                search: search || undefined,
                status: status !== 'All' ? status : undefined,
            })).unwrap();
            toast.success('Table refreshed successfully');
        } catch (err: any) {
            toast.error(err || 'Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/banks/fetch', {
                params: {
                    search: search || undefined,
                    status: status !== 'All' ? status : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Bank Number', 'Name', 'Account Number', 'IBAN', 'SWIFT Code', 'Branch Name', 'Phone', 'Email', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.banks?.items || []).map((b: Bank) => {
                return [
                    escapeCsv(b.bank_no || ''),
                    escapeCsv(b.name),
                    escapeCsv(b.account_number || ''),
                    escapeCsv(b.iban || ''),
                    escapeCsv(b.swift_code || ''),
                    escapeCsv(b.branch_name || ''),
                    escapeCsv(b.phone || ''),
                    escapeCsv(b.email || ''),
                    b.status || 'Active',
                    b.created_at ? new Date(b.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `banks_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!bankToDelete) return;

        try {
            await dispatch(deleteBank(bankToDelete.id)).unwrap();
            setIsDeleteDialogOpen(false);
            setBankToDelete(null);
            toast.success('Bank deleted successfully');
            dispatch(fetchBanks({
                page,
                limit,
                search: search || undefined,
                status: status !== 'All' ? status : undefined,
            }));
        } catch (err: any) {
            toast.error(err || 'Failed to delete bank');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Banks</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Browse and manage all system banks</p>
                </div>
                <Button
                    onClick={() => router.push('/banks/create')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add New Bank
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Banks"
                    description="All banks in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalItems,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Active Banks"
                    description="Currently active banks"
                    variant="default"
                    size="sm"
                    stats={{
                        total: banks.filter(b => b.status === 'Active').length,
                        badge: 'Active',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Inactive Banks"
                    description="Inactive banks"
                    variant="default"
                    size="sm"
                    stats={{
                        total: banks.filter(b => b.status === 'Inactive').length,
                        badge: 'Inactive',
                        badgeColor: 'error'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Filtered Results"
                    description="Current filter results"
                    variant="default"
                    size="sm"
                    stats={{
                        total: banks.length,
                        badge: 'Filtered',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by bank name..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'status',
                        label: 'Status',
                        value: status,
                        options: [
                            { key: 'All', value: 'All', label: 'All Statuses' },
                            { key: 'Active', value: 'Active', label: 'Active' },
                            { key: 'Inactive', value: 'Inactive', label: 'Inactive' },
                        ],
                        onValueChange: (v) => { setStatus(v as any); setPage(1); }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setStatus('All');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Banks Table */}
            <EnhancedCard
                title="Banks List"
                description={`${banks.length} banks out of ${totalItems} total`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={banks}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No banks found matching your search criteria"
                    searchPlaceholder="Search banks..."
                />
            </EnhancedCard>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Bank</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this bank? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {bankToDelete && (
                        <div className="py-4">
                            <p className="text-slate-900 dark:text-slate-100 font-semibold">{bankToDelete.name}</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                Bank Number: {bankToDelete.bank_no || '-'}
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
}

function escapeCsv(val: any) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

