/* =========================================================
   src/app/requests/tasks/details/page.tsx
   Task Request Details + Attachments + Approvals + Enhanced UI
   Bugs fixed and layout improved
=========================================================== */

'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { AppDispatch, RootState } from '@/stores/store';
import {
    fetchTaskOrder,
    clearSelectedTaskOrder,
    selectSelectedTaskOrder,
    selectSelectedContractor,
    selectSelectedProject,
    selectSelectedDocuments,
    selectSelectedContractTerms,
    selectTaskOrdersLoading,
    selectTaskOrdersError,
} from '@/stores/slices/task-orders';
import {
    fetchTaskRequest,
    clearSelectedTaskRequest,
    selectSelectedTaskRequest,
    selectLoading as selectRequestLoading,
    selectError as selectRequestError,
} from '@/stores/slices/tasks_requests';
import { toast } from "sonner";
import axios from "@/utils/axios";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Loader2, 
    ArrowLeft, 
    ClipboardList, 
    ExternalLink, 
    Calendar, 
    CircleCheckBig, 
    HardDriveDownload,
    Edit,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    FileText,
    Download,
    Plus,
    Eye,
    Trash2,
    Phone,
    Mail,
    MapPin,
    UserCheck,
    Activity,
    Save,
    RefreshCw
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import AttachmentModel from '@/components/AttachmentModel';
import ApprovalModel from '@/components/ApprovalModel';

/* =========================================================
   Hooks
=========================================================== */
const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* =========================================================
   Badge Status Helpers
=========================================================== */
const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Rejected': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        'Closed': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
        'Complete': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Onhold': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        'Cancelled': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

/* =========================================================
   Types
=========================================================== */
interface Attachment {
    id: number;
    request_type: string;
    title: string;
    uploader_name: string;
    path: string;
    file: string;
    created_at: string;
}

interface Approval {
    id: string;
    sequence: number;
    step_no: number;
    step_name: string;
    remarks: string;
    status: string;
    created_name: string;
    created_at: string;
}

/* =========================================================
   Helpers
=========================================================== */
function fmt(date?: string) {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Invalid date';
    }
}

/* =========================================================
   Reusable UI Components
=========================================================== */
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        {children}
    </div>
);

