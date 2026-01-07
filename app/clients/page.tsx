'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';

import {
    fetchClients,
    selectClients,
    selectClientsLoading,
    selectClientsTotal,
    selectClientsPages,
    selectClientsError,
} from '@/stores/slices/clients';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen, Plus, RefreshCw, FileSpreadsheet, Eye, X, Search } from 'lucide-react';
import type { Client } from '@/stores/types/clients';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { Label } from '@/components/ui/label';

export default function ClientsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const clients = useSelector(selectClients);
    const loading = useSelector(selectClientsLoading);
    const total: number = useSelector(selectClientsTotal); 
    const pages = useSelector(selectClientsPages);
    const error = useSelector(selectClientsError);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [clientTypeFilter, setClientTypeFilter] = useState<'All' | 'Government' | 'Private'>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Active' | 'Suspended'>('All');
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
        const key = JSON.stringify({ page, limit, search: debouncedSearch, client_type: clientTypeFilter, status: statusFilter, date_from: dateFrom, date_to: dateTo });
        if (lastKeyRef.current === key) return; 
        lastKeyRef.current = key;
        dispatch(fetchClients({ 
            page, 
            limit, 
            search: debouncedSearch,
            client_type: clientTypeFilter !== 'All' ? clientTypeFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, clientTypeFilter, statusFilter, dateFrom, dateTo]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchClients({ 
                page, 
                limit, 
                search: debouncedSearch,
                client_type: clientTypeFilter !== 'All' ? clientTypeFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
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
                client_type: clientTypeFilter !== 'All' ? clientTypeFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                limit: 10000,
                page: 1
            };
            if (dateFrom) exportParams.from_date = dateFrom;
            if (dateTo) exportParams.to_date = dateTo;
            
            const { data } = await axios.get('/clients/fetch', {
                params: exportParams
            });

            const headers = ['ID', 'Client Name', 'Client Number', 'Client Type', 'Status', 'State', 'City', 'Budget', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const csvRows = data.body?.clients?.items?.map((client: Client) => {
                return [
                    client.sequence || '',
                    client.name || '',
                    client.client_no || '',
                    client.client_type || '',
                    client.status || '',
                    client.state || '',
                    client.city || '',
                    client.budget || 0,
                    client.created_at || ''
                ].join(',');
            }) || [];

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            
            toast.success('Clients exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export clients');
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<Client>[] = [
        { 
            key: 'sequence' as keyof Client, 
            header: 'ID', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '80px'
        },
        { 
            key: 'name' as keyof Client, 
            header: 'Client Name', 
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>,
            sortable: true 
        },
        { 
            key: 'client_no' as keyof Client, 
            header: 'Client Number', 
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400 font-mono">{value}</span>,
            sortable: true 
        },
        { 
            key: 'state' as keyof Client, 
            header: 'State', 
            render: (value: any) => (
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                    {value}
                </Badge>
            ),
            sortable: true 
        },
        { 
            key: 'city' as keyof Client, 
            header: 'City', 
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true 
        },
        { 
            key: 'client_type' as keyof Client, 
            header: 'Client Type', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                const colors = {
                    Government: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[value as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'status' as keyof Client, 
            header: 'Status', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                const colors = {
                    Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    Draft: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
                    Suspended: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[value as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'budget' as keyof Client, 
            header: 'Budget', 
            render: (value: any) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    {value ? value : 'N/A'}
                </span>
            ),
            sortable: true 
        },
        { 
            key: 'created_at' as keyof Client, 
            header: 'Created', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{value}</span>,
            sortable: true 
        }
    ];

    const handleDeleteClient = useCallback(
        async (id: string) => {
            if (!id) return;
            try {
                setDeleting(true);
               const response = await axios.delete(`/clients/delete/${id}`);
               if(response.data.header.success) {
                toast.success('Client deleted successfully');
                dispatch(fetchClients({ 
                    page, 
                    limit, 
                    search: debouncedSearch,
                    client_type: clientTypeFilter !== 'All' ? clientTypeFilter : undefined,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    from_date: dateFrom || undefined,
                    to_date: dateTo || undefined,
                }));
               } else {
                toast.error(response.data.header.messages[0].message || 'Failed to delete client');
               }
            } catch (error: any) {
                toast.error(error.response.data.header.messages[0].message || 'Failed to delete client');
            } finally {
                setDeleting(false);
                setOpen(false);
            }
        },
        [dispatch, page, limit, debouncedSearch, clientTypeFilter, statusFilter, dateFrom, dateTo]
    );

    const actions: Action<Client>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (client: Client) => router.push(`/clients/details?id=${client.id}`),
            variant: 'info' as const
        },
        {
            label: 'Edit Client',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (client: Client) => router.push(`/clients/update?id=${client.id}`),
            variant: 'warning' as const
        },
        {
            label: 'Delete Client',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (client: Client) => {
                setSelectedId(client.id);
                setOpen(true);
            },
            variant: 'destructive' as const
        },
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (clientTypeFilter !== 'All') activeFilters.push(`Type: ${clientTypeFilter}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
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
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">All Clients</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Browse and manage all clients with comprehensive filtering and management tools
                        </p>
                    </div>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter clients by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search Input with Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by client number, name, state, city, budget, or sequence..."
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
                            {/* Client Type Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="client_type" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Client Type
                                </Label>
                                <Select
                                    value={clientTypeFilter}
                                    onValueChange={(value) => {
                                        setClientTypeFilter(value as 'All' | 'Government' | 'Private');
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Types</SelectItem>
                                        <SelectItem value="Government" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Government</SelectItem>
                                        <SelectItem value="Private" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Private</SelectItem>
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
                                        setStatusFilter(value as 'All' | 'Draft' | 'Active' | 'Suspended');
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        <SelectItem value="Draft" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Draft</SelectItem>
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Active</SelectItem>
                                        <SelectItem value="Suspended" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Suspended</SelectItem>
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
                                        setClientTypeFilter('All');
                                        setStatusFilter('All');
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

                {/* Clients Table */}
                <EnhancedCard
                    title="Clients List"
                    description={`${total} client${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: total,
                        badge: 'Active Clients',
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
                        data={clients}
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
                        noDataMessage="No clients found matching your search criteria"
                        searchPlaceholder="Search clients..."
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
                onConfirm={() => selectedId && handleDeleteClient(selectedId)}
            />
        </>
    );
}