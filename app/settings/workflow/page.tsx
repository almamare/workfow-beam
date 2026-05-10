'use client';

import React from 'react';
import {
    Users,
    FolderOpen,
    FileCheck,
    CreditCard,
    UserCheck,
    ClipboardList,
    GitBranch,
} from 'lucide-react';
import Link from 'next/link';

const workflowSections = [
    {
        title: 'Clients',
        icon: Users,
        href: '/settings/workflow/clients',
        color: '#7c3aed',
        bg: '#f5f3ff',
        description: 'Client creation approval chain',
    },
    {
        title: 'Projects',
        icon: FolderOpen,
        href: '/settings/workflow/projects',
        color: '#4f46e5',
        bg: '#eef2ff',
        description: 'Project approval workflow',
    },
    {
        title: 'Project Contracts',
        icon: FileCheck,
        href: '/settings/workflow/project-contracts',
        color: '#0f766e',
        bg: '#f0fdfa',
        description: 'Contract approval steps',
    },
    {
        title: 'Financial',
        icon: CreditCard,
        href: '/settings/workflow/financial',
        color: '#059669',
        bg: '#ecfdf5',
        description: 'Financial request approval',
    },
    {
        title: 'Employment',
        icon: UserCheck,
        href: '/settings/workflow/employment',
        color: '#0284c7',
        bg: '#f0f9ff',
        description: 'HR and employment approvals',
    },
    {
        title: 'Tasks',
        icon: ClipboardList,
        href: '/settings/workflow/tasks',
        color: '#d97706',
        bg: '#fffbeb',
        description: 'Task request workflow',
    },
];

export default function WorkflowHubPage() {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            <div className="px-3 sm:px-6 lg:px-8 pt-3 pb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <GitBranch className="h-9 w-9 text-brand-sky-500" />
                    Approval Workflow
                </h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                    Configure approval steps for each request type
                </p>
            </div>

            <div className="px-3 sm:px-6 lg:px-8 pt-4 pb-4">
                <div className="flex items-center gap-3">
                    <span
                        className="w-[3px] h-5 rounded-full inline-block flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,hsl(216,100%,36%) 0%,hsl(216,90%,48%) 100%)' }}
                    />
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                        Workflow Types &nbsp;·&nbsp; {workflowSections.length} types
                    </p>
                </div>
            </div>

            <div className="flex-1 px-3 sm:px-6 lg:px-8 pb-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
                    {workflowSections.map((item, i) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky-500 rounded-2xl"
                        >
                            <div className="relative flex flex-col items-center justify-center text-center gap-3
                                bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60
                                px-2 py-5 sm:py-6 overflow-hidden
                                transition-all duration-200
                                hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-1
                                active:scale-[0.97] active:translate-y-0 cursor-pointer min-h-[110px] sm:min-h-[130px]">
                                <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100
                                    transition-transform duration-300 origin-center"
                                    style={{ background: item.color }} />

                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0
                                        transition-transform duration-200 group-hover:scale-110"
                                    style={{ background: item.bg }}
                                >
                                    <item.icon
                                        className="w-6 h-6 sm:w-[26px] sm:h-[26px] transition-colors duration-200"
                                        style={{ color: item.color }}
                                    />
                                </div>

                                <div className="flex items-baseline justify-center gap-1.5 px-1 w-full">
                                    <span className="font-black text-[13px] sm:text-[14px] leading-none tabular-nums flex-shrink-0">
                                        {`W.${i + 1}`}
                                    </span>
                                    -
                                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-[11.5px] sm:text-[12.5px]
                                        leading-tight line-clamp-2 transition-colors duration-200
                                        group-hover:text-brand-sky-700 dark:group-hover:text-brand-sky-400">
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
