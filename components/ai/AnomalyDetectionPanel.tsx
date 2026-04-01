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
import type { AnomalyDetectionRequest } from '@/stores/types/ai';
import { AiLoadingState } from './AiLoadingState';
import { AiResponsePanel } from './AiResponsePanel';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ShieldAlert } from 'lucide-react';
import { AiErrorState } from './AiErrorState';

interface AnomalyDetectionButtonProps {
    data: AnomalyDetectionRequest['data'];
}

export function AnomalyDetectionButton({ data }: AnomalyDetectionButtonProps) {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiAnomalyLoading);
    const response = useSelector(selectAiAnomalyResponse);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpen = async () => {
        setOpen(true);
        setError(null);
        dispatch(clearAiResponse('anomalyResponse'));
        try {
            await dispatch(aiDetectAnomalies({ data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في فحص الشذوذات');
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={handleOpen} className="gap-1">
                <ShieldAlert className="h-4 w-4" />
                فحص الشذوذات
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" />
                            فحص الشذوذات والمخالفات
                        </DialogTitle>
                    </DialogHeader>

                    {loading && <AiLoadingState label="جاري فحص البيانات..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleOpen} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                            <p>اضغط لبدء الفحص</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
