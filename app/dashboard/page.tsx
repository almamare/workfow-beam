'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_LINK_LABELS, LEGAL_ROUTES } from '@/lib/legal';
import {
    Users,
    FileText,
    FolderOpen,
    Wallet,
    Settings,
    ClipboardList,
    UserCircle,
    Bell,
    FileSignature,
    BarChart2,
    FileArchive,
    PieChart,
    Shield,
    Receipt,
    Landmark,
    TrendingUp,
    CheckCircle,
    History,
    Package,
    Briefcase,
    Bot,
    FileCheck,
    LayoutGrid,
} from 'lucide-react';

/** Product name shown on the dashboard strip (matches app branding). */
const SYSTEM_NAME = 'BEAM';

// ── Sections ───────────────────────────────────────────────────────────────────
const sections = [
    { title: 'Clients', icon: UserCircle, href: '/clients', color: '#7c3aed', bg: '#f5f3ff' },
    { title: 'Projects', icon: FolderOpen, href: '/projects', color: '#4f46e5', bg: '#eef2ff' },
    { title: 'Project Contracts', icon: FileCheck, href: '/project-contracts', color: '#0891b2', bg: '#ecfeff' },
    { title: 'Task Orders', icon: ClipboardList, href: '/tasks', color: '#d97706', bg: '#fffbeb' },
    { title: 'Users', icon: Users, href: '/users', color: '#2563eb', bg: '#eff6ff' },
    { title: 'Financial', icon: Wallet, href: '/financial', color: '#059669', bg: '#ecfdf5' },
    { title: 'Requests', icon: FileText, href: '/requests/tasks', color: '#ca8a04', bg: '#fefce8' },
    { title: 'Settings', icon: Settings, href: '/settings', color: '#475569', bg: '#f8fafc' },
    { title: 'Notifications', icon: Bell, href: '/notifications', color: '#dc2626', bg: '#fff1f2' },
    { title: 'Forms', icon: FileSignature, href: '/forms', color: '#0d9488', bg: '#f0fdfa' },
    { title: 'Reports', icon: BarChart2, href: '/reports', color: '#0284c7', bg: '#f0f9ff' },
    { title: 'Documents', icon: FileArchive, href: '/documents', color: '#10b981', bg: '#ecfdf5' },
    { title: 'Statistics', icon: PieChart, href: '/statistics', color: '#9333ea', bg: '#faf5ff' },
    { title: 'Permissions', icon: Shield, href: '/permissions', color: '#7c3aed', bg: '#f5f3ff' },
    { title: 'Invoices', icon: Receipt, href: '/invoices', color: '#e11d48', bg: '#fff1f2' },
    { title: 'Banks', icon: Landmark, href: '/banks', color: '#0891b2', bg: '#ecfeff' },
    { title: 'Analysis', icon: TrendingUp, href: '/analysis', color: '#65a30d', bg: '#f7fee7' },
    { title: 'Approvals', icon: CheckCircle, href: '/approvals', color: '#db2777', bg: '#fdf2f8' },
    { title: 'Timeline', icon: History, href: '/timeline', color: '#64748b', bg: '#f8fafc' },
    { title: 'History', icon: History, href: '/history', color: '#4f46e5', bg: '#eef2ff' },
    { title: 'Inventory', icon: Package, href: '/inventory/items', color: '#ea580c', bg: '#fff7ed' },
    { title: 'Departments', icon: Briefcase, href: '/departments', color: '#0d9488', bg: '#f0fdfa' },
    { title: 'AI Assistant', icon: Bot, href: '/ai', color: '#7c3aed', bg: '#f5f3ff' },
];

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const user = useSelector((state: RootState) => state.login.user);
    const [userName, setUserName] = useState('');
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        if (user?.name) setUserName(`${user.name} ${user.surname ?? ''}`.trim());
        setDateStr(new Date().toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        }));
    }, [user]);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">

            {/* ── Brand Header ── */}
            <header
                className="relative shrink-0 overflow-hidden border-b border-sky-500/25
            min-h-[3rem] sm:min-h-[3.5rem]
            flex items-center
            rounded-xl
            px-4 sm:px-6 lg:px-8 py-2
            bg-[linear-gradient(108deg,hsl(201,96%,14%)_0%,hsl(200,76%,20%)_42%,hsl(215,32%,14%)_100%)]"
            >
                {/* Top Accent Line */}
                <div
                    className="absolute top-0 left-0 right-0 h-[2px] z-[1]
                    bg-[linear-gradient(90deg,hsl(43,96%,58%)_0%,hsl(199,85%,72%)_50%,hsl(43,96%,58%)_100%)] opacity-90"
                    aria-hidden
                />

                {/* Background Effects (desktop only for performance) */}
                <div
                    className="hidden sm:block pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at center, rgba(255,255,255,0.5) 1px, transparent 1.2px)',
                        backgroundSize: '14px 14px',
                    }}
                    aria-hidden
                />

                <div
                    className="hidden sm:block pointer-events-none absolute inset-0 z-0 opacity-[0.03]
                    bg-[linear-gradient(125deg,transparent_48%,rgba(255,255,255,0.3)_48%,rgba(255,255,255,0.3)_52%,transparent_52%)]
                    bg-[length:10px_10px]"
                    aria-hidden
                />

                <div
                    className="hidden sm:block pointer-events-none absolute -right-16 top-1/2 h-[140%] w-40 -translate-y-1/2 rounded-full
                    bg-sky-400/15 blur-2xl"
                    aria-hidden
                />

                {/* Content */}
                <div className="relative z-[2] flex items-center justify-between w-full gap-3">

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0 max-w-[220px] sm:max-w-none leading-tight space-y-1">
                            <h1 className="text-sm sm:text-[16px] font-semibold text-white tracking-[0.10em] truncate uppercase">
                                Shuaa Al-Ranou
                            </h1>

                            <p className="text-[10px] font-medium uppercase text-sky-200/70 truncate">
                                Trade &amp; General Contracting
                            </p>

                            <p className="text-[10px] text-white font-medium tracking-wide truncate">
                                Enterprise management platform
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">

                        {/* Badge */}
                        <div className="flex items-center">
                            <span
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-400/20 bg-emerald-500/10
                              px-2 py-0.5 text-[10px] font-medium text-emerald-100/95 whitespace-nowrap"
                            >
                                <Shield className="h-3 w-3 opacity-80" aria-hidden />
                                Role-based access
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-6 w-px bg-white/10" />

                        {/* User Info */}
                        <div className="flex flex-col items-start sm:items-end sm:text-right text-xs text-sky-100/85 whitespace-nowrap">
                            <p>
                                <span className="text-sky-200/70">{greeting()}, </span>
                                <span className="font-semibold text-white">
                                    {userName || 'Welcome'}
                                </span>
                            </p>

                            {dateStr && (
                                <p className="text-[10px] text-white">
                                    {dateStr}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </header>

            {/* ── SECTION TITLE ─────────────────────────────────────────────── */}
            <div className="px-5 sm:px-8 lg:px-10 pt-7 pb-4">
                <div className="flex items-center gap-3">
                    <span className="w-[3px] h-5 rounded-full inline-block flex-shrink-0"
                        style={{ background: 'linear-gradient(180deg,hsl(199,89%,42%),hsl(199,89%,64%))' }} />
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">
                        System Modules &nbsp;·&nbsp; {sections.length} sections
                    </p>
                </div>
            </div>

            {/* ── GRID ─────────────────────────────────────────────────────── */}
            <div className="flex-1 px-3 sm:px-6 lg:px-8 pb-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4">
                    {sections.map((s, i) => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
                        >
                            <div className="relative flex flex-col items-center justify-center text-center gap-3
                                bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/60
                                px-2 py-5 sm:py-6 overflow-hidden
                                transition-all duration-200
                                hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)] hover:-translate-y-1
                                active:scale-[0.97] active:translate-y-0 cursor-pointer min-h-[110px] sm:min-h-[130px]">

                                {/* Top micro accent line — appears on hover */}
                                <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full scale-x-0 group-hover:scale-x-100
                                    transition-transform duration-300 origin-center"
                                    style={{ background: s.color }} />

                                {/* Icon container */}
                                <div
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0
                                        transition-transform duration-200 group-hover:scale-110"
                                    style={{ background: s.bg }}
                                >
                                    <s.icon
                                        className="w-6 h-6 sm:w-[26px] sm:h-[26px] transition-colors duration-200"
                                        style={{ color: s.color }}
                                    />
                                </div>

                                {/* Number + Title */}
                                <div className="flex items-baseline justify-center gap-1.5 px-1 w-full">
                                    <span className="font-black text-[13px] sm:text-[14px] leading-none tabular-nums flex-shrink-0
                                        transition-colors duration-200">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    -
                                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-[11.5px] sm:text-[12.5px]
                                        leading-tight line-clamp-2 transition-colors duration-200
                                        group-hover:text-sky-700 dark:group-hover:text-sky-400">
                                        {s.title}
                                    </p>
                                </div>

                                {/* Hover background glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-200 pointer-events-none rounded-2xl"
                                    style={{ background: s.color }}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <footer className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="px-5 sm:px-8 lg:px-10 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    {/* Left — copyright */}
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0 opacity-70">
                            <img src="/icon-512.png" alt="" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            © {new Date().getFullYear()}&nbsp;
                            <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Shuaa Al-Ranou Trade &amp; General Contracting
                            </span>
                            . All rights reserved.
                            <span className="hidden sm:inline text-slate-300 dark:text-slate-700 mx-2">|</span>
                            <span className="hidden sm:inline">
                                Developed by&nbsp;
                                <span className="font-semibold text-slate-500 dark:text-slate-400">Lebilix LLC</span>
                            </span>
                        </p>
                    </div>

                    {/* Right — legal (same routes as login page) */}
                    <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 pl-7 sm:pl-0" aria-label="Legal">
                        <Link
                            href={LEGAL_ROUTES.privacyPolicy}
                            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium"
                        >
                            {LEGAL_LINK_LABELS.privacyPolicy}
                        </Link>
                        <span className="hidden sm:block w-px h-3 bg-slate-200 dark:bg-slate-700 flex-shrink-0" aria-hidden />
                        <Link
                            href={LEGAL_ROUTES.termsOfUse}
                            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-medium"
                        >
                            {LEGAL_LINK_LABELS.termsOfUse}
                        </Link>
                    </nav>
                </div>
            </footer>

        </div>
    );
}
