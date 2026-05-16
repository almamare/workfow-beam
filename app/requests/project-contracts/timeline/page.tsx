'use client';

import { RequestTimelinePage } from '@/components/RequestTimelinePage';

export default function Page() {
    return (
        <RequestTimelinePage
            requestType="project-contracts"
            listPath="/requests/project-contracts"
            detailsPath="/requests/project-contracts/details"
        />
    );
}
