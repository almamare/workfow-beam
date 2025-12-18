'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchContracts,
    selectContracts,
    selectContractsLoading,
    selectContractsTotal,
    selectContractsPages,
} from '@/stores/slices/client-contracts';
import { fetchClients, selectClients } from '@/stores/slices/clients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FileText, Eye, Edit, Trash2, Plus, RefreshCw, FileSpreadsheet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import type { ClientContract } from '@/stores/types/client-contracts';
import { deleteContract } from '@/stores/slices/client-contracts';
import axios from '@/utils/axios';
import { useRouter } from 'next/navigation';

export default function ClientContractsPage() {
    const router = useRouter();
    // Redux state
    const contracts = useSelector(selectContracts);
    const loading = useSelector(selectContractsLoading);
    const totalItems = useSelector(selectContractsTotal);
    const totalPages = useSelector(selectContractsPages);
    const clients = useSelector(selectClients);

    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
    const [clientFilter, setClientFilter] = useState<'All' | string>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedContract, setSelectedContract] = useState<ClientContract | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch contracts and clients
    useEffect(() => {
        dispatch(fetchContracts({
            page,
            limit,
            search: search || undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
            client_id: clientFilter !== 'All' ? clientFilter : undefined,
        }));
        dispatch(fetchClients({ limit: 1000 }));
    }, [dispatch, page, limit, search, statusFilter, clientFilter]);

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
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

    const getStatusIcon = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('نشط') || statusLower.includes('active')) {
            return <CheckCircle className="h-4 w-4" />;
        }
        if (statusLower.includes('منتهي') || statusLower.includes('expired') || statusLower.includes('ended')) {
            return <Clock className="h-4 w-4" />;
        }
        if (statusLower.includes('ملغي') || statusLower.includes('cancelled') || statusLower.includes('canceled')) {
            return <XCircle className="h-4 w-4" />;
        }
        return <Clock className="h-4 w-4" />;
    };

    const formatCurrency = (value: number | string, currency: string = 'IQD') => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '0';
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
            sortable: true,
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400 font-semibold">{value || '-'}</span>
        },
        {
            key: 'title' as keyof ClientContract,
            header: 'Title',
            sortable: true,
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || '-'}</span>
        },
        {
            key: 'client_name' as keyof ClientContract,
            header: 'Client Name',
            sortable: true,
            render: (value: any, row: ClientContract) => (
                <div className="flex flex-col">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{value || row.client?.name || '-'}</span>
                    {row.client_no && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">#{row.client_no}</span>
                    )}
                </div>
            )
        },
        {
            key: 'contract_date' as keyof ClientContract,
            header: 'Contract Date',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{formatDate(value)}</span>
        },
        {
            key: 'start_date' as keyof ClientContract,
            header: 'Start Date',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{formatDate(value)}</span>
        },
        {
            key: 'end_date' as keyof ClientContract,
            header: 'End Date',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{formatDate(value)}</span>
        },
        {
            key: 'contract_value' as keyof ClientContract,
            header: 'Contract Value',
            sortable: true,
            render: (value: any, row: ClientContract) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatCurrency(value, row.currency)}
                </span>
            )
        },
        {
            key: 'guarantee_percent' as keyof ClientContract,
            header: 'Guarantee %',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value ? `${value}%` : '0%'}</span>
        },
        {
            key: 'retention_percent' as keyof ClientContract,
            header: 'Retention %',
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value ? `${value}%` : '0%'}</span>
        },
        {
            key: 'status' as keyof ClientContract,
            header: 'Status',
            render: (value: any) => {
                return (
                    <Badge variant="outline" className={`${getStatusColor(value)} flex items-center gap-1 w-fit font-medium`}>
                        {getStatusIcon(value)}
                        {value || '-'}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'created_at' as keyof ClientContract,
            header: 'Created At',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : '-'}
                </span>
            )
        }
    ];

    const actions: Action<ClientContract>[] = [
        {
            label: 'View Details',
            onClick: (contract) => {
                router.push(`/client-contracts/${contract.id}`);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit',
            onClick: (contract) => {
                router.push(`/client-contracts/${contract.id}/edit`);
            },
            icon: <Edit className="h-4 w-4" />,
            variant: 'default' as const
        },
        {
            label: 'Delete',
            onClick: (contract) => {
                setSelectedContract(contract);
                setIsDeleteDialogOpen(true);
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            setPage(1);
            await dispatch(fetchContracts({
                page: 1,
                limit,
                search: search || undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                client_id: clientFilter !== 'All' ? clientFilter : undefined,
            }));
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
            const res = await axios.get('/client-contracts/fetch', {
                params: {
                    page: 1,
                    limit: 10000,
                    search: search || undefined,
                    status: statusFilter !== 'All' ? statusFilter : undefined,
                    client_id: clientFilter !== 'All' ? clientFilter : undefined,
                }
            });

            const items = res?.data?.data?.contracts?.items || res?.data?.body?.contracts?.items || contracts;

            const headers = ['Contract No', 'Title', 'Client Name', 'Client No', 'Contract Date', 'Start Date', 'End Date', 'Contract Value', 'Currency', 'Guarantee %', 'Retention %', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = items.map((c: ClientContract) => {
                const escapeCsv = (val: any) => {
                    if (val === null || val === undefined) return '';
                    const str = String(val);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };
                return [
                    escapeCsv(c.contract_no),
                    escapeCsv(c.title),
                    escapeCsv(c.client_name || c.client?.name),
                    escapeCsv(c.client_no || c.client?.client_no),
                    escapeCsv(c.contract_date),
                    escapeCsv(c.start_date),
                    escapeCsv(c.end_date),
                    escapeCsv(c.contract_value),
                    escapeCsv(c.currency),
                    escapeCsv(c.guarantee_percent),
                    escapeCsv(c.retention_percent),
                    escapeCsv(c.status),
                    escapeCsv(c.created_at)
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `client_contracts_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedContract) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteContract(selectedContract.id));
            toast.success('Contract deleted successfully');
            setIsDeleteDialogOpen(false);
            setSelectedContract(null);
            await dispatch(fetchContracts({ page, limit, search: search || undefined, status: statusFilter !== 'All' ? statusFilter : undefined, client_id: clientFilter !== 'All' ? clientFilter : undefined }));
        } catch (error: any) {
            toast.error(error || 'Failed to delete contract');
        } finally {
            setIsDeleting(false);
        }
    };

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (statusFilter !== 'All') arr.push(`Status: ${statusFilter}`);
        if (clientFilter !== 'All') {
            const client = clients.find(c => c.id === clientFilter);
            arr.push(`Client: ${client?.name || clientFilter}`);
        }
        return arr;
    }, [search, statusFilter, clientFilter, clients]);

    const uniqueStatuses = useMemo(() => {
        const statusSet = new Set<string>();
        contracts.forEach(c => {
            if (c.status) statusSet.add(c.status);
        });
        return Array.from(statusSet).sort();
    }, [contracts]);

    // Calculate stats
    const totalContracts = totalItems;
    const activeContracts = useMemo(() => {
        return contracts.filter(c => {
            const s = c.status?.toLowerCase() || '';
            return s.includes('نشط') || s.includes('active');
        }).length;
    }, [contracts]);

    const expiredContracts = useMemo(() => {
        return contracts.filter(c => {
            const s = c.status?.toLowerCase() || '';
            return s.includes('منتهي') || s.includes('expired') || s.includes('ended');
        }).length;
    }, [contracts]);

    const cancelledContracts = useMemo(() => {
        return contracts.filter(c => {
            const s = c.status?.toLowerCase() || '';
            return s.includes('ملغي') || s.includes('cancelled') || s.includes('canceled');
        }).length;
    }, [contracts]);


    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Client Contracts</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Manage and track client contracts</p>
                </div>
                <Button
                    onClick={() => router.push('/client-contracts/create')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Contract
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Contracts"
                    description="All contract records"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalContracts,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Active Contracts"
                    description="Currently active contracts"
                    variant="default"
                    size="sm"
                    stats={{
                        total: activeContracts,
                        badge: 'Active',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Expired Contracts"
                    description="Expired contracts"
                    variant="default"
                    size="sm"
                    stats={{
                        total: expiredContracts,
                        badge: 'Expired',
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Cancelled Contracts"
                    description="Cancelled contracts"
                    variant="default"
                    size="sm"
                    stats={{
                        total: cancelledContracts,
                        badge: 'Cancelled',
                        badgeColor: 'error'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by contract number, title..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'status',
                        label: 'Status',
                        value: statusFilter,
                        options: [
                            { key: 'all', label: 'All Statuses', value: 'All' },
                            ...uniqueStatuses.map(s => ({
                                key: s,
                                label: s,
                                value: s
                            }))
                        ],
                        onValueChange: (value) => {
                            setStatusFilter(value);
                            setPage(1);
                        }
                    },
                    {
                        key: 'client',
                        label: 'Client',
                        value: clientFilter,
                        options: [
                            { key: 'all', label: 'All Clients', value: 'All' },
                            ...clients.map(c => ({
                                key: c.id,
                                label: `${c.name} (${c.client_no})`,
                                value: c.id
                            }))
                        ],
                        onValueChange: (value) => {
                            setClientFilter(value);
                            setPage(1);
                        }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setStatusFilter('All');
                    setClientFilter('All');
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

            {/* Contracts Table */}
            <EnhancedCard
                title="Contracts List"
                description={`${totalItems} contracts found`}
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
                    data={contracts}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: totalPages,
                        pageSize: limit,
                        totalItems: totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No contracts found matching your search criteria"
                />
            </EnhancedCard>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contract</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contract? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedContract && (
                        <div className="py-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Contract No:</strong> {selectedContract.contract_no}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <strong>Title:</strong> {selectedContract.title}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

