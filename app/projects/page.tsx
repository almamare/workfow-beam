'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';

import {
    fetchProjects,
    selectProjects,
    selectLoading,
    selectTotalPages,
    selectTotalItems,
} from '@/stores/slices/projects';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SquarePen, RefreshCw, FileSpreadsheet, Eye, X, Search, HardDriveDownload } from 'lucide-react';
import type { Project } from '@/stores/types/projects';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { Label } from '@/components/ui/label';

export default function ProjectsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const projects = useSelector(selectProjects);
    const loading = useSelector(selectLoading);
    const pages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [typeFilter, setTypeFilter] = useState<'All' | 'Public' | 'Communications' | 'Restoration' | 'Referral'>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Complete' | 'Stopped' | 'Onhold'>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [projectIsDownload, setProjectIsDownload] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef<string>('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch, type: typeFilter, status: statusFilter, date_from: dateFrom, date_to: dateTo });
        if (lastKeyRef.current === key) return; 
        lastKeyRef.current = key;
        dispatch(fetchProjects({ 
            page, 
            limit, 
            search: debouncedSearch,
            type: typeFilter !== 'All' ? typeFilter : undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined,
        }));
    }, [dispatch, page, limit, debouncedSearch, typeFilter, statusFilter, dateFrom, dateTo]);

    const downloadProject = async (projectId: string, fileName = 'Project_merged') => {
        setProjectIsDownload(true);
        try {
            const { data } = await axios.get(`/projects/download/merged/${projectId}`, { responseType: 'blob' });

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
            toast.success('Project downloaded successfully');
        } catch (err) {
            toast.error('Failed to download project');
        } finally {
            setProjectIsDownload(false);
        }
    };

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchProjects({ 
                page, 
                limit, 
                search: debouncedSearch,
                type: typeFilter !== 'All' ? typeFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            }));
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
            const exportParams: any = {
                search: debouncedSearch,
                type: typeFilter !== 'All' ? typeFilter : undefined,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                limit: 10000,
                page: 1
            };
            if (dateFrom) exportParams.from_date = dateFrom;
            if (dateTo) exportParams.to_date = dateTo;
            
            const { data } = await axios.get('/projects/fetch', {
                params: exportParams
            });

            const items = data.body?.projects?.items || projects;

            const headers = ['ID', 'Project Code', 'Number', 'Project Name', 'Client', 'Status', 'Type', 'Created At'];
            const csvHeaders = headers.join(',');
            
            const escapeCsv = (val: any) => {
                if (val === null || val === undefined) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            const csvRows = items.map((project: Project) => {
                return [
                    project.sequence || '',
                    escapeCsv(project.project_code),
                    escapeCsv(project.number),
                    escapeCsv(project.name),
                    escapeCsv(project.client_name),
                    escapeCsv(project.status),
                    escapeCsv(project.type),
                    escapeCsv(project.created_at)
                ].join(',');
            }) || [];

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
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
    };

    const columns: Column<Project>[] = [
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
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>,
            sortable: true 
        },
        { 
            key: 'number' as keyof Project, 
            header: 'Number', 
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400 font-mono">{value}</span>,
            sortable: true 
        },
        { 
            key: 'name' as keyof Project, 
            header: 'Project Name', 
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>,
            sortable: true 
        },
        { 
            key: 'client_name' as keyof Project, 
            header: 'Client', 
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true 
        },
        { 
            key: 'type' as keyof Project, 
            header: 'Type', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                const colors = {
                    Public: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Communications: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                    Restoration: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                    Referral: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[value as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'status' as keyof Project, 
            header: 'Status', 
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                const colors = {
                    Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    Inactive: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
                    Complete: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    Stopped: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                    Onhold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                };
                return (
                    <Badge variant="outline" className={`${colors[value as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true 
        },
        { 
            key: 'created_at' as keyof Project, 
            header: 'Created', 
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{value}</span>,
            sortable: true 
        }
    ];

    const actions: Action<Project>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (project: Project) => router.push(`/projects/details?id=${project.id}`),
            variant: 'info' as const
        },
        {
            label: 'Edit Project',
            icon: <SquarePen className="h-4 w-4" />,
            onClick: (project: Project) => router.push(`/projects/update?id=${project.id}`),
            variant: 'warning' as const
        },
        {
            label: 'Download PDF',
            icon: <HardDriveDownload className="h-4 w-4" />,
            onClick: (project: Project) => downloadProject(project.id),
            variant: 'success' as const
        },
    ];

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (typeFilter !== 'All') activeFilters.push(`Type: ${typeFilter}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">All Projects</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Browse and manage all projects with comprehensive filtering and management tools
                        </p>
                    </div>
                </div>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter projects by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search Input with Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by project code, number, name, client..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToExcel}
                                    disabled={isExporting || loading}
                                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 whitespace-nowrap"
                                >
                                    <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                    {isExporting ? 'Exporting...' : 'Export Excel'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refreshTable}
                                    disabled={isRefreshing}
                                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Project Type Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Project Type
                                </Label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={(value) => {
                                        setTypeFilter(value as typeof typeFilter);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Types</SelectItem>
                                        <SelectItem value="Public" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Public</SelectItem>
                                        <SelectItem value="Communications" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Communications</SelectItem>
                                        <SelectItem value="Restoration" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Restoration</SelectItem>
                                        <SelectItem value="Referral" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Referral</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value) => {
                                        setStatusFilter(value as typeof statusFilter);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Active</SelectItem>
                                        <SelectItem value="Inactive" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Inactive</SelectItem>
                                        <SelectItem value="Complete" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Complete</SelectItem>
                                        <SelectItem value="Stopped" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Stopped</SelectItem>
                                        <SelectItem value="Onhold" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Onhold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* From Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date_from" className="text-slate-700 dark:text-slate-300 font-medium">
                                    From Date
                                </Label>
                                <DatePicker
                                    value={dateFrom}
                                    onChange={(value) => {
                                        setDateFrom(value);
                                        setPage(1);
                                    }}
                                />
                            </div>

                            {/* To Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date_to" className="text-slate-700 dark:text-slate-300 font-medium">
                                    To Date
                                </Label>
                                <DatePicker
                                    value={dateTo}
                                    onChange={(value) => {
                                        setDateTo(value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Active Filters & Clear Button */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                {/* Active Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((filter, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800"
                                        >
                                            {filter}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Clear All Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        setTypeFilter('All');
                                        setStatusFilter('All');
                                        setDateFrom('');
                                        setDateTo('');
                                        setPage(1);
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Projects Table */}
                <EnhancedCard
                    title="Projects List"
                    description={`${totalItems} project${totalItems !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalItems,
                        badge: 'Total Projects',
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
                        data={projects}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{
                            currentPage: page,
                            totalPages: pages,
                            pageSize: limit,
                            totalItems: totalItems,
                            onPageChange: setPage,
                        }}
                        noDataMessage="No projects found matching your search criteria"
                        searchPlaceholder="Search projects..."
                    />
                </EnhancedCard>
            </div>
        </>
    );
}
