"use client";

import { useEffect, useState } from "react";
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
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
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
import { DataTable, Column, Action } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
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

//————————————————————————————————————————
// Types
//————————————————————————————————————————
type ProjectStatus = "Active" | "Inactive" | "Complete" | "Stopped" | "Onhold";

//————————————————————————————————————————
// Component
//————————————————————————————————————————
export default function ProjectDetailsPage() {
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

    const handleDeleteTender = async () => {
        toast.info("Delete tender not implemented yet.");
    };

    const handleTenderDeleteClick = (tender: Tender) => {
        setTenderToDelete(tender.id);
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
    const tenderColumns: Column<Tender>[] = [
        { key: "sequence", header: "ID", sortable: true },
        { key: "name", header: "Name", sortable: true },
        { key: "price", header: "Price", sortable: true },
        { key: "quantity", header: "Quantity", sortable: true },
        { key: "amount", header: "Amount", sortable: true },
    ];

    const tenderActions: Action<Tender>[] = [
        {
            label: "Edit",
            onClick: (t) => router.push(`/tenders/edit?id=${t.id}`),
            icon: <Edit className="w-4 h-4" />,
        },
        {
            label: "Delete",
            onClick: handleTenderDeleteClick,
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
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
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Project Details</h1>
                    <p className="text-muted-foreground mt-2 text-sm md:text-base">
                        Manage details for <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <Button onClick={() => router.push(`/projects/tender/create?id=${projectId}`)} className="flex items-center gap-2">
                    + Create Tender
                </Button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Project Name" icon={Building} value={project.name} sub={project.client_name} />
                <StatCard title="Project Type" icon={Briefcase} value={project.type} sub={`#${project.sequence}`} />
                <StatCard
                    title="Project Status"
                    icon={BadgeCheck}
                    value={<Badge variant={statusVariants[status]}>{status}</Badge>}
                    sub={project.created_at ? formatDate(project.created_at) : "N/A"}
                />
            </div>

            {/* Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Project Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3 items-center">
                        <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {(["Active", "Inactive", "Complete", "Stopped", "Onhold"] as ProjectStatus[]).map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {s}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleStatusUpdate} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Update Status
                        </Button>

                        <Button variant="outline" className="flex items-center gap-2" onClick={() => projectId && downloadTender(projectId, 'tender')} disabled={tenderIsDownload}>
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
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => projectId && downloadProject(projectId, 'project')} disabled={projectIsDownload}>
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
                        <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => { setOpen(true); }}>
                            <Trash2 className="w-4 h-4" /> Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Info */}
                <div className="space-y-4">
                    <DataCard title="Project Information">
                        <DetailItem label="Project Code" value={project.project_code} />
                        <DetailItem label="Project Number" value={project.number} />
                        <DetailItem label="Start Date" value={formatDate(project.start_date)} />
                        <DetailItem label="End Date" value={formatDate(project.end_date)} />
                        <DetailItem label="Created At" value={formatDate(project.created_at)} />
                        <DetailItem label="Updated At" value={formatDate(project.updated_at)} />
                    </DataCard>

                    <DataCard title="Budget Information">
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
                    </DataCard>
                </div>

                {/* Tenders */}
                <Card>
                    <CardHeader className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg">Tenders List</CardTitle>
                                <CardDescription>Total {totalItems} tenders found</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search tenders…"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full md:w-48"
                                />
                                <Button onClick={() => (setPage(1), setSearch(""))} variant="outline">
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tendersError ? (
                            <ErrorBox
                                message={`Failed to load tenders: ${tendersError}`}
                                onRetry={() =>
                                    projectId &&
                                    dispatch(fetchTenders({
                                        projectId,
                                        page,
                                        limit,
                                        search,
                                    }))
                                }
                            />
                        ) : (
                            <DataTable
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
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="prose max-w-none text-sm md:text-base">
                        {project.description || "No description available"}
                    </p>
                </CardContent>
            </Card>

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
    <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-1">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{value}</div>
            {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
        </CardContent>
    </Card>
);

interface DataCardProps {
    title: string;
    children: React.ReactNode;
}
const DataCard: React.FC<DataCardProps> = ({ title, children }) => (
    <Card>
        <CardHeader className="p-3">
            <CardTitle className="text-lg md:text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b">
        <span className="font-medium text-gray-700 dark:text-gray-100 text-sm md:text-base">{label}:</span>
        <span className="text-muted-foreground text-left sm:text-right truncate max-w-[200px] text-xs md:text-sm">
            {value || "N/A"}
        </span>
    </div>
);

const BudgetItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = "" }) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="font-medium text-gray-700 dark:text-gray-100 text-sm md:text-base">{label}:</span>
        <span className={`font-semibold text-xs md:text-sm ${className}`}>{value || "0"}</span>
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
