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
import { Trash2, SquarePen, Plus, Download, Filter } from 'lucide-react';
import type { Client } from '@/stores/types/clients';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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

    const columns = [
        { 
            key: 'sequence' as keyof Client, 
            header: 'ID', 
            render: (value: any) => <span className="text-slate-500 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '80px'
        },
        { 
            key: 'name' as keyof Client, 
            header: 'Client Name', 
            render: (value: any) => <span className="font-semibold text-slate-800">{value}</span>,
            sortable: true 
        },
        { 
            key: 'client_no' as keyof Client, 
            header: 'Client Number', 
            render: (value: any) => <span className="text-slate-600 font-mono">{value}</span>,
            sortable: true 
        },
        { 
            key: 'state' as keyof Client, 
            header: 'State', 
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            ),
            sortable: true 
        },
        { 
            key: 'city' as keyof Client, 
            header: 'City', 
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true 
        },
        { 
            key: 'budget' as keyof Client, 
            header: 'Budget', 
            render: (value: any) => (
                <span className="font-semibold text-green-600">
                    {value ? `$${Number(value).toLocaleString()}` : 'N/A'}
                </span>
            ),
            sortable: true 
        },
        { 
            key: 'created_at' as keyof Client, 
            header: 'Created', 
            render: (value: any) => <span className="text-slate-500 text-sm">{new Date(value).toLocaleDateString()}</span>,
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

    const actions = [
        {
            label: 'Edit Client',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (client: Client) => router.push(`/clients/update?id=${client.id}`),
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

    const stats = [
        {
            label: 'Total Clients',
            value: total,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Active Projects',
            value: Math.floor(total * 0.7),
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Total Budget',
            value: `$${(total * 150000).toLocaleString()}`,
            change: '+5%',
            trend: 'up' as const
        },
        {
            label: 'Avg. Project Value',
            value: '$150K',
            change: '+3%',
            trend: 'up' as const
        }
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);

    return (
        <>
            <div className="space-y-6">
                {/* Page Header */}
                <PageHeader
                    title="Clients"
                    description="Manage your client relationships and track project assignments with comprehensive client management tools"
                    stats={stats}
                    actions={{
                        primary: {
                            label: 'Add Client',
                            onClick: () => router.push('/clients/create'),
                            icon: <Plus className="h-4 w-4" />
                        },
                        secondary: [
                            {
                                label: 'Export Data',
                                onClick: () => toast.info('Export feature coming soon'),
                                icon: <Download className="h-4 w-4" />
                            },
                            {
                                label: 'Advanced Filters',
                                onClick: () => toast.info('Advanced filters coming soon'),
                                icon: <Filter className="h-4 w-4" />
                            }
                        ]
                    }}
                />

                {/* Filter Bar */}
                <FilterBar
                    searchPlaceholder="Search by client name, number, or location..."
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
                />

                {/* Clients Table */}
                <EnhancedCard
                    title="Clients List"
                    description={`${total} client${total !== 1 ? 's' : ''} found`}
                    variant="gradient"
                    size="lg"
                    stats={{
                        total: total,
                        badge: 'Active Clients',
                        badgeColor: 'success'
                    }}
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