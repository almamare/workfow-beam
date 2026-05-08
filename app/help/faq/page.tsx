'use client';

import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, AlertCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { HelpPageHeader, AccordionItem } from '../_components';
import { FAQ_ITEMS } from '../_data';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function FaqPage() {
    const [search, setSearch] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return FAQ_ITEMS;
        const term = search.toLowerCase();
        return FAQ_ITEMS.filter(
            (faq) => faq.q.toLowerCase().includes(term) || faq.a.toLowerCase().includes(term),
        );
    }, [search]);

    return (
        <div className="space-y-6 pb-10">
            <Breadcrumb />

            <HelpPageHeader
                title="Frequently Asked Questions"
                description="Find quick answers to the most common questions about using the BEAM ERP system, from account access and permissions to data management and approval workflows."
            />

            <div className="max-w-4xl space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search FAQs…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Badge variant="default">{filtered.length} question{filtered.length !== 1 && 's'}</Badge>

                {filtered.length > 0 ? (
                    <div className="space-y-3">
                        {filtered.map((faq, i) => (
                            <AccordionItem
                                key={i}
                                question={faq.q}
                                answer={faq.a}
                                isOpen={openFaq === i}
                                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <AlertCircle className="h-10 w-10 mb-3" />
                        <p className="text-sm font-medium">No FAQs match &ldquo;{search}&rdquo;</p>
                    </div>
                )}
            </div>

            <div className="max-w-4xl rounded-xl border border-brand-sky-200 dark:border-brand-sky-900 bg-brand-sky-50 dark:bg-brand-sky-950/30 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-brand-sky-500 text-white shrink-0">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Still Need Help?</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            If you can&apos;t find the answer you&apos;re looking for, contact your IT department or system administrator for assistance with account access, permissions, and system configuration.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
