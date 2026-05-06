// app/projects/details/page.tsx
import { Suspense } from 'react';
import ProjectDetails from '@/components/pages/ProjectDetails';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading project...</div>}>
            <ProjectDetails />
        </Suspense>
    );
}
