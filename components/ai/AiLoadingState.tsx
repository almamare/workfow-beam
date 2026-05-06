'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AiLoadingStateProps {
    label?: string;
}

export function AiLoadingState({ label = 'جاري التحليل...' }: AiLoadingStateProps) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const arabicDigits = (n: number) =>
        n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium" dir="rtl">
                {elapsed > 3 ? `${label} ${arabicDigits(elapsed)} ثوان` : label}
            </p>
        </div>
    );
}
