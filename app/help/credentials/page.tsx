'use client';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, CopyButton } from '../_components';
import { ROLES_MATRIX, TYPE_COLORS } from '../_data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Lock, Zap, Mail, Shield } from 'lucide-react';

export default function CredentialsPage() {
    const nonAdminRoles = ROLES_MATRIX.filter(r => r.role !== 'SYSADMIN');

    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Login Credentials"
                description="Default system user accounts, passwords, and email formats for initial setup and testing."
            />

            {/* Security Notice */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0">
                    <Lock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-rose-800 dark:text-rose-300">Security Notice</h3>
                    <p className="text-sm text-rose-700 dark:text-rose-400 leading-relaxed">
                        These credentials are for initial setup only. Change all passwords after first login.
                        Passwords cannot be recovered — if forgotten, ask your IT administrator to reset them.
                    </p>
                </div>
            </div>

            {/* SYSADMIN Highlight Card */}
            <div className="rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Primary Admin — SYSADMIN</h2>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Full access · All permissions · All modules</p>
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 shrink-0">Username</span>
                        <code className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">admin</code>
                        <CopyButton value="admin" />
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 shrink-0">Password</span>
                        <code className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">Admin@2026!</code>
                        <CopyButton value="Admin@2026!" />
                    </div>
                </div>
            </div>

            {/* All System Users Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-sky-500 text-white shrink-0">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">All System Users</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Default password for non-admin accounts: <code className="font-mono font-semibold text-sky-600 dark:text-sky-400">Beam@2026</code>
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nonAdminRoles.map((r, i) => (
                                <tr
                                    key={r.role}
                                    className={cn(
                                        'border-b border-slate-100 dark:border-slate-800',
                                        i % 2 === 0
                                            ? 'bg-slate-50/50 dark:bg-slate-800/20'
                                            : 'bg-white dark:bg-slate-900'
                                    )}
                                >
                                    <td className="py-2.5 px-3">
                                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{r.role}</span>
                                        <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{r.label}</span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <Badge variant="secondary" className={cn('text-[11px] font-medium', TYPE_COLORS[r.type])}>
                                            {r.type}
                                        </Badge>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span className="inline-flex items-center gap-1.5">
                                            <code className="font-mono text-xs text-slate-700 dark:text-slate-300">{r.username}</code>
                                            <CopyButton value={r.username} />
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span className="inline-flex items-center gap-1.5">
                                            <code className="font-mono text-xs text-slate-700 dark:text-slate-300">{r.password}</code>
                                            <CopyButton value={r.password} />
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <code className="font-mono text-xs text-slate-500 dark:text-slate-400">{r.username}@beam.local</code>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <Badge variant="secondary" className={cn('text-[11px] font-medium', TYPE_COLORS[r.type])}>
                                            {r.type}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Email Format Note */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-slate-500 text-white shrink-0">
                    <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Email Format</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        All user email addresses follow the format <code className="font-mono font-semibold text-sky-600 dark:text-sky-400">username@beam.local</code>.
                        For example: <code className="font-mono text-slate-500">hr_dir@beam.local</code>, <code className="font-mono text-slate-500">cfo@beam.local</code>, <code className="font-mono text-slate-500">admin@beam.local</code>.
                    </p>
                </div>
            </div>
        </div>
    );
}
