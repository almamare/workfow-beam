'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader } from '../_components';
import { DEPARTMENTS } from '../_data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

export default function DepartmentsHelpPage() {
    const [expandedDept, setExpandedDept] = useState<string | null>(null);

    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Departments"
                description="Complete directory of all organizational departments — structure, roles, responsibilities, and system access levels."
            />

            <div className="flex items-center gap-2">
                <Badge variant="default" className="text-sm">
                    {DEPARTMENTS.length} of {DEPARTMENTS.length}
                </Badge>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {DEPARTMENTS.map((dept) => {
                    const Icon = dept.icon;
                    const isExpanded = expandedDept === dept.id;

                    return (
                        <div
                            key={dept.id}
                            className={cn(
                                'rounded-xl border p-5 space-y-3 transition-all',
                                dept.bg,
                                dept.border
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn('p-2.5 rounded-xl text-white shrink-0 bg-gradient-to-br', dept.color)}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {dept.name}
                                        </h3>
                                        <Badge variant="default" className="text-[10px] shrink-0">
                                            {dept.roles.length} {dept.roles.length === 1 ? 'role' : 'roles'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {dept.desc}
                            </p>

                            <button
                                onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                                className="flex items-center gap-1 text-xs font-medium text-brand-sky-600 dark:text-brand-sky-400 hover:text-brand-sky-700 dark:hover:text-brand-sky-300 transition-colors"
                            >
                                {isExpanded ? (
                                    <>
                                        Hide details <ChevronDown className="h-3 w-3" />
                                    </>
                                ) : (
                                    <>
                                        View details <ChevronRight className="h-3 w-3" />
                                    </>
                                )}
                            </button>

                            {isExpanded && (
                                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {dept.longDesc}
                                    </p>

                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            Key Positions
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {dept.heads.map((head) => (
                                                <Badge key={head} variant="default" className="text-xs">
                                                    {head}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            System Roles
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {dept.roles.map((role) => (
                                                <Badge key={role} variant="outline" className="text-xs">
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            Module Access
                                        </h4>
                                        <ul className="space-y-1">
                                            {dept.access.map((item) => (
                                                <li key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                            Responsibilities
                                        </h4>
                                        <ul className="space-y-1 list-disc list-inside">
                                            {dept.responsibilities.map((item) => (
                                                <li key={item} className="text-sm text-slate-600 dark:text-slate-400">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
