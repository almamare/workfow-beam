import { Suspense } from 'react';
import DetailsContractor from '@/components/pages/DetailsContractor';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading contractor...</div>}>
            <DetailsContractor />
        </Suspense>
    );
}