'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { AppDispatch, RootState } from '@/stores/store';
import {
    fetchTaskRequest,
    clearSelectedTaskRequest,
    selectSelectedTaskRequest,
    selectLoading as selectRequestLoading,
    selectError as selectRequestError,
} from '@/stores/slices/tasks_requests';
import {
    fetchProject,
    clearSelectedProject,
    selectSelectedProject,
    selectLoading as selectProjectsLoading,
} from '@/stores/slices/projects';
import {
    clearSelectedUser,
    selectSelectedUser,
    selectLoading as selectUsersLoading,
} from '@/stores/slices/users';
import {
    fetchAttachments,
    clearAttachments,
    selectAttachments,
    selectAttachmentsLoading,
    selectAttachmentsError,
    removeAttachment,
} from '@/stores/slices/attachments';
import { toast } from "sonner";
import axios from "@/utils/axios";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    ArrowLeft,
    Download,
    Plus,
    Eye,
    Trash2,
    Phone,
    Mail,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { AttachmentsList } from '@/components/attachments/AttachmentsList';
import { CreateAttachmentForm } from '@/components/attachments/CreateAttachmentForm';
import { UpdateAttachmentForm } from '@/components/attachments/UpdateAttachmentForm';
import ApprovalModel from '@/components/ApprovalModel';
import type { Attachment as AttachmentType } from '@/stores/types/attachments';

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
        'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Inactive': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        'Stopped': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        'Onhold': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        'Draft': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        'Suspended': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        'Submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

const getProjectTypeColor = (type?: string) => {
    if (!type) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    const colors: Record<string, string> = {
        'Public': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Communications': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        'Restoration': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Referral': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    };
    return colors[type] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

/* =========================================================
   Types
=========================================================== */

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
   Reusable UI Components
=========================================================== */
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        {children}
    </div>
);

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right">{value || 'N/A'}</span>
    </div>
);

