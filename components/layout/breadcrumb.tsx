'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            icon: <Home className="h-3.5 w-3.5 shrink-0" />,
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
            className="flex items-center gap-1.5 text-sm"
            aria-label="Breadcrumb"
        >
            {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                    <React.Fragment key={item.href}>
                        {idx > 0 && (
                            <ChevronRight 
                                className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0" 
                                aria-hidden="true" 
                            />
                        )}
                        {isLast ? (
                            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate px-2 py-1 rounded-md bg-gradient-to-r from-sky-50 to-sky-100/50 dark:from-sky-900/20 dark:to-sky-800/10 border border-sky-200/50 dark:border-sky-800/30">
                                {item.icon ?? null}
                                <span className="text-sky-700 dark:text-sky-300">{item.label}</span>
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-1.5 truncate px-2 py-1 rounded-md transition-all duration-200",
                                    "text-slate-600 dark:text-slate-400",
                                    "hover:text-sky-600 dark:hover:text-sky-400",
                                    "hover:bg-slate-100 dark:hover:bg-slate-800/50",
                                    "hover:shadow-sm"
                                )}
                            >
                                {item.icon ?? null}
                                <span>{item.label}</span>
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
