import { Suspense } from 'react';
import UpadteProject from '@/components/pages/UpadteProject';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading project...</div>}>
            <UpadteProject />
        </Suspense>
    );
}
