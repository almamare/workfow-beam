'use client';

import { Suspense } from 'react';
import { ProjectContractRequestsListContent } from '@/app/requests/project-contracts/components/ProjectContractRequestsListContent';

export default function ProjectContractRequestsApprovedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading…</div>
            }
        >
            <ProjectContractRequestsListContent
                status="Approved"
                title="Approved — project contract requests"
                description="Project contract requests that were approved."
            />
        </Suspense>
    );
}
