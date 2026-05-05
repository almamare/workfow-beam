'use client';

import React from 'react';
import Link from 'next/link';
import {
    HelpCircle, BookOpen, Layers, Navigation, Building2, Shield,
    GitBranch, Key, MessageSquare, ChevronRight, Info,
    Eye, FilePlus, Edit, Trash2, ThumbsUp, Users, DollarSign,
    CheckCircle, ClipboardList,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { cn } from '@/lib/utils';

const HELP_SECTIONS = [
    {
        title: 'Getting Started',
        desc: 'Step-by-step onboarding guide, system requirements, first login walkthrough, and key concepts to get you up and running quickly.',
        icon: BookOpen,
        color: 'bg-indigo-500',
        href: '/help/getting-started',
        tag: '6 steps',
    },
    {
        title: 'System Modules',
        desc: 'Detailed guide to all 14 system modules — Projects, Clients, Financial, HR, Inventory, and more — with features and step-by-step tutorials.',
        icon: Layers,
        color: 'bg-violet-500',
        href: '/help/modules',
        tag: '14 modules',
    },
    {
        title: 'Navigation Guide',
        desc: 'Learn how to navigate the system: dashboard, sidebar, breadcrumbs, search, filters, data tables, and page layout anatomy.',
        icon: Navigation,
        color: 'bg-cyan-500',
        href: '/help/navigation',
        tag: 'UI guide',
    },
    {
        title: 'Departments',
        desc: 'Complete directory of all 13 departments with organizational structure, roles, responsibilities, and module access levels.',
        icon: Building2,
        color: 'bg-blue-500',
        href: '/help/departments',
        tag: '13 departments',
    },
    {
        title: 'Roles & Permissions',
        desc: 'Learn what each role can do: 24 roles, 5 access levels, and how permissions work for every module in the system.',
        icon: Shield,
        color: 'bg-amber-500',
        href: '/help/roles',
        tag: '24 roles',
    },
    {
        title: 'Approval Workflows',
        desc: 'How multi-stage approval chains work for clients, contracts, disbursements, and task orders — from creation to final sign-off.',
        icon: GitBranch,
        color: 'bg-teal-500',
        href: '/help/workflows',
        tag: '4 workflows',
    },
    {
        title: 'Login Credentials',
        desc: 'Default system user accounts, passwords, and email formats for initial setup. Security notice and account management guide.',
        icon: Key,
        color: 'bg-emerald-500',
        href: '/help/credentials',
        tag: '24 accounts',
    },
    {
        title: 'FAQ',
        desc: 'Frequently asked questions about passwords, permissions, approvals, exports, the AI assistant, and general system usage.',
        icon: MessageSquare,
        color: 'bg-pink-500',
        href: '/help/faq',
        tag: '15 questions',
    },
];

export default function HelpCenterPage() {
    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Help Center</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Complete documentation and tutorials for <span className="font-semibold text-sky-600 dark:text-sky-400">BEAM</span> — Business Enterprise Asset Management
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { value: '14', label: 'Modules', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20' },
                    { value: '13', label: 'Departments', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                    { value: '24', label: 'Roles', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/20' },
                    { value: '5', label: 'Access Levels', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                    { value: '26', label: 'System Users', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                ].map(s => (
                    <div key={s.label} className={cn('rounded-xl p-4 flex items-center gap-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900', s.bg)}>
                        <div>
                            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* About BEAM */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sky-500 text-white shrink-0">
                            <Info className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">About BEAM</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <strong>BEAM</strong> (Business Enterprise Asset Management) is a fully integrated ERP platform
                        built for <strong>Shuaa Al-Ranou Trade & General Contracting</strong>. It unifies projects, contracts,
                        HR, finance, procurement, inventory, and more into a single platform with role-based access control
                        down to individual permission flags.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-500 text-white shrink-0">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">What Can You Do?</h2>
                    </div>
                    <div className="space-y-2.5">
                        {[
                            { icon: Users, text: 'Manage clients, employees, and user accounts', color: 'text-blue-500' },
                            { icon: DollarSign, text: 'Process payments, track budgets, and manage finances', color: 'text-emerald-500' },
                            { icon: ClipboardList, text: 'Create projects, contracts, and task orders', color: 'text-amber-500' },
                            { icon: ThumbsUp, text: 'Submit and approve requests through multi-stage workflows', color: 'text-purple-500' },
                            { icon: Eye, text: 'Generate reports, export data, and analyze performance', color: 'text-sky-500' },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.text} className="flex items-center gap-3">
                                    <Icon className={cn('h-4 w-4 shrink-0', item.color)} />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Permission Types Quick Ref */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white shrink-0">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Access Levels</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Every module uses these 5 types of permissions</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { icon: Eye, label: 'View', color: 'text-blue-500', desc: 'See and browse records' },
                        { icon: FilePlus, label: 'Create', color: 'text-green-500', desc: 'Add new records' },
                        { icon: Edit, label: 'Edit', color: 'text-amber-500', desc: 'Update existing records' },
                        { icon: Trash2, label: 'Delete', color: 'text-red-500', desc: 'Remove records' },
                        { icon: ThumbsUp, label: 'Approve', color: 'text-purple-500', desc: 'Sign off on requests' },
                    ].map(f => {
                        const Icon = f.icon;
                        return (
                            <div key={f.label} className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <Icon className={cn('h-4 w-4 shrink-0', f.color)} />
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{f.label}</p>
                                    <p className="text-xs text-slate-400">{f.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section Cards Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Documentation Sections</h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {HELP_SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <Link key={section.href} href={section.href} className="group block">
                                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-3 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full">
                                    <div className="flex items-start justify-between">
                                        <div className={cn('p-2.5 rounded-xl text-white shrink-0', section.color)}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">{section.tag}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{section.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{section.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400">
                                        Read more <ChevronRight className="h-3 w-3" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
