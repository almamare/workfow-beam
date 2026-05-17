import { Suspense } from 'react';
import UpdateContractor from '@/components/pages/UpdateContractor';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading contractor...</div>}>
            <UpdateContractor />
        </Suspense>
    );
}
