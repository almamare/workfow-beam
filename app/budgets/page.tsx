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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import { Building, DollarSign, FileText, BarChart2, Eye } from 'lucide-react';
import type { Budget } from '@/stores/types/budgets';

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
        'Public' | 'Communications' | 'Restoration' | 'Referral'
    >('Public');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const router = useRouter();

    /* ─────────────────────────────
       Fetch on mount / param change
       ───────────────────────────── */
    useEffect(() => {
        dispatch(fetchBudgets({ page, limit, search, type }));
    }, [dispatch, page, limit, search, type]);

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
            onClick: (budget) => router.push(`/projects/details?id=${budget.id}`),
        },
    ];

    /* ─────────────────────────────
       Render
       ───────────────────────────── */
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold">Budgets</h1>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all projects budgets
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Original Budget</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {budgets.reduce((sum, b) => sum + Number(b.original_budget || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Across all budgets</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revised Budget</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {budgets.reduce((sum, b) => sum + Number(b.revised_budget || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">After revisions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Committed Cost</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {budgets.reduce((sum, b) => sum + Number(b.committed_cost || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">All commitments</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Actual Cost</CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {budgets.reduce((sum, b) => sum + Number(b.actual_cost || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Already spent</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="w-full sm:max-w-sm"
                />

                <Select
                    value={type}
                    onValueChange={(v) => {
                        setType(v as typeof type);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Budget Type" />
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
                        <div>
                            <CardTitle>Budget List ({type})</CardTitle>
                            <CardDescription>
                                {total} budget{total !== 1 && 's'} found
                            </CardDescription>
                        </div>

                        {/* Items‑per‑page */}
                        <Select
                            value={String(limit)}
                            onValueChange={(v) => {
                                setLimit(Number(v));
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 50, 100].map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                        {n} per page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <DataTable
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
                    />
                </CardContent>
            </Card>
        </div>
    );
}
