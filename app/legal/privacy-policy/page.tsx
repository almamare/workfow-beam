import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalReturnLink } from '@/components/legal/LegalReturnLink';
import { LEGAL_LINK_LABELS, LEGAL_ROUTES } from '@/lib/legal';

export const metadata: Metadata = {
    title: 'Privacy Policy | Shuaa Al-Ranou',
    description: 'Privacy policy for the operations and finance management platform',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200" dir="ltr" lang="en">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <LegalReturnLink
                        variant="header"
                        className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
                    />
                    <span className="text-xs text-slate-500">Last updated: 2026-04-20</span>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-4 py-10 space-y-8 leading-relaxed text-[15px]">
                <header className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Privacy Policy</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        This policy applies to your use of the internal platform for operations, finance, human resources, and
                        contracts operated on behalf of{' '}
                        <strong>Shuaa Al-Ranou Trade &amp; General Contracting</strong> (the &quot;Platform&quot; or
                        &quot;System&quot;).
                    </p>
                </header>

                <section className="space-y-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-sm text-amber-950 dark:text-amber-100">
                    <p className="font-semibold">Legal notice</p>
                    <p>
                        This text is a general organizational template to document practices. It is not a substitute for review
                        by qualified counsel under the laws of Iraq or any other jurisdiction that applies to your activities.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Who controls your data?</h2>
                    <p>
                        The data controller is the entity that owns or operates the System on its behalf (the employer / the
                        company operating the Platform). Authorized employees and users process data only within their assigned
                        permissions in the System.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. What data may we collect?</h2>
                    <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-slate-300">
                        <li>
                            Identity and contact: name, username, email, phone (if provided), profile image.
                        </li>
                        <li>Role and permissions: role, title, department, approval and task identifiers.</li>
                        <li>
                            Operational data: projects, contracts, clients, vendors, financial documents, disbursement requests,
                            approval logs, attachments.
                        </li>
                        <li>
                            Technical data: IP address, browser type, login and activity timestamps, aggregated error logs
                            without individual identification where feasible.
                        </li>
                        <li>
                            Cookies and sessions: session tokens (e.g. JWT) for secure sign-in and UI preferences (e.g. dark
                            mode).
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Why we process data</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>To run the System and provide internal services (projects, finance, HR, contracts).</li>
                        <li>To execute approvals, workflows, and audit trails.</li>
                        <li>For security and compliance: fraud prevention, account protection, records per company policy.</li>
                        <li>For administrative communication and system-related notifications.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Legal bases for processing</h2>
                    <p>
                        Typically: performance of employment or legitimate instructions from the employer, legitimate interests
                        in securing operations and systems, and legal or regulatory obligations where they apply.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Sharing data</h2>
                    <p>
                        We do not sell your data to commercial parties. Data may be shared with technology providers acting for
                        the company (hosting, email, backups) under confidentiality agreements and least-privilege access.
                        Disclosure may be required by court order or applicable law.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Security</h2>
                    <p>
                        Reasonable security is applied at the application and infrastructure level (HTTPS when enabled,
                        authentication, permissions, secure sign-in). No system is risk-free; users must protect passwords and
                        not share accounts.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Retention</h2>
                    <p>
                        Data is kept for as long as needed to operate the System, meet legal obligations, and follow the
                        company&apos;s archive policy. Data may be deleted or archived when no longer required per internal
                        procedures.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">8. Data subject rights</h2>
                    <p>
                        Under internal company policy, this may include access or correction of inaccurate data, or restriction
                        of certain processing where the law applies. Direct requests to HR, IT, or the internally designated
                        contact.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">9. Updates</h2>
                    <p>
                        This policy may be updated. Please review the &quot;Last updated&quot; date above. Continued use after
                        changes may constitute acceptance as determined by the company.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">10. Contact</h2>
                    <p>For privacy-related questions, use the company&apos;s official channels (email or the relevant internal department).</p>
                </section>

                <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-sm">
                    <Link href={LEGAL_ROUTES.termsOfUse} className="text-sky-600 hover:underline dark:text-sky-400">
                        {LEGAL_LINK_LABELS.termsOfUse}
                    </Link>
                    <LegalReturnLink
                        variant="footer"
                        className="text-slate-600 hover:underline dark:text-slate-400"
                    />
                </footer>
            </article>
        </div>
    );
}
