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
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen, Plus, RefreshCw, FileSpreadsheet, Eye } from 'lucide-react';
import type { Client } from '@/stores/types/clients';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function ClientsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const clients = useSelector(selectClients);
    const loading = useSelector(selectClientsLoading);
    const total = useSelector(selectClientsTotal);
    const pages = useSelector(selectClientsPages);
    const error = useSelector(selectClientsError);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
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
        const key = JSON.stringify({ page, limit, search: debouncedSearch });
        if (lastKeyRef.current === key) return; 
        lastKeyRef.current = key;
        dispatch(fetchClients({ page, limit, search: debouncedSearch }));
    }, [dispatch, page, limit, debouncedSearch]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchClients({ page, limit, search: debouncedSearch }));
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
            const { data } = await axios.get('/clients/fetch', {
                params: {
                    search: debouncedSearch,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['ID', 'Client Name', 'Client Number', 'State', 'City', 'Budget', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const csvRows = data.body?.clients?.items?.map((client: Client) => {
                return [
                    client.sequence || '',
                    client.name || '',
                    client.client_no || '',
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
                await axios.delete(`/clients/delete/${id}`);
                toast.success('Client deleted successfully');
                dispatch(fetchClients({ page, limit, search: debouncedSearch }));
            } catch {
                toast.error('Failed to delete client');
            } finally {
                setDeleting(false);
                setOpen(false);
                setSelectedId(null);
            }
        },
        [dispatch, page, limit, debouncedSearch]
    );

    const actions: Action<Client>[] = [
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

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Clients</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage your client relationships and track project assignments
                        </p>
                    </div>
                </div>
                {/* Filter Bar */}
                <FilterBar
                    searchPlaceholder="Search by client number..."
                    searchValue={search}
                    onSearchChange={(value) => {
                        setSearch(value);
                        setPage(1);
                    }}
                    activeFilters={activeFilters}
                    onClearFilters={() => {
                        setSearch('');
                        setPage(1);
                    }}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToExcel}
                                disabled={isExporting || loading}
                                className="gap-2"
                            >
                                <FileSpreadsheet className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshTable}
                                disabled={isRefreshing}
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    }
                />

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
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                <SelectItem value="5" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">5 per page</SelectItem>
                                <SelectItem value="10" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">10 per page</SelectItem>
                                <SelectItem value="20" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">20 per page</SelectItem>
                                <SelectItem value="50" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">50 per page</SelectItem>
                                <SelectItem value="100" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">100 per page</SelectItem>
                                <SelectItem value="200" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">200 per page</SelectItem>
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