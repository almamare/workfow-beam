'use client';

import { RequestTimelinePage } from '@/components/RequestTimelinePage';

export default function Page() {
    return (
        <RequestTimelinePage
            requestType="projects"
            listPath="/requests/projects"
            detailsPath="/requests/projects/details"
        />
    );
}
