'use client';

import React, { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchTaskRequests,
    selectTaskRequests,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/tasks_requests';
import { fetchClient } from '@/stores/slices/clients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Eye, RefreshCw, FileSpreadsheet, Clock, Search, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { TaskRequest } from '@/stores/types/tasks_requests';
import type { Client } from '@/stores/types/clients';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';
import axios from '@/utils/axios';

// Extended TaskRequest with client data
interface ClientRequestWithData extends TaskRequest {
    client?: Client;
}

function ClientsRejectedPageContent() {
    const taskRequests = useSelector(selectTaskRequests);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const statusFilter = 'Rejected'; // Fixed status filter
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [clientsData, setClientsData] = useState<Map<string, Client>>(new Map());
    const [loadingClients, setLoadingClients] = useState<Set<string>>(new Set());

    // Filter task requests to only show "Clients" type with "Rejected" status
    const clientRequests = useMemo(() => {
        return taskRequests.filter(req => req.request_type === 'Clients' && req.status === 'Rejected');
    }, [taskRequests]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch task requests with request_type = "Clients" and status = "Rejected"
    useEffect(() => {
        dispatch(fetchTaskRequests({ 
            page, 
            limit, 
            search: debouncedSearch,
            request_type: 'Clients',
            status: 'Rejected',
            from_date: dateFrom || undefined,
            to_date: dateTo || undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, dateFrom, dateTo]);

    // Fetch client data for each task request
    const fetchClientData = useCallback(async (clientId: string) => {
        if (clientsData.has(clientId) || loadingClients.has(clientId)) {
            return;
        }

        setLoadingClients(prev => new Set(prev).add(clientId));
        try {
            const result = await dispatch(fetchClient(clientId)).unwrap();
            if (result?.data?.client) {
                setClientsData(prev => new Map(prev).set(clientId, result.data!.client));
            }
        } catch (error) {
            console.error(`Failed to fetch client ${clientId}:`, error);
        } finally {
            setLoadingClients(prev => {
                const next = new Set(prev);
                next.delete(clientId);
                return next;
            });
        }
    }, [dispatch, clientsData, loadingClients]);

    // Fetch client data for all requests
    useEffect(() => {
        clientRequests.forEach(request => {
            if (request.task_order_id && !clientsData.has(request.task_order_id)) {
                fetchClientData(request.task_order_id);
            }
        });
    }, [clientRequests, fetchClientData, clientsData]);

    // Create enriched requests with client data
    const enrichedRequests = useMemo(() => {
        return clientRequests.map(request => {
            const client = clientsData.get(request.task_order_id);
            return {
                ...request,
                client
            } as ClientRequestWithData;
        });
    }, [clientRequests, clientsData]);

    const filteredRequests = useMemo(() => {
        return enrichedRequests.filter(request => {
            const client = request.client;
            const matchesSearch = request.request_code?.toLowerCase().includes(search.toLowerCase()) ||
                                client?.name?.toLowerCase().includes(search.toLowerCase()) ||
                                client?.client_no?.toLowerCase().includes(search.toLowerCase()) ||
                                request.notes?.toLowerCase().includes(search.toLowerCase());
            
            return matchesSearch;
        });
    }, [enrichedRequests, search]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchTaskRequests({ 
                page, 
                limit, 
                search: debouncedSearch,
                request_type: 'Clients',
                status: 'Rejected',
                from_date: dateFrom || undefined,
                to_date: dateTo || undefined,
            }));
            setClientsData(new Map()); // Clear cached clients to refetch
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/requests/tasks/fetch', {
                params: {
                    request_type: 'Clients',
                    status: 'Rejected',
                    search: debouncedSearch,
                    limit: 10000,
                    page: 1,
                    from_date: dateFrom || undefined,
                    to_date: dateTo || undefined,
                }
            });

            const headers = ['Request Code', 'Request Type', 'Client', 'Client Number', 'Client Type', 'Status', 'State', 'City', 'Budget', 'Notes', 'Created By', 'Created At'];
            const csvHeaders = headers.join(',');
            const items = data?.body?.tasks_requests?.items || data?.data?.tasks_requests?.items || [];

            const exportData = await Promise.all(
                items.map(async (req: TaskRequest) => {
                    let client: Client | null = null;
                    if (req.task_order_id) {
                        try {
                            const result = await dispatch(fetchClient(req.task_order_id)).unwrap();
                            if (result?.data?.client) {
                                client = result.data.client;
                            }
                        } catch (error) {
                            console.error(`Failed to fetch client ${req.task_order_id}:`, error);
                        }
                    }
                    return { req, client };
                })
            );

            const csvRows = exportData.map(({ req, client }) => {
                return [
                    req.request_code,
                    req.request_type,
                    escapeCsv(client?.name || ''),
                    escapeCsv(client?.client_no || ''),
                    escapeCsv(client?.client_type || ''),
                    req.status,
                    escapeCsv(client?.state || ''),
                    escapeCsv(client?.city || ''),
                    client?.budget || '',
                    escapeCsv(req.notes || ''),
                    escapeCsv(req.created_by_name || ''),
                    req.created_at || ''
                ].join(',');
            });

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rejected_client_requests_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const escapeCsv = (str: string) => {
        if (!str) return '';
        return `"${String(str).replace(/"/g, '""')}"`;
    };

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (dateFrom && dateTo) arr.push(`Date: ${dateFrom} to ${dateTo}`);
        else if (dateFrom) arr.push(`From Date: ${dateFrom}`);
        else if (dateTo) arr.push(`To Date: ${dateTo}`);
        return arr;
    }, [search, dateFrom, dateTo]);

    // Memoize loadingClients to prevent unnecessary re-renders
    const loadingClientsRef = useRef(loadingClients);
    useEffect(() => {
        loadingClientsRef.current = loadingClients;
    }, [loadingClients]);

    const columns: Column<ClientRequestWithData>[] = useMemo(() => [
        {
            key: 'request_code' as keyof ClientRequestWithData,
            header: 'Request Code',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true
        },
        {
            key: 'client_name' as any,
            header: 'Client Name',
            render: (value: any, row: ClientRequestWithData) => {
                const client = row.client;
                const isLoading = loadingClientsRef.current.has(row.task_order_id);
                if (isLoading) {
                    return <span className="text-slate-400">Loading...</span>;
                }
                return <span className="font-semibold text-slate-800 dark:text-slate-200">{client?.name || 'N/A'}</span>;
            },
            sortable: true
        },
        {
            key: 'client_number' as any,
            header: 'Client Number',
            render: (value: any, row: ClientRequestWithData) => {
                const client = row.client;
                return <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{client?.client_no || 'N/A'}</span>;
            },
            sortable: true
        },
        {
            key: 'client_type' as any,
            header: 'Client Type',
            render: (value: any, row: ClientRequestWithData) => {
                const client = row.client;
                if (!client?.client_type) return <span className="text-slate-400">N/A</span>;
                const colors = {
                    Government: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Private: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[client.client_type as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {client.client_type}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'client_state' as any,
            header: 'State',
            render: (value: any, row: ClientRequestWithData) => {
                const client = row.client;
                return <span className="text-slate-600 dark:text-slate-400">{client?.state || 'N/A'}</span>;
            },
            sortable: true
        },
        {
            key: 'client_city' as any,
            header: 'City',
            render: (value: any, row: ClientRequestWithData) => {
                const client = row.client;
                return <span className="text-slate-600 dark:text-slate-400">{client?.city || 'N/A'}</span>;
            },
            sortable: true
        },
        {
            key: 'client_budget' as any,
            header: 'Budget',
            render: (value: any, row: ClientRequestWithData) => {
                const client = row.client;
                if (!client?.budget) return <span className="text-slate-400">N/A</span>;
                return (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                        {new Intl.NumberFormat('en-US').format(parseFloat(client.budget))} IQD
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'status' as keyof ClientRequestWithData,
            header: 'Status',
            render: (value: any) => {
                return (
                    <Badge variant="outline" className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium">
                        {value}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'created_by_name' as keyof ClientRequestWithData,
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>,
            sortable: true
        },
        {
            key: 'created_at' as keyof ClientRequestWithData,
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value}
                </span>
            ),
            sortable: true
        }
    ], []);

    const actions: Action<ClientRequestWithData>[] = [
        {
            label: 'View Request Details',
            onClick: (request) => {
                router.push(`/requests/clients/details?id=${request.id}`);
            },
            icon: <FileText className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'View Client Details',
            onClick: (request) => {
                if (request.client) {
                    router.push(`/clients/details?id=${request.client.id}`);
                } else if (request.task_order_id) {
                    router.push(`/clients/details?id=${request.task_order_id}`);
                }
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Show Approvals Timeline',
            onClick: (request) => router.push(`/requests/clients/timeline?id=${request.id}`),
            icon: <Clock className="h-4 w-4" />,
            variant: 'info' as const,
        },
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Rejected Client Requests</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Browse and manage all rejected client requests
                    </p>
                </div>
            </div>

            {/* Search & Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Search and filter rejected client requests"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by request code, client name, client number, or notes..."
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Requests Table */}
            <EnhancedCard
                title="Rejected Client Requests List"
                description={`${totalItems} rejected request${totalItems !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: totalItems,
                    badge: 'Total Rejected',
                    badgeColor: 'default'
                }}
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
                    data={filteredRequests}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems: totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No rejected client requests found matching your criteria"
                    searchPlaceholder="Search requests..."
                    hideEmptyMessage={true}
                />
            </EnhancedCard>
        </div>
    );
}

export default function ClientsRejectedPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            </div>
        }>
            <ClientsRejectedPageContent />
        </Suspense>
    );
}