/* =========================================================
   Main Component
=========================================================== */
function ProjectRequestDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const dispatch = useAppDispatch();

    // Redux Selectors
    const request = useAppSelector(selectSelectedTaskRequest);
    const requestLoading = useAppSelector(selectRequestLoading);
    const requestError = useAppSelector(selectRequestError);

    const project = useAppSelector(selectSelectedProject);
    const projectLoading = useAppSelector(selectProjectsLoading);

    const user = useAppSelector(selectSelectedUser);
    const userLoading = useAppSelector(selectUsersLoading);
    const userError = useAppSelector((state: RootState) => state.users.error);

    // Attachments Redux State
    const attachments = useAppSelector(selectAttachments);
    const attachmentsLoading = useAppSelector(selectAttachmentsLoading);
    const attachmentsError = useAppSelector(selectAttachmentsError);

    // Local State
    const [attachmentModelOpen, setAttachmentModelOpen] = useState(false);
    const [updateAttachmentModelOpen, setUpdateAttachmentModelOpen] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<AttachmentType | null>(null);
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [approvalModelOpen, setApprovalModelOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);


    // Fetch request data
    useEffect(() => {
        if (!id) {
            toast.error('Request ID is missing');
            router.push('/requests/projects');
            return;
        }
        dispatch(fetchTaskRequest({ id }));
        return () => {
            dispatch(clearSelectedTaskRequest());
        };
    }, [id, router, dispatch]);

    // Fetch project data
    useEffect(() => {
        if (request?.task_order_id) {
            dispatch(fetchProject({ id: request.task_order_id }));
        }
        return () => {
            dispatch(clearSelectedProject());
        };
    }, [request, dispatch]);

    // Fetch user data (creator) - Try multiple endpoints
    useEffect(() => {
        if (request?.created_id) {
            const fetchUserData = async () => {
                try {
                    const response1 = await axios.get(`/users/fetch/${request.created_id}`);
                    
                    if (response1.data?.body?.user) {
                        dispatch({
                            type: 'users/fetchUser/fulfilled',
                            payload: {
                                header: response1.data.header,
                                body: {
                                    users: {
                                        items: [response1.data.body.user],
                                        total: 1,
                                        pages: 1
                                    }
                                }
                            }
                        } as any);
                        return;
                    }
                } catch (error1: any) {
                }
            };
            
            fetchUserData();
        }
        return () => {
            dispatch(clearSelectedUser());
        };
    }, [request?.created_id, dispatch]);

    // Fetch attachments using Redux
    useEffect(() => {
        if (!id) return;
        dispatch(fetchAttachments(id));
        return () => {
            dispatch(clearAttachments());
        };
    }, [id, dispatch]);

    // Fetch approvals
    useEffect(() => {
        if (!id) return;
        axios.get(`/approvals/fetch/${id}`)
            .then((res) => setApprovals(res.data.body?.approvals?.items || []))
            .catch(() => toast.error("Failed to load approvals"));
    }, [id]);

    // Handle errors
    useEffect(() => {
        if (requestError) toast.error(requestError);
        if (attachmentsError) toast.error(attachmentsError);
    }, [requestError, attachmentsError]);

    // Combined loading
    const loading = requestLoading || projectLoading || isLoading;

    if (loading && !request) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
            </Centered>
        );
    }

    if (requestError) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">{requestError}</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/requests/projects')}
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
                <p className="text-rose-600 dark:text-rose-400">Project request not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/requests/projects')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Requests
                </Button>
            </Centered>
        );
    }

    // Handlers
    const handleAttachmentCreated = () => {
        if (id) {
            dispatch(fetchAttachments(id));
        }
    };

    const handleAttachmentUpdated = () => {
        if (id) {
            dispatch(fetchAttachments(id));
        }
    };

    const handleAttachmentDelete = (attachmentId: string) => {
        dispatch(removeAttachment(attachmentId));
    };

    const handleEditAttachment = (attachment: AttachmentType) => {
        setSelectedAttachment(attachment);
        setUpdateAttachmentModelOpen(true);
    };

    const approvalCreated = (approval: Approval) => setApprovals(prev => [...prev, approval]);



    const approvalColumns: Column<Approval>[] = [
        {
            key: 'sequence',
            header: 'Sequence',
            render: (value: any) => <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">{value || '-'}</span>
        },
        {
            key: 'created_name',
            header: 'Created By',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
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
            key: 'title' as any,
            header: 'Title',
            render: (value: any) => <span className="font-medium text-slate-800 dark:text-slate-200">{value || '-'}</span>
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
            key: 'created_at',
            header: 'Date',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value ? value : 'N/A'}</span>
            )
        }
    ];

    // User columns for table
    const userColumns: Column<any>[] = [
        {
            key: 'number' as any,
            header: 'User Number',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || 'N/A'}</span>
        },
        {
            key: 'name' as any,
            header: 'Full Name',
            render: (value: any, row: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {`${row?.name || ''} ${row?.surname || ''}`.trim() || 'N/A'}
                </span>
            )
        },
        {
            key: 'email' as any,
            header: 'Email',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {value || 'N/A'}
                </span>
            )
        },
        {
            key: 'phone' as any,
            header: 'Phone',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {value || 'N/A'}
                </span>
            )
        },
        {
            key: 'role' as any,
            header: 'Role',
            render: (value: any) => (
                <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                    {value || 'N/A'}
                </Badge>
            )
        },
        {
            key: 'type' as any,
            header: 'Type',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || 'N/A'}</span>
        },
        {
            key: 'status' as any,
            header: 'Status',
            render: (value: any) => (
                <Badge variant="outline" className={`${getStatusColor(value || '')} font-medium`}>
                    {value || 'N/A'}
                </Badge>
            )
        },
        {
            key: 'created_at' as any,
            header: 'Created At',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value ? value : 'N/A'}</span>
            )
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
                        Project Request Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the project request with available actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/requests/projects')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Requests
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Request Code"
                    description="Request code"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {request.request_code || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Request Type"
                    description="Type of request"
                    variant="default"
                    size="sm"
                >
                    <div className="text-xl md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {request.request_type || 'Projects'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Request Status"
                    description="Status and workflow stage of the request"
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-2 text-xl md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {request.status ? (
                            <Badge variant="outline" className={getStatusColor(request.status)}>
                                {request.status}
                            </Badge>
                        ) : 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Created At"
                    description="Request creation date"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {request.created_at}
                    </div>
                </EnhancedCard>
            </div>


            {/* Creator User Information Table */}
            <EnhancedCard
                title="Creator Information"
                description={user ? "User who created this request" : userLoading ? "Loading user data..." : "User information"}
                variant="default"
                size="sm"
            >
                {userError && (
                    <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg">
                        <p className="text-sm text-rose-700 dark:text-rose-300">
                            Error loading user: {userError}
                        </p>
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                            User ID: {request?.created_id || 'N/A'}
                        </p>
                    </div>
                )}
                {!user && !userLoading && !userError && request?.created_id && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            No user data found for ID: {request.created_id}
                        </p>
                    </div>
                )}
                <EnhancedDataTable
                    data={user ? [user] : []}
                    columns={userColumns}
                    actions={[]}
                    loading={userLoading}
                    noDataMessage={
                        userLoading 
                            ? "Loading user data..." 
                            : userError 
                                ? `Error: ${userError}` 
                                : request?.created_id 
                                    ? `User information not available (ID: ${request.created_id})` 
                                    : "No user ID found in request"
                    }
                    hideEmptyMessage={false}
                />
            </EnhancedCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Project Information */}
                {project && (
                    <EnhancedCard
                        title="Project Information"
                        description="Project details and information"
                        variant="default"
                        size="sm"
                        headerActions={
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/projects/details?id=${project.id}`)}
                                className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Project Details
                            </Button>
                        }
                    >
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                            <Detail label="Project ID" value={project.sequence} />
                            <Detail label="Project Number" value={project.number} />
                            <Detail label="Project Name" value={project.name} />
                            <Detail
                                label="Project Type"
                                value={
                                    project.type ? (
                                        <Badge variant="outline" className={getProjectTypeColor(project.type)}>
                                            {project.type}
                                        </Badge>
                                    ) : 'N/A'
                                }
                            />
                            <Detail
                                label="Status"
                                value={
                                    project.status ? (
                                        <Badge variant="outline" className={getStatusColor(project.status)}>
                                            {project.status}
                                        </Badge>
                                    ) : 'N/A'
                                }
                            />
                            <Detail label="Created At" value={project.created_at} />
                            {project.updated_at && (
                                <Detail label="Updated At" value={project.updated_at} />
                            )}
                        </div>
                    </EnhancedCard>
                )}


                {/* Request Details */}
                <EnhancedCard
                    title="Request Details"
                    description="Request information and notes"
                    variant="default"
                    size="sm"
                >
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        <Detail label="Request Code" value={request.request_code} />
                        <Detail label="Request Type" value={request.request_type || 'Projects'} />
                        <Detail label="Status" value={
                            <Badge variant="outline" className={getStatusColor(request.status || 'Pending')}>
                                {request.status || 'N/A'}
                            </Badge>
                        } />
                        <Detail label="Created By" value={request.created_by_name} />
                        <Detail label="Created At" value={request.created_at} />
                        <Detail label="Updated At" value={request.updated_at} />
                        {request.notes && (
                            <div className="py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200 block mb-2">Notes</span>
                                <p className="text-slate-600 dark:text-slate-400">{request.notes}</p>
                            </div>
                        )}
                    </div>
                </EnhancedCard>
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
                <AttachmentsList
                    attachments={attachments}
                    loading={attachmentsLoading}
                    onDelete={handleAttachmentDelete}
                    onEdit={handleEditAttachment}
                    requestId={id || undefined}
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
            <CreateAttachmentForm
                open={attachmentModelOpen}
                onClose={() => setAttachmentModelOpen(false)}
                onSuccess={handleAttachmentCreated}
                requestId={id || ''}
                requestType={request?.request_type || 'Projects'}
            />
            <UpdateAttachmentForm
                open={updateAttachmentModelOpen}
                onClose={() => {
                    setUpdateAttachmentModelOpen(false);
                    setSelectedAttachment(null);
                }}
                onSuccess={handleAttachmentUpdated}
                attachment={selectedAttachment}
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
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
                </Centered>
            }
        >
            <ProjectRequestDetails />
        </Suspense>
    );
}

