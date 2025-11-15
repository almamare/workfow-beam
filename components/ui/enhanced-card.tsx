'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    footerActions?: React.ReactNode;
    variant?: 'default' | 'gradient' | 'bordered';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    className?: string;
    stats?: {
        total?: number;
        badge?: string;
        badgeColor?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'danger' | 'light' | 'dark' | 'primary' | 'secondary';
    };
}

export function EnhancedCard({
    title,
    description,
    children,
    headerActions,
    footerActions,
    variant = 'default',
    size = 'md',
    loading = false,
    className = '',
    stats
}: EnhancedCardProps) {
    const cardVariants = {
        default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm',
        gradient: 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl dark:hover:shadow-2xl',
        bordered: 'bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-orange-800/50 shadow-sm hover:shadow-lg dark:hover:shadow-xl hover:border-orange-300 dark:hover:border-orange-700'
    };

    const sizeClasses = {
        sm: 'p-3 sm:p-4',
        md: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
    };

    return (
        <Card className={cn(
            'transition-all duration-300 overflow-hidden',
            cardVariants[variant],
            className
        )}>
            <CardHeader className={cn(
                'border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800',
                sizeClasses[size]
            )}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                                {title}
                            </CardTitle>
                            {stats?.badge && (
                                <Badge
                                    variant={stats.badgeColor === 'success' ? 'default' : 'outline'}
                                    className={cn(
                                        'text-xs',
                                        stats.badgeColor === 'success' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
                                        stats.badgeColor === 'warning' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                                        stats.badgeColor === 'error' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
                                        stats.badgeColor === 'default' && 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                                        stats.badgeColor === 'info' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                                        stats.badgeColor === 'danger' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
                                        stats.badgeColor === 'light' && 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                                        stats.badgeColor === 'dark' && 'bg-slate-800 dark:bg-slate-100/30 text-slate-100 dark:text-slate-800 border-slate-700 dark:border-slate-200',
                                        stats.badgeColor === 'primary' && 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-primary-200 dark:border-primary-800',
                                        stats.badgeColor === 'secondary' && 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-400 border-secondary-200 dark:border-secondary-800'
                                    )}
                                >
                                    {stats.badge}
                                </Badge>
                            )}
                        </div>
                        {description && (
                            <CardDescription className="text-slate-600 dark:text-slate-400">
                                {description}
                            </CardDescription>
                        )}
                        {stats?.total !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Total: {stats.total}
                                </span>
                                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 dark:text-green-400">Live</span>
                            </div>
                        )}
                    </div>
                    {headerActions && (
                        <div className="flex items-center gap-2">
                            {headerActions}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className={cn(
                'relative',
                sizeClasses[size]
            )}>
                {loading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
                    </div>
                ) : (
                    children
                )}
            </CardContent>

            {footerActions && (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-4">
                    <div className="flex items-center justify-end gap-2">
                        {footerActions}
                    </div>
                </div>
            )}
        </Card>
    );
}
