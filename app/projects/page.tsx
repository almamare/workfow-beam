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
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Project } from '@/stores/types/projects';
import { Edit, HardDriveDownload, Eye } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import { toast } from "sonner";
import axios from "@/utils/axios";

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
    const [projectIsDownload, setProjectIsDownload] = useState(false);

    useEffect(() => {
        dispatch(fetchProjects({ page, limit, search, type }));
    }, [dispatch, page, limit, search, type]);

    const downloadProject = async (projectId: string, fileName = 'Project_merged') => {
        setProjectIsDownload(true);
        try {
            const { data } = await axios.get(`/projects/download/merged/${projectId}`, { responseType: 'blob' },);

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a'); 
            link.href = url;
            link.download = `${fileName}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
        } catch (err) {
            toast.error('تعذّر تحميل المشروع');
        } finally {
            setProjectIsDownload(false);
        }
    }

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
            key: 'status',
            header: 'Status',
            render: (value) => (
                <Badge
                    variant={
                        value === 'Active'
                            ? 'approved'
                            : value === 'Inactive'
                                ? 'outline'
                                : value === 'Complete'
                                    ? 'completed'
                                    : value === 'Stopped'
                                        ? 'rejected'
                                        : value === 'Onhold'
                                            ? 'onhold'
                                            : 'default'
                    }
                >
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
            header: 'Created At'
        }
    ];

    const actions: Action<Project>[] = [
        {
            label: 'Details',
            onClick: (project) => {
                router.push(`/projects/details?id=${project.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit',
            onClick: (project) => {
                router.push(`/projects/update?id=${project.id}`);
            },
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Download',
            onClick: (project) => {
                downloadProject(project.id);
            },
            icon: <HardDriveDownload className="h-4 w-4" />
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all system projects
                    </p>
                </div>
                <Button onClick={() => router.push('/projects/create')} className="bg-primary text-white">
                    + Create Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Input
                    placeholder="Search by number..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full sm:max-w-sm"
                />

                <Select
                    value={type}
                    onValueChange={(value) => {
                        setType(value as typeof type);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Project Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Communications">Communications</SelectItem>
                        <SelectItem value="Restoration">Restoration</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                </Select>

            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Left: Title + Description */}
                        <div>
                            <CardTitle>Project List ({type})</CardTitle>
                            <CardDescription>Total {totalItems} projects found</CardDescription>
                        </div>

                        {/* Right: Select limit */}
                        <Select
                            value={limit.toString()}
                            onValueChange={(value) => {
                                setLimit(parseInt(value, 10));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <DataTable
                        data={projects}
                        columns={columns}
                        actions={actions}
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
