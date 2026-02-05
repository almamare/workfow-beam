'use client';

// REFACTOR-PHASE-1: Removed AuthProvider - authentication now handled by Redux only
import { ThemeProvider } from '@/contexts/ThemeContext';    // Importing the ThemeProvider from the ThemeContext file
import ReduxProvider from '@/components/ReduxProvider';     // Importing the ReduxProvider component which wraps the application with the Redux store
import { Toaster } from 'sonner';          // Importing the Toaster component for toast notifications


interface ProvidersProps {
    children: React.ReactNode;
}

// This component wraps the application with the ThemeProvider and ReduxProvider
// Authentication is now handled entirely by Redux (login slice) - no separate AuthProvider needed
// The children prop is the content that will be wrapped by these providers.
export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <ReduxProvider>
                {children}
                <Toaster position="top-right" richColors closeButton className="toaster group" />
            </ReduxProvider>
        </ThemeProvider>
    );
}