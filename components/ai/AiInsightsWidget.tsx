'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiDashboardInsights,
    selectAiDashboardLoading,
    selectAiDashboardResponse,
} from '@/stores/slices/ai';
import type { DashboardInsightsRequest } from '@/stores/types/ai';
import { AiLoadingState } from './AiLoadingState';
import { AiResponsePanel } from './AiResponsePanel';
import { AiErrorState } from './AiErrorState';
import { Button } from '@/components/ui/button';
import { Bot, RefreshCw } from 'lucide-react';

interface AiInsightsWidgetProps {
    data: DashboardInsightsRequest['data'];
    autoLoad?: boolean;
}

export function AiInsightsWidget({ data, autoLoad = true }: AiInsightsWidgetProps) {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiDashboardLoading);
    const response = useSelector(selectAiDashboardResponse);
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            await dispatch(aiDashboardInsights({ data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في تحليل البيانات');
        }
    }, [dispatch, data]);

    useEffect(() => {
        if (autoLoad) {
            load();
            // Auto-refresh every 5 minutes
            refreshIntervalRef.current = setInterval(load, 5 * 60 * 1000);
        }
        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoLoad]);

    return (
        <div dir="rtl" className="rounded-xl border bg-card p-4 shadow-sm">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-sm">رؤى الذكاء الاصطناعي</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={load}
                    disabled={loading}
                    className="h-7 px-2 text-xs"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ml-1 ${loading ? 'animate-spin' : ''}`} />
                    تحديث
                </Button>
            </div>

            {/* Content */}
            {loading && <AiLoadingState label="جاري تحليل البيانات..." />}
            {!loading && error && <AiErrorState message={error} onRetry={load} />}
            {!loading && !error && response && (
                <AiResponsePanel response={response} showActions={true} />
            )}
            {!loading && !error && !response && (
                <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground text-sm">
                    <Bot className="h-8 w-8 opacity-30" />
                    <p>اضغط تحديث للحصول على رؤى ذكية</p>
                </div>
            )}
        </div>
    );
}
