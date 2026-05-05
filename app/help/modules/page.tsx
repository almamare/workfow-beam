'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, SectionCard, StepList, FeatureList } from '../_components';
import { SYSTEM_MODULES } from '../_data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ModulesPage() {
    const [expandedModule, setExpandedModule] = useState<number | null>(null);

    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="System Modules"
                description="Complete guide to all 14 system modules — features, capabilities, and step-by-step tutorials for each."
            />

            <div className="flex items-center gap-2">
                <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 hover:bg-sky-100">
                    14 modules
                </Badge>
            </div>

            <div className="space-y-4">
                {SYSTEM_MODULES.map((mod, idx) => {
                    const Icon = mod.icon;
                    const isExpanded = expandedModule === idx;

                    return (
                        <div
                            key={mod.label}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
                        >
                            <div className="p-5 flex items-start gap-4">
                                <div className={cn('p-2.5 rounded-xl text-white shrink-0', mod.color)}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                            {mod.label}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                        {mod.desc}
                                    </p>

                                    <button
                                        onClick={() => setExpandedModule(isExpanded ? null : idx)}
                                        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                                    >
                                        {isExpanded ? 'Hide details' : 'View features'}
                                        <ChevronDown
                                            className={cn(
                                                'h-3.5 w-3.5 transition-transform duration-200',
                                                isExpanded && 'rotate-180'
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-5 pb-5 pt-5 space-y-6 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            Features
                                        </h4>
                                        <FeatureList features={mod.features} />
                                    </div>

                                    {mod.howTo.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                                <ChevronRight className="h-4 w-4 text-sky-500" />
                                                How To
                                            </h4>
                                            <div className="space-y-4">
                                                {mod.howTo.map((tutorial) => (
                                                    <div
                                                        key={tutorial.title}
                                                        className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 space-y-3"
                                                    >
                                                        <h5 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            {tutorial.title}
                                                        </h5>
                                                        <StepList steps={tutorial.steps} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
