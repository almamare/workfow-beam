'use client';

import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => {
                navigator.clipboard.writeText(value).then(() => {
                    setCopied(true);
                    toast.success('Copied to clipboard');
                    setTimeout(() => setCopied(false), 2000);
                });
            }}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
            {copied
                ? <Check className="h-3.5 w-3.5 text-green-500" />
                : <Copy className="h-3.5 w-3.5 text-slate-400" />}
        </button>
    );
}

export function PermBadge({ ok }: { ok: boolean }) {
    return ok
        ? <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
        : <span className="block w-3 h-0.5 bg-slate-300 dark:bg-slate-600 mx-auto rounded-full" />;
}

export function SectionCard({ icon: Icon, iconColor, title, subtitle, children }: {
    icon: React.ElementType; iconColor: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className={cn('p-2.5 rounded-xl text-white shrink-0', iconColor)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
                    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}

export function AccordionItem({ question, answer, isOpen, onToggle }: {
    question: string; answer: string; isOpen: boolean; onToggle: () => void;
}) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <span className="font-medium text-slate-800 dark:text-slate-200 pr-4">{question}</span>
                <ChevronDown className={cn('h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
                <div className="px-5 pb-5 pt-0">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
}

export function StepList({ steps }: { steps: string[] }) {
    return (
        <ol className="space-y-2">
            {steps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-brand-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step}</p>
                </li>
            ))}
        </ol>
    );
}

export function FeatureList({ features }: { features: string[] }) {
    return (
        <ul className="space-y-2">
            {features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                </li>
            ))}
        </ul>
    );
}

export function HelpPageHeader({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">{title}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{description}</p>
        </div>
    );
}
