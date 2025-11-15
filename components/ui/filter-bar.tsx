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
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm ${className}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300"
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
              <SelectTrigger className="w-full sm:w-48 bg-white border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.key} value={option.value}>
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
                className="h-10 px-3"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}

            {onClearFilters && activeFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
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
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
          <span className="text-sm font-medium text-slate-600">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-orange-100 text-orange-700 hover:bg-orange-200"
            >
              {filter}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
