'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';

import {
    fetchContracts,
    selectContracts,
    selectContractsLoading,
    selectContractsTotal,
    selectContractsPages,
    selectContractsError,
} from '@/stores/slices/client-contracts';
import { fetchClients, selectClients } from '@/stores/slices/clients';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/delete-dialog';
import { SquarePen, Plus, RefreshCw, FileSpreadsheet, Eye, X, Search, Trash2 } from 'lucide-react';
import type { ClientContract } from '@/stores/types/client-contracts';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { Label } from '@/components/ui/label';

export default function ClientContractsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const contracts = useSelector(selectContracts);
    const loading = useSelector(selectContractsLoading);
    const total = useSelector(selectContractsTotal);
    const pages = useSelector(selectContractsPages);
    const error = useSelector(selectContractsError);
    const clients = useSelector(selectClients);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
    const [clientFilter, setClientFilter] = useState<'All' | string>('All');
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

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef<string>('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch, status: statusFilter, client_id: clientFilter, date_from: dateFrom, date_to: dateTo });
        if (lastKeyRef.current === key) return; 
        lastKeyRef.current = key;
        dispatch(fetchContracts({ 
            page, 
            limit, 
            search: debouncedSearch,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            client_id: clientFilter !== 'All' ? clientFilter : undefined,
        }));
        dispatch(fetchClients({ limit: 1000 }));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, clientFilter, dateFrom, dateTo]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchContracts({ 
                page, 
                limit, 
                search: debouncedSearch,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                client_id: clientFilter !== 'All' ? clientFilter : undefined,
            }));
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
                status: statusFilter !== 'All' ? statusFilter : undefined,
                client_id: clientFilter !== 'All' ? clientFilter : undefined,
                limit: 10000,
                page: 1
            };
            if (dateFrom) exportParams.from_date = dateFrom;
            if (dateTo) exportParams.to_date = dateTo;
            
            const { data } = await axios.get('/client-contracts/fetch', {
                params: exportParams
            });

            const items = data?.data?.contracts?.items || data?.body?.contracts?.items || contracts;

            const headers = ['Contract No', 'Title', 'Client Name', 'Client No', 'Contract Date', 'Start Date', 'End Date', 'Contract Value', 'Currency', 'Guarantee %', 'Retention %', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const escapeCsv = (val: any) => {
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            const csvRows = items.map((contract: ClientContract) => {
                return [
                    escapeCsv(contract.contract_no),
                    escapeCsv(contract.title),
                    escapeCsv(contract.client_name || contract.client?.name),
                    escapeCsv(contract.client_no || contract.client?.client_no),
                    escapeCsv(contract.contract_date),
                    escapeCsv(contract.start_date),
                    escapeCsv(contract.end_date),
                    escapeCsv(contract.contract_value),
                    escapeCsv(contract.currency),
                    escapeCsv(contract.guarantee_percent),
                    escapeCsv(contract.retention_percent),
                    escapeCsv(contract.status),
                    escapeCsv(contract.created_at)
                ].join(',');
            }) || [];

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `client_contracts_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            
            toast.success('Client contracts exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export client contracts');
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusColor = (status: string) => {
        if (!status) return 'bg-slate-100 dark:bg-slate-800';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('نشط') || statusLower.includes('active')) {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        }
        if (statusLower.includes('منتهي') || statusLower.includes('expired') || statusLower.includes('ended')) {
            return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
        }
        if (statusLower.includes('ملغي') || statusLower.includes('cancelled') || statusLower.includes('canceled')) {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const formatCurrency = (value: number | string, currency: string = 'IQD') => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '0 ' + currency;
        return new Intl.NumberFormat('en-US').format(numValue) + ' ' + currency;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const columns: Column<ClientContract>[] = [
        { 
            key: 'contract_no' as keyof ClientContract, 
            header: 'Contract No', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm font-semibold">{value || '-'}</span>,
            sortable: true,
            width: '120px'
        },
        { 
            key: 'title' as keyof ClientContract, 
            header: 'Title', 
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || '-'}</span>,
            sortable: true 
        },
        { 
            key: 'client_name' as keyof ClientContract, 
            header: 'Client Name', 
            render: (value: any, row: ClientContract) => {
                const clientName = value || row.client?.name || '-';
                const clientNo = row.client_no || row.client?.client_no;
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{clientName}</span>
                        {clientNo && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">#{clientNo}</span>
                        )}
                    </div>
                );
            },
            sortable: true 
        },
        { 
            key: 'contract_date' as keyof ClientContract, 
            header: 'Contract Date', 
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{formatDate(value)}</span>,
            sortable: true 
        },
        { 
            key: 'contract_value' as keyof ClientContract, 
            header: 'Contract Value', 
            render: (value: any, row: ClientContract) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    {value ? formatCurrency(value, row.currency) : 'N/A'}
                </span>
            ),
            sortable: true 
        },
        { 
            key: 'status' as keyof ClientContract, 
            header: 'Status', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                return (
                    <Badge variant="outline" className={`${getStatusColor(value)} w-fit`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'created_at' as keyof ClientContract, 
            header: 'Created', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(value)}</span>,
            sortable: true 
        }
    ];

    const handleDeleteContract = useCallback(
        async (id: string) => {
            if (!id) return;
            try {
                setDeleting(true);
                await axios.delete(`/client-contracts/delete/${id}`);
                toast.success('Contract deleted successfully');
                dispatch(fetchContracts({ 
                    page, 
                    limit, 
                    search: debouncedSearch,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    client_id: clientFilter !== 'All' ? clientFilter : undefined,
                }));
            } catch {
                toast.error('Failed to delete contract');
            } finally {
                setDeleting(false);
                setOpen(false);
                setSelectedId(null);
            }
        },
        [dispatch, page, limit, debouncedSearch, statusFilter, clientFilter]
    );

    const actions: Action<ClientContract>[] = [
        {
            label: 'View',
            icon: <Eye className="h-4 w-4" />,
            onClick: (contract: ClientContract) => router.push(`/client-contracts/details?id=${contract.id}`),
            variant: 'info' as const
        },
        {
            label: 'Edit',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (contract: ClientContract) => router.push(`/client-contracts/update?id=${contract.id}`),
            variant: 'warning' as const
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (contract: ClientContract) => {
                setSelectedId(contract.id);
                setOpen(true);
            },
            variant: 'destructive' as const
        },
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (clientFilter !== 'All') {
        const client = clients.find(c => c.id === clientFilter);
        activeFilters.push(`Client: ${client?.name || clientFilter}`);
    }
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    // Get unique statuses for filter
    const uniqueStatuses = Array.from(new Set(contracts.map(c => c.status).filter(Boolean))).sort();

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">All Client Contracts</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Browse and manage all client contracts with comprehensive filtering and management tools
                        </p>
                    </div>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter contracts by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search Input with Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by contract number, title, client name..."
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
                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => {
                                        setStatusFilter(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        {uniqueStatuses.map(status => (
                                            <SelectItem key={status} value={status} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Client Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="client" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Client
                                </Label>
                                <Select
                                    value={clientFilter}
                                    onValueChange={(value) => {
                                        setClientFilter(value);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Clients" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Clients</SelectItem>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                {client.name} ({client.client_no})
                                            </SelectItem>
                                        ))}
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
                                        setStatusFilter('All');
                                        setClientFilter('All');
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

                {/* Contracts Table */}
                <EnhancedCard
                    title="Contracts List"
                    description={`${total} contract${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: total,
                        badge: 'Total Contracts',
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
                        data={contracts}
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
                        noDataMessage="No contracts found matching your search criteria"
                        searchPlaceholder="Search contracts..."
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
                onConfirm={() => selectedId && handleDeleteContract(selectedId)}
            />
        </>
    );
}
