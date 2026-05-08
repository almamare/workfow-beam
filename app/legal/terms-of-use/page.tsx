import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalReturnLink } from '@/components/legal/LegalReturnLink';
import { LEGAL_LINK_LABELS, LEGAL_ROUTES } from '@/lib/legal';

export const metadata: Metadata = {
    title: 'Terms of Use | Shuaa Al-Ranou',
    description: 'Terms of use for the operations and finance management platform',
};

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200" dir="ltr" lang="en">
            <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <LegalReturnLink
                        variant="header"
                        className="text-sm font-medium text-brand-sky-600 hover:text-brand-sky-700 dark:text-brand-sky-400 dark:hover:text-brand-sky-300"
                    />
                    <span className="text-xs text-slate-500">Last updated: 2026-04-20</span>
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-4 py-10 space-y-8 leading-relaxed text-[15px]">
                <header className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Terms of Use</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        By using the platform of <strong>Shuaa Al-Ranou Trade &amp; General Contracting</strong> (the
                        &quot;Platform&quot;), you agree to these terms. If you do not agree, do not use the Platform.
                    </p>
                </header>

                <section className="space-y-3 rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-sm text-amber-950 dark:text-amber-100">
                    <p className="font-semibold">Legal notice</p>
                    <p>
                        This text is a general framework. It should be reviewed with legal counsel so it aligns with employment
                        contracts, company policies, and applicable local law.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Nature of the service</h2>
                    <p>
                        The Platform is an internal tool to organize operations (projects, finance, approvals, clients, HR,
                        documents). Features may change or be suspended for maintenance. The Platform is not guaranteed to be
                        free of faults or data loss; follow your IT department&apos;s backup and archive policies.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Accounts and eligibility</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Accounts are created by the company or its delegates. Users are responsible for credential secrecy.</li>
                        <li>Sharing accounts or acting under another user&apos;s identity is prohibited.</li>
                        <li>Users must ensure information they enter is accurate within the scope of their duties.</li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Acceptable use</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Any use that violates the law, others&apos; rights, or Platform security is prohibited.</li>
                        <li>
                            Attempting to compromise systems, upload malware, or exploit vulnerabilities without notifying
                            management is prohibited.
                        </li>
                        <li>
                            Exporting or sending sensitive data outside approved policies (copy, export, transfer) without
                            authorization is prohibited.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Approvals and decisions</h2>
                    <p>
                        Workflow approvals are recorded electronically. Authorized users are responsible for reviewing data
                        before approving or rejecting, within their job permissions.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Intellectual property and confidentiality</h2>
                    <p>
                        Platform content, design, logos, and internal databases remain the property of the company or its
                        licensors. Commercial reuse outside authorized work is prohibited. Company policies impose obligations
                        of confidentiality on data and documents.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Disclaimer</h2>
                    <p>
                        The Platform is provided &quot;as is&quot; within the company&apos;s capabilities. To the extent
                        permitted by law, the company is not liable for indirect damages or lost profits from service
                        interruption or user input errors, unless the law provides otherwise.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">7. Suspension and termination</h2>
                    <p>
                        The company may suspend or revoke access for users who breach these terms or when the employment or
                        contractual relationship ends, per internal procedures.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">8. Changes to these terms</h2>
                    <p>
                        These terms may be updated. Notice may be given via the Platform or internal channels. Continued use
                        after notice may, under company policy, be treated as acceptance of the changes.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">9. Governing law and disputes</h2>
                    <p>
                        Applicable law, courts, or arbitration are determined by the company&apos;s location and governing
                        contracts, unless otherwise agreed in writing.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">10. Contact</h2>
                    <p>For regulatory or policy questions, contact the relevant management, HR, or IT department within the company.</p>
                </section>

                <footer className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-sm">
                    <Link href={LEGAL_ROUTES.privacyPolicy} className="text-brand-sky-600 hover:underline dark:text-brand-sky-400">
                        {LEGAL_LINK_LABELS.privacyPolicy}
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
