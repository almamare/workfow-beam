"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import {
    fetchProject,
    selectSelectedProject,
    selectSelectedProjectBudget,
    selectLoading,
    selectError,
} from "@/stores/slices/projects";
import { AppDispatch } from "@/stores/store";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, ArrowDownToLine, Edit, Eye, ArrowLeft, AlertCircle,
    FileText, Briefcase, GitMerge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedDataTable, Column, Action } from "@/components/ui/enhanced-data-table";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { toast } from "sonner";
import axios from "@/utils/axios";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import type { ProjectContract } from "@/stores/types/project-contracts";
import type { TaskOrder } from "@/stores/types/task-orders";
import type { ChangeOrder } from "@/stores/types/change-orders";
import type { Client } from "@/stores/types/clients";

// â”€â”€â”€ Shared helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">{children}</div>
);

const DetailRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
        {icon && <span className="mt-0.5 text-brand-sky-500 shrink-0">{icon}</span>}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">{label}</span>
        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium flex-1">{value ?? "N/A"}</span>
    </div>
);

// â”€â”€â”€ Status helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
        Active:    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
        Inactive:  "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
        Complete:  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        Stopped:   "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
        Onhold:    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        Draft:     "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
        Pending:   "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
        Approved:  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
        Rejected:  "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
        Suspended: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
    };
    return colors[status ?? ""] ?? "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800";
};

const formatDate = (d?: string | null) => {
    if (!d) return "N/A";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return "Invalid date"; }
};

const formatDateTime = (d?: string | null) => {
    if (!d) return "N/A";
    try { return new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return "Invalid date"; }
};

const formatCurrency = (value?: string | number) => {
    if (value === undefined || value === null || value === "") return "â€”";
    const raw = typeof value === "string" ? value.replace(/,/g, "") : value;
    const n = typeof raw === "string" ? parseFloat(raw) : raw;
    if (isNaN(n)) return "â€”";
    return new Intl.NumberFormat("en-US").format(n);
};

