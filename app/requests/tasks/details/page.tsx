/* =========================================================
   src/app/orders/tasks/details/page.tsx
   Task Order + Task Request Details + Attachments + Approvals
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
import { Loader2, ArrowLeft, ClipboardList, ExternalLink, User, Calendar, CircleCheckBig, HardDriveDownload } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
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
const orderStatus = (status: string) =>
    status === 'Active'
        ? 'completed'
        : status === 'Pending'
            ? 'pending'
            : status === 'Onhold'
                ? 'onhold'
                : status === 'Closed'
                    ? 'draft'
                    : status === 'Cancelled'
                        ? 'rejected'
                        : 'outline';

const requestStatus = (s: string) =>
    s === 'Approved'
        ? 'completed'
        : s === 'Rejected'
            ? 'rejected'
            : s === 'Pending'
                ? 'draft'
                : 'outline';

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

interface StatProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    value: React.ReactNode;
    sub?: string;
}
const StatCard: React.FC<StatProps> = ({ title, icon: Icon, value, sub }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-1">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-xl md:text-2xl font-bold">{value}</div>
            {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
        </CardContent>
    </Card>
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

    /* Redux Selectors */
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

    /* Local State */
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [attachmentModelOpen, setAttachmentModelOpen] = useState(false);
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [approvalModelOpen, setApprovalModelOpen] = useState(false);

    /* Fetch Task Request */
    useEffect(() => {
        if (!id) {
            toast.error('Missing task order ID');
            router.push('/orders/tasks');
            return;
        }
        dispatch(fetchTaskRequest({ id }));
        return () => {
            dispatch(clearSelectedTaskRequest());
        };
    }, [id, router, dispatch]);

    /* Fetch Task Order */
    useEffect(() => {
        if (request?.task_order_id) {
            dispatch(fetchTaskOrder({ id: request.task_order_id }));
        }
        return () => {
            dispatch(clearSelectedTaskOrder());
        };
    }, [request, dispatch]);

    /* Fetch Attachments & Approvals */
    useEffect(() => {
        if (!id) return;
        axios.get(`/attachments/fetch/${id}`)
            .then((res) => setAttachments(res.data.body.attachments))
            .catch(() => toast.error("Failed to load attachments"));

        axios.get(`/approvals/fetch/${id}`)
            .then((res) => setApprovals(res.data.body.approvals.items))
            .catch(() => toast.error("Failed to load approvals"));
    }, [id]);

    /* Handle errors */
    useEffect(() => {
        if (orderError) toast.error(orderError);
        if (requestError) toast.error(requestError);
    }, [orderError, requestError]);

    /* Combined Loading */
    const isLoading = orderLoading || requestLoading;

    if (isLoading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading details…</p>
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

    /* Attachment Uploaded Handler */
    const attachmentUploaded = (attachment: Attachment) => setAttachments([...attachments, attachment]);
    const approvalCreated = (approval: Approval) => setApprovals([...approvals, approval]);

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Task Request Details</h1>
                    {order?.task_order_no && <p className="text-muted-foreground mt-1">Task Order: {order.task_order_no}</p>}
                </div>
                <Button variant="outline" onClick={() => router.push('/requests/tasks')}>
                    Back to Requests
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {order && <StatCard title="Task Order Status" icon={CircleCheckBig} value={<Badge variant={orderStatus(order.status)}>{order.status}</Badge>} />}
                <StatCard title="Request Type" icon={ClipboardList} value={request.request_type} sub={request.request_code} />
                <StatCard title="Request Status" icon={CircleCheckBig} value={<Badge variant={requestStatus(request.status)}>{request.status}</Badge>} />
                <StatCard title="Created By" icon={User} value={request.created_by_name} sub={request.contractor_name} />
                <StatCard title="Dates" icon={Calendar} value={fmt(request.created_at)} sub={`Updated: ${fmt(request.updated_at)}`} />
            </div>

            {/* Project / Contractor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project && (
                    <DataCard title="Project">
                        <Detail label="Client Name" value={project.client_name} />
                        <Detail label="Project Name" value={project.name} />
                        <Detail label="Project Number" value={project.number} />
                        <Detail label="Project Code" value={project.project_code} />
                        <Detail label="Status" value={project.status} />
                        <Detail label="Project Type" value={project.type} />
                        <Detail label="Created At" value={fmt(project.created_at)} />
                    </DataCard>
                )}
                {contractor && (
                    <DataCard title="Contractor">
                        <Detail label="Name" value={contractor.name} />
                        <Detail label="Number" value={contractor.number} />
                        <Detail label="Province" value={contractor.province} />
                        <Detail label="Phone" value={contractor.phone} />
                        <Detail label="Email" value={contractor.email} />
                        <Detail label="Address" value={contractor.address} />
                        <Detail label="Created At" value={fmt(contractor.created_at)} />
                    </DataCard>
                )}
            </div>

            {/* Documents / Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents?.length > 0 && (
                    <DataCard title="Documents">
                        {documents.map(doc => (
                            <Detail key={doc.id} label={doc.title} value={
                                <div className="flex items-center gap-2">
                                    <Button variant="default" size="xs" asChild>
                                        <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-1" /> View
                                        </a>
                                    </Button>
                                    <Button variant="outline" size="xs" asChild>
                                        <a href={doc.file} download>
                                            <HardDriveDownload className="h-4 w-4 mr-1" /> Download
                                        </a>
                                    </Button>
                                </div>
                            } />
                        ))}
                    </DataCard>
                )}
                {contractTerms?.length > 0 && (
                    <DataCard title="Contract Terms">
                        {contractTerms.map(t => (
                            <Detail key={t.id} label={t.titel} value={t.description} />
                        ))}
                    </DataCard>
                )}
            </div>

            {/* Attachments Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg">Attachments</CardTitle>
                        <Button onClick={() => setAttachmentModelOpen(true)} variant="default">+ Add Attachment</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Uploaded By</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attachments.map((att, index) => (
                                <TableRow key={att.id} className="hover:bg-gray-50">
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{att.title}</TableCell>
                                    <TableCell>{att.request_type}</TableCell>
                                    <TableCell>{att.uploader_name}</TableCell>
                                    <TableCell>{fmt(att.created_at)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" asChild>
                                            <a href={`${att.path}${att.file}`} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4 mr-1" /> View
                                            </a>
                                        </Button>
                                        <Button size="sm" variant="outline" asChild>
                                            <a href={`${att.path}${att.file}`} download>
                                                <HardDriveDownload className="h-4 w-4 mr-1" /> Download
                                            </a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approvals Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg">Approvals</CardTitle>
                        <Button onClick={() => setApprovalModelOpen(true)} variant="default">+ Add Approval</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Sequence</TableHead>
                                <TableHead>Step No</TableHead>
                                <TableHead>Step Name</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created Name</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {approvals.map(a => (
                                <TableRow key={a.id} className="hover:bg-gray-50">
                                    <TableCell>{a.sequence}</TableCell>
                                    <TableCell>{a.step_no}</TableCell>
                                    <TableCell>{a.step_name}</TableCell>
                                    <TableCell>{a.remarks}</TableCell>
                                    <TableCell>{a.status}</TableCell>
                                    <TableCell>{a.created_name}</TableCell>
                                    <TableCell>{fmt(a.created_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                    <p className="text-muted-foreground">Loading details…</p>
                </Centered>
            }
        >
            <TaskDetails />
        </Suspense>
    );
}
