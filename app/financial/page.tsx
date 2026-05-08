'use client';

import React from 'react';
import {
    CreditCard,
    Banknote,
    Inbox,
    Landmark,
    BarChart3,
    TrendingUp,
    DollarSign,
    Activity,
    Wallet,
    LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { Breadcrumb } from '@/components/layout/breadcrumb';

const financialMenuItems = [
    {
        title: 'Financial Requests',
        icon: CreditCard,
        href: '/requests/financial',
        color: '#059669',
        bg: '#ecfdf5',
    },
    {
        title: 'Disbursements',
        icon: Banknote,
        href: '/financial/disbursements',
        color: '#0284c7',
        bg: '#f0f9ff',
    },
    {
        title: 'Disbursement Inbox',
        icon: Inbox,
        href: '/financial/disbursements/inbox',
        color: '#d97706',
        bg: '#fffbeb',
    },
    {
        title: 'Petty Cash',
        icon: Landmark,
        href: '/financial/petty-cash',
        color: '#16a34a',
        bg: '#f0fdf4',
    },
    {
        title: 'Financial Ledger',
        icon: BarChart3,
        href: '/financial/ledger',
        color: '#0891b2',
        bg: '#ecfeff',
    },
    {
        title: 'Contractor Payments',
        icon: Wallet,
        href: '/financial/contractor-payments',
        color: '#0f766e',
        bg: '#f0fdfa',
    },
    {
        title: 'Cash Ledger',
        icon: Activity,
        href: '/financial/cash-ledger',
        color: '#4f46e5',
        bg: '#eef2ff',
    },
    {
        title: 'Project Budgets',
        icon: TrendingUp,
        href: '/financial/budgets',
        color: '#7c3aed',
        bg: '#f5f3ff',
    },
    {
        title: 'Loans',
        icon: DollarSign,
        href: '/financial/loans',
        color: '#e11d48',
        bg: '#fff1f2',
    },
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        color: '#0369a1',
        bg: '#e0f2fe',
    },
];

export default function FinancialPage() {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
            {/* Title strip aligned with dashboard spacing */}
            <div className="px-3 sm:px-6 lg:px-8 pt-3 pb-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    Financial Management
                </h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                    Choose the financial section you want to access
                </p>
            </div>

            {/* Section label like dashboard */}
            <div className="px-3 sm:px-6 lg:px-8 pt-4 pb-4">
                <div className="flex items-center gap-3">
                    <span
                        className="w-[3px] h-5 rounded-full inline-block flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,hsl(216,100%,36%) 0%,hsl(216,90%,48%) 100%)' }}
                    />
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                        Financial Sections &nbsp;·&nbsp; {financialMenuItems.length} sections
                    </p>
                </div>
            </div>

            {/* Grid dimensions mirrored from dashboard */}
            <div className="flex-1 px-3 sm:px-6 lg:px-8 pb-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
                    {financialMenuItems.map((item, i) => (
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
                                        {`6.${i + 1}`}
                                    </span>
                                    -
                                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-[11.5px] sm:text-[12.5px]
                                        leading-tight line-clamp-2 transition-colors duration-200
                                        group-hover:text-brand-sky-700 dark:group-hover:text-brand-sky-400">
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
            </div>
        </div>
    );
}
