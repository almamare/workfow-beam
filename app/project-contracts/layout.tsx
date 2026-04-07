'use client';

import MainLayout from '@/components/layout/main-layout';

/** Wraps pages with MainLayout so the sidebar and shell match `client-contracts` and `clients`. */
export default function ProjectContractsLayout({ children }: { children: React.ReactNode }) {
    return <MainLayout>{children}</MainLayout>;
}
