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
        <div className={`space-y-4 ${className}`}>
            {/* Breadcrumb */}
            {breadcrumb && (
                    <Breadcrumb />
            )}

            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-200">
                            {title}
                        </h1>
                        {stats && (
                            <Badge variant="default" className="px-3 py-1 text-sm font-medium">
                                {stats.length} items
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        {actions.secondary?.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={action.onClick}
                                className="h-10 px-4"
                            >
                                {action.icon}
                                {action.label}
                            </Button>
                        ))}
                        {actions.primary && (
                            <Button
                                onClick={actions.primary.onClick}
                                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                size="sm"
                            >
                                {actions.primary.icon || <Plus className="h-4 w-4 mr-2" />}
                                {actions.primary.label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