// â”€â”€â”€ Main Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ProjectDetailsPageContent() {
    const dispatch = useDispatch<AppDispatch>();
    const params = useSearchParams();
    const router = useRouter();
    const projectId = params.get("id");

    const project = useSelector(selectSelectedProject);
    const budget = useSelector(selectSelectedProjectBudget);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [projectIsDownloading, setProjectIsDownloading] = useState(false);
    const [clientData, setClientData] = useState<Client | null>(null);

    const [contracts, setContracts] = useState<ProjectContract[]>([]);
    const [contractsLoading, setContractsLoading] = useState(false);
    const [taskOrders, setTaskOrders] = useState<TaskOrder[]>([]);
    const [taskOrdersLoading, setTaskOrdersLoading] = useState(false);
    const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
    const [changeOrdersLoading, setChangeOrdersLoading] = useState(false);

    useEffect(() => {
        if (projectId) dispatch(fetchProject({ id: projectId }));
    }, [projectId, dispatch]);

    // Fetch client details once project loads
    useEffect(() => {
        if (!project?.client_id) return;
        axios.get(`/clients/fetch/client/${project.client_id}`)
            .then((res) => {
                const c = res.data?.body?.client ?? res.data?.data?.client ?? res.data?.client;
                if (c) setClientData(c);
            })
            .catch(() => {});
    }, [project?.client_id]);

    const loadRelatedData = useCallback(async (id: string) => {
        setContractsLoading(true);
        try {
            const res = await axios.get("/project-contracts/fetch", { params: { project_id: id, limit: 100 } });
            const block = res.data?.body?.contracts ?? res.data?.data?.contracts;
            setContracts(block?.items ?? []);
        } catch { /* ignore */ } finally { setContractsLoading(false); }

        setTaskOrdersLoading(true);
        try {
            const res = await axios.get("/task-orders/fetch", { params: { project_id: id, limit: 100 } });
            setTaskOrders(res.data?.body?.task_orders?.items ?? []);
        } catch { /* ignore */ } finally { setTaskOrdersLoading(false); }

        setChangeOrdersLoading(true);
        try {
            const res = await axios.get("/change-orders/fetch", { params: { project_id: id, limit: 100 } });
            setChangeOrders(res.data?.body?.change_orders?.items ?? []);
        } catch { /* ignore */ } finally { setChangeOrdersLoading(false); }
    }, []);

    useEffect(() => {
        if (projectId) loadRelatedData(projectId);
    }, [projectId, loadRelatedData]);

    const downloadProject = async () => {
        if (!projectId) return;
        setProjectIsDownloading(true);
        try {
            const { data } = await axios.get(`/projects/download/project/${projectId}`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `${project?.name || "project"}.pdf`;
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
            toast.success("Project document downloaded successfully");
        } catch {
            toast.error("Failed to download project document");
        } finally {
            setProjectIsDownloading(false);
        }
    };

    // â”€â”€â”€ Table columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const contractColumns: Column<ProjectContract>[] = [
        { key: "contract_no",    header: "No.",      render: (v: any) => <span className="font-mono text-xs text-slate-500">{v || "â€”"}</span> },
        { key: "title",          header: "Title",    render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v || "â€”"}</span> },
        { key: "contract_type",  header: "Type",     render: (v: any) => <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v || "â€”"}</Badge> },
        { key: "contract_value", header: "Value",    render: (v: any) => <span className="font-semibold text-brand-sky-600 dark:text-brand-sky-400">{formatCurrency(v)}</span> },
        { key: "status",         header: "Status",   render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">â€”</span> },
        { key: "approval_status",header: "Approval", render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">â€”</span> },
    ];

    const contractActions: Action<ProjectContract>[] = [
        {
            label: "View Contract",
            onClick: (r) => router.push(`/requests/project-contracts/details?id=${r.id}`),
            icon: <Eye className="h-4 w-4" />,
            variant: "info" as const,
        },
    ];

    const taskOrderColumns: Column<TaskOrder>[] = [
        { key: "task_order_no",   header: "No.",        render: (v: any) => <span className="font-mono text-xs text-slate-500">{v || "â€”"}</span> },
        { key: "title",           header: "Title",      render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v || "â€”"}</span> },
        { key: "contractor_name", header: "Contractor", render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v || "â€”"}</span> },
        { key: "est_cost",        header: "Est. Cost",  render: (v: any) => <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(v)}</span> },
        { key: "status",          header: "Status",     render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">â€”</span> },
        { key: "issue_date",      header: "Issue Date", render: (v: any) => <span className="text-slate-500 text-sm">{formatDate(v)}</span> },
    ];

    const changeOrderColumns: Column<ChangeOrder>[] = [
        { key: "change_order_no", header: "No.",        render: (v: any) => <span className="font-mono text-xs text-slate-500">{v || "â€”"}</span> },
        { key: "title",           header: "Title",      render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v || "â€”"}</span> },
        { key: "contractor_name", header: "Contractor", render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v || "â€”"}</span> },
        { key: "est_cost",        header: "Est. Cost",  render: (v: any) => <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(v)}</span> },
        { key: "status",          header: "Status",     render: (v: any) => v ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">â€”</span> },
        { key: "issue_date",      header: "Issue Date", render: (v: any) => <span className="text-slate-500 text-sm">{formatDate(v)}</span> },
    ];

    // â”€â”€â”€ Loading / Error states â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    if (loading || !project)
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading project details...</p>
            </Centered>
        );

    if (error)
        return (
            <Centered>
                <AlertCircle className="h-10 w-10 text-rose-400" />
                <p className="text-rose-600 dark:text-rose-400">{error}</p>
                <Button variant="outline" onClick={() => projectId && dispatch(fetchProject({ id: projectId }))}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300">
                    Retry
                </Button>
            </Centered>
        );

    const isActive = project.status === "Active";

    return (
        <div className="space-y-4 pb-8">
            <Breadcrumb />

            {/* â”€â”€â”€ Header â”€â”€â”€ */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Project Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the project with available actions.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push("/projects")}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
                </Button>
            </div>

            {/* â”€â”€â”€ Stat Cards â”€â”€â”€ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <EnhancedCard title="Project Name" description="Full name" variant="default" size="sm">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {project.name || "N/A"}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Project Code" description="Unique identifier" variant="default" size="sm">
                    <div className="text-lg font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">
                        {project.project_code || "N/A"}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Project Type" description="Category" variant="default" size="sm">
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 w-fit font-semibold">
                        {project.type || "N/A"}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Status" description="Current project state" variant="default" size="sm">
                    <Badge variant="outline" className={`${getStatusColor(project.status)} font-semibold w-fit`}>
                        {project.status || "N/A"}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Created" description="Registration date" variant="default" size="sm">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateTime(project.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* â”€â”€â”€ Actions Card â”€â”€â”€ */}
            <EnhancedCard title="Actions" description="Available operations for this project" variant="default" size="sm">
                <div className="flex flex-wrap items-center gap-3">
                    {isActive && (
                        <Button
                            onClick={downloadProject}
                            disabled={projectIsDownloading}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm"
                        >
                            {projectIsDownloading
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <ArrowDownToLine className="h-4 w-4 mr-2" />}
                            {projectIsDownloading ? "Generating..." : "Download Document"}
                        </Button>
                    )}
                    {!isActive && (
                        <Button
                            onClick={() => router.push(`/projects/update?id=${projectId}`)}
                            className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Data
                        </Button>
                    )}
                </div>
            </EnhancedCard>

            {/* â”€â”€â”€ Info Cards â€” 2-column grid â”€â”€â”€ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Project Basic Info */}
                <EnhancedCard title="Project Information" description="Core project details" variant="default" size="sm">
                    <DetailRow label="Project No."  value={<span className="font-mono">{project.number}</span>} />
                    <DetailRow label="Code"         value={<span className="font-mono">{project.project_code}</span>} />
                    <DetailRow label="Type"         value={project.type} />
                    <DetailRow label="Status"       value={
                        project.status
                            ? <Badge variant="outline" className={`${getStatusColor(project.status)} w-fit`}>{project.status}</Badge>
                            : "N/A"
                    } />
                    <DetailRow label="Created"      value={formatDateTime(project.created_at)} />
                    <DetailRow label="Updated"      value={formatDateTime(project.updated_at)} />
                </EnhancedCard>

                {/* Budget Summary */}
                <EnhancedCard title="Budget Summary" description="Financial overview" variant="default" size="sm">
                    {budget ? (
                        <div className="space-y-0">
                            {[
                                { label: "Fiscal Year",     value: budget.fiscal_year,      mono: true },
                                { label: "Original Budget", value: budget.original_budget,  mono: false },
                                { label: "Revised Budget",  value: budget.revised_budget,   mono: false },
                                { label: "Committed Cost",  value: budget.committed_cost,   mono: false },
                                { label: "Actual Cost",     value: budget.actual_cost,      mono: false },
                            ].map((row, i, arr) => (
                                <div key={row.label} className={`flex justify-between items-center py-2.5 ${i < arr.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{row.label}</span>
                                    <span className="text-sm font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">
                                        {row.mono ? row.value : formatCurrency(row.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No budget data</p>
                    )}
                </EnhancedCard>
            </div>

            {/* â”€â”€â”€ Description â”€â”€â”€ */}
            {project.description && (
                <EnhancedCard title="Description" description="Additional remarks" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{project.description}</p>
                </EnhancedCard>
            )}

            {/* â”€â”€â”€ Client Information â”€â”€â”€ */}
            <EnhancedCard title="Client Information" description="Linked client details" variant="default" size="sm">
                <EnhancedDataTable
                    data={clientData ? [clientData] : (project.client_name ? [{
                        id: project.client_id ?? "",
                        name: project.client_name,
                        client_no: "\u2014",
                        sequence: 0,
                        state: "\u2014",
                        city: "\u2014",
                        budget: "\u2014",
                        created_at: "",
                        updated_at: "",
                    }] : [])}
                    columns={[
                        { key: "name",        header: "Client Name", render: (v: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{v || "â€”"}</span> },
                        { key: "client_no",   header: "Client No.",  render: (v: any) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{v || "â€”"}</span> },
                        { key: "client_type", header: "Type",        render: (v: any) => v && v !== "â€”" ? <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 w-fit">{v}</Badge> : <span className="text-slate-400">â€”</span> },
                        { key: "status",      header: "Status",      render: (v: any) => v && v !== "â€”" ? <Badge variant="outline" className={`${getStatusColor(v)} w-fit`}>{v}</Badge> : <span className="text-slate-400">â€”</span> },
                        { key: "state",       header: "State",       render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v || "â€”"}</span> },
                        { key: "city",        header: "City",        render: (v: any) => <span className="text-slate-600 dark:text-slate-400">{v || "â€”"}</span> },
                        { key: "budget",      header: "Budget",      render: (v: any) => v && v !== "â€”" ? <span className="font-semibold text-brand-sky-600 dark:text-brand-sky-400">{formatCurrency(v)}</span> : <span className="text-slate-400">â€”</span> },
                    ] as Column<Client>[]}
                    actions={clientData?.id ? [
                        {
                            label: "View Client Details",
                            onClick: () => router.push(`/clients/details?id=${clientData.id}`),
                            icon: <Eye className="h-4 w-4" />,
                            variant: "info" as const,
                        },
                    ] : []}
                    loading={false}
                    noDataMessage="No client linked to this project"
                    
                />
            </EnhancedCard>

            {/* â”€â”€â”€ Related Tables â”€â”€â”€ */}
            {contractsLoading || contracts.length > 0 ? (
                <EnhancedCard title="Project Contracts" description={`${contracts.length} contract(s) linked to this project`} variant="default" size="sm">
                    <EnhancedDataTable
                        data={contracts}
                        columns={contractColumns}
                        actions={contractActions}
                        loading={contractsLoading}
                        noDataMessage="No contracts found"
                        
                    />
                </EnhancedCard>
            ) : null}

            {taskOrdersLoading || taskOrders.length > 0 ? (
                <EnhancedCard title="Task Orders" description={`${taskOrders.length} task order(s) linked to this project`} variant="default" size="sm">
                    <EnhancedDataTable
                        data={taskOrders}
                        columns={taskOrderColumns}
                        actions={[]}
                        loading={taskOrdersLoading}
                        noDataMessage="No task orders found"
                        
                    />
                </EnhancedCard>
            ) : null}

            {changeOrdersLoading || changeOrders.length > 0 ? (
                <EnhancedCard title="Change Orders" description={`${changeOrders.length} change order(s) linked to this project`} variant="default" size="sm">
                    <EnhancedDataTable
                        data={changeOrders}
                        columns={changeOrderColumns}
                        actions={[]}
                        loading={changeOrdersLoading}
                        noDataMessage="No change orders found"
                        
                    />
                </EnhancedCard>
            ) : null}
        </div>
    );
}

export default function ProjectDetailsPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading detailsâ€¦</p>
            </div>
        }>
            <ProjectDetailsPageContent />
        </Suspense>
    );
}
