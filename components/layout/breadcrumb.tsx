'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

type Crumb = {
    label: string;
    href: string;
    icon?: React.ReactNode; // optional to avoid TS errors
};

const toLabel = (segment: string) =>
    decodeURIComponent(segment)
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

export function Breadcrumb() {
    const pathname = usePathname();
    if (!pathname) return null;

    const rawSegments = pathname.split('/').filter(Boolean);

    // Skip "dashboard" because Home already points to it
    const segments = rawSegments[0] === 'dashboard'
        ? rawSegments.slice(1)
        : rawSegments;

    // Start path from /dashboard if it exists, otherwise from root
    let currentPath = rawSegments[0] === 'dashboard' ? '/dashboard' : '';

    const items: Crumb[] = [
        {
            label: 'Home',
            href: '/dashboard',
            icon: <Home className="h-4 w-4 shrink-0" />,
        },
    ];

    segments.forEach(seg => {
        currentPath += `/${seg}`;
        items.push({
            label: toLabel(seg),
            href: currentPath,
        });
    });

    return (
        <nav
            className="flex items-center space-x-1 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
        >
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                    <React.Fragment key={item.href}>
                        {idx > 0 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        {isLast ? (
                            <span className="font-medium text-foreground flex items-center gap-1 truncate">
                                {item.icon ?? null}
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-foreground flex items-center gap-1 truncate"
                            >
                                {item.icon ?? null}
                                {item.label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
