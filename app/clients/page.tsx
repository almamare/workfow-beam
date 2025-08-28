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
import { Breadcrumb } from '@/components/layout/breadcrumb';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen } from 'lucide-react';
import type { Client } from '@/stores/types/clients';
import { toast } from 'sonner';
import axios from '@/utils/axios';

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

    const columns: Column<Client>[] = [
        { key: 'sequence', header: 'ID', sortable: true },
        { key: 'name', header: 'Name', sortable: true },
        { key: 'client_no', header: 'Client No', sortable: true },
        { key: 'state', header: 'State', sortable: true },
        { key: 'city', header: 'City', sortable: true },
        { key: 'budget', header: 'Budget', sortable: true },
        { key: 'created_at', header: 'Created At', sortable: true },
        { key: 'updated_at', header: 'Updated At', sortable: true },
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
            label: 'Edit',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (client) => router.push(`/clients/update?id=${client.id}`),
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (client) => {
                setSelectedId(client.id);
                setOpen(true);
            },
        },
    ];

    return (
        <>
            <div className="space-y-4">
                {/* Header */}
                <Breadcrumb />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold">Clients</h1>
                        <p className="text-muted-foreground mt-1">Browse and manage all clients</p>
                    </div>
                    <Button onClick={() => router.push('/clients/create')}>+ Create Client</Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                    <Input
                        placeholder="Search by name or number..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full sm:max-w-sm"
                    />

                    <Select
                        value={String(limit)}
                        onValueChange={(v) => {
                            setLimit(Number(v));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Client List</CardTitle>
                                <CardDescription>
                                    {total} client{total !== 1 && 's'} found
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <DataTable
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
                            noDataMessage="No clients found"
                        />
                    </CardContent>
                </Card>
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
