'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { 
    History, 
    RefreshCw, 
    FileSpreadsheet, 
    AlertCircle, 
    Search, 
    X,
    CheckCircle,
    XCircle,
    Clock,
    Info,
    User,
    FileText,
    FolderOpen,
    Building,
    DollarSign,
    Shield,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';

// Date formatting helper
const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Invalid date';
    }
};

interface HistoryItem {
    id: string;
    action_type: string;
    entity_type: string;
    entity_id: string;
    entity_name: string;
    action: string;
    description?: string;
    performed_by: string;
    performed_at: string;
    old_value?: string;
    new_value?: string;
    status?: 'success' | 'failed' | 'pending';
    ip_address?: string;
}

export default function HistoryPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [entityTypeFilter, setEntityTypeFilter] = useState<'All' | 'Project' | 'Client' | 'Task' | 'User' | 'Financial' | 'Approval'>('All');
    const [actionTypeFilter, setActionTypeFilter] = useState<'All' | 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject' | 'View'>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock history data
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockHistory: HistoryItem[] = [
                {
                    id: '1',
                    action_type: 'Create',
                    entity_type: 'Project',
                    entity_id: 'PROJ-001',
                    entity_name: 'New Building Project',
                    action: 'Created new project',
                    description: 'Project "New Building Project" was created',
                    performed_by: 'Ahmed Mohamed',
                    performed_at: '2024-01-15 10:30:00',
                    new_value: 'Active',
                    status: 'success',
                    ip_address: '192.168.1.100'
                },
                {
                    id: '2',
                    action_type: 'Update',
                    entity_type: 'Client',
                    entity_id: 'CLI-002',
                    entity_name: 'ABC Company',
                    action: 'Updated client information',
                    description: 'Client contact information was updated',
                    performed_by: 'Sara Ali',
                    performed_at: '2024-01-15 09:15:00',
                    old_value: 'old-email@example.com',
                    new_value: 'new-email@example.com',
                    status: 'success',
                    ip_address: '192.168.1.101'
                },
                {
                    id: '3',
                    action_type: 'Approve',
                    entity_type: 'Approval',
                    entity_id: 'APP-003',
                    entity_name: 'Task Request #123',
                    action: 'Approved task request',
                    description: 'Task request was approved by supervisor',
                    performed_by: 'Mohammed Hassan',
                    performed_at: '2024-01-14 14:20:00',
                    old_value: 'Pending',
                    new_value: 'Approved',
                    status: 'success',
                    ip_address: '192.168.1.102'
                },
                {
                    id: '4',
                    action_type: 'Delete',
                    entity_type: 'Task',
                    entity_id: 'TASK-004',
                    entity_name: 'Completed Task Item',
                    action: 'Deleted task',
                    description: 'Task was deleted after completion',
                    performed_by: 'Fatima Saleh',
                    performed_at: '2024-01-14 11:45:00',
                    old_value: 'Active',
                    new_value: 'Deleted',
                    status: 'success',
                    ip_address: '192.168.1.103'
                },
                {
                    id: '5',
                    action_type: 'View',
                    entity_type: 'Financial',
                    entity_id: 'FIN-005',
                    entity_name: 'Budget Report',
                    action: 'Viewed financial report',
                    description: 'User viewed budget report for Q1 2024',
                    performed_by: 'Omar Ibrahim',
                    performed_at: '2024-01-13 16:30:00',
                    status: 'success',
                    ip_address: '192.168.1.104'
                },
                {
                    id: '6',
                    action_type: 'Reject',
                    entity_type: 'Approval',
                    entity_id: 'APP-006',
                    entity_name: 'Leave Request #456',
                    action: 'Rejected leave request',
                    description: 'Leave request was rejected due to insufficient coverage',
                    performed_by: 'Noor Ahmed',
                    performed_at: '2024-01-13 13:10:00',
                    old_value: 'Pending',
                    new_value: 'Rejected',
                    status: 'success',
                    ip_address: '192.168.1.105'
                }
            ];
            setHistoryItems(mockHistory);
            setLoading(false);
        }, 500);
    }, []);

    const refreshHistory = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('History refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh history');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportHistory = async () => {
        setIsExporting(true);
        try {
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('History exported successfully');
        } catch (err) {
            toast.error('Failed to export history');
        } finally {
            setIsExporting(false);
        }
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'Create':
                return <CheckCircle className="h-4 w-4" />;
            case 'Update':
                return <FileText className="h-4 w-4" />;
            case 'Delete':
                return <XCircle className="h-4 w-4" />;
            case 'Approve':
                return <CheckCircle className="h-4 w-4" />;
            case 'Reject':
                return <XCircle className="h-4 w-4" />;
            case 'View':
                return <Eye className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getActionColor = (actionType: string) => {
        switch (actionType) {
            case 'Create':
            case 'Approve':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'Update':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'Delete':
            case 'Reject':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'View':
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'Project':
                return <FolderOpen className="h-4 w-4" />;
            case 'Client':
                return <Building className="h-4 w-4" />;
            case 'Task':
                return <FileText className="h-4 w-4" />;
            case 'User':
                return <User className="h-4 w-4" />;
            case 'Financial':
                return <DollarSign className="h-4 w-4" />;
            case 'Approval':
                return <Shield className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getEntityColor = (entityType: string) => {
        switch (entityType) {
            case 'Project':
                return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
            case 'Client':
                return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'Task':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            case 'User':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'Financial':
                return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'Approval':
                return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const filteredHistory = useMemo(() => {
        let items = historyItems;

        // Filter by entity type
        if (entityTypeFilter !== 'All') {
            items = items.filter(item => item.entity_type === entityTypeFilter);
        }

        // Filter by action type
        if (actionTypeFilter !== 'All') {
            items = items.filter(item => item.action_type === actionTypeFilter);
        }

        // Filter by date range
        if (dateFrom) {
            items = items.filter(item => new Date(item.performed_at) >= new Date(dateFrom));
        }
        if (dateTo) {
            items = items.filter(item => new Date(item.performed_at) <= new Date(dateTo + 'T23:59:59'));
        }

        // Filter by search
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            items = items.filter(item =>
                item.entity_name.toLowerCase().includes(searchLower) ||
                item.action.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower) ||
                item.performed_by.toLowerCase().includes(searchLower) ||
                item.entity_id.toLowerCase().includes(searchLower)
            );
        }

        return items;
    }, [historyItems, entityTypeFilter, actionTypeFilter, dateFrom, dateTo, debouncedSearch]);

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (entityTypeFilter !== 'All') activeFilters.push(`Entity: ${entityTypeFilter}`);
    if (actionTypeFilter !== 'All') activeFilters.push(`Action: ${actionTypeFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    // Calculate stats
    const totalHistory = historyItems.length;
    const todayHistory = historyItems.filter(item => {
        const itemDate = new Date(item.performed_at);
        const today = new Date();
        return itemDate.toDateString() === today.toDateString();
    }).length;
    const thisWeekHistory = historyItems.filter(item => {
        const itemDate = new Date(item.performed_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
    }).length;
    const createActions = historyItems.filter(item => item.action_type === 'Create').length;

    const columns: Column<HistoryItem>[] = [
        {
            key: 'action_type' as keyof HistoryItem,
            header: 'Action Type',
            render: (value: any) => (
                <Badge variant="outline" className={`${getActionColor(value)} flex items-center gap-1 w-fit`}>
                    {getActionIcon(value)}
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'entity_type' as keyof HistoryItem,
            header: 'Entity Type',
            render: (value: any) => (
                <Badge variant="outline" className={`${getEntityColor(value)} flex items-center gap-1 w-fit`}>
                    {getEntityIcon(value)}
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'entity_name' as keyof HistoryItem,
            header: 'Entity Name',
            render: (value: any, item: HistoryItem) => (
                <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.entity_id}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'action' as keyof HistoryItem,
            header: 'Action',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'description' as keyof HistoryItem,
            header: 'Description',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">{value || '-'}</span>
            ),
            sortable: false
        },
        {
            key: 'performed_by' as keyof HistoryItem,
            header: 'Performed By',
            render: (value: any) => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{value}</span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'performed_at' as keyof HistoryItem,
            header: 'Date & Time',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">{formatDateTime(value)}</span>
            ),
            sortable: true
        }
    ];

    const actions: Action<HistoryItem>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (item: HistoryItem) => {
                toast.info(`Viewing details for: ${item.entity_name}`);
            },
            variant: 'info' as const
        }
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        History
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete activity history and audit trail for all system actions and changes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={refreshHistory}
                        disabled={isRefreshing || loading}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total History"
                    description="All history records"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {totalHistory}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Today"
                    description="Actions performed today"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {todayHistory}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="This Week"
                    description="Actions this week"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {thisWeekHistory}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Create Actions"
                    description="Total create actions"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {createActions}
                    </div>
                </EnhancedCard>
            </div>

            {/* Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Filter history records by entity type, action type, or date range"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by entity name, action, description, or user..."
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
                                onClick={exportHistory}
                                disabled={isExporting || loading}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Entity Type Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="entityType" className="text-slate-700 dark:text-slate-300 font-medium">
                                Entity Type
                            </Label>
                            <Select
                                value={entityTypeFilter}
                                onValueChange={(value) => {
                                    setEntityTypeFilter(value as typeof entityTypeFilter);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Entity Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Entity Types</SelectItem>
                                    <SelectItem value="Project" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Project</SelectItem>
                                    <SelectItem value="Client" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Client</SelectItem>
                                    <SelectItem value="Task" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Task</SelectItem>
                                    <SelectItem value="User" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">User</SelectItem>
                                    <SelectItem value="Financial" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Financial</SelectItem>
                                    <SelectItem value="Approval" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Approval</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Type Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="actionType" className="text-slate-700 dark:text-slate-300 font-medium">
                                Action Type
                            </Label>
                            <Select
                                value={actionTypeFilter}
                                onValueChange={(value) => {
                                    setActionTypeFilter(value as typeof actionTypeFilter);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Action Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Action Types</SelectItem>
                                    <SelectItem value="Create" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Create</SelectItem>
                                    <SelectItem value="Update" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Update</SelectItem>
                                    <SelectItem value="Delete" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Delete</SelectItem>
                                    <SelectItem value="Approve" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Approve</SelectItem>
                                    <SelectItem value="Reject" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Reject</SelectItem>
                                    <SelectItem value="View" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">View</SelectItem>
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setEntityTypeFilter('All');
                                    setActionTypeFilter('All');
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

            {/* History Table */}
            <EnhancedCard
                title="Activity History"
                description={`${filteredHistory.length} history record${filteredHistory.length !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: filteredHistory.length,
                    badge: 'Total Records',
                    badgeColor: 'success'
                }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
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
                    data={filteredHistory}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredHistory.length / limit),
                        pageSize: limit,
                        totalItems: filteredHistory.length,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No history records found matching your search criteria"
                    searchPlaceholder="Search history..."
                />
            </EnhancedCard>
        </div>
    );
}

