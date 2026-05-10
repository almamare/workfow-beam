'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchWorkflowSteps,
    deleteWorkflowStep,
    updateWorkflowStep,
    selectWorkflowSteps,
    selectWorkflowLoading,
} from '@/stores/slices/workflow';
import { fetchRoles, selectRoles } from '@/stores/slices/roles';
import type { WorkflowStep, RequestType } from '@/stores/types/workflow';
import { REQUEST_TYPE_LABELS } from '@/stores/types/workflow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Plus, Pencil, Trash2, ChevronUp, ChevronDown, GitBranch, RefreshCw } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';

const TYPE_MAP: Record<string, RequestType> = {
    clients: 'Clients',
    projects: 'Projects',
    'project-contracts': 'ProjectContracts',
    financial: 'Financial',
    employment: 'Employment',
    tasks: 'Tasks',
};

const AUTO_STEP_ID = -1;

export default function WorkflowTypePageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" /></div>}>
            <WorkflowTypePage />
        </Suspense>
    );
}

function WorkflowTypePage() {
    const params = useParams();
    const router = useRouter();
    const typeSlug = typeof params?.type === 'string' ? params.type : '';
    const requestType = TYPE_MAP[typeSlug] as RequestType | undefined;

    const dispatch = useDispatch<AppDispatch>();
    const allSteps = useSelector(selectWorkflowSteps);
    const loading = useSelector(selectWorkflowLoading);
    const roles = useSelector(selectRoles);

    const [deleteTarget, setDeleteTarget] = useState<WorkflowStep | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchWorkflowSteps());
        dispatch(fetchRoles({ limit: 1000 }));
    }, [dispatch]);

    const steps = useMemo(
        () =>
            allSteps
                .filter((s) => s.request_type === requestType)
                .sort((a, b) => a.step_level - b.step_level),
        [allSteps, requestType]
    );

    const virtualStep1: WorkflowStep = useMemo(() => ({
        id: AUTO_STEP_ID,
        workflow_id: 'auto',
        request_type: requestType ?? 'Clients',
        step_level: 1,
        step_name: 'Submitted (auto)',
        required_role: 'Employee',
        is_required: 1,
    }), [requestType]);

    const tableData = useMemo(() => [virtualStep1, ...steps], [virtualStep1, steps]);

    if (!requestType) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    Unknown workflow type.{' '}
                    <Button variant="link" onClick={() => router.push('/settings/workflow')}>
                        Back to Workflow
                    </Button>
                </p>
            </div>
        );
    }

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchWorkflowSteps());
            toast.success('Refreshed successfully');
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const result = await dispatch(deleteWorkflowStep(deleteTarget.id));
            if (deleteWorkflowStep.fulfilled.match(result)) {
                toast.success('Step deleted.');
                setDeleteTarget(null);
            } else {
                toast.error((result.payload as string) || 'Failed to delete step.');
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleMove = async (step: WorkflowStep, direction: 'up' | 'down') => {
        const newLevel = direction === 'up' ? step.step_level - 1 : step.step_level + 1;
        if (newLevel < 2) return;
        const conflict = steps.find((s) => s.step_level === newLevel);
        if (conflict) {
            await dispatch(updateWorkflowStep({ id: conflict.id, params: { step_level: step.step_level } }));
        }
        const result = await dispatch(updateWorkflowStep({ id: step.id, params: { step_level: newLevel } }));
        if (!updateWorkflowStep.fulfilled.match(result)) {
            toast.error((result.payload as string) || 'Failed to reorder.');
            dispatch(fetchWorkflowSteps());
        }
    };

    const label = REQUEST_TYPE_LABELS[requestType] ?? requestType;

    // ── Columns ──────────────────────────────────────────────────────────────
    const columns: Column<WorkflowStep>[] = [
        {
            key: 'step_level',
            header: 'Level',
            width: '80px',
            render: (value, row) => (
                <span className={`font-mono font-bold text-sm ${
                    row.id === AUTO_STEP_ID
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-brand-sky-600 dark:text-brand-sky-400'
                }`}>
                    L{value}
                </span>
            ),
        },
        {
            key: 'step_name',
            header: 'Step Name',
            render: (value, row) => (
                <span className={
                    row.id === AUTO_STEP_ID
                        ? 'text-slate-400 dark:text-slate-500 italic text-sm'
                        : 'font-semibold text-slate-800 dark:text-slate-200'
                }>
                    {value}
                </span>
            ),
        },
        {
            key: 'required_role',
            header: 'Required Role',
            render: (value, row) => {
                if (row.id === AUTO_STEP_ID) {
                    return (
                        <Badge variant="outline" className="bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-600 text-xs">
                            {value}
                        </Badge>
                    );
                }
                const role = roles.find((r) => r.role_key === value);
                const roleName = role?.role_name ?? value;
                return (
                    <Badge variant="outline" className="bg-brand-sky-50 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200 dark:border-brand-sky-800">
                        {roleName}
                        {role?.role_key && roleName !== role.role_key && (
                            <span className="ml-1 opacity-60 text-[10px]">({role.role_key})</span>
                        )}
                    </Badge>
                );
            },
        },
        {
            key: 'is_required',
            header: 'Required',
            align: 'center',
            render: (value, row) => {
                if (row.id === AUTO_STEP_ID) {
                    return <span className="text-slate-400 dark:text-slate-500 text-xs italic">auto</span>;
                }
                return (
                    <Badge
                        variant="outline"
                        className={value
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }
                    >
                        {value ? 'Yes' : 'No'}
                    </Badge>
                );
            },
        },
    ];

    // ── Actions (array with hidden per row) ───────────────────────────────────
    const actionsArray: Action<WorkflowStep>[] = [
        {
            label: 'Up',
            icon: <ChevronUp className="h-4 w-4" />,
            onClick: (r) => handleMove(r, 'up'),
            variant: 'outline' as const,
            title: 'Move up',
            hidden: (r) => {
                if (r.id === AUTO_STEP_ID) return true;
                const idx = steps.findIndex((s) => s.id === r.id);
                return idx === 0;
            },
        },
        {
            label: 'Down',
            icon: <ChevronDown className="h-4 w-4" />,
            onClick: (r) => handleMove(r, 'down'),
            variant: 'outline' as const,
            title: 'Move down',
            hidden: (r) => {
                if (r.id === AUTO_STEP_ID) return true;
                const idx = steps.findIndex((s) => s.id === r.id);
                return idx === steps.length - 1;
            },
        },
        {
            label: 'Edit',
            icon: <Pencil className="h-4 w-4" />,
            onClick: (r) => router.push(`/settings/workflow/${typeSlug}/edit?id=${r.id}`),
            variant: 'warning' as const,
            title: 'Edit step',
            hidden: (r) => r.id === AUTO_STEP_ID,
        },
        {
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (r) => setDeleteTarget(r),
            variant: 'destructive' as const,
            title: 'Delete step',
            hidden: (r) => r.id === AUTO_STEP_ID,
        },
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <GitBranch className="h-8 w-8 text-brand-sky-500" />
                        {label} Workflow
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage approval steps for {label} requests
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => router.push(`/settings/workflow/${typeSlug}/create`)}
                        className="gap-2 bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        Add Step
                    </Button>
                </div>
            </div>

            {/* Table Card */}
            <EnhancedCard
                title={`${label} Workflow Steps`}
                description={`${steps.length} approval step${steps.length !== 1 ? 's' : ''} configured`}
                variant="default"
                size="sm"
                stats={{
                    total: steps.length,
                    badge: 'Approval Steps',
                    badgeColor: 'info',
                }}
            >
                <EnhancedDataTable
                    data={tableData}
                    columns={columns}
                    actions={actionsArray}
                    loading={loading}
                    noDataMessage="No workflow steps configured yet."
                />
            </EnhancedCard>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete workflow step?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete step L{deleteTarget?.step_level} — &quot;{deleteTarget?.step_name}&quot;.
                            In-progress approvals at this step will not be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
