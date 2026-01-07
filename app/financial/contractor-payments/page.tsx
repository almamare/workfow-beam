'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    fetchContractorPayments,
    selectContractorPayments,
    selectContractorPaymentsLoading,
    selectContractorPaymentsTotal,
    selectContractorPaymentsPages,
    selectContractorPaymentsError,
} from '@/stores/slices/contractor-payments';
import { fetchContractors, selectContractors } from '@/stores/slices/contractors';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, FileSpreadsheet, Eye, SquarePen, Trash2, X, Search, Loader2 } from 'lucide-react';
import type { ContractorPayment } from '@/stores/types/contractor-payments';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import { DeleteDialog } from '@/components/delete-dialog';

function ContractorPaymentsPageContent() {
    const dispatch = useReduxDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();

    const payments = useSelector(selectContractorPayments);
    const loading = useSelector(selectContractorPaymentsLoading);
    const total = useSelector(selectContractorPaymentsTotal);
    const pages = useSelector(selectContractorPaymentsPages);
    const error = useSelector(selectContractorPaymentsError);
    const contractors = useSelector(selectContractors);
    const projects = useSelector(selectProjects);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [contractorFilter, setContractorFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'approved' | 'paid' | 'rejected' | 'cancelled'>('All');
    const [methodFilter, setMethodFilter] = useState<'All' | 'bank_transfer' | 'cash' | 'check' | 'card'>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Delete dialog state
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Get status from URL params
    useEffect(() => {
        const status = searchParams.get('status');
        if (status && ['pending', 'approved', 'paid', 'rejected', 'cancelled'].includes(status)) {
            setStatusFilter(status as any);
        }
    }, [searchParams]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef<string>('');
    useEffect(() => {
        const key = JSON.stringify({ 
            page, 
            limit, 
            search: debouncedSearch, 
            contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            payment_method: methodFilter !== 'All' ? methodFilter : undefined,
            from_date: dateFrom || undefined, 
            to_date: dateTo || undefined 
        });
        if (lastKeyRef.current === key) return; 
        lastKeyRef.current = key;
        dispatch(fetchContractorPayments({ 
            page, 
            limit, 
            search: debouncedSearch,
            contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
            project_id: undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            payment_method: methodFilter !== 'All' ? methodFilter : undefined,
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, contractorFilter, statusFilter, methodFilter, dateFrom, dateTo]);

    // Fetch contractors and projects on mount
    useEffect(() => {
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
    }, [dispatch]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchContractorPayments({ 
                page, 
                limit, 
                search: debouncedSearch,
                contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                payment_method: methodFilter !== 'All' ? methodFilter : undefined,
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            })).unwrap();
            toast.success('Table refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const exportParams: any = {
                search: debouncedSearch,
                contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                payment_method: methodFilter !== 'All' ? methodFilter : undefined,
                limit: 10000,
                page: 1
            };
            if (dateFrom) exportParams.from_date = dateFrom;
            if (dateTo) exportParams.to_date = dateTo;
            
            const { data } = await axios.get('/contractor-payments/fetch', {
                params: exportParams
            });

            const headers = ['Payment Number', 'Contractor', 'Project', 'Amount', 'Currency', 'Payment Method', 'Payment Date', 'Status', 'Invoice Number', 'Invoice Date', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const csvRows = data.body?.contractor_payments?.items?.map((payment: ContractorPayment) => {
                return [
                    payment.payment_number || '',
                    payment.contractor_name || '',
                    payment.project_name || '',
                    payment.amount || 0,
                    payment.currency || '',
                    payment.payment_method || '',
                    payment.payment_date || '',
                    payment.status || '',
                    payment.invoice_number || '',
                    payment.invoice_date || '',
                    payment.created_at || ''
                ].join(',');
            }) || [];

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `contractor_payments_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            
            toast.success('Contractor payments exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export contractor payments');
        } finally {
            setIsExporting(false);
        }
    };

    const formatNumber = (amount: string | number) => {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num || 0);
    };

    const columns: Column<ContractorPayment>[] = [
        { 
            key: 'payment_number' as keyof ContractorPayment, 
            header: 'Payment Number', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '120px'
        },
        { 
            key: 'contractor_name' as keyof ContractorPayment, 
            header: 'Contractor', 
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{value || 'N/A'}</span>
                    {payment.contractor_id && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{payment.contractor_id}</div>
                    )}
                </div>
            ),
            sortable: true 
        },
        { 
            key: 'project_name' as keyof ContractorPayment, 
            header: 'Project', 
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{value || 'N/A'}</span>
                    {payment.project_id && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{payment.project_id}</div>
                    )}
                </div>
            ),
            sortable: true 
        },
        { 
            key: 'amount' as keyof ContractorPayment, 
            header: 'Amount', 
            render: (value: any, payment: ContractorPayment) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatNumber(value)} {payment.currency || 'USD'}
                </span>
            ),
            sortable: true 
        },
        { 
            key: 'payment_method' as keyof ContractorPayment, 
            header: 'Payment Method', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                const methodLabels: Record<string, string> = {
                    'bank_transfer': 'Bank Transfer',
                    'cash': 'Cash',
                    'check': 'Check',
                    'card': 'Credit Card'
                };
                return (
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {methodLabels[value] || value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'payment_date' as keyof ContractorPayment, 
            header: 'Payment Date', 
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || 'N/A'}</span>,
            sortable: true 
        },
        { 
            key: 'status' as keyof ContractorPayment, 
            header: 'Status', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                const colors: Record<string, string> = {
                    'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                    'approved': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    'paid': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'rejected': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                    'cancelled': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[value] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'invoice_number' as keyof ContractorPayment, 
            header: 'Invoice', 
            render: (value: any, payment: ContractorPayment) => (
                <div>
                    <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
                    {payment.invoice_date && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">{payment.invoice_date}</div>
                    )}
                </div>
            ),
            sortable: true 
        },
        { 
            key: 'created_at' as keyof ContractorPayment, 
            header: 'Created', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{value || 'N/A'}</span>,
            sortable: true 
        }
    ];

    const handleDeletePayment = useCallback(
        async (id: string) => {
            if (!id) return;
            try {
                setDeleting(true);
                await axios.delete(`/contractor-payments/delete/${id}`);
                toast.success('Payment deleted successfully');
                dispatch(fetchContractorPayments({ 
                    page, 
                    limit, 
                    search: debouncedSearch,
                    contractor_id: contractorFilter !== 'All' ? contractorFilter : undefined,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    payment_method: methodFilter !== 'All' ? methodFilter : undefined,
                    from_date: dateFrom || undefined,
                    to_date: dateTo || undefined,
                }));
            } catch {
                toast.error('Failed to delete payment');
            } finally {
                setDeleting(false);
                setOpen(false);
                setSelectedId(null);
            }
        },
        [dispatch, page, limit, debouncedSearch, contractorFilter, statusFilter, methodFilter, dateFrom, dateTo]
    );

    const actions: Action<ContractorPayment>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (payment: ContractorPayment) => router.push(`/financial/contractor-payments/details?id=${payment.id}`),
            variant: 'info' as const
        },
        {
            label: 'Edit Payment',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (payment: ContractorPayment) => router.push(`/financial/contractor-payments/update?id=${payment.id}`),
            variant: 'warning' as const
        },
        {
            label: 'Delete Payment',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (payment: ContractorPayment) => {
                setSelectedId(payment.id);
                setOpen(true);
            },
            variant: 'destructive' as const
        },
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (contractorFilter !== 'All') {
        const contractor = contractors.find(c => c.id === contractorFilter);
        if (contractor) activeFilters.push(`Contractor: ${contractor.name}`);
    }
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (methodFilter !== 'All') {
        const methodLabels: Record<string, string> = {
            'bank_transfer': 'Bank Transfer',
            'cash': 'Cash',
            'check': 'Check',
            'card': 'Credit Card'
        };
        activeFilters.push(`Method: ${methodLabels[methodFilter] || methodFilter}`);
    }
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Contractor Payments</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Browse and manage all contractor payments with comprehensive filtering and management tools
                        </p>
                    </div>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter contractor payments by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search Input with Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by payment number, contractor, project, invoice..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToExcel}
                                    disabled={isExporting || loading}
                                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                                >
                                    <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                    {isExporting ? 'Exporting...' : 'Export Excel'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refreshTable}
                                    disabled={isRefreshing}
                                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Contractor Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="contractor" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Contractor
                                </Label>
                                <Select
                                    value={contractorFilter}
                                    onValueChange={(value) => {
                                        setContractorFilter(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Contractors" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Contractors</SelectItem>
                                        {contractors.map(contractor => (
                                            <SelectItem key={contractor.id} value={contractor.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {contractor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => {
                                        setStatusFilter(value as any);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        <SelectItem value="pending" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Pending</SelectItem>
                                        <SelectItem value="approved" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Approved</SelectItem>
                                        <SelectItem value="paid" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Paid</SelectItem>
                                        <SelectItem value="rejected" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Rejected</SelectItem>
                                        <SelectItem value="cancelled" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Payment Method Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="method" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Payment Method
                                </Label>
                                <Select
                                    value={methodFilter}
                                    onValueChange={(value) => {
                                        setMethodFilter(value as any);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Methods" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Methods</SelectItem>
                                        <SelectItem value="bank_transfer" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Bank Transfer</SelectItem>
                                        <SelectItem value="cash" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Cash</SelectItem>
                                        <SelectItem value="check" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Check</SelectItem>
                                        <SelectItem value="card" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Credit Card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* From Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date_from" className="text-slate-700 dark:text-slate-300 font-medium">
                                    From Date
                                </Label>
                                <DatePicker
                                    value={dateFrom}
                                    onChange={(value) => {
                                        setDateFrom(value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            {/* To Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date_to" className="text-slate-700 dark:text-slate-300 font-medium">
                                    To Date
                                </Label>
                                <DatePicker
                                    value={dateTo}
                                    onChange={(value) => {
                                        setDateTo(value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Active Filters & Clear Button */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                {/* Active Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((filter, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
                                        >
                                            {filter}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Clear All Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setContractorFilter('All');
                                        setStatusFilter('All');
                                        setMethodFilter('All');
                                        setDateFrom('');
                                        setDateTo('');
                                        setPage(1);
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Payments Table */}
                <EnhancedCard
                    title="Contractor Payments List"
                    description={`${total} payment${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: total,
                        badge: 'Total Payments',
                        badgeColor: 'success'
                    }}
                    headerActions={
                        <Select
                            value={String(limit)}
                            onValueChange={(v) => {
                                setLimit(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                <SelectItem value="5" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">5 per page</SelectItem>
                                <SelectItem value="10" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">10 per page</SelectItem>
                                <SelectItem value="20" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">20 per page</SelectItem>
                                <SelectItem value="50" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">50 per page</SelectItem>
                                <SelectItem value="100" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">100 per page</SelectItem>
                                <SelectItem value="200" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">200 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={payments}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{
                            currentPage: page,
                            totalPages: pages,
                            pageSize: limit,
                            totalItems: total,
                            onPageChange: setPage,
                        }}
                        noDataMessage="No contractor payments found matching your search criteria"
                        searchPlaceholder="Search contractor payments..."
                    />
                </EnhancedCard>
            </div>

            {/* Delete dialog */}
            <DeleteDialog
                open={open}
                onClose={() => {
                    if (!deleting) {
                        setOpen(false);
                        setSelectedId(null);
                    }
                }}
                onConfirm={() => selectedId && handleDeletePayment(selectedId)}
            />
        </>
    );
}

export default function ContractorPaymentsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
        }>
            <ContractorPaymentsPageContent />
        </Suspense>
    );
}
