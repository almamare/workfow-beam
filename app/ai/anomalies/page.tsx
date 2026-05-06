'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiDetectAnomalies,
    selectAiAnomalyLoading,
    selectAiAnomalyResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { ShieldAlert, Plus, Trash2 } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

interface InvoiceRow {
    invoice_no: string;
    vendor: string;
    amount: string;
    date: string;
    status: string;
}

const emptyRow = (): InvoiceRow => ({ invoice_no: '', vendor: '', amount: '', date: '', status: 'Pending' });

export default function AiAnomaliesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiAnomalyLoading);
    const response = useSelector(selectAiAnomalyResponse);
    const [error, setError] = useState<string | null>(null);

    const [rows, setRows] = useState<InvoiceRow[]>([emptyRow(), emptyRow()]);

    const updateRow = (i: number, field: keyof InvoiceRow, val: string) => {
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
    };

    const addRow = () => setRows((r) => [...r, emptyRow()]);
    const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));

    const handleDetect = async () => {
        setError(null);
        const data = rows
            .filter((r) => r.invoice_no || r.vendor)
            .map((r) => ({
                invoice_no: r.invoice_no,
                vendor: r.vendor,
                amount: Number(r.amount) || 0,
                date: r.date,
                status: r.status,
            }));
        if (!data.length) return;
        dispatch(clearAiResponse('anomalyResponse'));
        try {
            await dispatch(aiDetectAnomalies({ data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في فحص الشذوذات');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow">
                    <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Anomaly Detection</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Detect duplicate invoices, unusual amounts, and suspicious patterns
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EnhancedCard title="Invoice / Transaction Data" description="Enter the records to analyze" variant="default" size="sm">
                    <div className="space-y-3">
                        {rows.map((row, i) => (
                            <div key={i} className="grid grid-cols-5 gap-2 items-end">
                                <div className="space-y-1 col-span-1">
                                    {i === 0 && <Label className="text-[10px]">Invoice No.</Label>}
                                    <Input value={row.invoice_no} onChange={(e) => updateRow(i, 'invoice_no', e.target.value)} placeholder="INV-001" className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1 col-span-1">
                                    {i === 0 && <Label className="text-[10px]">Vendor</Label>}
                                    <Input value={row.vendor} onChange={(e) => updateRow(i, 'vendor', e.target.value)} placeholder="Vendor name" className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    {i === 0 && <Label className="text-[10px]">Amount</Label>}
                                    <Input type="number" value={row.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} placeholder="75000" className="h-8 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    {i === 0 && <Label className="text-[10px]">Date</Label>}
                                    <Input type="date" value={row.date} onChange={(e) => updateRow(i, 'date', e.target.value)} className="h-8 text-xs" />
                                </div>
                                <div className="flex items-end gap-1">
                                    {rows.length > 1 && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => removeRow(i)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" size="sm" onClick={addRow} className="gap-1 w-full">
                            <Plus className="h-4 w-4" /> Add Row
                        </Button>

                        <Button onClick={handleDetect} disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                            <ShieldAlert className="h-4 w-4" />
                            {loading ? 'Detecting Anomalies...' : 'Run Anomaly Detection'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Detection Results" description="AI findings with severity levels" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري فحص البيانات..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleDetect} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <ShieldAlert className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Add records and run detection</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
