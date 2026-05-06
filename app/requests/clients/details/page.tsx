'use client';

import { useEffect, Suspense, useState, useCallback, useRef } from 'react';
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
    fetchClient,
    clearSelectedClient,
    selectSelectedClient,
    selectClientsLoading,
} from '@/stores/slices/clients';
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
    CheckCircle,
    XCircle,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { AttachmentsList } from '@/components/attachments/AttachmentsList';
import { UpdateAttachmentForm } from '@/components/attachments/UpdateAttachmentForm';
import { CreateAttachmentCard } from '@/components/attachments/CreateAttachmentCard';
import { ApprovalModal } from '@/components/ApprovalModal';
import type { Attachment as AttachmentType } from '@/stores/types/attachments';
import { CreateReviewForm } from '@/components/reviews/CreateReviewForm';

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
        'Draft': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        'Suspended': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        'Submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

const getClientTypeColor = (type?: string) => {
    if (!type) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('government')) {
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    if (typeLower.includes('private')) {
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

/* =========================================================
   Types
=========================================================== */

interface Approval {
    id: string;
    sequence: number;
    step_no: number;
    step_name: string;
    step_level?: string | number; // Optional field for step level
    remarks: string;
    status: string;
    created_name: string;
    approver_name?: string; // Optional field for approver name
    created_at: string;
    updated_at?: string; // Process date
    step_process?: string; // Alternative process date field
    processed_at?: string; // Alternative process date field
    approver_role: string;
    _sequenceIndex?: number; // Internal index for display (not from server)
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
function ClientRequestDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const dispatch = useAppDispatch();

    // Redux Selectors
    const request = useAppSelector(selectSelectedTaskRequest);
    const requestLoading = useAppSelector(selectRequestLoading);
    const requestError = useAppSelector(selectRequestError);

    const client = useAppSelector(selectSelectedClient);
    const clientLoading = useAppSelector(selectClientsLoading);

    const user = useAppSelector(selectSelectedUser);
    const userLoading = useAppSelector(selectUsersLoading);
    const userError = useAppSelector((state: RootState) => state.users.error);

    // Current logged in user
    const currentUser = useAppSelector((state: RootState) => state.login.user);

    // Attachments Redux State
    const attachments = useAppSelector(selectAttachments);
    const attachmentsLoading = useAppSelector(selectAttachmentsLoading);
    const attachmentsError = useAppSelector(selectAttachmentsError);

    // Local State
    const [updateAttachmentModelOpen, setUpdateAttachmentModelOpen] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<AttachmentType | null>(null);
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

    const [isLoading, setIsLoading] = useState(false);


    // Fetch request data
    useEffect(() => {
        if (!id) {
            toast.error('Request ID is missing');
            router.push('/requests/clients');
            return;
        }
        dispatch(fetchTaskRequest({ id }));
        return () => {
            dispatch(clearSelectedTaskRequest());
        };
    }, [id, router, dispatch]);

    // Fetch client data
    useEffect(() => {
        if (request?.task_order_id) {
            dispatch(fetchClient(request.task_order_id));
        }
        return () => {
            dispatch(clearSelectedClient());
        };
    }, [request, dispatch]);

    // Fetch user data (creator) - Try multiple endpoints
    useEffect(() => {
        if (request?.created_id) {

            // Try alternative endpoint first: /users/fetch/${id}
            const fetchUserData = async () => {
                try {
                    // Try endpoint 1: /users/fetch/${id} (used in update page)
                    const response1 = await axios.get(`/users/fetch/${request.created_id}`);
                    
                    if (response1.data?.body?.user) {
                        // Manually set user in Redux state
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
        } else {
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

    // Fetch approvals function
    const fetchApprovals = useCallback(async () => {
        if (!id) return;
        try {
            const res = await axios.get(`/approvals/fetch/${id}`);
            const approvalsData = res.data.body?.approvals?.items || [];
            // Add index to each approval for sequence display
            const approvalsWithIndex = approvalsData.map((approval: Approval, index: number) => ({
                ...approval,
                _sequenceIndex: index + 1
            }));
            setApprovals(approvalsWithIndex);
        } catch (error) {
            toast.error("Failed to load approvals");
        }
    }, [id]);

    // Fetch approvals
    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    // Handle errors
    useEffect(() => {
        if (requestError) toast.error(requestError);
        // Don't show toast for attachments error if it's just "no attachments" or empty list
        // Only show toast for actual errors (not empty results)
        if (attachmentsError && 
            !attachmentsError.toLowerCase().includes('no attachments') &&
            !attachmentsError.toLowerCase().includes('not found') &&
            attachmentsError !== 'Unexpected error occurred') {
            toast.error(attachmentsError);
        }
    }, [requestError, attachmentsError]);

    // Combined loading
    const loading = requestLoading || clientLoading || isLoading;

    if (loading && !request) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
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
                    onClick={() => router.push('/requests/clients')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
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
                <p className="text-rose-600 dark:text-rose-400">Client request not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/requests/clients')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
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

    const approvalCreated = async () => {
        // Refresh approvals from API
        await fetchApprovals();
    };

    // Check if current user can approve/reject
    const canApproveReject = (approval: Approval) => {
        // Check if request.created_id matches current user
        if (!currentUser || !request) return false;
        const currentUserId = (currentUser as any).user_id || (currentUser as any).id;
        if (request.created_id !== currentUserId) return false;
        
        // Check if approval status is Pending
        if (approval.status !== 'Pending') return false;
        
        return true;
    };

    // Handle approve
    const handleApprove = (approval: Approval) => {
        setSelectedApproval(approval);
        setModalAction('approve');
    };

    // Handle reject
    const handleReject = (approval: Approval) => {
        setSelectedApproval(approval);
        setModalAction('reject');
    };

    // Handle modal close
    const handleModalClose = () => {
        setSelectedApproval(null);
        setModalAction(null);
        fetchApprovals();
        if (id) {
            dispatch(fetchTaskRequest({ id }));
        }
    };


    const approvalColumns: Column<Approval>[] = [
        {
            key: 'sequence',
            header: 'Sequence',
            render: (value: any, row: Approval) => (
                <span className="text-slate-700 dark:text-slate-300 font-mono text-sm font-semibold">
                    {row._sequenceIndex || 'N/A'}
                </span>
            )
        },
        {
            key: 'approver_name',
            header: 'Approver',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300 font-mono text-sm">{value ? value : 'N/A'}</span>
        },
        {
            key: 'approver_role',
            header: 'Role',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300 font-mono text-sm">{value ? value : 'N/A'}</span>
        },
        {
            key: 'step_name',
            header: 'Step Name',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value ? value : 'N/A'}</span>
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
            header: 'Created Date',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">{value ? value : 'N/A'}</span>
            )
        },
        {
            key: 'updated_at',
            header: 'Process Date',
            render: (value: any, row: any) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                    {value || row?.step_process || row?.processed_at || 'N/A'}
                </span>
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
                        Client Request Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the client request with available actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/requests/clients')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
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
                        {request.request_type || 'Clients'}
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
                {/* Client Information */}
                {client && (
                    <EnhancedCard
                        title="Client Information"
                        description="Client details and information"
                        variant="default"
                        size="sm"
                        headerActions={
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/clients/details?id=${client.id}`)}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Client Details
                            </Button>
                        }
                    >
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                            <Detail label="Client ID" value={client.sequence} />
                            <Detail label="Client Number" value={client.client_no} />
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
                                value={client.budget ? `${client.budget} IQD` : 'N/A'}
                            />
                            {client.notes && (
                                <Detail label="Notes" value={client.notes} />
                            )}
                            <Detail label="Created At" value={client.created_at} />
                            {client.updated_at && (
                                <Detail label="Updated At" value={client.updated_at} />
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
                        <Detail label="Request Type" value={request.request_type || 'Clients'} />
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

            {/* Add Attachment Card - Fixed Card (only shown when status is Pending) */}
            {request.status === 'Pending' && (
                <EnhancedCard
                    title="Add New Document"
                    description="Upload a file attachment for this request"
                    variant="default"
                    size="sm"
                >
                    <CreateAttachmentCard
                        requestId={request?.id}
                        requestType={request?.request_type || 'Clients'}
                        onCreated={handleAttachmentCreated}
                    />
                </EnhancedCard>
            )}

            {/* Attachments Section */}
            <EnhancedCard
                title="Documents History"
                description={`${attachments.length} file(s) attached to this request`}
                variant="default"
                size="sm"
            >
                <AttachmentsList
                    attachments={attachments}
                    loading={attachmentsLoading}
                    onDelete={handleAttachmentDelete}
                    onEdit={handleEditAttachment}
                    requestId={id || undefined}
                />
            </EnhancedCard>

            {/* Add Review Card - Fixed Card (only shown when status is Pending) */}
            {request.status === 'Pending' && (
                <EnhancedCard
                    title="Add New Review"
                    description="Create a new review step for this request"
                    variant="default"
                    size="sm"
                >
                    <CreateReviewForm
                        requestId={request?.id}
                        requestType={request?.request_type || 'Clients'}
                        lastApprovalId={approvals.length > 0 ? approvals[approvals.length - 1]?.id : undefined}
                        onCreated={approvalCreated}
                    />
                </EnhancedCard>
            )}

            {/* Approvals Section */}
            <EnhancedCard
                title="Case History"
                description={`${approvals.length} approval step(s) for this request`}
                variant="default"
                size="sm"
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
            <UpdateAttachmentForm
                open={updateAttachmentModelOpen}
                onClose={() => {
                    setUpdateAttachmentModelOpen(false);
                    setSelectedAttachment(null);
                }}
                onSuccess={handleAttachmentUpdated}
                attachment={selectedAttachment}
            />
            
            {/* Approval Modal */}
            {selectedApproval && modalAction && (
                <ApprovalModal
                    open={true}
                    onClose={handleModalClose}
                    approvalId={selectedApproval.id}
                    action={modalAction}
                    requestCode={request?.request_code}
                    requestType={request?.request_type || 'Clients'}
                    creatorName={request?.created_by_name}
                    onSuccess={handleModalClose}
                />
            )}
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
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
                </Centered>
            }
        >
            <ClientRequestDetails />
        </Suspense>
    );
}

