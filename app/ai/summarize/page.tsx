'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiSummarize,
    selectAiSummarizeLoading,
    selectAiSummarizeResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import type { SummarizeType } from '@/stores/types/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

const TYPES: { value: SummarizeType; label: string }[] = [
    { value: 'contract', label: 'Contract' },
    { value: 'project', label: 'Project' },
    { value: 'financial', label: 'Financial Document' },
    { value: 'request', label: 'Request / Approval' },
    { value: 'general', label: 'General Text' },
];

export default function AiSummarizePage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiSummarizeLoading);
    const response = useSelector(selectAiSummarizeResponse);
    const [error, setError] = useState<string | null>(null);

    const [type, setType] = useState<SummarizeType>('contract');
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');

    const handleSummarize = async () => {
        setError(null);
        dispatch(clearAiResponse('summarizeResponse'));
        try {
            await dispatch(aiSummarize({
                type,
                data: {
                    title: title || undefined,
                    value: value ? Number(value) : undefined,
                    start_date: startDate || undefined,
                    end_date: endDate || undefined,
                    notes: notes || undefined,
                },
            })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في إنشاء الملخص');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 shadow">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Smart Summarize</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Summarize contracts, projects, or requests into key bullet points
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard title="Document Details" description="Enter the document information to summarize" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Document Type</Label>
                            <Select value={type} onValueChange={(v) => setType(v as SummarizeType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPES.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Title / Reference No.</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CTR-2025-014 or Project Name" />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Value / Amount (IQD)</Label>
                            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="1200000" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Start Date</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>End Date</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Key Clauses / Additional Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter important clauses, conditions, or any additional context..."
                                rows={4}
                            />
                        </div>

                        <Button onClick={handleSummarize} disabled={loading} className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Summarizing...' : 'Generate Smart Summary'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Summary" description="AI-generated key bullet points in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري إنشاء الملخص..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleSummarize} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <Sparkles className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Fill in the details and generate a summary</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
