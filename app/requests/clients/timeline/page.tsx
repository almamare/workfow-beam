'use client';

import { RequestTimelinePage } from '@/components/RequestTimelinePage';

export default function Page() {
    return (
        <RequestTimelinePage
            requestType="clients"
            listPath="/requests/clients"
            detailsPath="/requests/clients/details"
        />
    );
}
