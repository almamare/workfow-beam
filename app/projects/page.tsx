'use client';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchProjects,
    selectProjects,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/projects';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge'; 
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Project } from '@/stores/types/projects';

export default function ProjectsPage() {
    const projects = useSelector(selectProjects);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [type, setType] = useState<'Public' | 'Communications' | 'Restoration' | 'Referral'>('Public');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    useEffect(() => {
        dispatch(fetchProjects({ page, limit, search, type }));
    }, [dispatch, page, limit, search, type]);

    const columns: Column<Project>[] = [
        {
            key: 'sequence',
            header: 'ID',
            render: (value) => <span className="text-muted-foreground">{value}</span>,
            sortable: true
        },
        {
            key: 'project_code',
            header: 'Project Code',
            sortable: true
        },
        {
            key: 'number',
            header: 'Number',
            render: (value) => <span className="text-muted-foreground">{value}</span>,
            sortable: true
        },
        {
            key: 'name',
            header: 'Name',
            sortable: true
        },
        {
            key: 'client_name',
            header: 'Client Name',
            sortable: true
        },
        {
            key: 'type',
            header: 'Type',
            render: (value) => (
                <Badge variant={value === 'Public' ? 'secondary' : 'destructive'}>
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'start_date',
            header: 'Start Date',
            sortable: true
        },
        {
            key: 'end_date',
            header: 'End Date',
            sortable: true
        },
        {
            key: 'created_at',
            header: 'Created At',
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all system projects
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/projects/create')}
                    className="bg-primary text-white"
                >
                    + Create Project
                </Button>
            </div>

            <div className="flex gap-4 items-center flex-wrap">
                <div className="w-full md:max-w-sm">
                    <Input
                        placeholder="Search by number..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {/* Dropdown for type filter */}
                <div>
                    <select
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value as 'Public' | 'Communications' | 'Restoration' | 'Referral');
                            setPage(1);
                        }}
                        className="border rounded px-3 py-2"
                    >
                        <option value="Public">Public</option>
                        <option value="Communications">Communications</option>
                        <option value="Restoration">Restoration</option>
                        <option value="Referral">Referral</option>
                    </select>
                </div>

                {/* Limit dropdown */}
                <div className="ml-auto">
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="border rounded px-3 py-2"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Project List</CardTitle>
                    <CardDescription>
                        Showing {Math.min((page - 1) * limit + 1, totalItems)} to{' '}
                        {Math.min(page * limit, totalItems)} of {totalItems} projects
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={projects}
                        columns={columns}
                        loading={loading}
                        pagination={{
                            currentPage: page,
                            totalPages,
                            pageSize: limit,
                            totalItems,
                            onPageChange: setPage
                        }}
                        noDataMessage="No projects found"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
