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
import type { ApprovalRecommendationRequest } from '@/stores/types/ai';
import { AiLoadingState } from './AiLoadingState';
import { AiResponsePanel } from './AiResponsePanel';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Brain } from 'lucide-react';
import { AiErrorState } from './AiErrorState';

interface ApprovalRecommendationButtonProps {
    data: ApprovalRecommendationRequest['data'];
    onApprove?: () => void;
    onReject?: () => void;
}

export function ApprovalRecommendationButton({
    data,
    onApprove,
    onReject,
}: ApprovalRecommendationButtonProps) {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiApprovalLoading);
    const response = useSelector(selectAiApprovalResponse);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpen = async () => {
        setOpen(true);
        setError(null);
        dispatch(clearAiResponse('approvalResponse'));
        try {
            await dispatch(aiApprovalRecommend({ data })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في الحصول على التوصية');
        }
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={handleOpen} className="gap-1">
                <Brain className="h-4 w-4" />
                رأي الذكاء الاصطناعي
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            توصية الذكاء الاصطناعي
                        </DialogTitle>
                    </DialogHeader>

                    {loading && <AiLoadingState label="جاري تحليل الطلب..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleOpen} />}
                    {!loading && !error && response && (
                        <div className="flex flex-col gap-4">
                            <AiResponsePanel response={response} />
                            {(onApprove || onReject) && (
                                <div className="flex gap-2 justify-end border-t pt-3">
                                    {onApprove && (
                                        <Button
                                            onClick={() => { setOpen(false); onApprove(); }}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            موافقة
                                        </Button>
                                    )}
                                    {onReject && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => { setOpen(false); onReject(); }}
                                        >
                                            رفض
                                        </Button>
                                    )}
                                    <Button variant="ghost" onClick={() => setOpen(false)}>
                                        تجاهل التوصية
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground text-sm">
                            <p>اضغط للحصول على التوصية</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
