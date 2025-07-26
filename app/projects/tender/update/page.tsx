import { Suspense } from 'react';
import UpdateTender from '@/components/pages/UpdateTender';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading tender...</div>}>
            <UpdateTender />
        </Suspense>
    );
}
