'use client';

import { RequestTimelinePage } from '@/components/RequestTimelinePage';

export default function Page() {
    return (
        <RequestTimelinePage
            requestType="project-contracts"
            listPath="/requests/contracts/contracts"
            detailsPath="/requests/contracts/contracts/details"
        />
    );
}
