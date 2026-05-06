'use client';

import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AppDispatch, RootState } from '@/stores/store';

import {
    fetchChangeOrders,
    createChangeOrder,
    selectChangeOrders,
    selectChangeOrdersLoading,
    selectChangeOrdersTotal,
    selectChangeOrdersPages,
} from '@/stores/slices/change-orders';

import { fetchContractors } from '@/stores/slices/contractors';
import { fetchProjects } from '@/stores/slices/projects';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    RefreshCw,
    FileSpreadsheet,
    Eye,
    X,
    Search,
    Plus,
    ArrowLeft,
    GitPullRequestArrow,
} from 'lucide-react';
import type { ChangeOrder } from '@/stores/types/change-orders';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const STATUS_OPTIONS = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected', 'Completed', 'Cancelled'] as const;
type StatusOption = (typeof STATUS_OPTIONS)[number];

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    Submitted: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    Rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    Completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Cancelled: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

export default function ChangeOrdersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const changeOrders = useSelector(selectChangeOrders);
    const loading = useSelector(selectChangeOrdersLoading);
    const total = useSelector(selectChangeOrdersTotal);
    const pages = useSelector(selectChangeOrdersPages);

    const contractors = useSelector((state: RootState) => state.contractors?.contractors ?? []);
    const projects = useSelector((state: RootState) => state.projects?.projects ?? []);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusOption>('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        contractor_id: '',
        project_id: '',
        title: '',
        description: '',
        issue_date: '',
        est_cost: '',
        notes: '',
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const lastKeyRef = useRef('');
    useEffect(() => {
        const key = JSON.stringify({ page, limit, search: debouncedSearch, status: statusFilter, dateFrom, dateTo });
        if (lastKeyRef.current === key) return;
        lastKeyRef.current = key;
        dispatch(fetchChangeOrders({
            page,
            limit,
            search: debouncedSearch,
            status: statusFilter !== 'All' ? statusFilter : undefined,
        } as any));
    }, [dispatch, page, limit, debouncedSearch, statusFilter, dateFrom, dateTo]);

    useEffect(() => {
        dispatch(fetchContractors({} as any));
        dispatch(fetchProjects({} as any));
    }, [dispatch]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchChangeOrders({
                page,
                limit,
                search: debouncedSearch,
                status: statusFilter !== 'All' ? statusFilter : undefined,
            } as any));
            toast.success('Table refreshed successfully');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const exportParams: any = {
                search: debouncedSearch,
                status: statusFilter !== 'All' ? statusFilter : undefined,
                limit: 10000,
                page: 1,
            };
            if (dateFrom) exportParams.from_date = dateFrom;
            if (dateTo) exportParams.to_date = dateTo;

            const { data } = await axios.get('/change-orders/fetch', { params: exportParams });
            const items: ChangeOrder[] = data?.body?.change_orders?.items || changeOrders;

            const headers = ['ID', 'Change Order #', 'Title', 'Contractor', 'Project', 'Issue Date', 'Est. Cost', 'Status', 'Created At'];
            const escape = (val: any) => {
                const s = String(val ?? '');
                return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
            };

            const rows = items.map((co) =>
                [co.sequence, escape(co.change_order_no), escape(co.title), escape(co.contractor_name),
                 escape(co.project_name), escape(co.issue_date), escape(co.est_cost), escape(co.status), escape(co.created_at)].join(',')
            );

            const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `change_orders_${new Date().toISOString().split('T')[0]}.csv`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();

            toast.success('Change orders exported successfully');
        } catch {
            toast.error('Failed to export change orders');
        } finally {
            setIsExporting(false);
        }
    };

    const handleCreate = async () => {
        if (!form.contractor_id || !form.project_id || !form.title || !form.issue_date) {
            toast.error('Contractor, Project, Title and Issue Date are required');
            return;
        }
        setCreating(true);
        try {
            const result = await dispatch(createChangeOrder({
                contractor_id: form.contractor_id,
                project_id: form.project_id,
                title: form.title,
                description: form.description,
                issue_date: form.issue_date,
                est_cost: form.est_cost || undefined,
                notes: form.notes,
            }));

            if (createChangeOrder.fulfilled.match(result)) {
                toast.success('Change order created successfully');
                setCreateOpen(false);
                setForm({ contractor_id: '', project_id: '', title: '', description: '', issue_date: '', est_cost: '', notes: '' });
                lastKeyRef.current = '';
                dispatch(fetchChangeOrders({ page, limit, search: debouncedSearch } as any));
            } else {
                toast.error(result.payload as string || 'Failed to create change order');
            }
        } finally {
            setCreating(false);
        }
    };

    const columns: Column<ChangeOrder>[] = [
        {
            key: 'sequence' as keyof ChangeOrder,
            header: 'ID',
            render: (v: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{v}</span>,
            sortable: true,
            width: '70px',
        },
        {
            key: 'change_order_no' as keyof ChangeOrder,
            header: 'CO #',
            render: (v: any) => <span className="font-mono font-semibold text-violet-700 dark:text-violet-300">{v}</span>,
            sortable: true,
        },
        {
            key: 'title' as keyof ChangeOrder,
            header: 'Title',
            render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span>,
            sortable: true,
        },
        {
            key: 'contractor_name' as keyof ChangeOrder,
            header: 'Contractor',
            render: (v: any) => <span className="text-slate-700 dark:text-slate-300">{v}</span>,
            sortable: true,
        },
        {
            key: 'project_name' as keyof ChangeOrder,
            header: 'Project',
            render: (v: any) => (
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {v}
                </Badge>
            ),
            sortable: true,
        },
        {
            key: 'est_cost' as keyof ChangeOrder,
            header: 'Est. Cost',
            render: (v: any) => (
                <span className="font-mono text-slate-700 dark:text-slate-300">
                    {v ? Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                </span>
            ),
            sortable: true,
        },
        {
            key: 'status' as keyof ChangeOrder,
            header: 'Status',
            render: (v: any) => v
                ? <Badge variant="outline" className={`${STATUS_COLORS[v] || 'bg-slate-100 dark:bg-slate-800'} w-fit`}>{v}</Badge>
                : <span className="text-slate-400">N/A</span>,
            sortable: true,
        },
        {
            key: 'issue_date' as keyof ChangeOrder,
            header: 'Issue Date',
            render: (v: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{v}</span>,
            sortable: true,
        },
    ];

    const actions: Action<ChangeOrder>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (co: ChangeOrder) => router.push(`/change-orders/details?id=${co.id}`),
            variant: 'info' as const,
        },
    ];

    const activeFilters: string[] = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    return (
        <>
            <div className="space-y-4">
                <Breadcrumb />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">Change Orders</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Manage all change orders linked to task orders and projects
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/tasks">
                            <Button variant="outline" size="sm" className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Task Orders
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={() => setCreateOpen(true)}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Change Order
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <EnhancedCard
                    title="Search & Filters"
                    description="Filter change orders by various criteria"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search by CO number, title, contractor, project..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-violet-300 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToExcel}
                                    disabled={isExporting || loading}
                                    className="border-violet-200 dark:border-violet-800 hover:text-violet-700 hover:border-violet-300 dark:hover:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 whitespace-nowrap"
                                >
                                    <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                    {isExporting ? 'Exporting...' : 'Export Excel'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refreshTable}
                                    disabled={isRefreshing}
                                    className="border-violet-200 dark:border-violet-800 hover:text-violet-700 hover:border-violet-300 dark:hover:border-violet-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 whitespace-nowrap"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={(v) => { setStatusFilter(v as StatusOption); setPage(1); }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s} value={s}>{s === 'All' ? 'All Status' : s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">From Date</Label>
                                <DatePicker value={dateFrom} onChange={(v) => { setDateFrom(v); setPage(1); }} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">To Date</Label>
                                <DatePicker value={dateTo} onChange={(v) => { setDateTo(v); setPage(1); }} />
                            </div>
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((f, i) => (
                                        <Badge key={i} variant="outline" className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800">
                                            {f}
                                        </Badge>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => { setSearch(''); setStatusFilter('All'); setDateFrom(''); setDateTo(''); setPage(1); }}
                                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Table */}
                <EnhancedCard
                    title="Change Orders List"
                    description={`${total} change order${total !== 1 ? 's' : ''} found`}
                    variant="default"
                    size="sm"
                    stats={{ total, badge: 'Total Change Orders', badgeColor: 'success' }}
                    headerActions={
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                            <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                {['5', '10', '20', '50', '100'].map((v) => (
                                    <SelectItem key={v} value={v}>{v} per page</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    }
                >
                    <EnhancedDataTable
                        data={changeOrders}
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
                        noDataMessage="No change orders found matching your search criteria"
                        searchPlaceholder="Search change orders..."
                    />
                </EnhancedCard>
            </div>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <GitPullRequestArrow className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            New Change Order
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Contractor */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                Contractor <span className="text-red-500">*</span>
                            </Label>
                            <Select value={form.contractor_id} onValueChange={(v) => setForm((f) => ({ ...f, contractor_id: v }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select contractor..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-48">
                                    {contractors.map((c: any) => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Project */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                Project <span className="text-red-500">*</span>
                            </Label>
                            <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select project..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-48">
                                    {projects.map((p: any) => (
                                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Change order title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                        </div>

                        {/* Issue Date + Est. Cost */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                    Issue Date <span className="text-red-500">*</span>
                                </Label>
                                <DatePicker value={form.issue_date} onChange={(v) => setForm((f) => ({ ...f, issue_date: v }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Est. Cost</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={form.est_cost}
                                    onChange={(e) => setForm((f) => ({ ...f, est_cost: e.target.value }))}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                            <Textarea
                                placeholder="Describe the scope of this change order..."
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                rows={3}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Notes</Label>
                            <Textarea
                                placeholder="Additional notes..."
                                value={form.notes}
                                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                                rows={2}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setCreateOpen(false)}
                            disabled={creating}
                            className="border-slate-200 dark:border-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={creating}
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                        >
                            {creating ? 'Creating...' : 'Create Change Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
