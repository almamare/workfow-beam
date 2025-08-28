'use client'; // Marks this as a Client Component in Next.js

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/stores/store';
import {
    fetchTaskOrder,
    clearSelectedTaskOrder,
    selectSelectedTaskOrder,
    selectSelectedContractor,
    selectSelectedProject,
    selectSelectedDocuments,
    selectSelectedContractTerms,
    selectTaskOrdersLoading as selectLoading,
    selectTaskOrdersError as selectError,
} from '@/stores/slices/task-orders';
import { toast } from 'sonner'; // For displaying notifications

// UI Components
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Loader2,
    ArrowLeft,
    ClipboardList,
    ExternalLink,
    User,
    File,
    Calendar,
    CircleCheckBig
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb'; // Navigation breadcrumb component

// Typed dispatch hook for Redux with TypeScript
const useAppDispatch = () => useDispatch<AppDispatch>();

// Maps status values to corresponding visual variants for badges
const statusVariant = (status: string) =>
    status === 'Active' ? 'completed' :
        status === 'Pending' ? 'pending' :
            status === 'Onhold' ? 'onhold' :
                status === 'Closed' ? 'draft' :
                    status === 'Cancelled' ? 'rejected' : 'outline';

// Main Component
export default function TaskOrderDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id'); // Get task order ID from URL query parameters

    const dispatch = useAppDispatch();

    // Redux selectors to get data from the store
    const order = useSelector(selectSelectedTaskOrder);
    const contractor = useSelector(selectSelectedContractor);
    const project = useSelector(selectSelectedProject);
    const documents = useSelector(selectSelectedDocuments);
    const contractTerms = useSelector(selectSelectedContractTerms);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    // Fetch task order on component mount
    useEffect(() => {
        if (!id) {
            toast.error('Missing task order ID');
            router.push('/orders/tasks');
            return;
        }

        dispatch(fetchTaskOrder({ id }));

        // Cleanup: Clear selected task order when component unmounts
        return () => {
            dispatch(clearSelectedTaskOrder());
        };
    }, [id, router, dispatch]);

    // Show error toast if there's an error
    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    // Loading state
    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading task order...</p>
            </Centered>
        );
    }

    // Error state
    if (error) {
        return (
            <Centered>
                <p className="text-destructive">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/orders/tasks')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>
            </Centered>
        );
    }

    // No order found state
    if (!order) {
        return (
            <Centered>
                <p className="text-destructive">Task order not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/orders/tasks')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Section */}
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Task Order Details
                    </h1>
                    {order.task_order_no && (
                        <p className="text-muted-foreground mt-1">
                            Order No: {order.task_order_no}
                        </p>
                    )}
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/tasks')}
                >
                    Back to Orders
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Order Title"
                    icon={ClipboardList}
                    value={order.title}
                    sub={order.task_order_no}
                />
                <StatCard
                    title="Status"
                    icon={CircleCheckBig}
                    value={<Badge variant={statusVariant(order.status)}>{order.status}</Badge>}
                    sub={order.issue_date}
                />
                <StatCard
                    title="Contractor"
                    icon={User}
                    value={order.contractor_name}
                    sub={contractor?.number}
                />
                <StatCard
                    title="Dates"
                    icon={Calendar}
                    value={formatDate(order.created_at)}
                    sub={formatDate(order.updated_at)}
                />
            </div>

            {/* Detailed Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Project Information Card */}
                {project && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Information</CardTitle>
                            <CardDescription>Details about the associated project</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Detail label="Project Name" value={project.name} />
                            <Detail label="Client" value={project.client_name} />
                            <Detail label="Number" value={project.number} />
                            <Detail label="Project Code" value={project.project_code} />
                            <Detail label="Status" value={project.status} />
                            <Detail label="Start Date" value={formatDate(project.start_date)} />
                            <Detail label="End Date" value={formatDate(project.end_date)} />
                            <Detail label="Created At" value={project.created_at} />
                        </CardContent>
                    </Card>
                )}

                {/* Contractor Information Card */}
                {contractor && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Contractor Information</CardTitle>
                            <CardDescription>Details about the contractor</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Detail label="Name" value={contractor.name} />
                            <Detail label="Number" value={contractor.number} />
                            <Detail label="Email" value={contractor.email} />
                            <Detail label="Phone" value={contractor.phone} />
                            <Detail label="Status" value={contractor.status} />
                            <Detail label="Bank" value={contractor.bank_name} />
                            <Detail label="Account" value={contractor.bank_account} />
                            <Detail label="Created At" value={contractor.created_at} />
                        </CardContent>
                    </Card>
                )}

                {/* Documents Card */}
                {documents.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Attached task order documents</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {documents.map((doc) => (
                                <Detail
                                    key={doc.id}
                                    label={doc.title}
                                    value={
                                        <a
                                            href={doc.file}
                                            target="_blank"
                                            className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            View File
                                        </a>
                                    }
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Contract Terms Card */}
                {contractTerms.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Terms</CardTitle>
                            <CardDescription>Terms associated with this order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {contractTerms.map((term) => (
                                <Detail
                                    key={term.id}
                                    label={term.titel}
                                    value={term.description}
                                />
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Description Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Project Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Project Description</CardTitle>
                        <CardDescription>Details about the associated project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{project?.description}</p>
                    </CardContent>
                </Card>

                {/* Task Order Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Order Description</CardTitle>
                        <CardDescription>Details about this task order</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{order.description}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Centered Layout Component for states
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        {children}
    </div>
);

// Statistics Card Component
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
            {sub && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>
            )}
        </CardContent>
    </Card>
);

// Detail Row Component
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="font-medium text-sm md:text-base">{label}:</span>
        <span className="text-muted-foreground text-xs md:text-sm max-w-[250px] truncate text-right">
            {value || 'N/A'}
        </span>
    </div>
);

// Date Formatting Helper
function formatDate(dateString?: string) {
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
}