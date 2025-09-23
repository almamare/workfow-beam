'use client';


import MainLayout from '@/components/layout/main-layout';


export default function ApprovalsLayout({
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
