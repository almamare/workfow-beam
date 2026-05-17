/**
 * Maps backend `action_link` values to Next.js App Router paths.
 * Backend may send REST-style paths; this app uses `?id=` on details pages.
 */

export type ResolvedNotificationLink =
    | { kind: 'internal'; href: string }
    | { kind: 'external'; href: string }
    | null;

/**
 * Returns true if the string is an absolute http(s) URL.
 */
export function isExternalUrl(path: string): boolean {
    return /^https?:\/\//i.test(path.trim());
}

/**
 * Map `action_link` from API to a path usable with `router.push` or `window.location`.
 * - External URLs → `{ kind: 'external', href }`
 * - Known REST prefixes → details pages with `?id=`
 * - Already valid in-app paths (e.g. `/notifications`) → pass through as internal
 */
export function resolveNotificationActionLink(
    actionLink: string | null | undefined
): ResolvedNotificationLink {
    if (actionLink == null || typeof actionLink !== 'string') return null;
    const raw = actionLink.trim();
    if (!raw) return null;

    if (isExternalUrl(raw)) {
        return { kind: 'external', href: raw };
    }

    const path = raw.startsWith('/') ? raw : `/${raw}`;

    const restMappings: Array<{ pattern: RegExp; to: (id: string) => string }> = [
        { pattern: /^\/clients\/([^/?#]+)\/?$/i, to: (id) => `/clients/details?id=${encodeURIComponent(id)}` },
        { pattern: /^\/projects\/([^/?#]+)\/?$/i, to: (id) => `/projects/details?id=${encodeURIComponent(id)}` },
        { pattern: /^\/task-orders\/([^/?#]+)\/?$/i, to: (id) => `/contracts/details?id=${encodeURIComponent(id)}` },
        { pattern: /^\/client-contracts\/([^/?#]+)\/?$/i, to: (id) => `/client-contracts/details?id=${encodeURIComponent(id)}` },
        { pattern: /^\/requests\/tasks\/([^/?#]+)\/?$/i, to: (id) => `/requests/tasks/details?id=${encodeURIComponent(id)}` },
        // Change orders: no dedicated route — open task order detail as closest match
        { pattern: /^\/change-orders\/([^/?#]+)\/?$/i, to: (id) => `/contracts/details?id=${encodeURIComponent(id)}` },
        { pattern: /^\/financial\/disbursements\/([^/?#]+)\/?$/i, to: (id) => `/financial/disbursements/${encodeURIComponent(id)}` },
    ];

    for (const { pattern, to } of restMappings) {
        const m = path.match(pattern);
        if (m?.[1]) return { kind: 'internal', href: to(m[1]) };
    }

    // Backend may already send full SPA paths (with query) matching this app
    if (path.startsWith('/')) {
        return { kind: 'internal', href: path };
    }

    return null;
}

/**
 * If the app is hosted under a subpath (e.g. `/app`), set `NEXT_PUBLIC_APP_BASE_PATH=/app`.
 */
export function withAppBasePath(href: string): string {
    const base = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_BASE_PATH
        ? process.env.NEXT_PUBLIC_APP_BASE_PATH
        : ''
    ).replace(/\/$/, '');
    if (!base || !href.startsWith('/')) return href;
    return `${base}${href}`;
}
