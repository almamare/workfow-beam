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
import { useRouter } from 'next/navigation';
import type { Project } from '@/stores/types/projects';
import { Edit, HardDriveDownload, Eye, RefreshCw, FileSpreadsheet } from 'lucide-react';
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
import { EnhancedDataTable, Action } from '@/components/ui/enhanced-data-table';
import { Button } from '@/components/ui/button';

export default function ProjectsPage() {
    const projects = useSelector(selectProjects);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [type, setType] = useState<'All' | 'Public' | 'Communications' | 'Restoration' | 'Referral'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [projectIsDownload, setProjectIsDownload] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

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

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchProjects({ page, limit, search, type }));
            toast.success('Table refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    }

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            // Fetch all projects without pagination for export
            const { data } = await axios.get('/projects/fetch', {
                params: {
                    search,
                    type: type !== 'All' ? type : undefined,
                    limit: limit,
                    page: 1
                }
            });

            // Convert data to CSV format
            const headers = ['ID', 'Project Code', 'Number', 'Project Name', 'Client', 'Status', 'Type', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const csvRows = data.body.projects.items.map((project: Project) => {
                return [
                    project.sequence || '',
                    project.project_code || '',
                    project.number || '',
                    `"${(project.name || '').replace(/"/g, '""')}"`, // Escape quotes in names
                    `"${(project.client_name || '').replace(/"/g, '""')}"`,
                    project.status || '',
                    project.type || '',
                    project.created_at || ''
                ].join(',');
            });

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
            // Add BOM for Excel UTF-8 support
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `projects_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            
            toast.success('Projects exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export projects');
        } finally {
            setIsExporting(false);
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
            key: 'type' as keyof Project,
            header: 'Type',
            render: (value: any) => (
                <span className="text-slate-600">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'created_at' as keyof Project,
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600">{value}</span>
            ),
            sortable: true
        }
    ];

    const actions: Action<Project>[] = [
        {
            label: 'View Details',
            variant: 'info' as const,
            onClick: (project: Project) => {
                router.push(`/projects/details?id=${project.id}`);
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Project',
            variant: 'warning' as const,
            onClick: (project: Project) => {
                router.push(`/projects/update?id=${project.id}`);
            },
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Download PDF',
            variant: 'success' as const,
            onClick: (project: Project) => {
                downloadProject(project.id);
            },
            icon: <HardDriveDownload className="h-4 w-4" />
        }
    ];


    const projectTypeOptions = [
        { key: 'All', label: 'All Projects', value: 'All' },
        { key: 'Public', label: 'Public Projects', value: 'Public' },
        { key: 'Communications', label: 'Communications', value: 'Communications' },
        { key: 'Restoration', label: 'Restoration', value: 'Restoration' },
        { key: 'Referral', label: 'Referral', value: 'Referral' }
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (type !== 'All') activeFilters.push(`Type: ${type}`);

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <PageHeader
                title="Projects"
                breadcrumb={true}
                description="Manage all projects with comprehensive filtering and management tools"
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by project Number..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'type',
                        label: 'Project Status',
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
                    setType('All');
                    setPage(1);
                }}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshTable}
                        disabled={isRefreshing}
                        className="gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                }
            />

            {/* Projects Table */}
            <EnhancedCard
                title="Projects List"
                description={`${type === 'All' ? 'All' : type} projects - ${totalItems} total projects found`}
                variant="default"
                size="sm"
                stats={{
                    total: totalItems,
                    badge: `${type === 'All' ? 'All' : type} Projects`,
                    badgeColor: type === 'All'
                        ? 'default'
                        : type === 'Public'
                        ? 'success'
                        : type === 'Communications'
                        ? 'info'
                        : type === 'Restoration'
                        ? 'warning'
                        : type === 'Referral'
                        ? 'success'
                        : 'default'
                }}
                headerActions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToExcel}
                            disabled={isExporting || loading}
                            className="gap-2"
                        >
                            <FileSpreadsheet className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
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
                                <SelectItem value="5">5 per page</SelectItem>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="20">20 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">100 per page</SelectItem>
                                <SelectItem value="200">200 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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