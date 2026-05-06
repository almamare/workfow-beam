'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiEvaluateTenders,
    selectAiTenderLoading,
    selectAiTenderResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { FileSearch, Plus, Trash2, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

interface TenderRow {
    offer_no: string;
    contractor: string;
    price: string;
    duration_days: string;
    previous_projects: string;
    notes: string;
}

const emptyTender = (): TenderRow => ({
    offer_no: '',
    contractor: '',
    price: '',
    duration_days: '',
    previous_projects: '',
    notes: '',
});

export default function AiTendersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiTenderLoading);
    const response = useSelector(selectAiTenderResponse);
    const [error, setError] = useState<string | null>(null);
    const [tenders, setTenders] = useState<TenderRow[]>([emptyTender(), emptyTender()]);

    const update = (i: number, field: keyof TenderRow, val: string) =>
        setTenders((t) => t.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

    const handleEvaluate = async () => {
        setError(null);
        const data = tenders
            .filter((t) => t.contractor)
            .map((t) => ({
                offer_no: t.offer_no,
                contractor: t.contractor,
                price: Number(t.price) || 0,
                duration_days: Number(t.duration_days) || 0,
                previous_projects: Number(t.previous_projects) || 0,
                notes: t.notes,
            }));
        if (!data.length) return;
        dispatch(clearAiResponse('tenderResponse'));
        try {
            await dispatch(aiEvaluateTenders({ tenders: data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في تقييم العطاءات');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow">
                    <FileSearch className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Tender Evaluation</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Compare tender offers and get a ranked AI recommendation
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EnhancedCard title="Tender Offers" description="Add all offers for comparison" variant="default" size="sm">
                    <div className="space-y-4">
                        {tenders.map((t, i) => (
                            <div key={i} className="rounded-lg border p-3 space-y-3 relative">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Offer {i + 1}</span>
                                    {tenders.length > 2 && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setTenders((r) => r.filter((_, idx) => idx !== i))}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Offer No.</Label>
                                        <Input value={t.offer_no} onChange={(e) => update(i, 'offer_no', e.target.value)} placeholder="TND-001" className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Contractor</Label>
                                        <Input value={t.contractor} onChange={(e) => update(i, 'contractor', e.target.value)} placeholder="Company name" className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Price (IQD)</Label>
                                        <Input type="number" value={t.price} onChange={(e) => update(i, 'price', e.target.value)} placeholder="350000" className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Duration (days)</Label>
                                        <Input type="number" value={t.duration_days} onChange={(e) => update(i, 'duration_days', e.target.value)} placeholder="120" className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Previous Projects</Label>
                                        <Input type="number" value={t.previous_projects} onChange={(e) => update(i, 'previous_projects', e.target.value)} placeholder="5" className="h-8 text-xs" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px]">Notes</Label>
                                        <Input value={t.notes} onChange={(e) => update(i, 'notes', e.target.value)} placeholder="Additional notes" className="h-8 text-xs" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" size="sm" onClick={() => setTenders((r) => [...r, emptyTender()])} className="w-full gap-1">
                            <Plus className="h-4 w-4" /> Add Offer
                        </Button>

                        <Button onClick={handleEvaluate} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Evaluating...' : 'Evaluate with AI'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Evaluation Result" description="Ranked recommendations in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري تقييم العطاءات..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleEvaluate} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <FileSearch className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Add offers and click Evaluate</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
