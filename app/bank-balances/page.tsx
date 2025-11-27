'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchBankBalances,
    deleteBankBalance,
    selectBankBalances,
    selectBankBalancesLoading,
    selectBankBalancesTotal,
    selectBankBalancesPages,
} from '@/stores/slices/bank-balances';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Eye, Edit, Plus, RefreshCw, FileSpreadsheet, Trash2, Wallet, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import type { BankBalance } from '@/stores/types/bank-balances';

// Currency options
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
    { code: 'IQD', name: 'Iraqi Dinar', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800' },
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

// Format currency with symbol
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export default function BankBalancesPage() {
    const balances = useSelector(selectBankBalances);
    const loading = useSelector(selectBankBalancesLoading);
    const totalItems = useSelector(selectBankBalancesTotal);
    const totalPages = useSelector(selectBankBalancesPages);

    const dispatch = useReduxDispatch<AppDispatch>();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [bankFilter, setBankFilter] = useState<string>('All');
    const [currencyFilter, setCurrencyFilter] = useState<string>('All');
    const [banks, setBanks] = useState<Array<{ id: string; name: string; bank_no?: string }>>([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [balanceToDelete, setBalanceToDelete] = useState<BankBalance | null>(null);

    // Fetch banks for filter
    useEffect(() => {
        axios.get('/banks/fetch', { params: { page: 1, limit: 1000, status: 'Active' } })
            .then(res => {
                const items: any[] = res?.data?.body?.banks?.items || [];
                setBanks(items.map(b => ({ id: b.id, name: b.name, bank_no: b.bank_no })));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        dispatch(fetchBankBalances({
            page,
            limit,
            search: search || undefined,
            bank_id: bankFilter !== 'All' ? bankFilter : undefined,
            currency: currencyFilter !== 'All' ? currencyFilter : undefined,
        }));
    }, [dispatch, page, limit, search, bankFilter, currencyFilter]);

    const columns: Column<BankBalance>[] = [
        {
            key: 'bank_no',
            header: 'Bank Number',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'bank_name',
            header: 'Bank Name',
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value || '-'}</span>
            )
        },
        {
            key: 'currency',
            header: 'Currency',
            sortable: true,
            render: (value: any) => getCurrencyBadge(value)
        },
        {
            key: 'balance',
            header: 'Balance',
            sortable: true,
            render: (value: any, balance: BankBalance) => (
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(value || 0, balance.currency)}
                </span>
            )
        },
        {
            key: 'last_updated',
            header: 'Last Updated',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }) : '-'}
                </span>
            )
        },
        {
            key: 'notes',
            header: 'Notes',
            sortable: false,
            render: (value: any) => {
                const maxLength = 50;
                const shouldTruncate = value && value.length > maxLength;
                const displayText = shouldTruncate
                    ? `${value.substring(0, maxLength)}...`
                    : value || '-';

                return (
                    <div className="text-slate-700 dark:text-slate-300">
                        <span title={value || ''}>{displayText}</span>
                    </div>
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

    const actions: Action<BankBalance>[] = [
        {
            label: 'View Details',
            onClick: (balance: BankBalance) => {
                router.push(`/bank-balances/details?id=${balance.id}`);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'View Bank Balances',
            onClick: (balance: BankBalance) => {
                router.push(`/bank-balances/bank?id=${balance.bank_id}`);
            },
            icon: <Building2 className="h-4 w-4" />,
            variant: 'default' as const
        },
        {
            label: 'Edit Balance',
            onClick: (balance: BankBalance) => {
                router.push(`/bank-balances/update?id=${balance.id}`);
            },
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Delete Balance',
            onClick: (balance: BankBalance) => {
                setBalanceToDelete(balance);
                setIsDeleteDialogOpen(true);
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (bankFilter !== 'All') {
            const bank = banks.find(b => b.id === bankFilter);
            arr.push(`Bank: ${bank?.name || bankFilter}`);
        }
        if (currencyFilter !== 'All') arr.push(`Currency: ${currencyFilter}`);
        return arr;
    }, [search, bankFilter, currencyFilter, banks]);

    // Calculate totals by currency
    const totalsByCurrency = useMemo(() => {
        const totals: Record<string, number> = {};
        balances.forEach(balance => {
            const currency = balance.currency;
            totals[currency] = (totals[currency] || 0) + (balance.balance || 0);
        });
        return totals;
    }, [balances]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchBankBalances({
                page,
                limit,
                search: search || undefined,
                bank_id: bankFilter !== 'All' ? bankFilter : undefined,
                currency: currencyFilter !== 'All' ? currencyFilter : undefined,
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
            const { data } = await axios.get('/bank-balances/fetch', {
                params: {
                    search: search || undefined,
                    bank_id: bankFilter !== 'All' ? bankFilter : undefined,
                    currency: currencyFilter !== 'All' ? currencyFilter : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Bank Number', 'Bank Name', 'Currency', 'Balance', 'Last Updated', 'Notes', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.balances?.items || []).map((b: BankBalance) => {
                return [
                    escapeCsv(b.bank_no || ''),
                    escapeCsv(b.bank_name || ''),
                    b.currency,
                    b.balance || 0,
                    b.last_updated ? new Date(b.last_updated).toLocaleString('en-US') : '',
                    escapeCsv(b.notes || ''),
                    b.created_at ? new Date(b.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bank_balances_${new Date().toISOString().slice(0, 10)}.csv`;
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
        if (!balanceToDelete) return;

        try {
            await dispatch(deleteBankBalance(balanceToDelete.id)).unwrap();
            setIsDeleteDialogOpen(false);
            setBalanceToDelete(null);
            toast.success('Bank balance deleted successfully');
            dispatch(fetchBankBalances({
                page,
                limit,
                search: search || undefined,
                bank_id: bankFilter !== 'All' ? bankFilter : undefined,
                currency: currencyFilter !== 'All' ? currencyFilter : undefined,
            }));
        } catch (err: any) {
            toast.error(err || 'Failed to delete bank balance');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Bank Balances</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Browse and manage all bank balances</p>
                </div>
                <Button
                    onClick={() => router.push('/bank-balances/create')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add New Balance
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Balances"
                    description="All balances in the system"
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
                    title="Unique Banks"
                    description="Number of banks with balances"
                    variant="default"
                    size="sm"
                    stats={{
                        total: new Set(balances.map(b => b.bank_id)).size,
                        badge: 'Banks',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Unique Currencies"
                    description="Number of currencies"
                    variant="default"
                    size="sm"
                    stats={{
                        total: new Set(balances.map(b => b.currency)).size,
                        badge: 'Currencies',
                        badgeColor: 'success'
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
                        total: balances.length,
                        badge: 'Filtered',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Currency Totals Summary */}
            {Object.keys(totalsByCurrency).length > 0 && (
                <EnhancedCard
                    title="Total Balances by Currency"
                    description="Summary of all balances grouped by currency"
                    variant="default"
                    size="sm"
                >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {Object.entries(totalsByCurrency).map(([currency, total]) => (
                            <div key={currency} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 mb-2">
                                    {getCurrencyBadge(currency)}
                                </div>
                                <p className="font-mono font-semibold text-lg text-slate-900 dark:text-slate-100">
                                    {formatCurrency(total, currency)}
                                </p>
                            </div>
                        ))}
                    </div>
                </EnhancedCard>
            )}

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by bank name or number..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'bank',
                        label: 'Bank',
                        value: bankFilter,
                        options: [
                            { key: 'All', value: 'All', label: 'All Banks' },
                            ...banks.map(bank => ({
                                key: bank.id,
                                value: bank.id,
                                label: `${bank.name} ${bank.bank_no ? `(${bank.bank_no})` : ''}`
                            }))
                        ],
                        onValueChange: (v) => { setBankFilter(v); setPage(1); }
                    },
                    {
                        key: 'currency',
                        label: 'Currency',
                        value: currencyFilter,
                        options: [
                            { key: 'All', value: 'All', label: 'All Currencies' },
                            ...CURRENCIES.map(c => ({
                                key: c.code,
                                value: c.code,
                                label: `${c.code} - ${c.name}`
                            }))
                        ],
                        onValueChange: (v) => { setCurrencyFilter(v); setPage(1); }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setBankFilter('All');
                    setCurrencyFilter('All');
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

            {/* Balances Table */}
            <EnhancedCard
                title="Bank Balances List"
                description={`${balances.length} balances out of ${totalItems} total`}
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
                    data={balances}
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
                    noDataMessage="No bank balances found matching your search criteria"
                    searchPlaceholder="Search balances..."
                />
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
                                {balanceToDelete.bank_name || 'Bank'}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                {getCurrencyBadge(balanceToDelete.currency)}
                                <span className="ml-2 font-mono">
                                    {formatCurrency(balanceToDelete.balance || 0, balanceToDelete.currency)}
                                </span>
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

