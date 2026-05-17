'use client';

import { Suspense } from 'react';
import { ProjectContractRequestsListContent } from '@/app/requests/contracts/contracts/components/ProjectContractRequestsListContent';

export default function ProjectContractRequestsApprovedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading…</div>
            }
        >
            <ProjectContractRequestsListContent
                status="Approved"
                title="Project Contract Requests — Approved"
                description="Browse all project contract requests that have been approved"
            />
        </Suspense>
    );
}
