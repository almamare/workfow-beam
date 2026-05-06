'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiApprovalRecommend,
    selectAiApprovalLoading,
    selectAiApprovalResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Brain, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

const REQUEST_TYPES = [
    'Financial Disbursement',
    'Leave Request',
    'Purchase Order',
    'Project Budget Increase',
    'Contract Approval',
    'Other',
];

export default function AiApprovalsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiApprovalLoading);
    const response = useSelector(selectAiApprovalResponse);
    const [error, setError] = useState<string | null>(null);

    const [requestNo, setRequestNo] = useState('');
    const [requestType, setRequestType] = useState('Financial Disbursement');
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [requestedBy, setRequestedBy] = useState('');
    const [requestDate, setRequestDate] = useState('');
    const [budgetRemaining, setBudgetRemaining] = useState('');

    const handleRecommend = async () => {
        setError(null);
        dispatch(clearAiResponse('approvalResponse'));
        try {
            await dispatch(aiApprovalRecommend({
                data: {
                    request: {
                        request_no: requestNo,
                        type: requestType,
                        amount: Number(amount) || 0,
                        purpose,
                        requested_by: requestedBy,
                        date: requestDate,
                    },
                    budget_remaining: budgetRemaining ? Number(budgetRemaining) : undefined,
                },
            })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في الحصول على التوصية');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow">
                    <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Approval Advisor</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Get AI recommendations before approving or rejecting requests
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard title="Request Details" description="Enter the request information for AI review" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Request No.</Label>
                                <Input value={requestNo} onChange={(e) => setRequestNo(e.target.value)} placeholder="REQ-00123" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Request Type</Label>
                                <select
                                    value={requestType}
                                    onChange={(e) => setRequestType(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Amount (IQD)</Label>
                                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="95000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Budget Remaining (IQD)</Label>
                                <Input type="number" value={budgetRemaining} onChange={(e) => setBudgetRemaining(e.target.value)} placeholder="200000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Requested By</Label>
                                <Input value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Employee name" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Request Date</Label>
                                <Input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Purpose / Justification</Label>
                            <Textarea
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="Describe the purpose and justification for this request..."
                                rows={3}
                            />
                        </div>
                        <Button onClick={handleRecommend} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Analyzing...' : 'Get AI Recommendation'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="AI Recommendation" description="Approval guidance with confidence score in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري تحليل الطلب..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleRecommend} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <Brain className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Fill in the request details to get a recommendation</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
