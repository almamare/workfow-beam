import type { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';
import { openSans } from '@/lib/fonts';
import './globals.css';

export const dynamic = 'force-dynamic';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shuarano.com';
const siteName = 'Shuaa Al-Ranou Trade & General Contracting';
const siteDescription =
    'Project management system for Shuaa Al-Ranou Trade & General Contracting — track projects, contracts, payments, change orders, and financial reports all in one place.';

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: siteName,
        template: `%s | Shuaa Al-Ranou`,
    },
    description: siteDescription,
    keywords: [
        'Shuaa Al-Ranou',
        'contracting',
        'general contracting',
        'project management',
        'trade',
        'construction',
        'Saudi Arabia',
    ],
    authors: [{ name: 'Shuaa Al-Ranou Trade & General Contracting' }],
    creator: 'Shuaa Al-Ranou',
    publisher: 'Shuaa Al-Ranou',
    manifest: '/manifest.json',
    robots: {
        index: false,
        follow: false,
        googleBot: { index: false, follow: false },
    },
    // --- Open Graph (Facebook / Meta) ---
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: siteUrl,
        siteName,
        title: siteName,
        description: siteDescription,
        images: [
            {
                url: `${siteUrl}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: 'Shuaa Al-Ranou — Project Management System',
                type: 'image/png',
            },
        ],
    },
    // --- Twitter / X Card ---
    twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: siteDescription,
        images: [`${siteUrl}/opengraph-image`],
    },
    // --- PWA / Apple ---
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Shuaa Al-Ranou',
    },
    other: {
        'mobile-web-app-capable': 'yes',
    },
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/logo.png', sizes: 'any', type: 'image/png' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [{ url: '/logo.png' }],
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#0058de' },
        { media: '(prefers-color-scheme: dark)', color: '#0047b3' },
    ],
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={openSans.variable}>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
