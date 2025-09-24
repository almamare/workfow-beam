'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    badgeColor?: 'default' | 'success' | 'warning' | 'error';
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
    default: 'bg-white border-slate-200 shadow-sm hover:shadow-md',
    gradient: 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg hover:shadow-xl',
    bordered: 'bg-white border-2 border-orange-200 shadow-sm hover:shadow-lg hover:border-orange-300'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <Card className={cn(
      'transition-all duration-300 overflow-hidden',
      cardVariants[variant],
      className
    )}>
      <CardHeader className={cn(
        'border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white',
        sizeClasses[size]
      )}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-semibold text-slate-800">
                {title}
              </CardTitle>
              {stats?.badge && (
                <Badge 
                  variant={stats.badgeColor === 'success' ? 'default' : 'outline'}
                  className={cn(
                    'text-xs',
                    stats.badgeColor === 'success' && 'bg-green-100 text-green-700 border-green-200',
                    stats.badgeColor === 'warning' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    stats.badgeColor === 'error' && 'bg-red-100 text-red-700 border-red-200'
                  )}
                >
                  {stats.badge}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className="text-slate-600">
                {description}
              </CardDescription>
            )}
            {stats?.total !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium text-slate-700">
                  Total: {stats.total}
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
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
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>

      {footerActions && (
        <div className="border-t border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-end gap-2">
            {footerActions}
          </div>
        </div>
      )}
    </Card>
  );
}
