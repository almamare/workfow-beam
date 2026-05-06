'use client';

import { Suspense } from 'react';
import { ProjectContractRequestsListContent } from '@/app/requests/project-contracts/components/ProjectContractRequestsListContent';

export default function ProjectContractRequestsPendingPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading…</div>
            }
        >
            <ProjectContractRequestsListContent
                status="Pending"
                title="Pending — project contract approvals"
                description="Requests awaiting approval for project contracts."
            />
        </Suspense>
    );
}
