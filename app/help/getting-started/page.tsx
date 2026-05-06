'use client';

import React from 'react';
import {
    Monitor, LogIn, LayoutDashboard, PanelLeft, Table2, FilePlus,
    SendHorizonal, BookOpen, Globe, Cookie, CheckCircle,
    Shield, Key, Users, GitBranch,
    Layers, Building2, Lightbulb, Info,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, SectionCard, StepList, FeatureList } from '../_components';
import { cn } from '@/lib/utils';

const STEP_ICON_STYLE = 'p-3 rounded-2xl text-white shrink-0';

const STEPS = [
    {
        num: '01',
        icon: LogIn,
        iconColor: 'bg-sky-500',
        title: 'Log In to BEAM',
        description:
            'Access the system by navigating to the BEAM login page. Enter your credentials — every user account follows the email format username@beam.local with the password assigned by your administrator. Your session stays secure and you remain logged in until you sign out.',
        details: [
            'Open your browser and navigate to the BEAM login URL provided by your IT team.',
            'Enter your email (e.g. admin@beam.local) in the Email field.',
            'Enter your password in the Password field.',
            'Click "Sign In" — the system logs you in and redirects to the Dashboard.',
            'You are redirected to the Dashboard automatically on success.',
        ],
        tips: [
            'Default password for most accounts is Beam@2026 (SYSADMIN uses Admin@2026!).',
            'You stay logged in until you explicitly sign out or your session expires.',
            'If you enter incorrect credentials three times, wait a few seconds before retrying.',
            'Contact your IT administrator if you forget your password — they can reset it from the Users module.',
        ],
    },
    {
        num: '02',
        icon: LayoutDashboard,
        iconColor: 'bg-indigo-500',
        title: 'Explore the Dashboard',
        description:
            'After logging in you land on the Dashboard — the central hub of BEAM. It displays a personalised greeting based on the time of day and 24 module cards arranged in a responsive grid. Each card represents a system module you can access based on your role permissions.',
        details: [
            'The Dashboard greets you with "Good Morning", "Good Afternoon", or "Good Evening" plus your name.',
            'All 24 system modules are shown as cards with icons, titles, and short descriptions.',
            'Cards are arranged in a responsive grid — 1 column on mobile, 2 on tablet, 3-4 on desktop.',
            'Click any module card to navigate directly into that module.',
            'Modules you lack permission to view may be hidden or show a restricted badge.',
        ],
        tips: [
            'Use the Dashboard as your home base — you can always return here from any module.',
            'The grid layout adapts to your screen size automatically.',
            'Module cards include icons and colour coding for quick visual scanning.',
            'Your most-used modules will feel familiar after a few visits — the layout stays consistent.',
        ],
    },
    {
        num: '03',
        icon: PanelLeft,
        iconColor: 'bg-violet-500',
        title: 'Navigate Modules',
        description:
            'Once inside a module, BEAM provides a context-aware sidebar, breadcrumbs at the top of every page, and a "Back to Dashboard" button so you never get lost. The sidebar shows only the pages and actions relevant to the current module.',
        details: [
            'Enter any module by clicking its card on the Dashboard.',
            'The sidebar on the left updates to show pages specific to that module (e.g. "List", "Create", "Pending Requests").',
            'Breadcrumbs at the top of every page show your exact location in the hierarchy — click any segment to jump back.',
            'Click the "Back to Dashboard" link at the top of the sidebar to return home.',
            'On smaller screens the sidebar collapses into a hamburger menu to save space.',
        ],
        tips: [
            'Breadcrumbs are clickable — use them for fast back-navigation without losing context.',
            'The sidebar highlights the current page so you always know where you are.',
            'On mobile, tap the menu icon to expand or collapse the sidebar.',
            'Each module is self-contained — the sidebar only shows actions you can perform based on your permissions.',
        ],
    },
    {
        num: '04',
        icon: Table2,
        iconColor: 'bg-emerald-500',
        title: 'Work with Data Tables',
        description:
            'BEAM uses enhanced data tables throughout the system for listing records. Tables support searching, filtering, sorting, and pagination so you can quickly find exactly what you need — even in modules with thousands of records.',
        details: [
            'Every list page shows records in a data table with columns for key fields.',
            'Use the Search bar at the top to filter records by name, number, email, or description.',
            'Dropdown filters let you narrow results by status, type, role, department, or other dimensions.',
            'Click any column header to sort ascending/descending — an arrow icon shows the current sort direction.',
            'Pagination controls at the bottom let you move between pages.',
            'An "Items per page" selector lets you choose how many rows to display (10, 25, 50, 100).',
        ],
        tips: [
            'Combine search and filters for powerful queries — e.g. search "Ahmed" with filter "Department: Finance".',
            'Sorting persists while you paginate, so the order stays consistent.',
            'Use the "Export Excel" button (where available) to download the current filtered dataset.',
            'The Refresh button reloads the table data without navigating away.',
        ],
    },
    {
        num: '05',
        icon: FilePlus,
        iconColor: 'bg-amber-500',
        title: 'Create New Records',
        description:
            'To add new data — whether it is a project, employee, invoice, or client — click the "Create" button found on list pages or in the sidebar. Each form guides you through the required and optional fields with real-time validation.',
        details: [
            'Navigate to the module where you want to create a record (e.g. Clients, Projects, Employees).',
            'Click the "Create" button — typically found in the page header or sidebar.',
            'Fill in the form fields — required fields are marked with an asterisk (*).',
            'The form validates your input in real-time: invalid fields show red borders and error messages.',
            'Click "Submit" or "Save" to create the record.',
            'A success toast notification confirms the record was created — or an error toast explains what went wrong.',
        ],
        tips: [
            'Always complete all required (*) fields before submitting — the form will block submission otherwise.',
            'File upload fields accept images (JPG, PNG) and documents (PDF) depending on the module.',
            'Some records (Clients, Contracts, Disbursements) enter a "Pending" state and require approval after creation.',
            'You can often navigate away from a form without saving — but unsaved data will be lost.',
        ],
    },
    {
        num: '06',
        icon: SendHorizonal,
        iconColor: 'bg-teal-500',
        title: 'Submit for Approval',
        description:
            'Many records in BEAM go through a multi-stage approval workflow before they become active. After creating a record that requires approval, it enters "Pending" status and moves through a chain of reviewers based on the module\'s workflow configuration.',
        details: [
            'Create a record that requires approval (e.g. a new Client, Contract, or Disbursement).',
            'The record enters "Pending" status automatically — you will see a status badge on the record.',
            'Authorised approvers receive the request in their approval queue (Requests module).',
            'Each approver reviews the details and either Approves or Rejects with a comment.',
            'The record may pass through multiple approval stages (e.g. Staff → Manager → Director → CEO).',
            'Once fully approved, the record\'s status changes to "Approved" or "Active".',
            'If rejected at any stage, the record returns to you with feedback for corrections.',
        ],
        tips: [
            'Track your pending requests in the Requests module — see which stage each record is at.',
            'The approval chain varies by module: Client approvals are shorter, Disbursements have up to 4 stages.',
            'You can view the full approval timeline on any record\'s detail page.',
            'If a request is rejected, read the reviewer\'s comment, make corrections, and resubmit.',
        ],
    },
];