/* =========================================================
   Main Component
=========================================================== */
function TaskDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const dispatch = useAppDispatch();

    // Redux Selectors
    const order = useAppSelector(selectSelectedTaskOrder);
    const contractor = useAppSelector(selectSelectedContractor);
    const project = useAppSelector(selectSelectedProject);
    const documents = useAppSelector(selectSelectedDocuments);
    const contractTerms = useAppSelector(selectSelectedContractTerms);
    const orderLoading = useAppSelector(selectTaskOrdersLoading);
    const orderError = useAppSelector(selectTaskOrdersError);

    const request = useAppSelector(selectSelectedTaskRequest);
    const requestLoading = useAppSelector(selectRequestLoading);
    const requestError = useAppSelector(selectRequestError);

    // Local State
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [attachmentModelOpen, setAttachmentModelOpen] = useState(false);
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [approvalModelOpen, setApprovalModelOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        request_type: '',
        contractor_name: '',
        project_name: '',
        priority: 'medium',
        description: '',
        notes: '',
        due_date: '',
        estimated_hours: '',
        assigned_to: ''
    });
    const [statusFormData, setStatusFormData] = useState({
        status: '',
        remarks: ''
    });

    // Fetch request data
    useEffect(() => {
        if (!id) {
            toast.error('Request ID is missing');
            router.push('/orders/tasks');
            return;
        }
        dispatch(fetchTaskRequest({ id }));
        return () => {
            dispatch(clearSelectedTaskRequest());
        };
    }, [id, router, dispatch]);

    // Fetch task order data
    useEffect(() => {
        if (request?.task_order_id) {
            dispatch(fetchTaskOrder({ id: request.task_order_id }));
        }
        return () => {
            dispatch(clearSelectedTaskOrder());
        };
    }, [request, dispatch]);

    // Fetch attachments and approvals
    useEffect(() => {
        if (!id) return;
        axios.get(`/attachments/fetch/${id}`)
            .then((res) => setAttachments(res.data.body.attachments))
            .catch(() => toast.error("Failed to load attachments"));

        axios.get(`/approvals/fetch/${id}`)
            .then((res) => setApprovals(res.data.body.approvals.items))
            .catch(() => toast.error("Failed to load approvals"));
    }, [id]);

    // Handle errors
    useEffect(() => {
        if (orderError) toast.error(orderError);
        if (requestError) toast.error(requestError);
    }, [orderError, requestError]);

    // Combined loading
    const loading = orderLoading || requestLoading || isLoading;

    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
            </Centered>
        );
    }

    if (orderError || requestError) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">{orderError || requestError}</p>
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/requests/tasks')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requests
                </Button>
            </Centered>
        );
    }

    if (!request) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">Task request not found</p>
                <Button 
                    variant="outline" 
                    onClick={() => router.push('/requests/tasks')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requests
                </Button>
            </Centered>
        );
    }

    // Handlers
    const attachmentUploaded = (attachment: Attachment) => setAttachments(prev => [...prev, attachment]);
    const approvalCreated = (approval: Approval) => setApprovals(prev => [...prev, approval]);

    const handleEdit = () => {
        if (!request) return;
        setEditFormData({
            request_type: request.request_type || '',
            contractor_name: request.contractor_name || '',
            project_name: request.project_name || '',
            priority: request.priority || 'medium',
            description: (request as any).description || '',
            notes: request.notes || '',
            due_date: '',
            estimated_hours: '',
            assigned_to: ''
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            // Replace this mock with actual backend call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Task request updated successfully');
            setIsEditDialogOpen(false);
        } catch (error) {
            toast.error('Failed to update request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async () => {
        setIsLoading(true);
        try {
            // Replace this mock with actual backend call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success(`Status updated to ${statusFormData.status}`);
            setIsStatusDialogOpen(false);
            setStatusFormData({ status: '', remarks: '' });
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Request approved successfully');
        } catch (error) {
            toast.error('Failed to approve request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Request rejected');
        } catch (error) {
            toast.error('Failed to reject request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Request marked as complete');
        } catch (error) {
            toast.error('Failed to complete request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        toast.success('Request exported');
    };

    const handlePrint = () => {
        window.print();
    };

    // Static data
    const requestTypes = [
        { value: 'maintenance', label: 'Maintenance', icon: <ClipboardList className="h-4 w-4" /> },
        { value: 'repair', label: 'Repair', icon: <AlertTriangle className="h-4 w-4" /> },
        { value: 'installation', label: 'Installation', icon: <UserCheck className="h-4 w-4" /> },
        { value: 'inspection', label: 'Inspection', icon: <Eye className="h-4 w-4" /> },
        { value: 'other', label: 'Other', icon: <ClipboardList className="h-4 w-4" /> }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const contractors = ['ABC Construction', 'XYZ Electrical', 'Green Landscaping', 'Modern Plumbing', 'Quality Painters'];
    const projects = ['Office Building Construction', 'Residential Complex', 'Shopping Mall', 'Hospital', 'School'];

    const attachmentColumns: Column<Attachment>[] = [
        {
            key: 'title',
            header: 'File Name',
            render: (value: any) => <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
        },
        {
            key: 'request_type',
            header: 'Type',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value}
                </Badge>
            )
        },
        {
            key: 'uploader_name',
            header: 'Uploaded By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>
        },
        {
            key: 'created_at',
            header: 'Date',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{fmt(value)}</span>
            )
        }
    ];

    const attachmentActions: Action<Attachment>[] = [
        {
            label: 'View File',
            onClick: (attachment) => {
                window.open(`${attachment.path}${attachment.file}`, '_blank');
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Download',
            onClick: (attachment) => {
                const link = document.createElement('a');
                link.href = `${attachment.path}${attachment.file}`;
                link.download = attachment.file;
                link.click();
            },
            icon: <Download className="h-4 w-4" />,
            variant: 'default' as const
        },
        {
            label: 'Delete',
            onClick: (attachment) => {
                setAttachments(prev => prev.filter(att => att.id !== attachment.id));
                toast.success('Attachment deleted successfully');
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const approvalColumns: Column<Approval>[] = [
        {
            key: 'sequence',
            header: 'Sequence',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
        },
        {
            key: 'step_name',
            header: 'Step Name',
            render: (value: any) => <span className="font-medium text-slate-800 dark:text-slate-200">{value}</span>
        },
        {
            key: 'remarks',
            header: 'Remarks',
            render: (value: any) => (
                <div className="max-w-xs">
                    <div className="text-sm text-slate-800 dark:text-slate-200 truncate">{value || '-'}</div>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any) => (
                <Badge variant="outline" className={`${getStatusColor(value)} font-medium`}>
                    {value}
                </Badge>
            )
        },
        {
            key: 'created_name',
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
        },
        {
            key: 'created_at',
            header: 'Date',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{fmt(value)}</span>
            )
        }
    ];

    const approvalActions: Action<Approval>[] = [
        {
            label: 'View Details',
            onClick: () => {
                toast.info('Approval details feature coming soon');
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Edit',
            onClick: () => {
                toast.info('Edit approval feature coming soon');
            },
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Delete',
            onClick: (approval) => {
                setApprovals(prev => prev.filter(app => app.id !== approval.id));
                toast.success('Approval deleted successfully');
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Task Request Details
                    </h1>
                    {request.request_code && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Request Code: {request.request_code}
                        </p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Review request information and manage actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/requests/tasks')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Requests
                    </Button>
                    <Button
                        onClick={handleEdit}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Request
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Status"
                    description="Current request status"
                    variant="default"
                    size="sm"
                >
                    <Badge variant="outline" className={`${getStatusColor(request.status || 'Pending')} text-lg font-semibold px-4 py-2`}>
                        {request.status || 'N/A'}
                    </Badge>
                </EnhancedCard>
                <EnhancedCard
                    title="Request Type"
                    description="Type of request"
                    variant="default"
                    size="sm"
                >
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {request.request_type || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Created By"
                    description="Request creator"
                    variant="default"
                    size="sm"
                >
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {request.created_by_name || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Created At"
                    description="Request creation date"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100">
                        {fmt(request.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* Quick Actions */}
            <EnhancedCard
                title="Quick Actions"
                description={`Last Updated: ${fmt(request.updated_at)}`}
                variant="default"
                size="sm"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        onClick={() => setIsStatusDialogOpen(true)}
                        variant="outline"
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <Activity className="h-4 w-4 mr-2" />
                        Change Status
                    </Button>
                    <Button
                        onClick={handleApprove}
                        disabled={request.status !== 'Pending' || isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                    </Button>
                    <Button
                        onClick={handleReject}
                        variant="outline"
                        disabled={request.status === 'Approved' || request.status === 'Rejected' || request.status === 'Complete' || isLoading}
                        className="border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                    <Button
                        onClick={handleComplete}
                        disabled={request.status !== 'Approved' || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CircleCheckBig className="h-4 w-4 mr-2" />
                        Complete
                    </Button>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </EnhancedCard>

            {/* Project and Contractor Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {project && (
                    <EnhancedCard
                        title="Project Information"
                        description="Project details and specifications"
                        variant="default"
                        size="sm"
                    >
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-3">
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Client Name</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{project.client_name || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Project Number</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{project.number || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Project Name</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{project.name || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Project Code</span>
                                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm text-right">{project.project_code || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Project Type</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{project.type || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Created At</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{fmt(project.created_at)}</span>
                            </div>
                        </div>
                    </EnhancedCard>
                )}
                {contractor && (
                    <EnhancedCard
                        title="Contractor Information"
                        description="Contractor details and contact information"
                        variant="default"
                        size="sm"
                    >
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-3">
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Contractor Name</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{contractor.name || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Contractor Number</span>
                                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm text-right">{contractor.number || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Phone</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {contractor.phone || '-'}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Email</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {contractor.email || '-'}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Address</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {contractor.address || '-'}
                                </span>
                            </div>
                            <div className="flex items-start justify-between gap-4 py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200">Province</span>
                                <span className="text-slate-600 dark:text-slate-400 text-right">{contractor.province || '-'}</span>
                            </div>
                        </div>
                    </EnhancedCard>
                )}
            </div>

            {/* Documents and Contract Terms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {documents?.length > 0 && (
                    <EnhancedCard
                        title="Documents"
                        description={`${documents.length} document(s) attached`}
                        variant="default"
                        size="sm"
                    >
                        <div className="space-y-3">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{doc.title}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Document ID: {doc.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            asChild
                                            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4 mr-1" /> View
                                            </a>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            asChild
                                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                        >
                                            <a href={doc.file} download>
                                                <HardDriveDownload className="h-4 w-4 mr-1" /> Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </EnhancedCard>
                )}
                {contractTerms?.length > 0 && (
                    <EnhancedCard
                        title="Contract Terms"
                        description={`${contractTerms.length} term(s) defined`}
                        variant="default"
                        size="sm"
                    >
                        <div className="space-y-3">
                            {contractTerms.map((t: any) => (
                                <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{t.titel || t.title || '-'}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.description || '-'}</p>
                                </div>
                            ))}
                        </div>
                    </EnhancedCard>
                )}
            </div>

            {/* Attachments Section */}
            <EnhancedCard
                title="Attachments"
                description={`${attachments.length} file(s) attached to this request`}
                variant="default"
                size="sm"
                headerActions={
                    <Button 
                        onClick={() => setAttachmentModelOpen(true)} 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Attachment
                    </Button>
                }
            >
                <EnhancedDataTable
                    data={attachments}
                    columns={attachmentColumns}
                    actions={attachmentActions}
                    loading={false}
                    noDataMessage="No attachments for this request"
                    hideEmptyMessage={true}
                />
            </EnhancedCard>

            {/* Approvals Section */}
            <EnhancedCard
                title="Approvals"
                description={`${approvals.length} approval step(s) for this request`}
                variant="default"
                size="sm"
                headerActions={
                    <Button 
                        onClick={() => setApprovalModelOpen(true)} 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Approval
                    </Button>
                }
            >
                <EnhancedDataTable
                    data={approvals}
                    columns={approvalColumns}
                    actions={approvalActions}
                    loading={false}
                    noDataMessage="No approvals for this request"
                    hideEmptyMessage={true}
                />
            </EnhancedCard>

                {/* Modals */}
                <ApprovalModel
                    open={approvalModelOpen}
                    onClose={() => setApprovalModelOpen(false)}
                    onCreated={approvalCreated}
                    requestId={request?.id}
                />
                <AttachmentModel
                    open={attachmentModelOpen}
                    onClose={() => setAttachmentModelOpen(false)}
                    onUploaded={attachmentUploaded}
                    requestId={request?.id}
                />

            {/* Edit Request Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-slate-100">Edit Task Request</DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            Update task request data and information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-request_type" className="text-slate-700 dark:text-slate-300 font-medium">Request Type</Label>
                            <Select value={editFormData.request_type} onValueChange={(value) => setEditFormData(prev => ({ ...prev, request_type: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {requestTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-contractor_name" className="text-slate-700 dark:text-slate-300 font-medium">Contractor</Label>
                            <Select value={editFormData.contractor_name} onValueChange={(value) => setEditFormData(prev => ({ ...prev, contractor_name: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {contractors.map(contractor => (
                                        <SelectItem key={contractor} value={contractor} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {contractor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-project_name" className="text-slate-700 dark:text-slate-300 font-medium">Project</Label>
                            <Select value={editFormData.project_name} onValueChange={(value) => setEditFormData(prev => ({ ...prev, project_name: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {projects.map(project => (
                                        <SelectItem key={project} value={project} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {project}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-priority" className="text-slate-700 dark:text-slate-300 font-medium">Priority</Label>
                            <Select value={editFormData.priority} onValueChange={(value) => setEditFormData(prev => ({ ...prev, priority: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    {priorities.map(priority => (
                                        <SelectItem key={priority.value} value={priority.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                            {priority.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="edit-description" className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editFormData.description}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-notes" className="text-slate-700 dark:text-slate-300 font-medium">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={editFormData.notes}
                                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsEditDialogOpen(false)}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUpdate} 
                                disabled={isLoading}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {isLoading ? 'Updating...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-slate-100">Change Request Status</DialogTitle>
                        <DialogDescription className="text-slate-600 dark:text-slate-400">
                            Update the status of the task request
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">New Status</Label>
                            <Select value={statusFormData.status} onValueChange={(value) => setStatusFormData(prev => ({ ...prev, status: value }))}>
                                <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    <SelectItem value="Pending" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="Approved" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                        Approved
                                    </SelectItem>
                                    <SelectItem value="Rejected" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                        Rejected
                                    </SelectItem>
                                    <SelectItem value="Complete" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                        Complete
                                    </SelectItem>
                                    <SelectItem value="Closed" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200">
                                        Closed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-300 font-medium">Remarks</Label>
                            <Textarea
                                id="remarks"
                                value={statusFormData.remarks}
                                onChange={(e) => setStatusFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                placeholder="Add remarks for status change"
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button 
                                variant="outline" 
                                onClick={() => setIsStatusDialogOpen(false)}
                                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleStatusChange} 
                                disabled={isLoading || !statusFormData.status}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                {isLoading ? 'Updating...' : 'Update Status'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modals */}
            <ApprovalModel
                open={approvalModelOpen}
                onClose={() => setApprovalModelOpen(false)}
                onCreated={approvalCreated}
                requestId={request?.id}
            />
            <AttachmentModel
                open={attachmentModelOpen}
                onClose={() => setAttachmentModelOpen(false)}
                onUploaded={attachmentUploaded}
                requestId={request?.id}
            />
        </div>
    );
}

/* =========================================================
   Page Wrapper
=========================================================== */
export default function Page() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading details...</p>
                </Centered>
            }
        >
            <TaskDetails />
        </Suspense>
    );
}
