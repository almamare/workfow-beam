import './globals.css';
import type { Metadata } from 'next';
import { Alexandria } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers';

const alexandria = Alexandria({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'WorkFlow - Enterprise Management System',
    description: 'Complete enterprise workflow management system for corporate operations',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={alexandria.className}>
                <Providers>
                    {children}
                </Providers>
                <Toaster />
            </body>
        </html>
    );
}
