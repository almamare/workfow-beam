'use client'; // Marks this as a Client Component in Next.js

import { useEffect, Suspense} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
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
import { toast } from 'sonner';

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
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

// Typed dispatch hook for Redux with TypeScript
const useAppDispatch = () => useDispatch<AppDispatch>();

// Maps status to badge classes (dark/light)
const statusBadgeClasses = (status: string) =>
    status === 'Active'
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
        : status === 'Pending'
        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        : status === 'Onhold'
        ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        : status === 'Closed'
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        : status === 'Cancelled'
        ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        : 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';

// Main Component
function TaskOrderDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const dispatch = useAppDispatch();

    // Redux selectors
    const order = useSelector(selectSelectedTaskOrder);
    const contractor = useSelector(selectSelectedContractor);
    const project = useSelector(selectSelectedProject);
    const documents = useSelector(selectSelectedDocuments);
    const contractTerms = useSelector(selectSelectedContractTerms);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    // Fetch task order on mount
    useEffect(() => {
        if (!id) {
            toast.error('Missing task order ID');
            router.push('/tasks');
            return;
        }
        dispatch(fetchTaskOrder({ id }));
        return () => { dispatch(clearSelectedTaskOrder()); };
    }, [id, router, dispatch]);

    useEffect(() => { if (error) toast.error(error); }, [error]);

    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading task order...</p>
            </Centered>
        );
    }

    if (error) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">{error}</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/tasks')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
                </Button>
            </Centered>
        );
    }

    if (!order) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">Task order not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/tasks')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tasks
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Task Order Details
                    </h1>
                    {order.task_order_no && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Order No: {order.task_order_no}</p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Review task order data and related info.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/tasks')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    Back to Tasks
                </Button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Order Title" description={order.task_order_no} variant="default" size="sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{order.title}</div>
                </EnhancedCard>
                <EnhancedCard title="Status" description={order.issue_date} variant="default" size="sm">
                    <Badge className={statusBadgeClasses(order.status)}>{order.status}</Badge>
                </EnhancedCard>
                <EnhancedCard title="Contractor" description={contractor?.number} variant="default" size="sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{order.contractor_name}</div>
                </EnhancedCard>
                <EnhancedCard title="Dates" description={formatDate(order.updated_at)} variant="default" size="sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{formatDate(order.created_at)}</div>
                </EnhancedCard>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {project && (
                    <EnhancedCard title="Project Information" description="Details about the associated project" variant="default" size="sm">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            <Detail label="Project Name" value={project.name} />
                            <Detail label="Client" value={project.client_name} />
                            <Detail label="Number" value={project.number} />
                            <Detail label="Project Code" value={project.project_code} />
                            <Detail label="Status" value={project.status} />
                            <Detail label="Start Date" value={formatDate(project.start_date)} />
                            <Detail label="End Date" value={formatDate(project.end_date)} />
                            <Detail label="Created At" value={formatDate(project.created_at)} />
                        </div>
                    </EnhancedCard>
                )}

                {contractor && (
                    <EnhancedCard title="Contractor Information" description="Details about the contractor" variant="default" size="sm">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            <Detail label="Name" value={contractor.name} />
                            <Detail label="Number" value={contractor.number} />
                            <Detail label="Email" value={contractor.email} />
                            <Detail label="Phone" value={contractor.phone} />
                            <Detail label="Status" value={contractor.status} />
                            <Detail label="Bank" value={contractor.bank_name} />
                            <Detail label="Account" value={String(contractor.bank_account)} />
                            <Detail label="Created At" value={formatDate(contractor.created_at)} />
                        </div>
                    </EnhancedCard>
                )}

                {documents.length > 0 && (
                    <EnhancedCard title="Documents" description="Attached task order documents" variant="default" size="sm">
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <Detail
                                    key={doc.id}
                                    label={doc.title}
                                    value={
                                        <a
                                            href={doc.file}
                                            target="_blank"
                                            className="text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View File
                                        </a>
                                    }
                                />
                            ))}
                        </div>
                    </EnhancedCard>
                )}

                {contractTerms.length > 0 && (
                    <EnhancedCard title="Contract Terms" description="Terms associated with this order" variant="default" size="sm">
                        <div className="space-y-2">
                            {contractTerms.map((term) => (
                                <Detail key={term.id} label={term.titel} value={term.description} />
                            ))}
                        </div>
                    </EnhancedCard>
                )}
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <EnhancedCard title="Project Description" description="Details about the associated project" variant="default" size="sm">
                    <p className="text-slate-700 dark:text-slate-300">{project?.description || 'N/A'}</p>
                </EnhancedCard>
                <EnhancedCard title="Task Order Description" description="Details about this task order" variant="default" size="sm">
                    <p className="text-slate-700 dark:text-slate-300">{order.description || 'N/A'}</p>
                </EnhancedCard>
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

// Detail Row Component (branded colors)
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right">{value || 'N/A'}</span>
    </div>
);

// Date Formatting Helper (consistent locale)
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

/* =========================================================
   Page Wrapper
=========================================================== */
export default function Page() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
                </Centered>
            }
        >
            <TaskOrderDetails />
        </Suspense>
    );
}