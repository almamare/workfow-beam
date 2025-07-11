'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchProject, selectSelectedProject, selectSelectedProjectBudget, selectLoading, selectError } from '@/stores/slices/projects';
import { fetchTenders, selectTenders, selectTendersTotal, selectTendersPages, selectTendersLoading, selectTendersError } from '@/stores/slices/tenders';
import { AppDispatch } from '@/stores/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, Users, Edit, Trash2, CheckCircle2, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Tender } from '@/stores/types/tenders';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';


// Define the possible project status values
type ProjectStatus = 'Active' | 'Inactive' | 'Complete' | 'Stopped' | 'Onhold';

export default function ProjectDetailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const params = useSearchParams();
    const router = useRouter();
    const projectId = params.get('id');

    // State for tenders pagination and search
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

    // Initialize status from project data
    const [status, setStatus] = useState<ProjectStatus>(
        (project?.status as ProjectStatus) || 'Active'
    );

    useEffect(() => {
        if (projectId) {
            dispatch(fetchProject({ id: projectId }));
        }
    }, [projectId, dispatch]);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchTenders({
                projectId,
                page,
                limit,
                search
            }));
        }
    }, [projectId, page, limit, search, dispatch]);

    // Sync status when project data changes
    useEffect(() => {
        if (project?.status) {
            setStatus(project.status as ProjectStatus);
        }
    }, [project?.status]);

    const handleStatusUpdate = async () => {

    };

    const handleDeleteTender = async () => {

    };

    const handleTenderDeleteClick = (tender: Tender) => {
        setTenderToDelete(tender.id);
        setDeleteConfirmOpen(true);
    };

    if (loading || !project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="flex items-center">
                    <Loader2 className="animate-spin w-8 h-8 text-primary" />
                    <span className="ml-3 text-xl text-muted-foreground">
                        Loading project data...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md text-center">
                    <h3 className="font-bold text-lg">Failed to load data</h3>
                    <p>{error}</p>
                    <Button
                        className="mt-3"
                        variant="outline"
                        onClick={() => projectId && dispatch(fetchProject({ id: projectId }))}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // Define columns for tenders table
    const tenderColumns: Column<Tender>[] = [
        {
            key: 'sequence',
            header: 'ID',
            sortable: true
        },
        {
            key: 'name',
            header: 'Name',
            sortable: true
        },
        {
            key: 'price',
            header: 'Price',
            sortable: true,
        },
        {
            key: 'quantity',
            header: 'Quantity',
            sortable: true,
        },
        {
            key: 'amount',
            header: 'Amount',
            sortable: true,
        }
    ];

    // Define actions for tenders table
    const tenderActions: Action<Tender>[] = [
        {
            label: 'Edit',
            onClick: (tender) => router.push(`/tenders/edit?id=${tender.id}`),
            icon: <Edit className="w-4 h-4" />
        },
        {
            label: 'Delete',
            onClick: handleTenderDeleteClick,
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
        }
    ];

    // Status badge variants mapping
    const statusVariants: Record<ProjectStatus, "completed" | "approved" | "default" | "outline" | "draft" | "pending" | "rejected" | "inprogress" | "onhold" | "cancelled" | null | undefined> = {
        Active: 'completed',
        Inactive: 'cancelled',
        Complete: 'approved',
        Stopped: 'cancelled',
        Onhold: 'onhold',
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Project Details</h1>
                    <p className="text-muted-foreground mt-1">
                        View and manage details for project <span className="font-semibold">{project.name}</span>
                    </p>
                </div>
                <Button
                    onClick={() => router.push(`/projects/${projectId}/tenders/create`)}
                    className="bg-primary text-white w-full md:w-auto"
                >
                    + Create Tender
                </Button>
            </div>

            {/* Stats Cards - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Project Name</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{project.name}</div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                            {project.client_name}
                        </p>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Project Type</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">
                            {project.type}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            #{project.sequence}
                        </p>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Project Status</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">
                            <Badge variant={statusVariants[status]}>
                                {status}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {project.created_at ? formatDate(project.created_at) : 'N/A'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Project Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3 items-center">
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as ProjectStatus)}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Complete">Complete</SelectItem>
                                <SelectItem value="Stopped">Stopped</SelectItem>
                                <SelectItem value="Onhold">Onhold</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="default"
                            className="flex items-center gap-2"
                            onClick={handleStatusUpdate}
                        >
                            <CheckCircle2 className="w-4 h-4" /> Update Status
                        </Button>

                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowDownToLine className="w-4 h-4" /> Download Tender
                        </Button>

                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowDownToLine className="w-4 h-4" /> Download Project
                        </Button>

                        <Button
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteConfirmOpen(true)}
                        >
                            <Trash2 className="w-4 h-4" /> Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid - Responsive layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Project Details */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className='p-3'>
                            <CardTitle className='text-xl'>Project Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <DetailItem label="Project Code" value={project.project_code} />
                                <DetailItem label="Project Number" value={project.number} />
                                <DetailItem label="Start Date" value={formatDate(project.start_date)} />
                                <DetailItem label="End Date" value={formatDate(project.end_date)} />
                                <DetailItem label="Created At" value={formatDate(project.created_at)} />
                                <DetailItem label="Updated At" value={formatDate(project.updated_at)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='p-3'>
                            <CardTitle className='text-xl'>Budget Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {budget ? (
                                <div>
                                    <BudgetItem
                                        label="Fiscal Year"
                                        value={budget.fiscal_year}
                                    />
                                    <BudgetItem
                                        label="Original Budget"
                                        value={budget.original_budget}
                                    />
                                    <BudgetItem
                                        label="Revised Budget"
                                        value={budget.revised_budget}
                                    />
                                    <BudgetItem
                                        label="Committed Cost"
                                        value={budget.committed_cost}
                                        className="text-blue-600"
                                    />
                                    <BudgetItem
                                        label="Actual Cost"
                                        value={budget.actual_cost}
                                        className="text-green-600"
                                    />
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No budget information available</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Tenders List */}
                <div>
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Tenders List</CardTitle>
                                    <CardDescription>
                                        Total {totalItems} tenders found
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Search tenders..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1); // Reset to first page when searching
                                        }}
                                        className="w-full md:w-48"
                                    />
                                    <Button
                                        onClick={() => {
                                            setPage(1);
                                            setSearch('');
                                        }}
                                        variant="outline"
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {tendersError ? (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                                    <p>Failed to load tenders: {tendersError}</p>
                                    <Button
                                        className="mt-3"
                                        variant="outline"
                                        onClick={() => projectId && dispatch(fetchTenders({
                                            projectId,
                                            page,
                                            limit,
                                            search
                                        }))}
                                    >
                                        Retry
                                    </Button>
                                </div>
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
            </div>

            {/* Project Description */}
            <Card>
                <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose max-w-none">
                        {project.description || 'No description available'}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

// Helper components
const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b">
        <span className="font-medium text-gray-700 dark:text-gray-100">{label}:</span>
        <span className="text-muted-foreground text-left sm:text-right truncate max-w-[200px]">
            {value || 'N/A'}
        </span>
    </div>
);

const BudgetItem = ({ label, value, className = '' }: {
    label: string;
    value: string | number;
    className?: string;
}) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="font-medium text-gray-700 dark:text-gray-100">{label}:</span>
        <span className={`font-semibold ${className}`}>
            {value || '0'}
        </span>
    </div>
);

// Date formatting function
function formatDate(dateString: string) {
    if (!dateString) return 'N/A';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch (e) {
        return 'Invalid date';
    }
}