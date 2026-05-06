'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchClient, selectSelectedClient, selectClientsLoading, clearSelectedClient } from '@/stores/slices/clients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, Edit, Trash2, Building, MapPin, DollarSign, Calendar, 
    CheckCircle, XCircle, Clock, Loader2, Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import axios from '@/utils/axios';
import type { ClientProject, ClientContract, ClientTaskOrder, ClientContractor } from '@/stores/types/clients';

// Centered Layout Component for states
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        {children}
    </div>
);

// Detail Row Component (branded colors)
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right">{value || 'N/A'}</span>
    </div>
);

function ClientDetailsContent() {
    const params = useSearchParams();
    const router = useRouter();
    const clientId = params.get('id') || '';

    const dispatch = useReduxDispatch<AppDispatch>();
    // Structure: { success: true, data: { client: { id, name, projects: [], contracts: [], task_orders: [], contractors: [] } } }
    const client = useSelector(selectSelectedClient);
    const loading = useSelector(selectClientsLoading);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

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
            // router.push('/clients');
        }
    }, [clientId, dispatch, router]);

    useEffect(() => {
        fetchClientData();
        return () => {
            dispatch(clearSelectedClient());
        };
    }, [fetchClientData, dispatch]);

    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        const colors: Record<string, string> = {
            'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'Rejected': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            'Closed': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
            'Complete': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'Draft': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
            'Suspended': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            'Submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
        return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    };

    const getStatusIcon = (status?: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('active')) {
            return <CheckCircle className="h-4 w-4" />;
        }
        if (statusLower.includes('draft')) {
            return <Clock className="h-4 w-4" />;
        }
        if (statusLower.includes('suspended')) {
            return <XCircle className="h-4 w-4" />;
        }
        return <Clock className="h-4 w-4" />;
    };

    const getClientTypeColor = (type?: string) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('government')) {
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        }
        if (typeLower.includes('private')) {
            return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

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

    const formatCurrency = (value: string | number | undefined, currency: string = 'IQD') => {
        if (!value) return '';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '';
        return new Intl.NumberFormat('en-US').format(numValue) + ' ' + currency;
    };

    const handleDownloadPDF = async () => {
        if (!client?.id) {
            toast.error('Client ID is missing');
            return;
        }

        try {
            const response = await axios.get(`/clients/download/${client.id}`, {
                responseType: 'blob', // Important for file downloads
            });

            // Create a blob from the response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            
            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary anchor element and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `client_${client.client_no || client.id}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Client document downloaded successfully');
        } catch (error: any) {
            console.error('Error downloading PDF:', error);
            const errorMessage = 
                error?.response?.data?.message || 
                error?.response?.data?.header?.message ||
                error?.message || 
                'Failed to download client document';
            toast.error(errorMessage);
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

    // Projects Columns
    const projectsColumns: Column<ClientProject>[] = [
        {
            key: 'project_code' as keyof ClientProject,
            header: 'Project Code',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'number' as keyof ClientProject,
            header: 'Number',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'name' as keyof ClientProject,
            header: 'Project Name',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || ''}</span>
        },
        {
            key: 'type' as keyof ClientProject,
            header: 'Type',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'status' as keyof ClientProject,
            header: 'Status',
            render: (value: any) => value ? (
                <Badge variant="outline" className={`${getStatusColor(value)} w-fit`}>
                    {value}
                </Badge>
            ) : <span className="text-slate-500 dark:text-slate-400">—</span>
        },
        {
            key: 'created_at' as keyof ClientProject,
            header: 'Created At',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(value) || ''}</span>
        }
    ];

    // Contracts Columns
    const contractsColumns: Column<ClientContract>[] = [
        {
            key: 'contract_no' as keyof ClientContract,
            header: 'Contract No',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'title' as keyof ClientContract,
            header: 'Title',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || ''}</span>
        },
        {
            key: 'contract_value' as keyof ClientContract,
            header: 'Contract Value',
            render: (value: any, row: ClientContract) => (
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                    {formatCurrency(value, row.currency) || ''}
                </span>
            )
        },
        {
            key: 'status' as keyof ClientContract,
            header: 'Status',
            render: (value: any) => value ? (
                <Badge variant="outline" className={`${getStatusColor(value)} w-fit`}>
                    {value}
                </Badge>
            ) : <span className="text-slate-500 dark:text-slate-400">—</span>
        },
        {
            key: 'contract_date' as keyof ClientContract,
            header: 'Contract Date',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(value) || ''}</span>
        }
    ];

    // Task Orders Columns
    const taskOrdersColumns: Column<ClientTaskOrder>[] = [
        {
            key: 'task_order_no' as keyof ClientTaskOrder,
            header: 'Task Order No',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'title' as keyof ClientTaskOrder,
            header: 'Title',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || ''}</span>
        },
        {
            key: 'est_cost' as keyof ClientTaskOrder,
            header: 'Estimated Cost',
            render: (value: any) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(value) || ''}
                </span>
            )
        },
        {
            key: 'status' as keyof ClientTaskOrder,
            header: 'Status',
            render: (value: any) => value ? (
                <Badge variant="outline" className={`${getStatusColor(value)} w-fit`}>
                    {value}
                </Badge>
            ) : <span className="text-slate-500 dark:text-slate-400">—</span>
        },
        {
            key: 'issue_date' as keyof ClientTaskOrder,
            header: 'Issue Date',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(value) || ''}</span>
        }
    ];

    // Contractors Columns
    const contractorsColumns: Column<ClientContractor>[] = [
        {
            key: 'number' as keyof ClientContractor,
            header: 'Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'name' as keyof ClientContractor,
            header: 'Name',
            render: (value: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value || ''}</span>
        },
        {
            key: 'phone' as keyof ClientContractor,
            header: 'Phone',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'email' as keyof ClientContractor,
            header: 'Email',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || ''}</span>
        },
        {
            key: 'status' as keyof ClientContractor,
            header: 'Status',
            render: (value: any) => value ? (
                <Badge variant="outline" className={`${getStatusColor(value)} w-fit`}>
                    {value}
                </Badge>
            ) : <span className="text-slate-500 dark:text-slate-400">—</span>
        }
    ];

    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading client details...</p>
            </Centered>
        );
    }

    if (!client) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">Client not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/clients')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Client Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the client with available actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/clients')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        Back to Clients
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Client ID"
                    description="Client identifier"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {client.sequence || client.id || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Client Number"
                    description="Client number"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {client.client_no || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Client Status"
                    description="Status and workflow stage"
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-2 text-xl md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {client.status ? (
                            <Badge variant="outline" className={getStatusColor(client.status)}>
                                {client.status}
                            </Badge>
                        ) : 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Created At"
                    description="Client creation date"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatDateTime(client.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* Client Information */}
            <EnhancedCard
                title="Client Information"
                description="Client details and information"
                variant="default"
                size="sm"
                headerActions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadPDF}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/clients/update?id=${client.id}`)}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Client
                        </Button>
                    </div>
                }
            >
                <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                    <Detail label="Client ID" value={client.sequence || client.id} />
                    <Detail label="Client Number" value={<span className="font-mono">{client.client_no}</span>} />
                    <Detail label="Client Name" value={client.name} />
                    <Detail
                        label="Client Type"
                        value={
                            client.client_type ? (
                                <Badge variant="outline" className={getClientTypeColor(client.client_type)}>
                                    {client.client_type}
                                </Badge>
                            ) : 'N/A'
                        }
                    />
                    <Detail
                        label="Status"
                        value={
                            client.status ? (
                                <Badge variant="outline" className={getStatusColor(client.status)}>
                                    {client.status}
                                </Badge>
                            ) : 'N/A'
                        }
                    />
                    <Detail label="State" value={client.state} />
                    <Detail label="City" value={client.city} />
                    <Detail
                        label="Budget"
                        value={client.budget ? formatCurrency(client.budget) : 'N/A'}
                    />
                    {client.notes && (
                        <div className="py-2">
                            <span className="font-medium text-slate-700 dark:text-slate-200 block mb-2">Notes</span>
                            <p className="text-slate-600 dark:text-slate-400">{client.notes}</p>
                        </div>
                    )}
                    <Detail label="Created At" value={formatDateTime(client.created_at)} />
                    {client.updated_at && (
                        <Detail label="Updated At" value={formatDateTime(client.updated_at)} />
                    )}
                </div>
            </EnhancedCard>

            {client.projects && client.projects.length > 0 && (
                <EnhancedCard
                    title="Projects"
                    description={`${client.projects.length} project(s) associated with this client`}
                    variant="default"
                    size="sm"
                >
                    <EnhancedDataTable
                        data={client.projects}
                        columns={projectsColumns}
                        loading={false}
                        noDataMessage="No projects found"
                    />
                </EnhancedCard>
            )}

            {client.contracts && client.contracts.length > 0 && (
                <EnhancedCard
                    title="Contracts"
                    description={`${client.contracts.length} contract(s) associated with this client`}
                    variant="default"
                    size="sm"
                >
                    <EnhancedDataTable
                        data={client.contracts}
                        columns={contractsColumns}
                        loading={false}
                        noDataMessage="No contracts found"
                    />
                </EnhancedCard>
            )}

            {client.task_orders && client.task_orders.length > 0 && (
                <EnhancedCard
                    title="Task Orders"
                    description={`${client.task_orders.length} task order(s) associated with this client`}
                    variant="default"
                    size="sm"
                >
                    <EnhancedDataTable
                        data={client.task_orders}
                        columns={taskOrdersColumns}
                        loading={false}
                        noDataMessage="No task orders found"
                    />
                </EnhancedCard>
            )}

            {client.contractors && client.contractors.length > 0 && (
                <EnhancedCard
                    title="Contractors"
                    description={`${client.contractors.length} contractor(s) associated with this client`}
                    variant="default"
                    size="sm"
                >
                    <EnhancedDataTable
                        data={client.contractors}
                        columns={contractorsColumns}
                        loading={false}
                        noDataMessage="No contractors found"
                    />
                </EnhancedCard>
            )}


            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this client? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Client Name:</strong> {client.name}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Client Number:</strong> {client.client_no}
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ClientDetailsPage() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
                </Centered>
            }
        >
            <ClientDetailsContent />
        </Suspense>
    );
}

