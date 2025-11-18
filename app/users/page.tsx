'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchUsers,
    selectUsers,
    selectLoading,
    selectTotalPages,
    selectTotalItems
} from '@/stores/slices/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { User } from '@/stores/types/users';
import { Edit, Eye, Plus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';

export default function UsersPage() {
    const users = useSelector(selectUsers);
    const loading = useSelector(selectLoading);
    const totalPages = useSelector(selectTotalPages);
    const totalItems = useSelector(selectTotalItems);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<'All' | 'Active' | 'Inactive' | 'Blocked' | 'Pending'>('All');
    const [type, setType] = useState<'All' | 'Accounts' | 'Employment' | 'Contracts' | 'General' | 'Financial'>('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [role, setRole] = useState<'All' | 'Manager' | 'Supervisor' | 'Employee' | 'Admin'>('All');
    useEffect(() => {
        dispatch(fetchUsers({ 
            page, 
            limit, 
            search, 
            type: type !== 'All' ? type : undefined,
            status: status !== 'All' ? status : undefined,
            role: role !== 'All' ? role : undefined
        } as any));
    }, [dispatch, page, limit, search, status, type, role]);

    const columns: Column<User>[] = [
        { 
            key: 'number', 
            header: 'Number', 
            sortable: true,
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value}</span>
        },
        { 
            key: 'name', 
            header: 'Name', 
            sortable: true,
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
        },
        { 
            key: 'surname', 
            header: 'Surname', 
            sortable: true,
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>
        },
        { 
            key: 'email', 
            header: 'Email', 
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>
        },
        { 
            key: 'phone', 
            header: 'Phone', 
            sortable: true,
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value}</span>
        },
        { 
            key: 'role', 
            header: 'Role', 
            sortable: true,
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>
        },
        { 
            key: 'type', 
            header: 'Type', 
            sortable: true,
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value}
                </Badge>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any) => {
                const statusColors: Record<string, string> = {
                    'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'Disabled': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                    'Locked': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                    'Inactive': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
                    'Blocked': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
                    'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                };
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors] || statusColors.Active} font-medium`}>
                        {value}
                    </Badge>
                );
            },
            sortable: true
        },
        { 
            key: 'created_at', 
            header: 'Created At', 
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? value : '-'}
                </span>
            )
        }
    ];

    const actions: Action<User>[] = [
        {
            label: 'View Details',
            onClick: (user) => router.push(`/users/details?id=${user.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit User',
            onClick: (user) => router.push(`/users/update?id=${user.id}`),
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (status !== 'All') arr.push(`Status: ${status}`);
        if (type !== 'All') arr.push(`Type: ${type}`);
        return arr;
    }, [search, status, type]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchUsers({ 
                page, 
                limit, 
                search, 
                type: type !== 'All' ? type : undefined,
                status: status !== 'All' ? status : undefined,
                role: role !== 'All' ? role : undefined
            } as any));
            toast.success('Table refreshed successfully');
        } catch {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/users/fetch', {
                params: {
                    search,
                    status: status !== 'All' ? status : undefined,
                    type: type !== 'All' ? type : undefined,
                    role: role !== 'All' ? role : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Number', 'Name', 'Surname', 'Email', 'Phone', 'Role', 'Type', 'Status', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.users?.items || data?.body?.items || []).map((u: any) => {
                return [
                    u.number,
                    escapeCsv(u.name),
                    escapeCsv(u.surname),
                    escapeCsv(u.email),
                    u.phone,
                    escapeCsv(u.role),
                    escapeCsv(u.type),
                    u.status,
                    u.created_at ? new Date(u.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Users</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Browse and manage all system users</p>
                </div>
                <Button 
                    onClick={() => router.push('/users/create')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Create User
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Users"
                    description="All users in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalItems,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Active Users"
                    description="Currently active users"
                    variant="default"
                    size="sm"
                    stats={{
                        total: users.filter(u => u.status === 'Active').length,
                        badge: 'Active',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Disabled Users"
                    description="Disabled users"
                    variant="default"
                    size="sm"
                    stats={{
                        total: users.filter(u => u.status === 'Disabled' || u.status === 'Disabled').length,
                        badge: 'Disabled',
                        badgeColor: 'error'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Locked Users"
                    description="Locked users"
                    variant="default"
                    size="sm"
                    stats={{
                        total: users.filter(u => u.status === 'Locked').length,
                        badge: 'Locked',
                        badgeColor: 'warning'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by user number, name, or email..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[
                    {
                        key: 'role',
                        label: 'Role',
                        value: role,
                        options: [
                            { key: 'All', value: 'All', label: 'All Roles' },
                            { key: 'Manager', value: 'Manager', label: 'Manager' },
                            { key: 'Supervisor', value: 'Supervisor', label: 'Supervisor' },
                            { key: 'Employee', value: 'Employee', label: 'Employee' },
                            { key: 'Admin', value: 'Admin', label: 'Admin' },
                        ],
                        onValueChange: (v) => { setRole(v as any); setPage(1); }
                    },
                    {
                        key: 'status',
                        label: 'Status',
                        value: status,
                        options: [
                            { key: 'All', value: 'All', label: 'All Statuses' },
                            { key: 'Active', value: 'Active', label: 'Active' },
                            { key: 'Disabled', value: 'Disabled', label: 'Disabled' },
                            { key: 'Locked', value: 'Locked', label: 'Locked' },
                        ],
                        onValueChange: (v) => { setStatus(v as any); setPage(1); }
                    },
                    {
                        key: 'type',
                        label: 'Type',
                        value: type,
                        options: [
                            { key: 'All', value: 'All', label: 'All Types' },
                            { key: 'Accounts', value: 'Accounts', label: 'Accounts' },
                            { key: 'Employment', value: 'Employment', label: 'Employment' },
                            { key: 'Contracts', value: 'Contracts', label: 'Contracts' },
                            { key: 'General', value: 'General', label: 'General' },
                            { key: 'Financial', value: 'Financial', label: 'Financial' }
                        ],
                        onValueChange: (v) => { setType(v as any); setPage(1); }
                    }
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setStatus('All');
                    setType('All');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Users Table */}
            <EnhancedCard
                title="User List"
                description={`${totalItems} users in the system`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={users}
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
                    noDataMessage="No users found matching your search criteria"
                    searchPlaceholder="Search users..."
                />
            </EnhancedCard>
        </div>
    );
}

function escapeCsv(val: any) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}
