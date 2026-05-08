'use client';

import React from 'react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, SectionCard } from '../_components';
import { NAVIGATION_SECTIONS } from '../_data';
import { cn } from '@/lib/utils';
import {
    Monitor, Navigation, ChevronRight, Search,
    ClipboardList, RefreshCw, LayoutDashboard,
    ArrowLeft, Menu,
} from 'lucide-react';

const PAGE_LAYOUT_STEPS = [
    { num: 1, label: 'Breadcrumb', desc: 'Shows your current location in the system hierarchy. Click any segment to navigate back up.' },
    { num: 2, label: 'Page Title & Create Button', desc: 'The main heading of the current page with a primary action button (e.g. "Create Project").' },
    { num: 3, label: 'Stats Cards', desc: 'Quick summary metrics displayed as colored cards — totals, counts, and key indicators.' },
    { num: 4, label: 'Filter Bar', desc: 'Search input and dropdown filters to narrow down the data table results instantly.' },
    { num: 5, label: 'Data Table', desc: 'The main content area showing records with sortable columns, pagination, and row actions.' },
    { num: 6, label: 'Sidebar', desc: 'Context-aware navigation panel on the left showing module-specific pages and actions.' },
];

const SIDEBAR_MODULES = [
    {
        title: 'Projects',
        color: 'bg-indigo-500',
        items: ['All Projects', 'Create Project', 'Project Details', 'Tenders', 'Milestones'],
    },
    {
        title: 'Clients',
        color: 'bg-purple-500',
        items: ['All Clients', 'Create Client', 'Client Contracts', 'Pending Requests', 'Approved Requests'],
    },
    {
        title: 'Users & HR',
        color: 'bg-blue-500',
        items: ['All Users', 'Create User', 'Employees', 'Departments', 'Permissions', 'Roles'],
    },
    {
        title: 'Financial',
        color: 'bg-emerald-500',
        items: ['Disbursements', 'Financial Inbox', 'Petty Cash', 'Cash Ledger', 'Loans', 'Payroll', 'Budgets'],
    },
    {
        title: 'Banks',
        color: 'bg-cyan-500',
        items: ['All Banks', 'Create Bank', 'Exchange List', 'Exchange Balances', 'Bank Balances'],
    },
    {
        title: 'AI Assistant',
        color: 'bg-fuchsia-500',
        items: ['AI Chat', 'Financial Analysis', 'Anomaly Detection', 'Budget Forecasting', 'Smart Summarization'],
    },
];

const TIPS = [
    { icon: ChevronRight, text: 'Click column headers to sort data ascending or descending' },
    { icon: Search, text: 'Use the search bar to filter records instantly by name, email, or ID' },
    { icon: ClipboardList, text: 'Hover over stat cards for a visual highlight effect' },
    { icon: RefreshCw, text: 'Click the refresh button to reload data without a full page refresh' },
    { icon: Navigation, text: 'Use breadcrumbs to quickly jump back to parent pages' },
    { icon: ArrowLeft, text: 'Click "Back to Dashboard" in the sidebar to return to the home grid' },
];

export default function NavigationGuidePage() {
    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Navigation Guide"
                description="Learn how to navigate through the BEAM system efficiently — from the dashboard grid to module sidebars, breadcrumbs, search, and data tables."
            />

            {/* Navigation Elements Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Navigation Elements</h2>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {NAVIGATION_SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <div
                                key={section.title}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-3 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn('p-2.5 rounded-xl text-white shrink-0', section.color)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{section.title}</h3>
                                        <span className="text-xs font-medium text-brand-sky-600 dark:text-brand-sky-400">{section.where}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{section.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Page Layout Anatomy */}
            <SectionCard icon={Monitor} iconColor="bg-brand-sky-500" title="Page Layout Anatomy" subtitle="Every listing page in BEAM follows this consistent 6-part structure">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PAGE_LAYOUT_STEPS.map(step => (
                        <div key={step.num} className="flex gap-3 items-start p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                            <div className="w-7 h-7 rounded-full bg-brand-sky-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {step.num}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{step.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Sidebar Module Structure */}
            <SectionCard icon={Menu} iconColor="bg-indigo-500" title="Sidebar Module Structure" subtitle="Each module has a dedicated sidebar with context-aware navigation links">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SIDEBAR_MODULES.map(mod => (
                        <div key={mod.title} className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className={cn('w-2.5 h-2.5 rounded-full', mod.color)} />
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{mod.title}</h4>
                            </div>
                            <ul className="space-y-1">
                                {mod.items.map(item => (
                                    <li key={item} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* Keyboard & Mouse Tips */}
            <SectionCard icon={Navigation} iconColor="bg-emerald-500" title="Keyboard & Mouse Tips" subtitle="Quick interaction tips to boost your productivity">
                <div className="grid sm:grid-cols-2 gap-3">
                    {TIPS.map(tip => {
                        const TipIcon = tip.icon;
                        return (
                            <div key={tip.text} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <TipIcon className="h-4 w-4 text-brand-sky-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">{tip.text}</p>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* Responsive Design */}
            <SectionCard icon={LayoutDashboard} iconColor="bg-violet-500" title="Responsive Design" subtitle="BEAM adapts to all screen sizes automatically">
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-brand-sky-500" />
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Desktop</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Full sidebar always visible on the left. Dashboard shows the complete module grid. Data tables display all columns with comfortable spacing.
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tablet</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Sidebar collapses to icons-only mode by default. Click the expand button to reveal full labels. Tables adjust column visibility for the narrower viewport.
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                            <Menu className="h-4 w-4 text-violet-500" />
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mobile</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            Sidebar is hidden behind a hamburger menu button. Tap the menu icon to slide in the navigation panel. Tables become scrollable horizontally.
                        </p>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
