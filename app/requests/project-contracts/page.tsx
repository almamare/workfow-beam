'use client';

import { Suspense } from 'react';
import { ProjectContractRequestsListContent } from '@/app/requests/project-contracts/components/ProjectContractRequestsListContent';

export default function ProjectContractRequestsIndexPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-slate-500">Loading…</div>
            }
        >
            <ProjectContractRequestsListContent
                status="all"
                title="Project contract — approval requests"
                description="All task requests of type ProjectContracts (any status)."
            />
        </Suspense>
    );
}
