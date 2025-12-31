import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Shuaa Al-Ranou Trade & General Contracting',
    description: 'Project Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
