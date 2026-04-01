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
import type { FinancialAnalysisRequest } from '@/stores/types/ai';
import { AiLoadingState } from './AiLoadingState';
import { AiResponsePanel } from './AiResponsePanel';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';
import { AiErrorState } from './AiErrorState';

interface FinancialAnalysisModalProps {
    data: FinancialAnalysisRequest['data'];
}

export function FinancialAnalysisButton({ data }: FinancialAnalysisModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiFinancialLoading);
    const response = useSelector(selectAiFinancialResponse);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpen = async () => {
        setOpen(true);
        setError(null);
        dispatch(clearAiResponse('financialResponse'));
        try {
            await dispatch(aiAnalyzeFinancial({ data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في التحليل المالي');
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={handleOpen} className="gap-1">
                <Sparkles className="h-4 w-4" />
                تحليل بالذكاء الاصطناعي
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            التحليل المالي بالذكاء الاصطناعي
                        </DialogTitle>
                    </DialogHeader>

                    {loading && <AiLoadingState label="جاري التحليل المالي..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleOpen} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                            <p>اضغط لتحميل التحليل</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
