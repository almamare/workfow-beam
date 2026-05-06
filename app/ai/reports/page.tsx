'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiGenerateReport,
    selectAiReportLoading,
    selectAiReportResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import type { ReportType } from '@/stores/types/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
    { value: 'financial', label: 'Financial Report' },
    { value: 'project', label: 'Project Status Report' },
    { value: 'employee', label: 'HR / Employee Report' },
    { value: 'monthly', label: 'Monthly Executive Report' },
    { value: 'executive', label: 'Executive Summary' },
    { value: 'general', label: 'General Report' },
];

export default function AiReportsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiReportLoading);
    const response = useSelector(selectAiReportResponse);
    const [error, setError] = useState<string | null>(null);

    const [reportType, setReportType] = useState<ReportType>('monthly');
    const [month, setMonth] = useState('');
    const [totalApprovals, setTotalApprovals] = useState('');
    const [approvedCount, setApprovedCount] = useState('');
    const [rejectedCount, setRejectedCount] = useState('');

    const handleGenerate = async () => {
        setError(null);
        dispatch(clearAiResponse('reportResponse'));
        try {
            await dispatch(aiGenerateReport({
                report_type: reportType,
                data: {
                    month: month || undefined,
                    approvals_summary: totalApprovals
                        ? {
                              total: Number(totalApprovals),
                              approved: Number(approvedCount || 0),
                              rejected: Number(rejectedCount || 0),
                          }
                        : undefined,
                },
            })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في إنشاء التقرير');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow">
                    <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Smart Reports</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Generate full professional reports using AI
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard title="Report Configuration" description="Select type and provide data" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Report Type</Label>
                            <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Period / Month (e.g. 2026-03)</Label>
                            <Input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="2026-03" />
                        </div>

                        <div className="border-t pt-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Approvals Summary</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Total</Label>
                                    <Input type="number" value={totalApprovals} onChange={(e) => setTotalApprovals(e.target.value)} placeholder="45" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Approved</Label>
                                    <Input type="number" value={approvedCount} onChange={(e) => setApprovedCount(e.target.value)} placeholder="38" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Rejected</Label>
                                    <Input type="number" value={rejectedCount} onChange={(e) => setRejectedCount(e.target.value)} placeholder="7" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Generating Report...' : 'Generate AI Report'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Generated Report" description="AI-generated report in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري إنشاء التقرير..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleGenerate} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <FileText className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Configure and generate your report</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
