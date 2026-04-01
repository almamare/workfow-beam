'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiForecast,
    selectAiForecastLoading,
    selectAiForecastResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import type { ForecastType } from '@/stores/types/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Plus, Trash2, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

interface MonthRow {
    month: string;
    income: string;
    expenses: string;
}

const emptyRow = (): MonthRow => ({ month: '', income: '', expenses: '' });

export default function AiForecastPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiForecastLoading);
    const response = useSelector(selectAiForecastResponse);
    const [error, setError] = useState<string | null>(null);
    const [forecastType, setForecastType] = useState<ForecastType>('cashflow');
    const [rows, setRows] = useState<MonthRow[]>([
        { month: '2025-10', income: '500000', expenses: '320000' },
        { month: '2025-11', income: '480000', expenses: '350000' },
        { month: '2025-12', income: '520000', expenses: '400000' },
        { month: '2026-01', income: '490000', expenses: '370000' },
        { month: '2026-02', income: '510000', expenses: '390000' },
    ]);

    const update = (i: number, field: keyof MonthRow, val: string) =>
        setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

    const handleForecast = async () => {
        setError(null);
        const data = rows
            .filter((r) => r.month)
            .map((r) => ({
                month: r.month,
                income: Number(r.income) || 0,
                expenses: Number(r.expenses) || 0,
            }));
        if (!data.length) return;
        dispatch(clearAiResponse('forecastResponse'));
        try {
            await dispatch(aiForecast({ forecast_type: forecastType, data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في إنشاء التوقعات');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow">
                    <LineChart className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">AI Forecast</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Predict future financial or project outcomes from historical data
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EnhancedCard title="Historical Data" description="Enter monthly data for forecasting" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Forecast Type</Label>
                            <Select value={forecastType} onValueChange={(v) => setForecastType(v as ForecastType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cashflow">Cash Flow Forecast</SelectItem>
                                    <SelectItem value="financial">Financial Forecast</SelectItem>
                                    <SelectItem value="project">Project Forecast</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1">
                                <span>Month</span><span>Income (IQD)</span><span>Expenses (IQD)</span>
                            </div>
                            {rows.map((r, i) => (
                                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                                    <Input value={r.month} onChange={(e) => update(i, 'month', e.target.value)} placeholder="2026-01" className="h-8 text-xs" />
                                    <Input type="number" value={r.income} onChange={(e) => update(i, 'income', e.target.value)} placeholder="500000" className="h-8 text-xs" />
                                    <div className="flex gap-1 items-center">
                                        <Input type="number" value={r.expenses} onChange={(e) => update(i, 'expenses', e.target.value)} placeholder="320000" className="h-8 text-xs flex-1" />
                                        {rows.length > 3 && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 shrink-0" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setRows((r) => [...r, emptyRow()])} className="w-full gap-1">
                            <Plus className="h-4 w-4" /> Add Month
                        </Button>

                        <Button onClick={handleForecast} disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Forecasting...' : 'Generate Forecast'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Forecast Result" description="AI predictions and narrative in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري حساب التوقعات..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleForecast} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <LineChart className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Enter historical data and generate forecast</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
