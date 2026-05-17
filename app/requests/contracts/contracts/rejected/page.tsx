'use client';

import { Suspense } from 'react';
import { ProjectContractRequestsListContent } from '@/app/requests/contracts/contracts/components/ProjectContractRequestsListContent';

export default function ProjectContractRequestsRejectedPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading…</div>
            }
        >
            <ProjectContractRequestsListContent
                status="Rejected"
                title="Project Contract Requests — Rejected"
                description="Browse all project contract requests that have been rejected"
            />
        </Suspense>
    );
}
