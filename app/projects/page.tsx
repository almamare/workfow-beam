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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { Project } from '@/stores/types/projects';
import { Edit, HardDriveDownload, Eye, Plus, Filter, Download } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import { toast } from "sonner";
import axios from "@/utils/axios";
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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
            toast.error('Failed to download project');
        } finally {
            setProjectIsDownload(false);
        }
    }

    const columns = [
        {
            key: 'sequence' as keyof Project,
            header: 'ID',
            render: (value: any) => <span className="text-slate-500 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '80px'
        },
        {
            key: 'project_code' as keyof Project,
            header: 'Project Code',
            render: (value: any) => (
                <span className="font-semibold text-slate-800">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'number' as keyof Project,
            header: 'Number',
            render: (value: any) => <span className="text-slate-600">{value}</span>,
            sortable: true
        },
        {
            key: 'name' as keyof Project,
            header: 'Project Name',
            render: (value: any) => (
                <span className="font-medium text-slate-800">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'client_name' as keyof Project,
            header: 'Client',
            render: (value: any) => (
                <span className="text-slate-700">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof Project,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'Active': 'bg-green-100 text-green-700 border-green-200',
                    'Inactive': 'bg-slate-100 text-slate-700 border-slate-200',
                    'Complete': 'bg-blue-100 text-blue-700 border-blue-200',
                    'Stopped': 'bg-red-100 text-red-700 border-red-200',
                    'Onhold': 'bg-yellow-100 text-yellow-700 border-yellow-200'
                };
                
                return (
                    <Badge 
                        variant="outline" 
                        className={`${statusColors[value as keyof typeof statusColors] || statusColors.Inactive} font-medium`}
                    >
                        {value}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'start_date' as keyof Project,
            header: 'Start Date',
            render: (value: any) => (
                <span className="text-slate-600">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'end_date' as keyof Project,
            header: 'End Date',
            render: (value: any) => (
                <span className="text-slate-600">{value}</span>
            ),
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'View Details',
            onClick: (project: Project) => {
                router.push(`/projects/details?id=${project.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Project',
            onClick: (project: Project) => {
                router.push(`/projects/update?id=${project.id}`);
            },
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Download PDF',
            onClick: (project: Project) => {
                downloadProject(project.id);
            },
            icon: <HardDriveDownload className="h-4 w-4" />,
            variant: 'outline' as const
        }
    ];

    const stats = [
        {
            label: 'Total Projects',
            value: totalItems,
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Active Projects',
            value: projects.filter(p => p.status === 'Active').length,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Completed',
            value: projects.filter(p => p.status === 'Complete').length,
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'On Hold',
            value: projects.filter(p => p.status === 'Onhold').length,
            change: '-3%',
            trend: 'down' as const
        }
    ];

    const projectTypeOptions = [
        { key: 'Public', label: 'Public Projects', value: 'Public' },
        { key: 'Communications', label: 'Communications', value: 'Communications' },
        { key: 'Restoration', label: 'Restoration', value: 'Restoration' },
        { key: 'Referral', label: 'Referral', value: 'Referral' }
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (type !== 'Public') activeFilters.push(`Type: ${type}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Projects"
                description="Browse and manage all system projects with comprehensive filtering and management tools"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Create Project',
                        onClick: () => router.push('/projects/create'),
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
                searchPlaceholder="Search by project name, code, or client..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'type',
                        label: 'Project Type',
                        value: type,
                        options: projectTypeOptions,
                        onValueChange: (value) => {
                            setType(value as typeof type);
                            setPage(1);
                        }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setType('Public');
                    setPage(1);
                }}
            />

            {/* Projects Table */}
            <EnhancedCard
                title="Projects List"
                description={`${type} projects - ${totalItems} total projects found`}
                variant="gradient"
                size="lg"
                stats={{
                    total: totalItems,
                    badge: `${type} Projects`,
                    badgeColor: type === 'Public' ? 'success' : 'default'
                }}
                headerActions={
                    <Select
                        value={limit.toString()}
                        onValueChange={(value) => {
                            setLimit(parseInt(value, 10));
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-36 bg-white border-slate-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
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
                    noDataMessage="No projects found matching your criteria"
                    searchPlaceholder="Search projects..."
                />
            </EnhancedCard>
        </div>
    );
}