const KEY_CONCEPTS = [
    {
        icon: Shield,
        iconColor: 'bg-sky-500',
        term: 'Role',
        definition: 'Your role (like CEO, Finance Manager, or HR Staff) determines what you can see and do in the system. BEAM has 24 different roles, each with their own set of permissions.',
    },
    {
        icon: Key,
        iconColor: 'bg-amber-500',
        term: 'Permission',
        definition: 'Permissions control what actions you can perform in each module — View, Create, Edit, Delete, or Approve. Your role sets your default permissions, but IT can adjust them individually.',
    },
    {
        icon: Users,
        iconColor: 'bg-violet-500',
        term: 'Individual Permission Adjustment',
        definition: 'The IT team can give you extra access (or remove access) for specific features without changing your overall role. For example, you could be given delete access that your role normally doesn\'t include.',
    },
    {
        icon: GitBranch,
        iconColor: 'bg-teal-500',
        term: 'Approval Chain',
        definition: 'Some records (like payments or contracts) need to be reviewed and approved by multiple people before they take effect. Each person reviews and either approves or sends it back for changes.',
    },
    {
        icon: Layers,
        iconColor: 'bg-indigo-500',
        term: 'Module',
        definition: 'A section of BEAM focused on a specific area — like Financial, Projects, or Inventory. Each module has its own pages, data, and actions accessible from the sidebar.',
    },
    {
        icon: Building2,
        iconColor: 'bg-emerald-500',
        term: 'Department',
        definition: 'An organizational unit (like Finance, HR, or IT) that groups employees. BEAM has 13 departments, each with designated heads and specific modules they can access.',
    },
];

