'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiAnalyzeFinancial,
    selectAiFinancialLoading,
    selectAiFinancialResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { BarChart3, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

export default function AiFinancialPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiFinancialLoading);
    const response = useSelector(selectAiFinancialResponse);
    const [error, setError] = useState<string | null>(null);

    const [period, setPeriod] = useState('');
    const [totalDisbursements, setTotalDisbursements] = useState('');
    const [totalInvoices, setTotalInvoices] = useState('');
    const [pettyCash, setPettyCash] = useState('');
    const [labor, setLabor] = useState('');
    const [materials, setMaterials] = useState('');
    const [services, setServices] = useState('');

    const handleAnalyze = async () => {
        setError(null);
        dispatch(clearAiResponse('financialResponse'));
        try {
            await dispatch(aiAnalyzeFinancial({
            data: {
                period: period || undefined,
                total_disbursements: totalDisbursements ? Number(totalDisbursements) : undefined,
                total_invoices: totalInvoices ? Number(totalInvoices) : undefined,
                petty_cash_spent: pettyCash ? Number(pettyCash) : undefined,
                disbursements_by_category: {
                    ...(labor ? { Labor: Number(labor) } : {}),
                    ...(materials ? { Materials: Number(materials) } : {}),
                    ...(services ? { Services: Number(services) } : {}),
                },
            },
        })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في التحليل المالي');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow">
                    <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Financial Analysis</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Deep AI analysis of financial data — KPIs, spending breakdown, and recommendations
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input form */}
                <EnhancedCard title="Financial Data Input" description="Enter the data you want to analyze" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label>Period (e.g. 2026-Q1)</Label>
                                <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-Q1" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Total Disbursements (IQD)</Label>
                                <Input type="number" value={totalDisbursements} onChange={(e) => setTotalDisbursements(e.target.value)} placeholder="450000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Total Invoices (IQD)</Label>
                                <Input type="number" value={totalInvoices} onChange={(e) => setTotalInvoices(e.target.value)} placeholder="320000" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Petty Cash Spent (IQD)</Label>
                                <Input type="number" value={pettyCash} onChange={(e) => setPettyCash(e.target.value)} placeholder="15000" />
                            </div>
                        </div>

                        <div className="border-t pt-3">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                                Spending by Category
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Labor</Label>
                                    <Input type="number" value={labor} onChange={(e) => setLabor(e.target.value)} placeholder="180000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Materials</Label>
                                    <Input type="number" value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="150000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Services</Label>
                                    <Input type="number" value={services} onChange={(e) => setServices(e.target.value)} placeholder="120000" />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Analyzing...' : 'Analyze with AI'}
                        </Button>
                    </div>
                </EnhancedCard>

                {/* Result */}
                <EnhancedCard title="AI Analysis Result" description="Results are generated in Arabic by Gemini 2.0" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري التحليل المالي..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleAnalyze} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <BarChart3 className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Enter financial data and click Analyze</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
