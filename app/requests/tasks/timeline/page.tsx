'use client';

import { RequestTimelinePage } from '@/components/RequestTimelinePage';

export default function Page() {
    return (
        <RequestTimelinePage
            requestType="tasks"
            listPath="/requests/tasks"
            detailsPath="/requests/tasks/details"
        />
    );
}
