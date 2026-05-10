'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchWorkflowSteps,
    updateWorkflowStep,
    selectWorkflowSteps,
} from '@/stores/slices/workflow';
import { fetchRoles, selectRoles } from '@/stores/slices/roles';
import type { RequestType } from '@/stores/types/workflow';
import { REQUEST_TYPE_LABELS } from '@/stores/types/workflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, GitBranch } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';

const TYPE_MAP: Record<string, RequestType> = {
    clients: 'Clients',
    projects: 'Projects',
    'project-contracts': 'ProjectContracts',
    financial: 'Financial',
    employment: 'Employment',
    tasks: 'Tasks',
};

export default function EditWorkflowStepPageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" /></div>}>
            <EditWorkflowStepPage />
        </Suspense>
    );
}

function EditWorkflowStepPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const typeSlug = typeof params?.type === 'string' ? params.type : '';
    const requestType = TYPE_MAP[typeSlug] as RequestType | undefined;
    const stepId = searchParams.get('id');

    const dispatch = useDispatch<AppDispatch>();
    const roles = useSelector(selectRoles);
    const allSteps = useSelector(selectWorkflowSteps);

    const [stepName, setStepName] = useState('');
    const [requiredRole, setRequiredRole] = useState('');
    const [stepLevel, setStepLevel] = useState('');
    const [isRequired, setIsRequired] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [fetchDone, setFetchDone] = useState(false);

    useEffect(() => {
        Promise.all([
            dispatch(fetchRoles({ limit: 1000 })),
            dispatch(fetchWorkflowSteps()),
        ]).then(() => setFetchDone(true));
    }, [dispatch]);

    useEffect(() => {
        if (!fetchDone || !stepId) return;
        const step = allSteps.find((s) => String(s.id) === stepId);
        if (step) {
            setStepName(step.step_name);
            setRequiredRole(step.required_role);
            setStepLevel(String(step.step_level));
            setIsRequired(step.is_required === 1);
            setLoaded(true);
        }
    }, [allSteps, stepId, fetchDone]);

    if (!requestType) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">Unknown workflow type.</p>
            </div>
        );
    }

    if (!stepId) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <p className="text-slate-600 dark:text-slate-400">
                    No step ID provided.{' '}
                    <Button variant="link" onClick={() => router.push(`/settings/workflow/${typeSlug}`)}>
                        Back
                    </Button>
                </p>
            </div>
        );
    }

    if (fetchDone && !loaded) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-16">
                    <p className="text-slate-500 dark:text-slate-400">Step not found.</p>
                </div>
            </div>
        );
    }

    const label = REQUEST_TYPE_LABELS[requestType] ?? requestType;

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!stepName.trim()) errs.step_name = 'Step name is required.';
        if (!requiredRole) errs.required_role = 'Required role is required.';
        const level = parseInt(stepLevel, 10);
        if (isNaN(level) || level < 2) errs.step_level = 'Step level must be 2 or higher (level 1 is auto-created on submission).';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const result = await dispatch(updateWorkflowStep({
                id: parseInt(stepId, 10),
                params: {
                    step_name: stepName.trim(),
                    required_role: requiredRole,
                    step_level: parseInt(stepLevel, 10),
                    is_required: isRequired ? 1 : 0,
                },
            }));
            if (updateWorkflowStep.fulfilled.match(result)) {
                toast.success('Workflow step updated successfully.');
                router.push(`/settings/workflow/${typeSlug}`);
            } else {
                toast.error((result.payload as string) || 'Failed to update step.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <GitBranch className="h-8 w-8 text-brand-sky-500" />
                        Edit Workflow Step
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Editing step in the{' '}
                        <span className="font-semibold text-brand-sky-600 dark:text-brand-sky-400">{label}</span> workflow
                    </p>
                </div>
            </div>

            {!loaded ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <EnhancedCard
                        title="Step Details"
                        description="Update the workflow step configuration"
                        variant="default"
                        size="sm"
                    >
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Step Level */}
                            <div className="space-y-2">
                                <Label htmlFor="step_level" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Step Level <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="step_level"
                                    type="number"
                                    min={2}
                                    value={stepLevel}
                                    onChange={(e) => {
                                        setStepLevel(e.target.value);
                                        setErrors((prev) => { const c = { ...prev }; delete c.step_level; return c; });
                                    }}
                                    placeholder="e.g. 1"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50"
                                />
                                {errors.step_level && <p className="text-xs text-red-500">{errors.step_level}</p>}
                            </div>

                            {/* Step Name */}
                            <div className="space-y-2">
                                <Label htmlFor="step_name" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Step Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="step_name"
                                    value={stepName}
                                    onChange={(e) => {
                                        setStepName(e.target.value);
                                        setErrors((prev) => { const c = { ...prev }; delete c.step_name; return c; });
                                    }}
                                    placeholder="e.g. Manager Review"
                                    maxLength={50}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50"
                                />
                                {errors.step_name && <p className="text-xs text-red-500">{errors.step_name}</p>}
                            </div>

                            {/* Required Role */}
                            <div className="space-y-2">
                                <Label htmlFor="required_role" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Required Role <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={requiredRole}
                                    onValueChange={(v) => {
                                        setRequiredRole(v);
                                        setErrors((prev) => { const c = { ...prev }; delete c.required_role; return c; });
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-brand-sky-300 dark:focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-100 dark:focus:ring-brand-sky-900/50">
                                        <SelectValue placeholder="Select a role…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r.role_key} value={r.role_key}>
                                                {r.role_name ? `${r.role_name} (${r.role_key})` : r.role_key}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.required_role && <p className="text-xs text-red-500">{errors.required_role}</p>}
                            </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <Switch
                                id="is_required"
                                checked={isRequired}
                                onCheckedChange={setIsRequired}
                            />
                            <Label htmlFor="is_required" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                                Required step{' '}
                                <span className="text-slate-400 dark:text-slate-500 font-normal">
                                    (cannot be skipped during approval)
                                </span>
                            </Label>
                        </div>
                    </EnhancedCard>

                    <div className="flex items-center gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/settings/workflow/${typeSlug}`)}
                            disabled={saving}
                            className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="gap-2 bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-md"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
