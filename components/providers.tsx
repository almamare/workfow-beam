'use client';

import { AuthProvider } from '@/contexts/AuthContext';      // Importing the AuthProvider from the AuthContext file
import { ThemeProvider } from '@/contexts/ThemeContext';    // Importing the ThemeProvider from the ThemeContext file
import ReduxProvider from '@/components/ReduxProvider';     // Importing the ReduxProvider component which wraps the application with the Redux store
import { Toaster } from '@/components/ui/sonner';          // Importing the Toaster component for toast notifications


interface ProvidersProps {
    children: React.ReactNode;
}

// This component wraps the application with the ThemeProvider, ReduxProvider, and AuthProvider
// It allows the application to use theme management, Redux state management, and authentication context.
// The children prop is the content that will be wrapped by these providers.
export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <ReduxProvider>
                <AuthProvider>
                    {children}
                    <Toaster />
                </AuthProvider>
            </ReduxProvider>
        </ThemeProvider>
    );
}