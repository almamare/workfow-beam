'use client';

import React from 'react';
import {
    Shield, Eye, FilePlus, Edit, Trash2, ThumbsUp,
    Zap, ArrowRight, ChevronRight, Key, Info,
    CheckCircle, Users,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, SectionCard, PermBadge } from '../_components';
import { ROLES_MATRIX, PERMISSION_FLAGS, TYPE_COLORS } from '../_data';
import { cn } from '@/lib/utils';

export default function RolesPermissionsPage() {
    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Roles & Permissions"
                description="Learn what each role can do in BEAM, what permissions they have, and how access is controlled across the system."
            />

            {/* ── What Are Permissions? ── */}
            <SectionCard icon={Shield} iconColor="bg-brand-sky-500" title="How Permissions Work" subtitle="A simple guide to understanding access levels">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Every user in BEAM is assigned a <strong>Role</strong> (like Finance Staff, HR Director, or Operations Manager).
                        Your role determines what you can see and do in the system. Each role has a set of <strong>permission flags</strong> for
                        every module — these flags control whether you can view records, create new ones, edit existing ones, delete them, or approve requests.
                    </p>
                    <div className="rounded-lg bg-brand-sky-50 dark:bg-brand-sky-950/20 border border-brand-sky-200 dark:border-brand-sky-800 p-4">
                        <p className="text-sm text-brand-sky-700 dark:text-brand-sky-400">
                            <strong>Example:</strong> A Finance Staff member can view financial records and create new disbursements,
                            but cannot delete records or approve payments. A Finance Manager can do everything Finance Staff can, plus approve payments.
                            The CFO can do everything, including final sign-off on large transactions.
                        </p>
                    </div>
                </div>
            </SectionCard>

            {/* ── Permission Flags ── */}
            <SectionCard icon={Key} iconColor="bg-amber-500" title="What Each Permission Means" subtitle="There are 5 types of permissions for every module">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PERMISSION_FLAGS.map(f => {
                        const Icon = f.icon;
                        return (
                            <div key={f.key} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', f.color)} />
                                <div className="space-y-1">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{f.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ── Real-World Examples ── */}
            <SectionCard icon={Users} iconColor="bg-violet-500" title="Real-World Examples" subtitle="See how permissions work in everyday situations">
                <div className="space-y-3">
                    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Trash2 className="h-4 w-4 text-red-500" />
                            <p className="text-sm font-semibold text-red-700 dark:text-red-300">Finance Staff tries to delete a payment record</p>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                            Finance Staff does not have the <strong>Delete</strong> permission for financial records.
                            The system shows an &quot;Access Denied&quot; message. Only Finance Directors or the System Admin can delete financial records.
                        </p>
                    </div>

                    <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-semibold text-green-700 dark:text-green-300">System Admin deletes the same record</p>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 leading-relaxed">
                            The System Admin has <strong>full access</strong> to every module. They can view, create, edit, delete,
                            and approve anything in the system — no restrictions apply.
                        </p>
                    </div>

                    <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">IT gives an HR Staff member extra access</p>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                            The IT department can give <strong>individual users</strong> extra permissions without changing their role.
                            For example, they can allow a specific HR Staff member to delete employee records, even though other HR Staff cannot.
                        </p>
                    </div>

                    <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="h-4 w-4 text-purple-600" />
                            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Operations Manager approves a task order</p>
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 leading-relaxed">
                            The Operations Manager has the <strong>Approve</strong> permission for task orders. When a team member submits a task order,
                            the manager can review it and approve it directly from the pending requests list.
                        </p>
                    </div>
                </div>
            </SectionCard>

            {/* ── Approval Chain Example ── */}
            <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 p-5">
                <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="h-4 w-4 text-indigo-600" />
                    <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Example: How a Payment Gets Approved</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    {[
                        { role: 'Finance Staff', action: 'Creates the payment' },
                        { role: 'Finance Manager', action: 'Reviews & verifies' },
                        { role: 'CFO', action: 'Approves the amount' },
                        { role: 'CEO', action: 'Final sign-off' },
                    ].map((step, i, arr) => (
                        <React.Fragment key={step.role}>
                            <div className="flex flex-col items-center gap-1">
                                <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                                    {step.role}
                                </span>
                                <span className="text-indigo-500 dark:text-indigo-400">{step.action}</span>
                            </div>
                            {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />}
                        </React.Fragment>
                    ))}
                </div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 leading-relaxed">
                    Each person in the chain reviews the payment and either approves it or sends it back with comments.
                    If anyone rejects, the payment goes back to the creator to fix and resubmit.
                </p>
            </div>

            {/* ── Roles Matrix Table ── */}
            <SectionCard icon={Shield} iconColor="bg-brand-sky-500" title="All System Roles" subtitle="What each role can do across the system">
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                                <th className="py-3 pr-3 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                <th className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Department</th>
                                <th className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 text-center" title="Can View">
                                    <Eye className="h-3.5 w-3.5 mx-auto text-blue-500" />
                                </th>
                                <th className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 text-center" title="Can Create">
                                    <FilePlus className="h-3.5 w-3.5 mx-auto text-green-500" />
                                </th>
                                <th className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 text-center" title="Can Edit">
                                    <Edit className="h-3.5 w-3.5 mx-auto text-amber-500" />
                                </th>
                                <th className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 text-center" title="Can Delete">
                                    <Trash2 className="h-3.5 w-3.5 mx-auto text-red-500" />
                                </th>
                                <th className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-300 text-center" title="Can Approve">
                                    <ThumbsUp className="h-3.5 w-3.5 mx-auto text-purple-500" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROLES_MATRIX.map(r => {
                                const canView = true;
                                const canCreate = r.perms >= 7;
                                const canEdit = r.perms >= 5;
                                const canDelete = r.perms >= 8 || r.role.includes('DIR') || r.role === 'CFO';
                                const canApprove = r.role.includes('DIR') || r.role === 'CFO' || r.role === 'COM_DIR' || r.role === 'CEO';

                                return (
                                    <tr
                                        key={r.role}
                                        className={cn(
                                            'border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                                            r.bypass && 'bg-amber-50/50 dark:bg-amber-950/10',
                                        )}
                                    >
                                        <td className="py-2.5 pr-3">
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{r.label}</p>
                                        </td>
                                        <td className="py-2.5 px-2">
                                            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', TYPE_COLORS[r.type] || 'bg-slate-100 text-slate-600')}>
                                                {r.type}
                                            </span>
                                        </td>
                                        {r.bypass ? (
                                            <td colSpan={5} className="py-2.5 px-2 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400">
                                                    <Zap className="h-3.5 w-3.5" />
                                                    <span className="text-xs font-semibold">Full access — all permissions</span>
                                                </div>
                                            </td>
                                        ) : (
                                            <>
                                                <td className="py-2.5 px-2 text-center"><PermBadge ok={canView} /></td>
                                                <td className="py-2.5 px-2 text-center"><PermBadge ok={canCreate} /></td>
                                                <td className="py-2.5 px-2 text-center"><PermBadge ok={canEdit} /></td>
                                                <td className="py-2.5 px-2 text-center"><PermBadge ok={canDelete} /></td>
                                                <td className="py-2.5 px-2 text-center"><PermBadge ok={canApprove} /></td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* ── Important Notes ── */}
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-5">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Important Notes</p>
                        <ul className="space-y-1.5 text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                            <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5" /> The <strong>System Admin</strong> has unrestricted access to everything. This role should only be given to 1-2 trusted people.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5" /> The IT department can give or remove specific permissions for individual users without changing their role.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5" /> If you need access to something you can&apos;t see, contact your IT administrator — they can adjust your permissions.</li>
                            <li className="flex items-start gap-2"><CheckCircle className="h-3 w-3 shrink-0 mt-0.5" /> Permission changes may take a few minutes to take effect across the system.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
