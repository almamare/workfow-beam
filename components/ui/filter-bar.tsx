'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RefreshCw } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: Array<{
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onValueChange: (value: string) => void;
  }>;
  activeFilters?: string[];
  onClearFilters?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters = [],
  onClearFilters,
  onRefresh,
  loading = false,
  className = '',
  actions
}: FilterBarProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onValueChange={filter.onValueChange}
            >
              <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                {filter.options.map((option) => (
                  <SelectItem 
                    key={option.key} 
                    value={option.value}
                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-orange-600 dark:focus:text-orange-400 cursor-pointer transition-colors duration-200"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {actions && actions}
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="h-10 px-3 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {onClearFilters && activeFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-10 px-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800"
            >
              {filter}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
