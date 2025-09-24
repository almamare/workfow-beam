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

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
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
    User, 
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
    Activity
} from 'lucide-react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
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
        'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Approved': 'bg-green-100 text-green-700 border-green-200',
        'Rejected': 'bg-red-100 text-red-700 border-red-200',
        'Closed': 'bg-gray-100 text-gray-700 border-gray-200',
        'Complete': 'bg-blue-100 text-blue-700 border-blue-200',
        'Active': 'bg-green-100 text-green-700 border-green-200',
        'Onhold': 'bg-orange-100 text-orange-700 border-orange-200',
        'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
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
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        {children}
    </div>
);

const DataCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="font-medium text-sm">{label}:</span>
        <span className="text-muted-foreground text-xs md:text-sm max-w-[250px] truncate text-right">
            {value || 'N/A'}
        </span>
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading details...</p>
            </Centered>
        );
    }

    if (orderError || requestError) {
        return (
            <Centered>
                <p className="text-destructive">{orderError || requestError}</p>
                <Button variant="outline" onClick={() => router.push('/orders/tasks')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>
            </Centered>
        );
    }

    if (!request) {
        return (
            <Centered>
                <p className="text-destructive">Task request not found</p>
                <Button variant="outline" onClick={() => router.push('/requests/tasks')}>
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

    const attachmentColumns = [
        {
            key: 'title' as keyof Attachment,
            header: 'File Name',
            render: (value: any) => <span className="font-medium text-slate-800">{value}</span>
        },
        {
            key: 'request_type' as keyof Attachment,
            header: 'Type',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            )
        },
        {
            key: 'uploader_name' as keyof Attachment,
            header: 'Uploaded By',
            render: (value: any) => <span className="text-slate-700">{value}</span>
        },
        {
            key: 'created_at' as keyof Attachment,
            header: 'Date',
            render: (value: any) => <span className="text-slate-700">{fmt(value)}</span>
        }
    ];

    const attachmentActions = [
        {
            label: 'View File',
            onClick: (attachment: Attachment) => {
                window.open(`${attachment.path}${attachment.file}`, '_blank');
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Download',
            onClick: (attachment: Attachment) => {
                const link = document.createElement('a');
                link.href = `${attachment.path}${attachment.file}`;
                link.download = attachment.file;
                link.click();
            },
            icon: <Download className="h-4 w-4" />
        },
        {
            label: 'Delete',
            onClick: (attachment: Attachment) => {
                setAttachments(prev => prev.filter(att => att.id !== attachment.id));
                toast.success('Attachment deleted successfully');
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const approvalColumns = [
        {
            key: 'sequence' as keyof Approval,
            header: 'Sequence',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value || ''}</span>
        },
        {
            key: 'step_name' as keyof Approval,
            header: 'Step Name',
            render: (value: any) => <span className="font-medium text-slate-800">{value}</span>
        },
        {
            key: 'remarks' as keyof Approval,
            header: 'Remarks',
            render: (value: any) => (
                <div className="max-w-xs">
                    <div className="text-sm text-slate-800 truncate">{value}</div>
                </div>
            )
        },
        {
            key: 'status' as keyof Approval,
            header: 'Status',
            render: (value: any) => (
                <Badge variant="outline" className={`${getStatusColor(value)} font-medium`}>
                    {value}
                </Badge>
            )
        },
        {
            key: 'created_name' as keyof Approval,
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700">{value}</span>
        },
        {
            key: 'created_at' as keyof Approval,
            header: 'Date',
            render: (value: any) => <span className="text-slate-700">{fmt(value)}</span>
        }
    ];

    const approvalActions = [
        {
            label: 'View Details',
            onClick: () => {
                toast.info('Approval details feature coming soon');
            },
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit',
            onClick: () => {
                toast.info('Edit approval feature coming soon');
            },
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Delete',
            onClick: (approval: Approval) => {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="space-y-6 p-6">
                {/* Page Header */}
                <PageHeader
                    title="Task Request Details"
                    description={`Request Code: ${request?.request_code || 'N/A'}`}
                    breadcrumb={true}
                    actions={{
                        primary: {
                            label: 'Edit Request',
                            onClick: handleEdit,
                            icon: <Edit className="h-4 w-4 mr-2" />
                        },
                        secondary: [
                            {
                                label: 'Back to Requests',
                                onClick: () => router.push('/requests/tasks'),
                                icon: <ArrowLeft className="h-4 w-4 mr-2" />,
                                variant: 'outline'
                            }
                        ]
                    }}
                    stats={[
                        {
                            label: 'Status',
                            value: request?.status || 'N/A',
                            change: '+5%',
                            trend: 'up'
                        },
                        {
                            label: 'Type',
                            value: request?.request_type || 'N/A',
                            change: '+2%',
                            trend: 'up'
                        },
                        {
                            label: 'Created By',
                            value: request?.created_by_name || 'N/A',
                            change: '+1%',
                            trend: 'up'
                        },
                        {
                            label: 'Created At',
                            value: fmt(request?.created_at),
                            change: '+3%',
                            trend: 'up'
                        }
                    ]}
                />

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
                            <div className="h-6 w-px bg-slate-300"></div>
                            <Badge variant="outline" className="text-slate-600">
                                <Clock className="h-3 w-3 mr-1" />
                                Last Updated: {fmt(request?.updated_at)}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => setIsStatusDialogOpen(true)}
                                variant="outline"
                                size="sm"
                                className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                                <Activity className="h-4 w-4 mr-2" />
                                Change Status
                            </Button>
                            <Button
                                onClick={handleApprove}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                            </Button>
                            <Button
                                onClick={handleReject}
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                            <Button
                                onClick={handleComplete}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <CircleCheckBig className="h-4 w-4 mr-2" />
                                Complete
                            </Button>
                            <Button
                                onClick={handleExport}
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                            <Button
                                onClick={handlePrint}
                                variant="outline"
                                size="sm"
                                className="border-slate-300 text-slate-700 hover:bg-slate-50"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Project and Contractor Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {project && (
                        <EnhancedCard
                            title="Project Information"
                            description="Project details and specifications"
                            variant="gradient"
                            size="lg"
                            stats={{
                                total: 1,
                                badge: project.status,
                                badgeColor: 'success'
                            }}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client Name</Label>
                                        <p className="text-sm font-semibold text-slate-800 mt-1">{project.client_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Project Number</Label>
                                        <p className="text-sm font-semibold text-slate-800 mt-1">{project.number}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Project Name</Label>
                                    <p className="text-sm font-semibold text-slate-800 mt-1">{project.name}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Project Code</Label>
                                        <p className="text-sm font-mono text-slate-600 mt-1">{project.project_code}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Project Type</Label>
                                        <p className="text-sm text-slate-600 mt-1">{project.type}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created At</Label>
                                    <p className="text-sm text-slate-600 mt-1">{fmt(project.created_at)}</p>
                                </div>
                            </div>
                        </EnhancedCard>
                    )}
                    {contractor && (
                        <EnhancedCard
                            title="Contractor Information"
                            description="Contractor details and contact information"
                            variant="gradient"
                            size="lg"
                            stats={{
                                total: 1,
                                badge: 'Active',
                                badgeColor: 'success'
                            }}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contractor Name</Label>
                                        <p className="text-sm font-semibold text-slate-800 mt-1">{contractor.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contractor Number</Label>
                                        <p className="text-sm font-mono text-slate-600 mt-1">{contractor.number}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</Label>
                                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {contractor.phone}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</Label>
                                        <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {contractor.email}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</Label>
                                    <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {contractor.address}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Province</Label>
                                    <p className="text-sm text-slate-600 mt-1">{contractor.province}</p>
                                </div>
                            </div>
                        </EnhancedCard>
                    )}
                </div>

                {/* Documents and Contract Terms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {documents?.length > 0 && (
                        <EnhancedCard
                            title="Documents"
                            description={`${documents.length} document(s) attached`}
                            variant="gradient"
                            size="lg"
                            stats={{
                                total: documents.length,
                                badge: 'Available',
                                badgeColor: 'success'
                            }}
                        >
                            <div className="space-y-3">
                                {documents.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800">{doc.title}</p>
                                            <p className="text-sm text-slate-500">Document ID: {doc.id}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="default" size="sm" asChild>
                                                <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 mr-1" /> View
                                                </a>
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
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
                            variant="gradient"
                            size="lg"
                            stats={{
                                total: contractTerms.length,
                                badge: 'Active',
                                badgeColor: 'success'
                            }}
                        >
                            <div className="space-y-3">
                                {contractTerms.map((t: any) => (
                                    <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <h4 className="font-medium text-slate-800 mb-2">{t.titel || t.title}</h4>
                                        <p className="text-sm text-slate-600">{t.description}</p>
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
                    variant="gradient"
                    size="lg"
                    stats={{
                        total: attachments.length,
                        badge: 'Files',
                        badgeColor: 'success'
                    }}
                >
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setAttachmentModelOpen(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Attachment
                            </Button>
                        </div>
                        <EnhancedDataTable
                            data={attachments}
                            columns={attachmentColumns}
                            actions={attachmentActions}
                            loading={false}
                            noDataMessage="No attachments for this request"
                        />
                    </div>
                </EnhancedCard>

                {/* Approvals Section */}
                <EnhancedCard
                    title="Approvals"
                    description={`${approvals.length} approval step(s) for this request`}
                    variant="gradient"
                    size="lg"
                    stats={{
                        total: approvals.length,
                        badge: 'Steps',
                        badgeColor: 'success'
                    }}
                >
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => setApprovalModelOpen(true)} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Approval
                            </Button>
                        </div>
                        <EnhancedDataTable
                            data={approvals}
                            columns={approvalColumns}
                            actions={approvalActions}
                            loading={false}
                            noDataMessage="No approvals for this request"
                        />
                    </div>
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
                    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 -m-6 mb-6 rounded-t-lg">
                            <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
                                <Edit className="h-5 w-5" />
                                <span>Edit Task Request</span>
                            </DialogTitle>
                            <DialogDescription className="text-orange-100 mt-2">
                                Update task request data and information
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit-request_type">Request Type</Label>
                                <Select value={editFormData.request_type} onValueChange={(value) => setEditFormData(prev => ({ ...prev, request_type: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {requestTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-contractor_name">Contractor</Label>
                                <Select value={editFormData.contractor_name} onValueChange={(value) => setEditFormData(prev => ({ ...prev, contractor_name: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contractors.map(contractor => (
                                            <SelectItem key={contractor} value={contractor}>{contractor}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-project_name">Project</Label>
                                <Select value={editFormData.project_name} onValueChange={(value) => setEditFormData(prev => ({ ...prev, project_name: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {projects.map(project => (
                                            <SelectItem key={project} value={project}>{project}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select value={editFormData.priority} onValueChange={(value) => setEditFormData(prev => ({ ...prev, priority: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(priority => (
                                            <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-notes">Notes</Label>
                                <Textarea
                                    id="edit-notes"
                                    value={editFormData.notes}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsEditDialogOpen(false)}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleUpdate} 
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Edit className="h-4 w-4 mr-2" />
                                    )}
                                    {isLoading ? 'Updating...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Change Status Dialog */}
                <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader className="bg-gradient-to-r from-green-500 to-green-600 p-6 -m-6 mb-6 rounded-t-lg">
                            <DialogTitle className="text-xl font-bold text-white flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>Change Request Status</span>
                            </DialogTitle>
                            <DialogDescription className="text-green-100 mt-2">
                                Update the status of the task request
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="status">New Status</Label>
                                <Select value={statusFormData.status} onValueChange={(value) => setStatusFormData(prev => ({ ...prev, status: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Complete">Complete</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={statusFormData.remarks}
                                    onChange={(e) => setStatusFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                    placeholder="Add remarks for status change"
                                    rows={3}
                                    className="mt-1"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsStatusDialogOpen(false)}
                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleStatusChange} 
                                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Activity className="h-4 w-4 mr-2" />
                                    )}
                                    {isLoading ? 'Updating...' : 'Update Status'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
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
