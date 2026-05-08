'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Plus, Settings, Filter, Download, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumb?: boolean;
    actions?: {
        primary?: {
            label: string;
            onClick: () => void;
            icon?: React.ReactNode;
        };
        secondary?: Array<{
            label: string;
            onClick: () => void;
            icon?: React.ReactNode;
            variant?: 'default' | 'outline' | 'ghost';
        }>;
    };
    stats?: Array<{
        label: string;
        value: string | number;
        change?: string;
        trend?: 'up' | 'down' | 'neutral';
    }>;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumb = true,
    actions,
    stats,
    className = ''
}: PageHeaderProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {/* Breadcrumb */}
            {breadcrumb && <Breadcrumb />}

            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                                {title}
                            </h1>
                            {/* Brand accent rule */}
                            <div className="h-0.5 w-10 mt-1.5 rounded-full bg-gradient-to-r from-brand-sky-500 to-brand-sky-400" />
                        </div>
                        {stats && (
                            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold tabular-nums mt-0.5">
                                {stats.length}
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:shrink-0">
                        {actions.secondary?.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={action.onClick}
                                className="h-9 px-3 text-sm border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-sky-400 hover:text-brand-sky-600 dark:hover:border-brand-sky-600 dark:hover:text-brand-sky-400 transition-colors"
                            >
                                {action.icon && <span className="mr-1.5">{action.icon}</span>}
                                {action.label}
                            </Button>
                        ))}
                        {actions.primary && (
                            <Button
                                onClick={actions.primary.onClick}
                                size="sm"
                                className="h-9 px-4 text-sm bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                {actions.primary.icon || <Plus className="h-4 w-4 mr-1.5" />}
                                {actions.primary.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
