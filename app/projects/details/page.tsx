// app/projects/details/page.tsx
import { Suspense } from 'react';
import ProjectDetailsPage from '@/components/pages/ProjectDetailsPage';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading project...</div>}>
            <ProjectDetailsPage />
        </Suspense>
    );
}
