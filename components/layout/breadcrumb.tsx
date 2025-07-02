'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumb() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean);

    const breadcrumbItems = [
        {
            label: 'Home',
            href: '/dashboard',
            icon: <Home className="h-4 w-4 shrink-0" />,
        },
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;

        const label = segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        breadcrumbItems.push({
            label,
            href: currentPath,
            icon: segment === 'dashboard' ? <Home className="h-4 w-4 shrink-0" /> : <span className="h-4 w-4 shrink-0" />, // Default icon for other segments
        });
    });

    return (
        <nav
            className="flex items-center space-x-2 text-sm text-muted-foreground"
            aria-label="Breadcrumb"
        >
            {breadcrumbItems.map((item, index) => (
                <React.Fragment key={item.href}>
                    {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    {index === breadcrumbItems.length - 1 ? (
                        <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                            {item.icon}
                            {item.label}
                        </span>
                    ) : (
                        <Link
                            href={item.href}
                            className="hover:text-foreground flex items-center gap-1.5 truncate"
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
}
