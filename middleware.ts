// REFACTOR-PHASE-1: Route protection middleware
// Protects all routes except /login and public assets
// Checks for authentication token in cookies

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/'];
// Routes that should redirect to login if not authenticated
const protectedRoutes = [
    '/dashboard',
    '/approvals',
    '/clients',
    '/projects',
    '/contractors',
    '/tasks',
    '/users',
    '/employees',
    '/requests',
    '/financial',
    '/inventory',
    '/forms',
    '/documents',
    '/banks',
    '/invoices',
    '/bank-balances',
    '/client-contracts',
    '/settings',
    '/profile',
    '/notifications',
    '/reports',
    '/statistics',
    '/analysis',
    '/timeline',
    '/history',
    '/departments',
    '/roles',
    '/permissions',
    '/budgets',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/_next') || pathname.startsWith('/api'));
    
    // Check if route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    const isAuthenticated = !!token;
    
    // If accessing login page while authenticated, redirect to dashboard
    if (pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If accessing protected route without authentication, redirect to login
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        // Store the attempted URL to redirect back after login
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    
    // Allow the request to proceed
    return NextResponse.next();
}

// Configure which routes this middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

