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
    const [status, setStatus] = useState<'All' | 'Active' | 'Inactive' | 'Complete' | 'Stopped' | 'Onhold'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [projectIsDownload, setProjectIsDownload] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {   
        dispatch(fetchProjects({ page, limit, search, type, status }));
    }, [dispatch, page, limit, search, type, status]);

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
            await dispatch(fetchProjects({ page, limit, search, type, status }));
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
                    status: status !== 'All' ? status : undefined,
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
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>,
            sortable: true,
            width: '80px'
        },
        {
            key: 'project_code' as keyof Project,
            header: 'Project Code',
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'number' as keyof Project,
            header: 'Number',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true
        },
        {
            key: 'name' as keyof Project,
            header: 'Project Name',
            render: (value: any) => (
                <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'client_name' as keyof Project,
            header: 'Client',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof Project,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Inactive': 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    'Complete': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    'Stopped': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                    'Onhold': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
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
                <span className="text-slate-600 dark:text-slate-400">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'created_at' as keyof Project,
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value}</span>
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
                    },
                    {
                        key: 'status',
                        label: 'Project Status',
                        value: status,
                        options: [
                            { key: 'All', label: 'All Statuses', value: 'All' },
                            { key: 'Active', label: 'Active', value: 'Active' },
                            { key: 'Inactive', label: 'Inactive', value: 'Inactive' },
                            { key: 'Complete', label: 'Complete', value: 'Complete' },
                            { key: 'Stopped', label: 'Stopped', value: 'Stopped' },
                            { key: 'Onhold', label: 'Onhold', value: 'Onhold' }
                        ],
                        onValueChange: (value) => {
                            setStatus(value as typeof status);
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
                        <Select
                            value={limit.toString()}
                            onValueChange={(value) => {
                                setLimit(parseInt(value, 10));
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