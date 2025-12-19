'use client';

import React, { useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchClient, selectSelectedClient, selectClientsLoading, clearSelectedClient } from '@/stores/slices/clients';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
    ArrowLeft, Edit, Trash2, Building, MapPin, DollarSign, Calendar, UserCircle, 
    CheckCircle, XCircle, Clock, FolderOpen, FileText, ClipboardList, 
    Phone, Mail, Landmark, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import axios from '@/utils/axios';
import type { ClientProject, ClientContract, ClientTaskOrder, ClientContractor } from '@/stores/types/clients';

export default function ClientDetailsPage() {
    const params = useSearchParams();
    const router = useRouter();
    const clientId = params.get('id') || '';

    const dispatch = useReduxDispatch<AppDispatch>();
    // البيانات تأتي مباشرة من السيرفر عبر Redux store
    // Structure: { success: true, data: { client: { id, name, projects: [], contracts: [], task_orders: [], contractors: [] } } }
    const client = useSelector(selectSelectedClient);
    const loading = useSelector(selectClientsLoading);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // جلب بيانات العميل من السيرفر - البيانات تأتي منظمة من السيرفر
    const fetchClientData = useCallback(async () => {
        if (!clientId) {
            toast.error('Client ID is required');
            router.push('/clients');
            return;
        }
        try {
            // البيانات تأتي من السيرفر بالشكل: { success: true, data: { client: {...} } }
            // client object يحتوي على: id, name, client_no, projects[], contracts[], task_orders[], contractors[]
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
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('active') || statusLower.includes('نشط')) {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        }
        if (statusLower.includes('draft') || statusLower.includes('مسودة')) {
            return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
        }
        if (statusLower.includes('suspended') || statusLower.includes('معلق')) {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const getStatusIcon = (status?: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('active') || statusLower.includes('نشط')) {
            return <CheckCircle className="h-4 w-4" />;
        }
        if (statusLower.includes('draft') || statusLower.includes('مسودة')) {
            return <Clock className="h-4 w-4" />;
        }
        if (statusLower.includes('suspended') || statusLower.includes('معلق')) {
            return <XCircle className="h-4 w-4" />;
        }
        return <Clock className="h-4 w-4" />;
    };

    const getClientTypeColor = (type?: string) => {
        const typeLower = type?.toLowerCase() || '';
        if (typeLower.includes('government') || typeLower.includes('حكومي')) {
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        }
        if (typeLower.includes('private') || typeLower.includes('أهلي')) {
            return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (value: string | number | undefined, currency: string = 'IQD') => {
        if (!value) return '';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '';
        return new Intl.NumberFormat('en-US').format(numValue) + ' ' + currency;
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
                <span className="font-semibold text-orange-600 dark:text-orange-400">
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
            <div className="space-y-4">
                <Breadcrumb />
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    Loading client details...
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    Client not found
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-slate-200 dark:border-slate-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Client Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete client information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => router.push(`/clients/update?id=${client.id}`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Basic Information */}
            <EnhancedCard
                title="Basic Information"
                description="Client basic details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client ID</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-mono text-lg">{client.sequence || client.id}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client Number</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-mono text-lg">{client.client_no}</p>
                    </div>
                    <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client Name</Label>
                        <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold">{client.name}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client Type</Label>
                        <div>
                            {client.client_type ? (
                                <Badge variant="outline" className={`${getClientTypeColor(client.client_type)} flex items-center gap-1 w-fit`}>
                                    <Building className="h-4 w-4" />
                                    {client.client_type}
                                </Badge>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">—</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                        <div>
                            {client.status ? (
                                <Badge variant="outline" className={`${getStatusColor(client.status)} flex items-center gap-1 w-fit`}>
                                    {getStatusIcon(client.status)}
                                    {client.status}
                                </Badge>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">—</p>
                            )}
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Location Information */}
            <EnhancedCard
                title="Location Information"
                description="Client location details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">State</Label>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <p className="text-slate-900 dark:text-slate-100">
                                {client.state || <span className="text-slate-500 dark:text-slate-400">—</span>}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">City</Label>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <p className="text-slate-900 dark:text-slate-100">
                                {client.city || <span className="text-slate-500 dark:text-slate-400">—</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Financial Information */}
            <EnhancedCard
                title="Financial Information"
                description="Client budget information"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Budget</Label>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-xl">
                                {client.budget ? new Intl.NumberFormat('en-US').format(parseFloat(client.budget)) : <span className="text-slate-500 dark:text-slate-400 font-normal">—</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Projects - البيانات تأتي مباشرة من السيرفر: client.projects[] */}
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

            {/* Contracts - البيانات تأتي مباشرة من السيرفر: client.contracts[] */}
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

            {/* Task Orders - البيانات تأتي مباشرة من السيرفر: client.task_orders[] */}
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

            {/* Contractors - البيانات تأتي مباشرة من السيرفر: client.contractors[] */}
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

            {/* Additional Information */}
            <EnhancedCard
                title="Additional Information"
                description="Additional client details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created At</Label>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <p className="text-slate-900 dark:text-slate-100">
                                {formatDateTime(client.created_at) || <span className="text-slate-500 dark:text-slate-400">—</span>}
                            </p>
                        </div>
                    </div>
                    {client.updated_at && (
                        <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Updated At</Label>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <p className="text-slate-900 dark:text-slate-100">
                                    {formatDateTime(client.updated_at) || <span className="text-slate-500 dark:text-slate-400">—</span>}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </EnhancedCard>

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

