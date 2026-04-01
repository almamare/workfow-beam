'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiNlQuery,
    selectAiQueryLoading,
    selectAiQueryResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Search, ArrowRight } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

const EXAMPLE_QUESTIONS = [
    'كم صرفنا على مشروع المستودع في شهر مارس؟',
    'ما هو إجمالي المصاريف هذا الشهر؟',
    'كم عدد المشاريع النشطة حالياً؟',
    'ما هي الفواتير المتأخرة؟',
    'أعطني ملخصاً لأداء الموظفين',
];

export default function AiQueryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiQueryLoading);
    const response = useSelector(selectAiQueryResponse);
    const [error, setError] = useState<string | null>(null);
    const [question, setQuestion] = useState('');

    const handleQuery = async (q?: string) => {
        setError(null);
        const text = (q ?? question).trim();
        if (!text || loading) return;
        if (!q) setQuestion(text);
        dispatch(clearAiResponse('queryResponse'));
        try {
            await dispatch(aiNlQuery({ question: text })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في معالجة الاستعلام');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleQuery();
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow">
                    <Search className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Data Query</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ask questions in plain Arabic and get instant answers from your data
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        placeholder="اسأل عن بياناتك بالعربي أو الانجليزي..."
                        dir="rtl"
                        className="w-full rounded-xl border bg-white dark:bg-slate-800 py-3 pl-4 pr-12 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-slate-700 disabled:opacity-50"
                    />
                </div>
                <Button
                    onClick={() => handleQuery()}
                    disabled={loading || !question.trim()}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-5 rounded-xl"
                >
                    <ArrowRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Example questions */}
            <EnhancedCard title="Example Questions" description="Click to use as input" variant="default" size="sm">
                <div className="flex flex-wrap gap-2">
                    {EXAMPLE_QUESTIONS.map((q) => (
                        <button
                            key={q}
                            onClick={() => { setQuestion(q); handleQuery(q); }}
                            disabled={loading}
                            className="rounded-full border px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            dir="rtl"
                        >
                            {q}
                        </button>
                    ))}
                </div>
            </EnhancedCard>

            {/* Result */}
            {(loading || response || error) && (
                <EnhancedCard title="Answer" description="AI-generated answer in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري البحث في البيانات..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleQuery} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                </EnhancedCard>
            )}
        </div>
    );
}
