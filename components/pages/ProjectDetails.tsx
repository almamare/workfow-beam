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

    return (
        <div className="space-y-4 pb-10">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Project Details</h1>
                    <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400 text-left">
                        Manage details for <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <Button onClick={() => router.push(`/projects/tender/create?id=${projectId}`)} className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    + Create Tender
                </Button>
            </div>

            {/* Actions */}
            <EnhancedCard
                title="Project Actions"
                variant="default"
                size="sm"
            >
                <div className="flex flex-wrap gap-3 items-center justify-start">
                    <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                        <SelectTrigger className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {["Active", "Inactive", "Complete", "Stopped", "Onhold"].map((s) => (
                                <SelectItem 
                                    key={s} 
                                    value={s as ProjectStatus}
                                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                >
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* 1) Update first (primary) */}
                    <Button onClick={handleStatusUpdate} className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                        <CheckCircle2 className="w-4 h-4" /> Update Status
                    </Button>

                    {/* 2) Download Project (outline orange) */}
                    <Button
                        variant="outline"
                        onClick={() => projectId && downloadProject(projectId, 'project')}
                        disabled={projectIsDownload}
                        className="border-sky-200 hover:border-sky-300 hover:text-sky-700 text-sky-700 hover:bg-sky-50"
                    >
                        {projectIsDownload ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" /> Loading...
                            </>
                        ) : (
                            <>
                                <ArrowDownToLine className="w-4 h-4" /> Download Project
                            </>
                        )}
                    </Button>

                    {/* 3) Download Tender (outline orange) */}
                    <Button
                        variant="outline"
                        onClick={() => projectId && downloadTender(projectId, 'tender')}
                        disabled={tenderIsDownload}
                        className="border-sky-200 hover:border-sky-300 hover:text-sky-700 text-sky-700 hover:bg-sky-50"
                    >
                        {tenderIsDownload ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4" /> Loading...
                            </>
                        ) : (
                            <>
                                <ArrowDownToLine className="w-4 h-4" /> Download Tender
                            </>
                        )}
                    </Button>

                    {/* 4) Delete (outline red) */}
                    <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50" onClick={() => { setOpen(true); }}>
                        <Trash2 className="w-4 h-4" /> Delete Project
                    </Button>
                </div>
            </EnhancedCard>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Info */}
                <div className="space-y-4">
                    <EnhancedCard title="Project Information" variant="default" size="sm">
                        <DetailItem label="Project Name" value={project.name} />
                        <DetailItem label="Project Type" value={project.type} />
                        <DetailItem label="Project Status" value={<Badge variant={statusVariants[status as ProjectStatus]}>{status}</Badge>} />
                        <DetailItem label="Project Code" value={project.project_code} />
                        <DetailItem label="Project Number" value={project.number} />
                        <DetailItem label="Created At" value={formatDate(project.created_at)} />
                        <DetailItem label="Updated At" value={formatDate(project.updated_at)} />
                    </EnhancedCard>

                    <EnhancedCard title="Budget Information" variant="default" size="sm">
                        {budget ? (
                            <>
                                <BudgetItem label="Fiscal Year" value={budget.fiscal_year} />
                                <BudgetItem label="Original Budget" value={budget.original_budget} />
                                <BudgetItem label="Revised Budget" value={budget.revised_budget} />
                                <BudgetItem label="Committed Cost" value={budget.committed_cost} className="text-blue-600" />
                                <BudgetItem label="Actual Cost" value={budget.actual_cost} className="text-green-600" />
                            </>
                        ) : (
                            <p className="text-muted-foreground">No budget information available</p>
                        )}
                    </EnhancedCard>
                </div>

                {/* Tenders */}
                <EnhancedCard
                    title="Tenders List"
                    description={`Total ${totalItems} tenders found`}
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
            </div>

            {/* Description */}
            <EnhancedCard title="Project Description" variant="default" size="sm">
                <p className="prose max-w-none text-sm md:text-base text-slate-700 dark:text-slate-300">
                    {project.description || "No description available"}
                </p>
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
