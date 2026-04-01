'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiDashboardInsights,
    selectAiDashboardLoading,
    selectAiDashboardResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { LayoutDashboard, Sparkles, RefreshCw } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

export default function AiInsightsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiDashboardLoading);
    const response = useSelector(selectAiDashboardResponse);
    const [error, setError] = useState<string | null>(null);

    const [activeProjects, setActiveProjects] = useState('5');
    const [pendingApprovals, setPendingApprovals] = useState('12');
    const [overdueInvoices, setOverdueInvoices] = useState('3');
    const [totalDisbursements, setTotalDisbursements] = useState('180000');
    const [budgetUtil, setBudgetUtil] = useState('78');
    const [bankBalance, setBankBalance] = useState('1200000');
    const [pettyCash, setPettyCash] = useState('8000');
    const [employees, setEmployees] = useState('24');

    const handleGenerate = async () => {
        setError(null);
        dispatch(clearAiResponse('dashboardResponse'));
        try {
            await dispatch(aiDashboardInsights({
                data: {
                    active_projects: Number(activeProjects) || undefined,
                    pending_approvals: Number(pendingApprovals) || undefined,
                    overdue_invoices: Number(overdueInvoices) || undefined,
                    total_disbursements_this_month: Number(totalDisbursements) || undefined,
                    budget_utilization_pct: Number(budgetUtil) || undefined,
                    bank_balance_iqd: Number(bankBalance) || undefined,
                    petty_cash_remaining: Number(pettyCash) || undefined,
                    employees_count: Number(employees) || undefined,
                    last_updated: new Date().toISOString().split('T')[0],
                },
            })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في إنشاء الرؤى');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow">
                    <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard Insights</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        AI-generated alerts and insights from your live dashboard data
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedCard title="Dashboard Snapshot" description="Current system metrics" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Active Projects</Label>
                                <Input type="number" value={activeProjects} onChange={(e) => setActiveProjects(e.target.value)} placeholder="5" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Pending Approvals</Label>
                                <Input type="number" value={pendingApprovals} onChange={(e) => setPendingApprovals(e.target.value)} placeholder="12" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Overdue Invoices</Label>
                                <Input type="number" value={overdueInvoices} onChange={(e) => setOverdueInvoices(e.target.value)} placeholder="3" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Employees Count</Label>
                                <Input type="number" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="24" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Disbursements This Month (IQD)</Label>
                                <Input type="number" value={totalDisbursements} onChange={(e) => setTotalDisbursements(e.target.value)} placeholder="180000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Budget Utilization (%)</Label>
                                <Input type="number" value={budgetUtil} onChange={(e) => setBudgetUtil(e.target.value)} placeholder="78" min="0" max="100" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Bank Balance (IQD)</Label>
                                <Input type="number" value={bankBalance} onChange={(e) => setBankBalance(e.target.value)} placeholder="1200000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Petty Cash Remaining (IQD)</Label>
                                <Input type="number" value={pettyCash} onChange={(e) => setPettyCash(e.target.value)} placeholder="8000" />
                            </div>
                        </div>

                        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {loading ? 'Generating Insights...' : 'Generate AI Insights'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="AI Insights" description="Smart alerts and recommendations in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري تحليل البيانات..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleGenerate} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <LayoutDashboard className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Enter dashboard metrics and generate insights</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
