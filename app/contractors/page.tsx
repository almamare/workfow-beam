'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';

import {
    fetchContractors,
    selectContractors, 
    selectContractorsLoading,
    selectContractorsTotal,
    selectContractorsPages,
    selectContractorsError, 
} from '@/stores/slices/contractors';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen, Eye, Plus, Download, Filter, Building2 } from 'lucide-react';
import type { Contractor } from '@/stores/types/contractors';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

export default function ContractorsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const contractors = useSelector(selectContractors);
    const loading = useSelector(selectContractorsLoading);
    const total = useSelector(selectContractorsTotal);
    const pages = useSelector(selectContractorsPages);
    const error = useSelector(selectContractorsError);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebounced] = useState(search);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

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
        const key = JSON.stringify({ page, limit, search: debouncedSearch });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchContractors({ page, limit, search: debouncedSearch }));
    }, [dispatch, page, limit, debouncedSearch]);

    const columns = [
        { 
            key: 'number' as keyof Contractor, 
            header: 'Contractor #', 
            render: (value: any) => <span className="text-slate-500 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '100px'
        },
        { 
            key: 'name' as keyof Contractor, 
            header: 'Company Name', 
            render: (value: any) => <span className="font-semibold text-slate-800">{value}</span>,
            sortable: true 
        },
        { 
            key: 'phone' as keyof Contractor, 
            header: 'Phone', 
            render: (value: any) => <span className="text-slate-600">{value}</span>,
            sortable: true 
        },
        { 
            key: 'email' as keyof Contractor, 
            header: 'Email', 
            render: (value: any) => <span className="text-slate-600">{value}</span>,
            sortable: true 
        },
        { 
            key: 'province' as keyof Contractor, 
            header: 'Province', 
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
                    'Active': 'bg-green-100 text-green-700 border-green-200',
                    'Inactive': 'bg-red-100 text-red-700 border-red-200',
                    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200'
                };
                
                return (
                    <Badge 
                        variant="outline" 
                        className={`${statusColors[value as keyof typeof statusColors] || statusColors.Pending} font-medium`}
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
            render: (value: any) => <span className="text-slate-500 text-sm">{new Date(value).toLocaleDateString()}</span>,
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
                dispatch(fetchContractors({ page, limit, search: debouncedSearch }));
            } catch {
                toast.error('Failed to delete contractor');
            } finally {
                setDeleting(false);
                setOpen(false);
                setSelId(null);
            }
        },
        [dispatch, page, limit, debouncedSearch]
    );

    const actions = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row: Contractor) => router.push(`/contractors/details?id=${row.id}`),
        },
        {
            label: 'Edit Contractor',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (row: Contractor) => router.push(`/contractors/update?id=${row.id}`),
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

    const stats = [
        {
            label: 'Total Contractors',
            value: total,
            change: '+6%',
            trend: 'up' as const
        },
        {
            label: 'Active Contractors',
            value: contractors.filter(c => c.status === 'Active').length,
            change: '+4%',
            trend: 'up' as const
        },
        {
            label: 'Pending Approval',
            value: contractors.filter(c => c.status === 'Pending').length,
            change: '-2%',
            trend: 'down' as const
        },
        {
            label: 'Avg. Projects',
            value: '3.2',
            change: '+0.5',
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
                    title="Contractors"
                    description="Manage contractor relationships and track project assignments with comprehensive contractor management tools"
                    stats={stats}
                    actions={{
                        primary: {
                            label: 'Add Contractor',
                            onClick: () => router.push('/contractors/create'),
                            icon: <Plus className="h-4 w-4" />
                        },
                        secondary: [
                            {
                                label: 'Export Data',
                                onClick: () => toast.info('Export feature coming soon'),
                                icon: <Download className="h-4 w-4" />
                            },
                            {
                                label: 'Company Directory',
                                onClick: () => toast.info('Company directory coming soon'),
                                icon: <Building2 className="h-4 w-4" />
                            }
                        ]
                    }}
                />

                {/* Filter Bar */}
                <FilterBar
                    searchPlaceholder="Search by company name, contact person, or number..."
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

                {/* Contractors Table */}
                <EnhancedCard
                    title="Contractors Directory"
                    description={`${total} contractor${total !== 1 ? 's' : ''} in the system`}
                    variant="gradient"
                    size="lg"
                    stats={{
                        total: total,
                        badge: 'Active Contractors',
                        badgeColor: 'success'
                    }}
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