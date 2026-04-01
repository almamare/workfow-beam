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

const aiMenuItems = [
    {
        number: '26.1',
        title: 'AI Chat',
        icon: MessageSquare,
        href: '/ai/chat',
        color: 'from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700',
    },
    {
        number: '26.2',
        title: 'Financial Analysis',
        icon: BarChart3,
        href: '/ai/financial',
        color: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
    },
    {
        number: '26.3',
        title: 'Project Analysis',
        icon: FolderOpen,
        href: '/ai/projects',
        color: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
    },
    {
        number: '26.4',
        title: 'Employee Performance',
        icon: UserCheck,
        href: '/ai/employees',
        color: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700',
    },
    {
        number: '26.5',
        title: 'Smart Reports',
        icon: FileText,
        href: '/ai/reports',
        color: 'from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700',
    },
    {
        number: '26.6',
        title: 'Anomaly Detection',
        icon: ShieldAlert,
        href: '/ai/anomalies',
        color: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
    },
    {
        number: '26.7',
        title: 'Data Query',
        icon: Search,
        href: '/ai/query',
        color: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
    },
    {
        number: '26.8',
        title: 'Approval Advisor',
        icon: Brain,
        href: '/ai/approvals',
        color: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700',
    },
    {
        number: '26.9',
        title: 'Tender Evaluation',
        icon: FileSearch,
        href: '/ai/tenders',
        color: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
    },
    {
        number: '26.10',
        title: 'Forecast',
        icon: LineChart,
        href: '/ai/forecast',
        color: 'from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700',
    },
    {
        number: '26.11',
        title: 'Summarize',
        icon: Sparkles,
        href: '/ai/summarize',
        color: 'from-fuchsia-500 to-fuchsia-600 dark:from-fuchsia-600 dark:to-fuchsia-700',
    },
    {
        number: '26.12',
        title: 'Dashboard Insights',
        icon: LayoutDashboard,
        href: '/ai/insights',
        color: 'from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700',
    },
];

export default function AiPage() {
    return (
        <div className="bg-slate-100 dark:bg-slate-900 transition-colors duration-300 p-3 sm:p-4 md:p-6 space-y-4">
            <div className="mb-4 md:mb-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 via-violet-500 to-fuchsia-400 dark:from-violet-400 dark:via-violet-300 dark:to-fuchsia-500 bg-clip-text text-transparent mb-2 leading-tight">
                    AI Assistant
                </h1>
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-medium">
                    Choose the AI operation you want to access
                </p>
            </div>

            <EnhancedCard
                title="AI Operations"
                description="Navigate to the AI operation you want to access"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                    {aiMenuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block group"
                        >
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-lg dark:hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer h-full active:scale-95">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-700/30 dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative p-3 sm:p-4 flex flex-col items-center justify-center text-center h-full min-h-[100px] sm:min-h-[120px] md:min-h-[140px]">
                                    <div className="mb-2 sm:mb-3">
                                        <div className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.color} group-hover:scale-110 dark:group-hover:shadow-lg transition-all duration-300 inline-block shadow-md dark:shadow-lg`}>
                                            <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-tight line-clamp-2 px-1">
                                            <span className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                                                {item.number}.
                                            </span>
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl sm:rounded-2xl" />
                            </div>
                        </Link>
                    ))}
                </div>
            </EnhancedCard>
        </div>
    );
}
