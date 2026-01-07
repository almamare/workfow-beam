"use client";

import { useEffect, useState, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import {
    fetchProject,
    selectSelectedProject,
    selectSelectedProjectBudget,
    selectLoading,
    selectError,
} from "@/stores/slices/projects";
import {
    fetchTenders,
    selectTenders,
    selectTendersTotal,
    selectTendersPages,
    selectTendersLoading,
    selectTendersError,
} from "@/stores/slices/tenders";
import { AppDispatch } from "@/stores/store";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Building,
    Briefcase,
    BadgeCheck,
    Edit,
    Trash2,
    CheckCircle2,
    ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedDataTable, Column, Action } from "@/components/ui/enhanced-data-table";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Tender } from "@/stores/types/tenders";
import { DeleteDialog } from '@/components/delete-dialog';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "@/utils/axios";
import { Breadcrumb } from '@/components/layout/breadcrumb';


//————————————————————————————————————————
// Types
//————————————————————————————————————————
type ProjectStatus = "Active" | "Inactive" | "Complete" | "Stopped" | "Onhold";

//————————————————————————————————————————
// Component
//————————————————————————————————————————
function ProjectDetailsPageContent() {
    const dispatch = useDispatch<AppDispatch>();
    const params = useSearchParams();
    const router = useRouter();
    const projectId = params.get("id");

    // Pagination & search state for tenders
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");

    // Dialog helpers
    const [open, setOpen] = useState(false);
    const [tenderToDelete, setTenderToDelete] = useState<string | null>(null);

    // Project state
    const project = useSelector(selectSelectedProject);
    const budget = useSelector(selectSelectedProjectBudget);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    // Tenders state
    const tenders = useSelector(selectTenders);
    const totalItems = useSelector(selectTendersTotal);
    const totalPages = useSelector(selectTendersPages);
    const tendersLoading = useSelector(selectTendersLoading);
    const tendersError = useSelector(selectTendersError);
    const [tenderIsDownload, setTenderIsDownload] = useState(false);
    const [projectIsDownload, setProjectIsDownload] = useState(false);


    const [status, setStatus] = useState<ProjectStatus>(
        (project?.status as ProjectStatus) || "Active",
    );

    useEffect(() => {
        if (projectId) dispatch(fetchProject({ id: projectId }));
    }, [projectId, dispatch]);

    useEffect(() => {
        if (projectId)
            dispatch(
                fetchTenders({
                    projectId,
                    page,
                    limit,
                    search,
                }),
            );
    }, [projectId, page, limit, search, dispatch]);

    useEffect(() => {
        if (project?.status) setStatus(project.status as ProjectStatus);
    }, [project?.status]);

    const handleStatusUpdate = async () => {
        
        if (!projectId) return;
        try {
            await axios.put(`/projects/update/status/${projectId}`, { params: { status } });
            
            toast.success("Project status updated successfully");
            dispatch(fetchProject({ id: projectId })); // Refresh project data
        } catch (error) {
            toast.error("Failed to update project status");
        }
    };

    const handleDeleteTender = async (tenderId: string) => {
        if (!tenderId) return;
        try {
            await axios.delete(`/projects/tenders/delete/${tenderId}`);
            toast.success("Tender deleted successfully");
            if (projectId) {
                dispatch(fetchTenders({
                    projectId,
                    page,
                    limit,
                    search,
                }));
            }
        } catch (error) {
            toast.error("Failed to delete tender");
        } finally {
            setOpen(false);
        }
    };


    const downloadTender = async (projectId: string, fileName = 'Tender') => {
        setTenderIsDownload(true);
        try {
            const { data } = await axios.get(
                `/projects/download/tender/${projectId}`,
                { responseType: 'blob' },
            );

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
        } catch (err) {
            toast.error('تعذّر تحميل الفاتورة');
        } finally {
            setTenderIsDownload(false);
        }
    };

    const downloadProject = async (projectId: string, fileName = 'Project') => {
        setProjectIsDownload(true);
        try {
            const { data } = await axios.get(
                `/projects/download/project/${projectId}`,
                { responseType: 'blob' },
            );

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
        } catch (err) {
            toast.error('تعذّر تحميل المشروع');
        } finally {
            setProjectIsDownload(false);
        }
    }

    const handleDeleteProject = async () => {
        if (!projectId) return;
        try {
            await axios.delete(`/projects/delete/project/${projectId}`);
            toast.success("Project deleted successfully");
            router.push("/projects");
        } catch (error) {
            toast.error("Failed to delete project");
        } finally {
            setOpen(false);
        }
    };

    //———————————————————————————————————————
    // Table configs
    //———————————————————————————————————————
    interface TenderColumn extends Column<Tender> {}

    interface TenderAction extends Action<Tender> {}

    const tenderColumns: TenderColumn[] = [
        { key: "sequence", header: "ID", sortable: true },
        { key: "name", header: "Name", sortable: true },
        { key: "price", header: "Price", sortable: true },
        { key: "quantity", header: "Quantity", sortable: true },
        { key: "amount", header: "Amount", sortable: true },
    ];

    const tenderActions: TenderAction[] = [
        {
            label: "Edit",
            onClick: (t: Tender) => router.push(`/projects/tender/update?id=${t.id}`),
            icon: <Edit className="w-4 h-4" />,
            variant: 'warning'
        },
        {
            label: "Delete",
            onClick: (t: Tender) => {
                handleDeleteTender(t.id);
            },
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'destructive'
        },
    ];

    //———————————————————————————————————————
    // Helpers
    //———————————————————————————————————————
    const statusVariants: Record<
        ProjectStatus,
        | "completed"
        | "approved"
        | "default"
        | "outline"
        | "draft"
        | "pending"
        | "rejected"
        | "inprogress"
        | "onhold"
        | "cancelled"
        | null
        | undefined
    > = {
        Active: "completed",
        Inactive: "cancelled",
        Complete: "approved",
        Stopped: "cancelled",
        Onhold: "onhold",
    };

    if (loading || !project)
        return (
            <Centered>
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
                <span className="ml-3 text-xl text-muted-foreground">Loading project …</span>
            </Centered>
        );

    if (error)
        return (
            <Centered>
                <ErrorBox message={error} onRetry={() => projectId && dispatch(fetchProject({ id: projectId }))} />
            </Centered>
        );

            // Format DateTime helper
    const formatDateTime = (dateString?: string | null) => {
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

    // Get Status Color helper
    const getStatusColor = (status?: string) => {
        if (!status) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        const colors: Record<string, string> = {
            'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'Inactive': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
            'Complete': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Stopped': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            'Onhold': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
        };
        return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    };

    // Get Project Type Color helper
    const getProjectTypeColor = (type?: string) => {
        if (!type) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        const colors: Record<string, string> = {
            'Public': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            'Communications': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            'Restoration': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            'Referral': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
        return colors[type] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    };

    // Detail Row Component
    const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div className="flex items-start justify-between gap-4 py-2">
            <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
            <span className="text-slate-600 dark:text-slate-400 text-right">{value || 'N/A'}</span>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Project Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the project with available actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/projects')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        Back to Projects
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Project ID"
                    description="Project identifier"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {project.sequence || project.id || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Project Code"
                    description="Project code"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {project.project_code || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Project Status"
                    description="Status and workflow stage"
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-2 text-xl md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {project.status ? (
                            <Badge variant="outline" className={getStatusColor(project.status)}>
                                {project.status}
                            </Badge>
                        ) : 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Created At"
                    description="Project creation date"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatDateTime(project.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* Project Information */}
            <EnhancedCard
                title="Project Information"
                description="Project details and information"
                variant="default"
                size="sm"
                headerActions={
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/projects/update?id=${project.id}`)}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                    </Button>
                }
            >
                <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                    <Detail label="Project ID" value={project.sequence || project.id} />
                    <Detail label="Project Code" value={<span className="font-mono">{project.project_code}</span>} />
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
                    {project.description && (
                        <div className="py-2">
                            <span className="font-medium text-slate-700 dark:text-slate-200 block mb-2">Description</span>
                            <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
                        </div>
                    )}
                    <Detail label="Created At" value={formatDateTime(project.created_at)} />
                    {project.updated_at && (
                        <Detail label="Updated At" value={formatDateTime(project.updated_at)} />
                    )}
                </div>
            </EnhancedCard>

            {/* Budget Information */}
            {budget && (
                <EnhancedCard
                    title="Budget Information"
                    description="Project budget details"
                    variant="default"
                    size="sm"
                >
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        <Detail label="Fiscal Year" value={budget.fiscal_year} />
                        <Detail label="Original Budget" value={budget.original_budget || 'N/A'} />
                        <Detail label="Revised Budget" value={budget.revised_budget || 'N/A'} />
                        <Detail 
                            label="Committed Cost" 
                            value={<span className="font-semibold text-blue-600 dark:text-blue-400">{budget.committed_cost || 'N/A'}</span>} 
                        />
                        <Detail 
                            label="Actual Cost" 
                            value={<span className="font-semibold text-green-600 dark:text-green-400">{budget.actual_cost || 'N/A'}</span>} 
                        />
                    </div>
                </EnhancedCard>
            )}

            {/* Tenders */}
            <EnhancedCard
                title="Tenders List"
                description={`${totalItems} tender(s) associated with this project`}
                variant="default"
                size="sm"
            >
                <EnhancedDataTable
                    data={tenders}
                    columns={tenderColumns}
                    actions={tenderActions}
                    loading={tendersLoading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No tenders found"
                    onSearch={(term) => { setSearch(term); setPage(1); }}
                    searchPlaceholder="Search tenders..."
                />
            </EnhancedCard>

            <DeleteDialog open={open} onClose={() => setOpen(false)} onConfirm={handleDeleteProject} />
        </div>
    );
}

//————————————————————————————————————————
// Reusable UI
//————————————————————————————————————————
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">{children}</div>
);

const ErrorBox: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md text-center">
        <h3 className="font-bold text-lg">Failed to load data</h3>
        <p className="text-sm mt-1">{message}</p>
        <Button className="mt-3" variant="outline" onClick={onRetry}>
            Retry
        </Button>
    </div>
);

interface StatCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    value: React.ReactNode;
    sub?: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, icon: Icon, value, sub }) => (
    <EnhancedCard title={title} variant="default" size="sm">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
        {sub && <p className="text-xs mt-2 truncate text-slate-500 dark:text-slate-400">{sub}</p>}
    </EnhancedCard>
);

interface DataCardProps {
    title: string;
    children: React.ReactNode;
}
const DataCard: React.FC<DataCardProps> = ({ title, children }) => (
    <EnhancedCard title={title} variant="default" size="sm">
        {children}
    </EnhancedCard>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b text-left">
        <span className="font-medium text-slate-700 dark:text-slate-100 text-sm md:text-base">{label}:</span>
        <span className="text-left truncate max-w-[200px] text-xs md:text-sm text-slate-600 dark:text-slate-400">
            {value ?? "N/A"}
        </span>
    </div>
);

const BudgetItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = "" }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="font-medium text-slate-700 dark:text-slate-100 text-sm md:text-base">{label}:</span>
        <span className={`font-semibold text-xs md:text-sm ${className} text-slate-800 dark:text-slate-100`}>{value || "0"}</span>
    </div>
);

//————————————————————————————————————————
// Utilities
//————————————————————————————————————————
function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "N/A";
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "Invalid date";
    }
}

export default function ProjectDetailsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading project...</div>}>
            <ProjectDetailsPageContent />
        </Suspense>
    );
}
