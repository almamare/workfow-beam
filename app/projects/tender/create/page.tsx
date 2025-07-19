import { Suspense } from 'react';
import CreateTender from '@/components/pages/CreateTender';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading tender...</div>}>
            <CreateTender />
        </Suspense>
    );
}
