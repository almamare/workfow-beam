'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';

import {
    fetchContractors,
    selectContractors, 
    selectLoading,
    selectTotalItems,
    selectTotalPages,
    selectError, 
} from '@/stores/slices/contractors';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen, Eye, Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import type { Contractor } from '@/stores/types/contractors';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function ContractorsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const contractors = useSelector(selectContractors);
    const loading = useSelector(selectLoading);
    const total = useSelector(selectTotalItems);
    const pages = useSelector(selectTotalPages);
    const error = useSelector(selectError);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebounced] = useState(search);
    const [status, setStatus] = useState<'All' | 'Active' | 'Inactive' | 'Close'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // delete-dialog state
    const [open, setOpen] = useState(false);
    const [selectedId, setSelId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    /* ---------- Effects ---------- */
    // Toast backend errors
    useEffect(() => { if (error) toast.error(error); }, [error]);

    // debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // avoid duplicate fetch in StrictMode
    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch, status });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchContractors({ page, limit, search: debouncedSearch, status }));
    }, [dispatch, page, limit, debouncedSearch, status]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchContractors({ page, limit, search: debouncedSearch, status }));
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
            const { data } = await axios.get('/contractors/fetch', {
                params: {
                    search: debouncedSearch,
                    status: status !== 'All' ? status : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['ID', 'Contractor Number', 'Company Name', 'Phone', 'Email', 'Province', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const csvRows = data.body?.contractors?.items?.map((contractor: Contractor) => {
                return [
                    contractor.number || '',
                    contractor.number || '',
                    `"${(contractor.name || '').replace(/"/g, '""')}"`,
                    contractor.phone || '',
                    contractor.email || '',
                    contractor.province || '',
                    contractor.status || '',
                    contractor.created_at || ''
                ].join(',');
            }) || [];

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `contractors_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            
            toast.success('Contractors exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export contractors');
        } finally {
            setIsExporting(false);
        }
    };

    const columns: Column<Contractor>[] = [
        { 
            key: 'number' as keyof Contractor, 
            header: 'Contractor #', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '100px'
        },
        { 
            key: 'name' as keyof Contractor, 
            header: 'Company Name', 
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>,
            sortable: true 
        },
        { 
            key: 'phone' as keyof Contractor, 
            header: 'Phone', 
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true 
        },
        { 
            key: 'email' as keyof Contractor, 
            header: 'Email', 
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true 
        },
        { 
            key: 'province' as keyof Contractor, 
            header: 'Province', 
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value}
                </Badge>
            ),
            sortable: true 
        },
        {
            key: 'status' as keyof Contractor,
            header: 'Status',
            render: (value: string) => {
                const statusColors = {
                    'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Inactive': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                    'Close': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                };
                
                return (
                    <Badge 
                        variant="outline" 
                        className={`${statusColors[value as keyof typeof statusColors] || statusColors.Close} font-medium`}
                    >
                        {value}
                    </Badge>
                );
            },
            sortable: true,
        },
        { 
            key: 'created_at' as keyof Contractor, 
            header: 'Created', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{value}</span>,
            sortable: true 
        }
    ];

    /* ---------- Handlers ---------- */
    const handleDelete = useCallback(
        async (id: string) => {
            if (!id) return;
            try {
                setDeleting(true);
                await axios.delete(`/contractors/delete/${id}`);
                toast.success('Contractor deleted successfully');
                dispatch(fetchContractors({ page, limit, search: debouncedSearch, status }));
            } catch {
                toast.error('Failed to delete contractor');
            } finally {
                setDeleting(false);
                setOpen(false);
                setSelId(null);
            }
        },
        [dispatch, page, limit, debouncedSearch, status]
    );

    const actions: Action<Contractor>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row: Contractor) => router.push(`/contractors/details?id=${row.id}`),
            variant: 'info' as const
        },
        {
            label: 'Edit Contractor',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (row: Contractor) => router.push(`/contractors/update?id=${row.id}`),
            variant: 'warning' as const
        },
        {
            label: 'Delete Contractor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row: Contractor) => {
                setSelId(row.id);
                setOpen(true);
            },
            variant: 'destructive' as const
        },
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (status !== 'All') activeFilters.push(`Status: ${status}`);

    // Generate dynamic no data message based on active filters
    const getNoDataMessage = () => {
        // Check if we have filters active
        const hasFilters = status !== 'All' || search;
        
        if (hasFilters && contractors.length === 0 && !loading) {
            if (status !== 'All' && search) {
                return `No contractors found with status "${status}" and search "${search}". Try selecting different filters or clear them to see all contractors.`;
            }
            if (status !== 'All') {
                return `No contractors found with status "${status}". Try selecting a different status or clear filters to see all contractors.`;
            }
            if (search) {
                return `No contractors found matching search "${search}". Try using a different search term or clear filters.`;
            }
        }
        
        if (!hasFilters && contractors.length === 0 && !loading) {
            return "No contractors found in the system. Create your first contractor to get started.";
        }
        
        return "No contractors found matching your search criteria";
    };

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Contractors</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage contractor relationships and track project assignments
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/contractors/create')}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Contractor
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <EnhancedCard
                        title="Total Contractors"
                        description="All contractors in the system"
                        variant="default"
                        size="sm"
                        stats={{
                            total: total,
                            badge: 'Total',
                            badgeColor: 'default'
                        }}
                    >
                        <></>
                    </EnhancedCard>
                    <EnhancedCard
                        title="Active Contractors"
                        description="Currently active contractors"
                        variant="default"
                        size="sm"
                        stats={{
                            total: contractors.filter(c => c.status === 'Active').length,
                            badge: 'Active',
                            badgeColor: 'success'
                        }}
                    >
                        <></>
                    </EnhancedCard>
                    <EnhancedCard
                        title="Close Contractors"
                        description="Currently close"
                        variant="default"
                        size="sm"
                        stats={{
                            total: contractors.filter(c => c.status === 'Close').length,
                            badge: 'Close',
                            badgeColor: 'error'
                        }}
                    >
                        <></>
                    </EnhancedCard>
                    <EnhancedCard
                        title="Inactive Contractors"
                        description="Currently inactive"
                        variant="default"
                        size="sm"
                        stats={{
                            total: contractors.filter(c => c.status === 'Inactive').length,
                            badge: 'Inactive',
                            badgeColor: 'error'
                        }}
                    >
                        <></>
                    </EnhancedCard>
                </div>

                {/* Filter Bar */}
                <FilterBar
                    searchPlaceholder="Search by contractor number..."
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
                                { key: 'all', label: 'All Statuses', value: 'All' },
                                { key: 'active', label: 'Active', value: 'Active' },
                                { key: 'inactive', label: 'Inactive', value: 'Inactive' },
                                { key: 'close', label: 'Close', value: 'Close' }
                            ],
                            onValueChange: (value: string) => {
                                setStatus(value as 'All' | 'Active' | 'Inactive' | 'Close');
                                setPage(1);
                            }
                        }
                    ]}
                    activeFilters={activeFilters}
                    onClearFilters={() => {
                        setSearch('');
                        setStatus('All');
                        setPage(1);
                    }}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToExcel}
                                disabled={isExporting || loading}
                                className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                <FileSpreadsheet className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshTable}
                                disabled={isRefreshing}
                                className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    }
                />

                {/* Contractors Table */}
                <EnhancedCard
                    title="Contractors Directory"
                    description={`${total} contractor${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: total,
                        badge: 'Active Contractors',
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
                        data={contractors}
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
                        noDataMessage="No contractors found matching your search criteria"
                        searchPlaceholder="Search contractors..."
                    />
                </EnhancedCard>
            </div>

            {/* Delete Dialog */}
            <DeleteDialog
                open={open}
                onClose={() => {
                    if (!deleting) {
                        setOpen(false);
                        setSelId(null);
                    }
                }}
                onConfirm={() => selectedId && handleDelete(selectedId)}
            />
        </>
    );
}