/* =========================================================
   src/app/contractors/page.tsx
   القائمة الرئيسية للمقاولين (مع عرض، تعديل، حذف)
========================================================= */

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

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DeleteDialog } from '@/components/delete-dialog';
import { Trash2, SquarePen, Eye } from 'lucide-react';
import type { Contractor } from '@/stores/types/contractors';
import { toast } from 'sonner';
import axios from '@/utils/axios';

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

    /* ---------- Table columns ---------- */
    const columns: Column<Contractor>[] = [
        { key: 'number', header: 'No.', sortable: true },
        { key: 'name', header: 'Name', sortable: true },
        { key: 'phone', header: 'Phone', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'province', header: 'Province', sortable: true },
        {
            key: 'status',
            header: 'Status',
            render: (value: string) => (
                <Badge
                    variant={
                        value === 'Active'
                            ? 'completed'
                            : value === 'Inactive'
                                ? 'rejected'
                                : 'outline'
                    }
                >
                    {value}
                </Badge>
            ),
            sortable: true,
        },
        { key: 'created_at', header: 'Created', sortable: true },
        { key: 'updated_at', header: 'Updated', sortable: true },
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

    const actions: Action<Contractor>[] = [
        {
            label: 'Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (row) => router.push(`/contractors/details?id=${row.id}`),
        },
        {
            label: 'Edit',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (row) => router.push(`/contractors/update?id=${row.id}`),
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (row) => {
                setSelId(row.id);
                setOpen(true);
            },
        },
    ];

    /* =========================================================
       Render
    ========================================================= */
    return (
        <>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold">Contractors</h1>
                        <p className="text-muted-foreground mt-1">
                            Browse and manage all contractors
                        </p>
                    </div>
                    <Button onClick={() => router.push('/contractors/create')}>
                        + Create Contractor
                    </Button>
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
                                <CardTitle>Contractor List</CardTitle>
                                <CardDescription>
                                    {total} contractor{total !== 1 && 's'} found
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <DataTable
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
                            noDataMessage="No contractors found"
                        />
                    </CardContent>
                </Card>
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
