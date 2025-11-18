'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';

import {
    fetchBudgets,
    selectBudgetItems,
    selectBudgetLoading,
    selectBudgetMeta,
} from '@/stores/slices/budgets';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileSpreadsheet, Eye } from 'lucide-react';
import type { Budget } from '@/stores/types/budgets';
import { toast } from 'sonner';
import axios from '@/utils/axios';

export default function BudgetsPage() {
    /* ─────────────────────────────
       Redux
       ───────────────────────────── */
    const dispatch = useDispatch<AppDispatch>();
    const budgets = useSelector(selectBudgetItems);
    const loading = useSelector(selectBudgetLoading);
    const { total, pages } = useSelector(selectBudgetMeta);

    /* ─────────────────────────────
       Local state
       ───────────────────────────── */
    const [search, setSearch] = useState('');
    const [type, setType] = useState<
        'All' | 'Public' | 'Communications' | 'Restoration' | 'Referral'
    >('All');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const router = useRouter();

    /* ─────────────────────────────
       Fetch on mount / param change
       ───────────────────────────── */
    useEffect(() => {
        dispatch(fetchBudgets({ page, limit, search, type: type !== 'All' ? type : undefined }));
    }, [dispatch, page, limit, search, type]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchBudgets({ page, limit, search, type: type !== 'All' ? type : undefined }));
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
            const { data } = await axios.get('/budgets/fetch', {
                params: {
                    search,
                    type: type !== 'All' ? type : undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Fiscal Year', 'Original Budget', 'Revised Budget', 'Committed Cost', 'Actual Cost', 'Created At', 'Updated At'];
            const csvHeaders = headers.join(',');
            
            const csvRows = data.body?.budgets?.items?.map((budget: Budget) => {
                return [
                    budget.fiscal_year || '',
                    budget.original_budget || 0,
                    budget.revised_budget || 0,
                    budget.committed_cost || 0,
                    budget.actual_cost || 0,
                    budget.created_at || '',
                    budget.updated_at || ''
                ].join(',');
            }) || [];

            const csvContent = [csvHeaders, ...csvRows].join('\n');
            
            const BOM = '\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `budgets_${new Date().toISOString().split('T')[0]}.csv`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            
            toast.success('Budgets exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export budgets');
        } finally {
            setIsExporting(false);
        }
    };

    /* ─────────────────────────────
       Table config
       ───────────────────────────── */
    const columns: Column<Budget>[] = [
        {
            key: 'fiscal_year',
            header: 'Fiscal Year',
            sortable: true,
        },
        {
            key: 'original_budget',
            header: 'Original Budget',
            sortable: true,
        },
        {
            key: 'revised_budget',
            header: 'Revised Budget',
            sortable: true,
        },
        {
            key: 'committed_cost',
            header: 'Committed Cost',
            sortable: true,
        },
        {
            key: 'actual_cost',
            header: 'Actual Cost',
            sortable: true,
        },
        {
            key: 'created_at',
            header: 'Created At',
            sortable: true,
        },
        {
            key: 'updated_at',
            header: 'Updated At',
        },
    ];

    const actions: Action<Budget>[] = [
        {
            label: 'Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (budget) => router.push(`/projects/details?id=${budget.project_id || budget.id}`),
            variant: 'info' as const
        },
    ];

    /* ─────────────────────────────
       Render
       ───────────────────────────── */
    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Budgets</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Browse and manage all projects budgets
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <EnhancedCard 
                    title="Total Original Budget" 
                    variant="default" 
                    size="sm"
                    stats={{
                        badge: 'Across all budgets',
                        badgeColor: 'success'
                    }}
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {budgets.reduce((sum, b) => sum + Number(b.original_budget || 0), 0).toLocaleString('en-US')}
                    </div>
                </EnhancedCard>

                <EnhancedCard 
                    title="Total Revised Budget" 
                    variant="default" 
                    size="sm"
                    stats={{
                        badge: 'After revisions',
                        badgeColor: 'info'
                    }}
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {budgets.reduce((sum, b) => sum + Number(b.revised_budget || 0), 0).toLocaleString('en-US')}
                    </div>
                </EnhancedCard>

                <EnhancedCard 
                    title="Total Committed Cost" 
                    variant="default" 
                    size="sm"
                    stats={{
                        badge: 'All commitments',
                        badgeColor: 'warning'
                    }}
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {budgets.reduce((sum, b) => sum + Number(b.committed_cost || 0), 0).toLocaleString('en-US')}
                    </div>
                </EnhancedCard>

                <EnhancedCard 
                    title="Total Actual Cost" 
                    variant="default" 
                    size="sm"
                    stats={{
                        badge: 'Already spent',
                        badgeColor: 'error'
                    }}
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {budgets.reduce((sum, b) => sum + Number(b.actual_cost || 0), 0).toLocaleString('en-US')}
                    </div>
                </EnhancedCard>
            </div>

            {/* Filters */}
            <FilterBar
                searchPlaceholder="Search by name..."
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
                        options: [
                            { key: 'All', label: 'All Types', value: 'All' },
                            { key: 'Public', label: 'Public', value: 'Public' },
                            { key: 'Communications', label: 'Communications', value: 'Communications' },
                            { key: 'Restoration', label: 'Restoration', value: 'Restoration' },
                            { key: 'Referral', label: 'Referral', value: 'Referral' }
                        ],
                        onValueChange: (value) => {
                            setType(value as typeof type);
                            setPage(1);
                        }
                    }
                ]}
                activeFilters={[
                    ...(search ? [`Search: ${search}`] : []),
                    ...(type !== 'All' ? [`Type: ${type}`] : [])
                ]}
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
                            className="gap-2"
                        >
                            <FileSpreadsheet className={`h-4 w-4 ${isExporting ? 'animate-pulse' : ''}`} />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
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
                    </div>
                }
            />

            {/* Table */}
            <EnhancedCard
                title="Budget List"
                description={`${type === 'All' ? 'All' : type} budgets - ${total} total budgets found`}
                variant="default"
                size="sm"
                stats={{
                    total: total,
                    badge: `${type === 'All' ? 'All' : type} Budgets`,
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
                    data={budgets}
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
                    noDataMessage="No budgets found"
                    searchPlaceholder="Search budgets..."
                />
            </EnhancedCard>
        </div>
    );
}
