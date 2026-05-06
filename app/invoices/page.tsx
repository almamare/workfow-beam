'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchInvoices,
    deleteInvoice,
    selectInvoices,
    selectInvoicesLoading,
    selectInvoicesTotal,
    selectInvoicesPages,
} from '@/stores/slices/invoices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Eye, Edit, Plus, RefreshCw, FileSpreadsheet, Trash2, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import type { Invoice } from '@/stores/types/invoices';

export default function InvoicesPage() {
    const invoices = useSelector(selectInvoices);
    const loading = useSelector(selectInvoicesLoading);
    const totalItems = useSelector(selectInvoicesTotal);
    const totalPages = useSelector(selectInvoicesPages);

    const dispatch = useReduxDispatch<AppDispatch>();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | 'Draft' | 'Issued' | 'Paid' | 'Cancelled'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    useEffect(() => {
        dispatch(fetchInvoices({
            page,
            limit,
            search: search || undefined,
            status: status !== 'All' ? status : undefined,
        }));
    }, [dispatch, page, limit, search, status]);

    // Helper function to get status badge
    const getStatusBadge = (status?: string) => {
        const statusValue = status || 'Draft';
        switch (statusValue) {
            case 'Draft':
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 font-medium"
                    >
                        Draft
                    </Badge>
                );
            case 'Issued':
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
                    >
                        Issued
                    </Badge>
                );
            case 'Paid':
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 font-medium"
                    >
                        Paid
                    </Badge>
                );
            case 'Cancelled':
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-medium"
                    >
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 font-medium"
                    >
                        {statusValue}
                    </Badge>
                );
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const columns: Column<Invoice>[] = [
        {
            key: 'invoice_no',
            header: 'Invoice Number',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
            )
        },
        {
            key: 'invoice_date',
            header: 'Invoice Date',
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
        },
        {
            key: 'due_date',
            header: 'Due Date',
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
        },
        {
            key: 'client_name',
            header: 'Client Name',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-800 dark:text-slate-200 font-medium">{value || '-'}</span>
            )
        },
        {
            key: 'bank_name',
            header: 'Bank Name',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value || '-'}</span>
            )
        },
        {
            key: 'subtotal',
            header: 'Subtotal',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono">{formatCurrency(value || 0)}</span>
            )
        },
        {
            key: 'tax',
            header: 'Tax',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono">{formatCurrency(value || 0)}</span>
            )
        },
        {
            key: 'discount',
            header: 'Discount',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono">{formatCurrency(value || 0)}</span>
            )
        },
        {
            key: 'total',
            header: 'Total',
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{formatCurrency(value || 0)}</span>
            )
        },
        {
            key: 'items_count',
            header: 'Items',
            sortable: false,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value || 0}</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            sortable: true,
            render: (value: any, invoice: Invoice) => getStatusBadge(invoice.status)
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

    const actions: Action<Invoice>[] = [
        {
            label: 'View Details',
            onClick: (invoice: Invoice) => {
                router.push(`/invoices/details?id=${invoice.id}`);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit Invoice',
            onClick: (invoice: Invoice) => {
                router.push(`/invoices/update?id=${invoice.id}`);
            },
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Delete Invoice',
            onClick: (invoice: Invoice) => {
                setInvoiceToDelete(invoice);
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
            await dispatch(fetchInvoices({
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
            const { data } = await axios.get('/invoices/fetch', {
                params: {
                    search: search || undefined,
                    status: status !== 'All' ? status : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Invoice Number', 'Invoice Date', 'Due Date', 'Client Name', 'Bank Name', 'Subtotal', 'Tax', 'Discount', 'Total', 'Items Count', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.invoices?.items || []).map((inv: Invoice) => {
                return [
                    escapeCsv(inv.invoice_no || ''),
                    inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-US') : '',
                    inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US') : '',
                    escapeCsv(inv.client_name || ''),
                    escapeCsv(inv.bank_name || ''),
                    inv.subtotal || 0,
                    inv.tax || 0,
                    inv.discount || 0,
                    inv.total || 0,
                    inv.items_count || 0,
                    inv.status || 'Draft',
                    inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
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
        if (!invoiceToDelete) return;

        try {
            await dispatch(deleteInvoice(invoiceToDelete.id)).unwrap();
            setIsDeleteDialogOpen(false);
            setInvoiceToDelete(null);
            toast.success('Invoice deleted successfully');
            dispatch(fetchInvoices({
                page,
                limit,
                search: search || undefined,
                status: status !== 'All' ? status : undefined,
            }));
        } catch (err: any) {
            toast.error(err || 'Failed to delete invoice');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Invoices</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Browse and manage all system invoices</p>
                </div>
                <Button
                    onClick={() => router.push('/invoices/create')}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add New Invoice
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Invoices"
                    description="All invoices in the system"
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
                    title="Total Amount"
                    description={`${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoices.reduce((sum, inv) => sum + (inv.total || 0), 0))}`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
                        badge: 'Amount',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Paid Invoices"
                    description="Successfully paid"
                    variant="default"
                    size="sm"
                    stats={{
                        total: invoices.filter(inv => inv.status === 'Paid').length,
                        badge: 'Paid',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Draft Invoices"
                    description="Pending invoices"
                    variant="default"
                    size="sm"
                    stats={{
                        total: invoices.filter(inv => inv.status === 'Draft').length,
                        badge: 'Draft',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by invoice number..."
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
                            { key: 'Draft', value: 'Draft', label: 'Draft' },
                            { key: 'Issued', value: 'Issued', label: 'Issued' },
                            { key: 'Paid', value: 'Paid', label: 'Paid' },
                            { key: 'Cancelled', value: 'Cancelled', label: 'Cancelled' },
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
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Invoices Table */}
            <EnhancedCard
                title="Invoices List"
                description={`${invoices.length} invoices out of ${totalItems} total`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={invoices}
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
                    noDataMessage="No invoices found matching your search criteria"
                    searchPlaceholder="Search invoices..."
                />
            </EnhancedCard>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Invoice</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this invoice? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {invoiceToDelete && (
                        <div className="py-4">
                            <p className="text-slate-900 dark:text-slate-100 font-semibold">
                                Invoice: {invoiceToDelete.invoice_no || invoiceToDelete.id}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoiceToDelete.total || 0)}
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

