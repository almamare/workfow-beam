'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MainLayout } from '@/components/layout/main-layout';

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout>
          {children}
        </MainLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}