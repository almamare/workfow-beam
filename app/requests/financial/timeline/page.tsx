'use client';

import { RequestTimelinePage } from '@/components/RequestTimelinePage';

export default function Page() {
    return (
        <RequestTimelinePage
            requestType="financial"
            listPath="/requests/financial"
            detailsPath="/requests/financial/details"
        />
    );
}
