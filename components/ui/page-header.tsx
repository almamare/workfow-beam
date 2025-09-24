'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumb */}
      {breadcrumb && (
        <div className="mb-4">
          <Breadcrumb />
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {stats && (
              <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                {stats.length} items
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-slate-600 text-lg max-w-2xl">
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
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                size="sm"
              >
                {actions.primary.icon || <Plus className="h-4 w-4 mr-2" />}
                {actions.primary.label}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-slate-500">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.trend === 'up' ? 'bg-green-100' : 
                  stat.trend === 'down' ? 'bg-red-100' : 'bg-slate-100'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-500' : 
                    stat.trend === 'down' ? 'bg-red-500' : 'bg-slate-400'
                  }`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
