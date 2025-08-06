import { Suspense } from 'react';
import UpdateClient from '@/components/pages/UpdateClient';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading clients...</div>}>
            <UpdateClient />
        </Suspense>
    );
}
