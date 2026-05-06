'use client';

import React from 'react';
import {
    MessageSquare,
    BarChart3,
    FolderOpen,
    UserCheck,
    FileText,
    ShieldAlert,
    Search,
    Brain,
    FileSearch,
    LineChart,
    Sparkles,
    LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Breadcrumb } from '@/components/layout/breadcrumb';

const aiMenuItems = [
    {
        title: 'AI Chat',
        icon: MessageSquare,
        href: '/ai/chat',
        color: '#0284c7',
        bg: '#f0f9ff',
    },
    {
        title: 'Financial Analysis',
        icon: BarChart3,
        href: '/ai/financial',
        color: '#16a34a',
        bg: '#f0fdf4',
    },
    {
        title: 'Project Analysis',
        icon: FolderOpen,
        href: '/ai/projects',
        color: '#4f46e5',
        bg: '#eef2ff',
    },
    {
        title: 'Employee Performance',
        icon: UserCheck,
        href: '/ai/employees',
        color: '#059669',
        bg: '#ecfdf5',
    },
    {
        title: 'Smart Reports',
        icon: FileText,
        href: '/ai/reports',
        color: '#0891b2',
        bg: '#ecfeff',
    },
    {
        title: 'Anomaly Detection',
        icon: ShieldAlert,
        href: '/ai/anomalies',
        color: '#dc2626',
        bg: '#fef2f2',
    },
    {
        title: 'Data Query',
        icon: Search,
        href: '/ai/query',
        color: '#d97706',
        bg: '#fffbeb',
    },
    {
        title: 'Approval Advisor',
        icon: Brain,
        href: '/ai/approvals',
        color: '#db2777',
        bg: '#fdf2f8',
    },
    {
        title: 'Tender Evaluation',
        icon: FileSearch,
        href: '/ai/tenders',
        color: '#ea580c',
        bg: '#fff7ed',
    },
    {
        title: 'Forecast',
        icon: LineChart,
        href: '/ai/forecast',
        color: '#0d9488',
        bg: '#f0fdfa',
    },
    {
        title: 'Summarize',
        icon: Sparkles,
        href: '/ai/summarize',
        color: '#a21caf',
        bg: '#fdf4ff',
    },
    {
        title: 'Dashboard Insights',
        icon: LayoutDashboard,
        href: '/ai/insights',
        color: '#7c3aed',
        bg: '#f5f3ff',
    },
];

export default function AiPage() {
    return (
        <div className="bg-slate-100 dark:bg-slate-900 transition-colors duration-300 p-3 sm:p-4 md:p-6 space-y-4">
            <Breadcrumb />
            <div className="mb-4 md:mb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    AI Assistant
                </h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                    Choose the AI operation you want to access
                </p>
            </div>

            <EnhancedCard
                title="AI Operations"
                description="Navigate through all AI operations from one place"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
                    {aiMenuItems.map((item, i) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
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
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    -
                                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-[11.5px] sm:text-[12.5px]
                                        leading-tight line-clamp-2 transition-colors duration-200
                                        group-hover:text-sky-700 dark:group-hover:text-sky-400">
                                        {item.title}
                                    </p>
                                </div>

                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-200 pointer-events-none rounded-2xl"
                                    style={{ background: item.color }}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </EnhancedCard>
        </div>
    );
}
