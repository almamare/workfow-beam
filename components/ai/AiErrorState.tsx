'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function AiErrorState({ message, onRetry }: AiErrorStateProps) {
    return (
        <div
            dir="rtl"
            className="flex flex-col items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 px-4 py-6 text-center"
        >
            <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed max-w-xs">
                {message}
            </p>
            {onRetry && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    className="gap-1.5 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    إعادة المحاولة
                </Button>
            )}
        </div>
    );
}
