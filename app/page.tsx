'use client';

// REFACTOR-PHASE-1: Updated to use Redux-based auth hook instead of AuthContext
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

function AppContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return null;
}

export default function Home() {
    return <AppContent />;
}