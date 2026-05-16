// Route protection: default-deny — every path requires auth except explicitly public routes.
// (A whitelist of "protected" routes is fragile: new pages under /app would be public by mistake.)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Paths that never require a session cookie */
const PUBLIC_PATHS = new Set<string>(['/', '/login', '/forgot-password']);

function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.has(pathname)) {
        return true;
    }
    // Legal pages must stay readable without a session (linked from login) and must not
    // bounce authenticated users through session edge-cases on /legal/*.
    if (pathname.startsWith('/legal/')) {
        return true;
    }
    // Next internals & Next API routes (if any)
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return true;
    }
    return false;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;
    const isAuthenticated = !!token;

    if (isPublicPath(pathname)) {
        if (pathname === '/login' && isAuthenticated) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (!isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|xml|txt)$).*)',
    ],
};
