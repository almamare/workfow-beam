'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, SectionCard } from '../_components';
import { WORKFLOW_STEPS } from '../_data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Info, CheckCircle, GitBranch } from 'lucide-react';

export default function WorkflowsPage() {
    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Approval Workflows"
                description="Multi-stage approval chains that govern how records move from creation to final authorization across the system."
            />

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500 text-white shrink-0">
                        <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">How Workflows Work</h2>
                    </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Many actions in BEAM require approval from one or more people before they take effect.
                    For example, when you create a new payment or register a client, it goes through a chain of reviewers.
                    Each reviewer checks the details and either approves it (passing it to the next person) or rejects it
                    (sending it back to you with comments). Records must be approved at each level before they become active.
                </p>
                <div className="pt-1">
                    <Badge variant="default" className="text-xs">
                        {WORKFLOW_STEPS.length} workflows
                    </Badge>
                </div>
            </div>

            {/* Workflow Cards */}
            <div className="space-y-6">
                {WORKFLOW_STEPS.map((workflow) => {
                    const Icon = workflow.icon;
                    return (
                        <div
                            key={workflow.title}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
                        >
                            <div className={cn('flex items-center gap-3 px-6 py-4', workflow.color)}>
                                <Icon className="h-5 w-5 text-white" />
                                <h3 className="text-lg font-semibold text-white">{workflow.title}</h3>
                            </div>

                            <div className="p-6 space-y-5">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {workflow.desc}
                                </p>

                                <div className="relative pl-5">
                                    {workflow.steps.map((step, i) => {
                                        const isLast = i === workflow.steps.length - 1;
                                        const circleColor = isLast ? 'bg-green-500' : workflow.color;

                                        return (
                                            <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                                                {/* Vertical connector line */}
                                                {!isLast && (
                                                    <div className="absolute left-[11px] top-[28px] bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                                                )}

                                                {/* Numbered circle */}
                                                <div
                                                    className={cn(
                                                        'w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 relative z-10',
                                                        circleColor,
                                                    )}
                                                >
                                                    {i + 1}
                                                </div>

                                                {/* Step content */}
                                                <div className="space-y-1.5 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {step.actor}
                                                        </span>
                                                        <Badge
                                                            variant="default"
                                                            className={cn(
                                                                'text-[10px]',
                                                                isLast
                                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                    : 'bg-brand-sky-100 text-brand-sky-700 dark:bg-brand-sky-900/30 dark:text-brand-sky-300',
                                                            )}
                                                        >
                                                            {step.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        {step.action}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Workflow Notes */}
            <div className="rounded-xl border border-brand-sky-200 dark:border-brand-sky-800 bg-brand-sky-50 dark:bg-brand-sky-950/20 p-6 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-sky-500 text-white shrink-0">
                        <Info className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-brand-sky-800 dark:text-brand-sky-300">Workflow Notes</h3>
                </div>
                <ul className="space-y-2">
                    {[
                        'Every step is recorded with the reviewer\'s name, date, and any comments they leave.',
                        'If your request is rejected, you can fix the issues and resubmit it — it goes through the approval steps again.',
                        'Email notifications are sent to the next reviewer at each stage so nothing gets missed.',
                        'System Administrators can approve records directly if there is an urgent need.',
                        'You can see the full approval history from any record\'s detail page under the "Timeline" tab.',
                    ].map((note) => (
                        <li key={note} className="flex items-start gap-2 text-sm text-brand-sky-700 dark:text-brand-sky-400">
                            <CheckCircle className="h-4 w-4 text-brand-sky-500 shrink-0 mt-0.5" />
                            {note}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
