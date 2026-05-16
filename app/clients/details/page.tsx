'use client';

import React, { useEffect, useCallback, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchClient, selectSelectedClient, selectClientsLoading, clearSelectedClient } from '@/stores/slices/clients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Edit, Trash2, Building2, MapPin, DollarSign, Calendar,
    CheckCircle, XCircle, Clock, Loader2, Download, Phone, Mail,
    FileText, Hash, User, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import axios from '@/utils/axios';
import type { ClientProject, ClientContract, ClientTaskOrder, ClientContractor, ClientBudgetSummary } from '@/stores/types/clients';

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">{children}</div>
);

const DetailRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
        {icon && <span className="mt-0.5 text-brand-sky-500 shrink-0">{icon}</span>}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">{label}</span>
        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium flex-1">{value ?? 'N/A'}</span>
    </div>
);

function ClientDetailsContent() {
    const params = useSearchParams();
    const router = useRouter();
    const clientId = params.get('id') || '';

    const dispatch = useReduxDispatch<AppDispatch>();
    const client = useSelector(selectSelectedClient);
    const loading = useSelector(selectClientsLoading);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [budgetSummary, setBudgetSummary] = useState<ClientBudgetSummary | null>(null);

    const fetchClientData = useCallback(async () => {
        if (!clientId) {
            toast.error('Client ID is required');
            router.push('/clients');
            return;
        }
        try {
            await dispatch(fetchClient(clientId)).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load client data.');
        }
    }, [clientId, dispatch, router]);

    useEffect(() => {
        if (!clientId) return;
        axios.get(`/clients/budget-summary/${clientId}`)
            .then(res => setBudgetSummary(res.data?.body?.budget_summary ?? null))
            .catch(() => {});
    }, [clientId]);

    useEffect(() => {
        fetchClientData();
        return () => { dispatch(clearSelectedClient()); };
    }, [fetchClientData, dispatch]);

    const isActive = client?.status?.toLowerCase() === 'active';

    const getStatusColor = (status?: string) => {
        const colors: Record<string, string> = {
            'Pending':   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            'Approved':  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'Rejected':  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            'Closed':    'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
            'Complete':  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Active':    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'Draft':     'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
            'Suspended': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            'Submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
        return colors[status ?? ''] ?? 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    };

    const getClientTypeColor = (type?: string) => {
        const t = type?.toLowerCase() ?? '';
        if (t.includes('government')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        if (t.includes('private'))    return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const formatDate = (d?: string) => {
        if (!d) return 'N/A';
        try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
        catch { return 'Invalid date'; }
    };

    const formatDateTime = (d?: string) => {
        if (!d) return 'N/A';
        try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch { return 'Invalid date'; }
    };

    const formatCurrency = (value?: string | number, currency = 'IQD') => {
        if (value === undefined || value === null || value === '') return '—';
        const n = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(n)) return '—';
        return new Intl.NumberFormat('en-US').format(n) + ' ' + currency;
    };

    const handleDownloadPDF = async () => {
        if (!client?.id) { toast.error('Client ID is missing'); return; }
        setIsDownloading(true);
        try {
            const response = await axios.get(`/clients/download/${client.id}`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `client_${client.client_no || client.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Client document downloaded successfully');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to download client document');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async () => {
        if (!client) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/clients/delete/${client.id}`);
            toast.success('Client deleted successfully');
            router.push('/clients');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to delete client');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    // Table columns
    const projectsColumns: Column<ClientProject>[] = [
        { key: 'number' as keyof ClientProject,          header: 'Project No.',     render: (v: any) => <span className="font-mono text-xs font-semibold text-brand-sky-600 dark:text-brand-sky-400">{v || '—'}</span> },
        { key: 'project_code' as keyof ClientProject,    header: 'Code',            render: (v: any) => <span className="font-mono text-xs text-slate-500">{v}</span> },
        { key: 'name' as keyof ClientProject,            header: 'Project Name',    render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span> },
        { key: 'type' as keyof ClientProject,            header: 'Type',            render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v}</span> },
        { key: 'original_budget' as keyof ClientProject, header: 'Original Budget', render: (v: any) => v ? <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(v)}</span> : <span className="text-slate-400">—</span> },
        { key: 'status' as keyof ClientProject,          header: 'Status',          render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">—</span> },
        { key: 'created_at' as keyof ClientProject,      header: 'Created',         render: (v: any) => <span className="text-slate-500 text-sm">{formatDateTime(v)}</span> },
    ];

    const contractsColumns: Column<ClientContract>[] = [
        { key: 'contract_no' as keyof ClientContract, header: 'No.', render: (v: any) => <span className="font-mono text-xs text-slate-500">{v}</span> },
        { key: 'title' as keyof ClientContract, header: 'Title', render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span> },
        { key: 'contract_value' as keyof ClientContract, header: 'Value', render: (v: any, row: ClientContract) => <span className="font-semibold text-brand-sky-600 dark:text-brand-sky-400">{formatCurrency(v, row.currency)}</span> },
        { key: 'status' as keyof ClientContract, header: 'Status', render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">—</span> },
        { key: 'contract_date' as keyof ClientContract, header: 'Date', render: (v: any) => <span className="text-slate-500 text-sm">{formatDate(v)}</span> },
    ];

    const taskOrdersColumns: Column<ClientTaskOrder>[] = [
        { key: 'task_order_no' as keyof ClientTaskOrder, header: 'No.', render: (v: any) => <span className="font-mono text-xs text-slate-500">{v}</span> },
        { key: 'title' as keyof ClientTaskOrder, header: 'Title', render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span> },
        { key: 'est_cost' as keyof ClientTaskOrder, header: 'Est. Cost', render: (v: any) => <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(v)}</span> },
        { key: 'status' as keyof ClientTaskOrder, header: 'Status', render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">—</span> },
        { key: 'issue_date' as keyof ClientTaskOrder, header: 'Issue Date', render: (v: any) => <span className="text-slate-500 text-sm">{formatDate(v)}</span> },
    ];

    const contractorsColumns: Column<ClientContractor>[] = [
        { key: 'number' as keyof ClientContractor, header: 'No.', render: (v: any) => <span className="font-mono text-xs text-slate-500">{v}</span> },
        { key: 'name' as keyof ClientContractor, header: 'Name', render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v}</span> },
        { key: 'phone' as keyof ClientContractor, header: 'Phone', render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v}</span> },
        { key: 'email' as keyof ClientContractor, header: 'Email', render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v}</span> },
        { key: 'status' as keyof ClientContractor, header: 'Status', render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">—</span> },
    ];

    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading client details...</p>
            </Centered>
        );
    }

    if (!client) {
        return (
            <Centered>
                <AlertCircle className="h-10 w-10 text-rose-400" />
                <p className="text-rose-600 dark:text-rose-400">Client not found</p>
                <Button variant="outline" onClick={() => router.push('/clients')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4 pb-8">
            <Breadcrumb />

            {/* ─── Header ─── */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Client Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the client with available actions.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/clients')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
                </Button>
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <EnhancedCard title="Client Name" description="Full name" variant="default" size="sm">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {client.name || 'N/A'}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Client Number" description="Unique identifier" variant="default" size="sm">
                    <div className="text-lg font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">
                        {client.client_no || client.id || 'N/A'}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Client Type" description="Category" variant="default" size="sm">
                    <Badge variant="outline" className={`${getClientTypeColor(client.client_type)} w-fit font-semibold`}>
                        {client.client_type || 'N/A'}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Status" description="Current account state" variant="default" size="sm">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getStatusColor(client.status)} font-semibold`}>
                            {client.status || 'N/A'}
                        </Badge>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Created" description="Registration date" variant="default" size="sm">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateTime(client.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* ─── Actions Card ─── */}
            <EnhancedCard title="Actions" description="Available operations for this client" variant="default" size="sm">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Edit — visible only when NOT Active */}
                    {!isActive && (
                        <Button
                            onClick={() => router.push(`/clients/update?id=${client.id}`)}
                            className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Client
                        </Button>
                    )}

                    {/* Download — visible only when Active */}
                    {isActive && (
                        <Button
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm"
                        >
                            {isDownloading
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <Download className="h-4 w-4 mr-2" />}
                            {isDownloading ? 'Generating...' : 'Download Document'}
                        </Button>
                    )}

                    {/* Delete — hidden when Active */}
                    {!isActive && (
                        <Button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
            </EnhancedCard>

            {/* ─── Client Info — 3-column grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Basic Info */}
                <EnhancedCard title="Basic Information" description="Core client details" variant="default" size="sm">
                    <DetailRow label="Client No."    value={<span className="font-mono">{client.client_no}</span>} />
                    <DetailRow label="Name"          value={client.name} />
                    <DetailRow label="Type"          value={
                        client.client_type
                            ? <Badge variant="outline" className={`${getClientTypeColor(client.client_type)} w-fit`}>{client.client_type}</Badge>
                            : 'N/A'
                    } />
                    <DetailRow label="Status"        value={
                        client.status
                            ? <Badge variant="outline" className={`${getStatusColor(client.status)} w-fit`}>{client.status}</Badge>
                            : 'N/A'
                    } />
                    <DetailRow label="Budget"        value={client.budget ? formatCurrency(client.budget) : 'N/A'} />
                </EnhancedCard>

                {/* Location & Timestamps */}
                <EnhancedCard title="Location & Dates" description="Address and timestamps" variant="default" size="sm">
                    <DetailRow label="Governorate"   value={client.state} />
                    <DetailRow label="City"          value={client.city} />
                    <DetailRow label="Created"       value={formatDateTime(client.created_at)} />
                    <DetailRow label="Updated"       value={formatDateTime(client.updated_at)} />
                </EnhancedCard>

                {/* Budget Summary */}
                <EnhancedCard title="Budget Summary" description="Financial overview across all projects" variant="default" size="sm">
                    {budgetSummary ? (
                        <div className="space-y-0">
                            {[
                                { label: 'Client Budget',        value: budgetSummary.client_budget },
                                { label: 'Allocated to Projects',value: budgetSummary.allocated_to_projects },
                                { label: 'Remaining Budget',     value: budgetSummary.remaining_budget },
                                { label: 'Actual Cost',          value: budgetSummary.actual_cost },
                                { label: 'Budget After Actual',  value: budgetSummary.budget_after_actual },
                            ].map((row, i, arr) => (
                                <div key={row.label} className={`flex justify-between items-center py-2.5 ${i < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{row.label}</span>
                                    <span className="text-sm font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">{formatCurrency(row.value)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No budget data</p>
                    )}
                </EnhancedCard>
            </div>

            {/* Notes */}
            {client.notes && (
                <EnhancedCard title="Notes" description="Additional remarks" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{client.notes}</p>
                </EnhancedCard>
            )}

            {/* ─── Related Tables ─── */}
            {client.projects && client.projects.length > 0 && (
                <EnhancedCard title="Projects" description={`${client.projects.length} project(s)`} variant="default" size="sm">
                    <EnhancedDataTable data={client.projects} columns={projectsColumns} loading={false} noDataMessage="No projects found" />
                </EnhancedCard>
            )}

            {client.contracts && client.contracts.length > 0 && (
                <EnhancedCard title="Contracts" description={`${client.contracts.length} contract(s)`} variant="default" size="sm">
                    <EnhancedDataTable data={client.contracts} columns={contractsColumns} loading={false} noDataMessage="No contracts found" />
                </EnhancedCard>
            )}

            {client.task_orders && client.task_orders.length > 0 && (
                <EnhancedCard title="Task Orders" description={`${client.task_orders.length} task order(s)`} variant="default" size="sm">
                    <EnhancedDataTable data={client.task_orders} columns={taskOrdersColumns} loading={false} noDataMessage="No task orders found" />
                </EnhancedCard>
            )}

            {client.contractors && client.contractors.length > 0 && (
                <EnhancedCard title="Contractors" description={`${client.contractors.length} contractor(s)`} variant="default" size="sm">
                    <EnhancedDataTable data={client.contractors} columns={contractorsColumns} loading={false} noDataMessage="No contractors found" />
                </EnhancedCard>
            )}

            {/* ─── Delete Dialog ─── */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this client? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Name:</strong> {client.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Number:</strong> {client.client_no}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ClientDetailsPage() {
    return (
        <Suspense fallback={
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
            </Centered>
        }>
            <ClientDetailsContent />
        </Suspense>
    );
}
