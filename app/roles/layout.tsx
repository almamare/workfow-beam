'use client';

import MainLayout from '@/components/layout/main-layout';

export default function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <MainLayout>
          {children}
        </MainLayout>
  );
}