const BROWSERS = [
    { name: 'Chrome 90+', share: 'Recommended' },
    { name: 'Firefox 88+', share: 'Supported' },
    { name: 'Safari 14+', share: 'Supported' },
    { name: 'Edge 90+', share: 'Supported' },
];

export default function GettingStartedPage() {
    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Getting Started"
                description="A step-by-step onboarding guide to help you log in, explore the dashboard, navigate modules, work with data, create records, and understand the approval workflow."
            />

            {/* Quick overview stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { value: '6', label: 'Steps', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/20' },
                    { value: '24', label: 'Module Cards', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
                    { value: '~5 min', label: 'Read Time', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
                ].map(s => (
                    <div key={s.label} className={cn('rounded-xl p-4 flex items-center gap-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900', s.bg)}>
                        <div>
                            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* System Requirements */}
            <SectionCard icon={Monitor} iconColor="bg-sky-500" title="System Requirements" subtitle="Make sure your environment is ready">
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Globe className="h-4 w-4 text-sky-500" />
                            Supported Browsers
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {BROWSERS.map(b => (
                                <div key={b.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{b.name}</p>
                                        <p className="text-xs text-slate-400">{b.share}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-sky-500" />
                            Additional Requirements
                        </h3>
                        <ul className="space-y-2">
                            {[
                                { icon: Globe, text: 'JavaScript must be enabled in your browser settings.' },
                                { icon: Cookie, text: 'Cookies must be enabled — BEAM uses cookies to keep you signed in.' },
                                { icon: Monitor, text: 'Minimum screen width of 320px supported — optimised for 1024px and above.' },
                                { icon: Globe, text: 'Stable internet connection required to use the system.' },
                            ].map((r, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                    <r.icon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                                    {r.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </SectionCard>

            {/* Steps */}
            {STEPS.map(step => {
                const Icon = step.icon;
                return (
                    <div key={step.num} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                        {/* Step header */}
                        <div className="flex items-start gap-4 p-6 pb-4">
                            <div className={cn(STEP_ICON_STYLE, step.iconColor)}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/30 px-2 py-0.5 rounded-full">
                                        Step {step.num}
                                    </span>
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{step.title}</h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">{step.description}</p>
                            </div>
                        </div>

                        {/* How-to steps */}
                        <div className="px-6 pb-4">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-sky-500" />
                                How to do it
                            </h3>
                            <StepList steps={step.details} />
                        </div>

                        {/* Tips */}
                        <div className="px-6 pb-6">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                Tips
                            </h3>
                            <ul className="space-y-2">
                                {step.tips.map((tip, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                                        <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            })}

            {/* Key Concepts Glossary */}
            <SectionCard icon={BookOpen} iconColor="bg-sky-500" title="Key Concepts" subtitle="Essential terminology you'll encounter throughout BEAM">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {KEY_CONCEPTS.map(concept => {
                        const Icon = concept.icon;
                        return (
                            <div key={concept.term} className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 space-y-2">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn('p-1.5 rounded-lg text-white', concept.iconColor)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{concept.term}</h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{concept.definition}</p>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>
        </div>
    );
}
