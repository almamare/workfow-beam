'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface AiResponsePanelProps {
    response: string;
    className?: string;
    showActions?: boolean;
}

export function AiResponsePanel({ response, className = '', showActions = true }: AiResponsePanelProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(response).then(() => {
            toast.success('تم نسخ النص');
        });
    };

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <html dir="rtl">
            <head>
                <meta charset="UTF-8" />
                <title>BEAM AI Report</title>
                <style>
                    body { font-family: 'Arial', sans-serif; direction: rtl; text-align: right; padding: 24px; line-height: 1.8; }
                    h1,h2,h3 { color: #1e293b; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ccc; padding: 8px; }
                    th { background: #f1f5f9; }
                </style>
            </head>
            <body>${win.document.createElement('div').innerHTML}</body>
            </html>
        `);
        // Write the actual content
        const container = win.document.querySelector('body')!;
        const div = win.document.createElement('div');
        div.innerHTML = response.replace(/\n/g, '<br/>');
        container.appendChild(div);
        win.document.close();
        win.print();
    };

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <div className="ai-response prose prose-sm max-w-none dark:prose-invert rounded-lg bg-muted/40 p-4 border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response}
                </ReactMarkdown>
            </div>
            {showActions && (
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-4 w-4 ml-1" />
                        نسخ النص
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="h-4 w-4 ml-1" />
                        طباعة
                    </Button>
                </div>
            )}
        </div>
    );
}
