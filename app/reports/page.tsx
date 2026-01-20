'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    BarChart3, 
    RefreshCw, 
    FileSpreadsheet, 
    Download, 
    X, 
    Search, 
    FileText,
    TrendingUp,
    Users,
    FolderOpen,
    DollarSign,
    Calendar,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';

/* =========================
   Types
========================= */
interface Report {
    id: string;
    report_type: string;
    title: string;
    description: string;
    generated_by: string;
    generated_at: string;
    status: 'Completed' | 'Processing' | 'Failed';
    file_url?: string;
    record_count?: number;
}

/* =========================
   Component
========================= */
export default function ReportsPage() {
    const router = useRouter();

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [reportTypeFilter, setReportTypeFilter] = useState<'All' | 'Projects' | 'Clients' | 'Financial' | 'Tasks' | 'Users'>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Processing' | 'Failed'>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    // Mock data for demonstration
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockReports: Report[] = [
                {
                    id: '1',
                    report_type: 'Projects',
                    title: 'Projects Summary Report',
                    description: 'Complete overview of all projects with budget and status',
                    generated_by: 'Ahmed Mohamed',
                    generated_at: '2024-01-15 10:30:00',
                    status: 'Completed',
                    record_count: 45
                },
                {
                    id: '2',
                    report_type: 'Clients',
                    title: 'Clients Activity Report',
                    description: 'Client engagement and activity analysis',
                    generated_by: 'Sara Ali',
                    generated_at: '2024-01-14 14:20:00',
                    status: 'Completed',
                    record_count: 120
                },
                {
                    id: '3',
                    report_type: 'Financial',
                    title: 'Financial Budget Report',
                    description: 'Budget analysis and financial overview',
                    generated_by: 'Mohammed Hassan',
                    generated_at: '2024-01-13 09:15:00',
                    status: 'Completed',
                    record_count: 30
                }
            ];
            setReports(mockReports);
            setTotalItems(mockReports.length);
            setTotalPages(1);
            setLoading(false);
        }, 500);
    }, []);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Reports refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh reports');
        } finally {
            setIsRefreshing(false);
        }
    };

    const generateReport = async (type: string) => {
        setIsGenerating(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success(`${type} report generated successfully`);
            refreshTable();
        } catch (err) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadReport = async (report: Report) => {
        try {
            if (report.file_url) {
                // Simulate download
                toast.success('Report downloaded successfully');
            } else {
                toast.error('Report file not available');
            }
        } catch (err) {
            toast.error('Failed to download report');
        }
    };

    const getReportTypeIcon = (type: string) => {
        switch (type) {
            case 'Projects':
                return <FolderOpen className="h-4 w-4" />;
            case 'Clients':
                return <Users className="h-4 w-4" />;
            case 'Financial':
                return <DollarSign className="h-4 w-4" />;
            case 'Tasks':
                return <FileText className="h-4 w-4" />;
            case 'Users':
                return <Users className="h-4 w-4" />;
            default:
                return <BarChart3 className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'Processing':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'Failed':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        }
    };

    const getReportTypeColor = (type: string) => {
        switch (type) {
            case 'Projects':
                return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'Clients':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'Financial':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'Tasks':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'Users':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            report.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                            report.generated_by.toLowerCase().includes(debouncedSearch.toLowerCase());
        const matchesType = reportTypeFilter === 'All' || report.report_type === reportTypeFilter;
        const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (reportTypeFilter !== 'All') activeFilters.push(`Type: ${reportTypeFilter}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    const columns: Column<Report>[] = [
        {
            key: 'report_type' as keyof Report,
            header: 'Report Type',
            render: (value: any) => (
                <Badge variant="outline" className={`${getReportTypeColor(value)} flex items-center gap-1 w-fit`}>
                    {getReportTypeIcon(value)}
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'title' as keyof Report,
            header: 'Title',
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'description' as keyof Report,
            header: 'Description',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">{value}</span>
            ),
            sortable: false
        },
        {
            key: 'generated_by' as keyof Report,
            header: 'Generated By',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof Report,
            header: 'Status',
            render: (value: any) => (
                <Badge variant="outline" className={`${getStatusColor(value)} font-medium`}>
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'record_count' as keyof Report,
            header: 'Records',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || 'N/A'}</span>
            ),
            sortable: true
        },
        {
            key: 'generated_at' as keyof Report,
            header: 'Generated At',
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">{value}</span>
            ),
            sortable: true
        }
    ];

    const actions: Action<Report>[] = [
        {
            label: 'Download Report',
            icon: <Download className="h-4 w-4" />,
            onClick: (report: Report) => downloadReport(report),
            variant: 'success' as const,
            hidden: (report) => report.status !== 'Completed'
        },
        {
            label: 'View Details',
            icon: <FileText className="h-4 w-4" />,
            onClick: (report: Report) => {
                toast.info(`Viewing details for: ${report.title}`);
            },
            variant: 'info' as const
        }
    ];

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Reports</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Generate and manage comprehensive reports for projects, clients, financial data, and more
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <EnhancedCard 
                        title="Total Reports" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'All time',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                            {totalItems}
                        </div>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Completed Reports" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Ready to download',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                            {reports.filter(r => r.status === 'Completed').length}
                        </div>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Processing" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'In progress',
                            badgeColor: 'warning'
                        }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                            {reports.filter(r => r.status === 'Processing').length}
                        </div>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Report Types" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Available types',
                            badgeColor: 'info'
                        }}
                    >
                        <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                            5
                        </div>
                    </EnhancedCard>
                </div>

                {/* Quick Generate Reports */}
                <EnhancedCard
                    title="Quick Generate Reports"
                    description="Generate common reports instantly"
                    variant="default"
                    size="sm"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => generateReport('Projects')}
                            disabled={isGenerating}
                            className="border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 hover:text-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Projects
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => generateReport('Clients')}
                            disabled={isGenerating}
                            className="border-purple-200 dark:border-purple-800 hover:border-purple-300 hover:text-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Clients
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => generateReport('Financial')}
                            disabled={isGenerating}
                            className="border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 hover:text-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Financial
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => generateReport('Tasks')}
                            disabled={isGenerating}
                            className="border-yellow-200 dark:border-yellow-800 hover:border-yellow-300 hover:text-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Tasks
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => generateReport('Users')}
                            disabled={isGenerating}
                            className="border-blue-200 dark:border-blue-800 hover:border-blue-300 hover:text-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Users
                        </Button>
                    </div>
                </EnhancedCard>

                {/* Search & Filters Card */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Search and filter reports by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Search Input with Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by title, description, or generated by..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refreshTable}
                                    disabled={isRefreshing}
                                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Report Type Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="reportType" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Report Type
                                </Label>
                                <Select
                                    value={reportTypeFilter}
                                    onValueChange={(value) => {
                                        setReportTypeFilter(value as typeof reportTypeFilter);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Types</SelectItem>
                                        <SelectItem value="Projects" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Projects</SelectItem>
                                        <SelectItem value="Clients" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Clients</SelectItem>
                                        <SelectItem value="Financial" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Financial</SelectItem>
                                        <SelectItem value="Tasks" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Tasks</SelectItem>
                                        <SelectItem value="Users" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Users</SelectItem>
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
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Status</SelectItem>
                                        <SelectItem value="Completed" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Completed</SelectItem>
                                        <SelectItem value="Processing" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Processing</SelectItem>
                                        <SelectItem value="Failed" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Failed</SelectItem>
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
                                            className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
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
                                        setReportTypeFilter('All');
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

                {/* Reports Table */}
                <EnhancedCard
                    title="Reports List"
                    description={`${filteredReports.length} report${filteredReports.length !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: filteredReports.length,
                        badge: 'Total Reports',
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
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                <SelectItem value="5" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">5 per page</SelectItem>
                                <SelectItem value="10" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">10 per page</SelectItem>
                                <SelectItem value="20" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">20 per page</SelectItem>
                                <SelectItem value="50" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">50 per page</SelectItem>
                                <SelectItem value="100" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">100 per page</SelectItem>
                                <SelectItem value="200" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">200 per page</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={filteredReports}
                        columns={columns}
                        actions={actions}
                        loading={loading}
                        pagination={{
                            currentPage: page,
                            totalPages: totalPages,
                            pageSize: limit,
                            totalItems: filteredReports.length,
                            onPageChange: setPage,
                        }}
                        noDataMessage="No reports found matching your search criteria"
                        searchPlaceholder="Search reports..."
                    />
                </EnhancedCard>
            </div>
        </>
    );
}

