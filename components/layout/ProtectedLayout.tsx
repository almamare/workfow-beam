// REFACTOR-PHASE-1: Client-side route protection component
// Provides additional protection and prevents flash of unauthorized content
// Should be used in layout files for protected routes
// FIX: Added mounted state to prevent hydration mismatches

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedLayoutProps {
    children: React.ReactNode;
    requiredRole?: string; // Optional: specific role required
}

/**
 * ProtectedLayout component that ensures user is authenticated before rendering children
 * Prevents flash of unauthorized content by showing loading state
 * FIX: Uses mounted state to prevent hydration mismatches between server and client
 */
export function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // FIX: Only check auth after component mounts on client to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Wait for component to mount and auth state to load
        if (!mounted || isLoading) return;

        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
            return;
        }

        // If role is required and user doesn't have it, redirect to dashboard
        if (requiredRole && user?.role !== requiredRole) {
            router.push('/dashboard');
            return;
        }
    }, [mounted, isAuthenticated, isLoading, user, router, pathname, requiredRole]);

    // FIX: Show consistent loading state during initial render to prevent hydration mismatch
    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated (will redirect)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-600 dark:text-slate-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-slate-600 dark:text-slate-400">Access denied. Redirecting...</p>
                </div>
            </div>
        );
    }

    // User is authenticated and authorized, render children
    return <>{children}</>;
}

