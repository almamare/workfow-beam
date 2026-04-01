'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiAnalyzeProject,
    selectAiProjectLoading,
    selectAiProjectResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

const STATUS_OPTIONS = ['In Progress', 'Completed', 'On Hold', 'Cancelled', 'Planning'];

export default function AiProjectsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiProjectLoading);
    const response = useSelector(selectAiProjectResponse);
    const [error, setError] = useState<string | null>(null);

    const [projectName, setProjectName] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [spent, setSpent] = useState('');
    const [completion, setCompletion] = useState('');
    const [contractor, setContractor] = useState('');

    const handleAnalyze = async () => {
        setError(null);
        dispatch(clearAiResponse('projectResponse'));
        try {
            await dispatch(aiAnalyzeProject({
                data: {
                    project_name: projectName || undefined,
                    status,
                    start_date: startDate || undefined,
                    expected_end_date: endDate || undefined,
                    budget: budget ? Number(budget) : undefined,
                    spent: spent ? Number(spent) : undefined,
                    completion_percentage: completion ? Number(completion) : undefined,
                    contractor: contractor || undefined,
                },
            })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في تحليل المشروع');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow">
                    <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Project Analysis</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Analyze project health, timeline, budget usage, and risk factors
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard title="Project Details" description="Enter the project data to analyze" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Project Name</Label>
                            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Warehouse Expansion Project" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Completion (%)</Label>
                                <Input type="number" value={completion} onChange={(e) => setCompletion(e.target.value)} placeholder="70" min="0" max="100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Start Date</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Expected End Date</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Total Budget (IQD)</Label>
                                <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="800000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Amount Spent (IQD)</Label>
                                <Input type="number" value={spent} onChange={(e) => setSpent(e.target.value)} placeholder="620000" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Contractor</Label>
                            <Input value={contractor} onChange={(e) => setContractor(e.target.value)} placeholder="e.g. Modern Construction Co." />
                        </div>
                        <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Analyzing...' : 'Analyze Project'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Analysis Result" description="AI project health report in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري تحليل المشروع..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleAnalyze} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <FolderOpen className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Enter project details and click Analyze</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
