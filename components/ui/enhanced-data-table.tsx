'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface Action<T> {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
  hidden?: (row: T) => boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  pagination?: PaginationProps;
  loading?: boolean;
  onSearch?: (term: string) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  noDataMessage?: string;
  className?: string;
  searchPlaceholder?: string;
  showActions?: boolean;
}

export function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  pagination,
  loading = false,
  onSearch,
  onSort,
  onRowClick,
  noDataMessage = 'No data available',
  className = '',
  searchPlaceholder = 'Search...',
  showActions = true
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof T) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    
    setSortKey(key);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(key, newDirection);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (onSearch) {
      onSearch(term);
    }
  };

  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    
    if (sortKey === column.key) {
      return sortDirection === 'asc' ? (
        <ArrowUp className="h-4 w-4 text-orange-600" />
      ) : (
        <ArrowDown className="h-4 w-4 text-orange-600" />
      );
    }
    
    return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      {onSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300"
            />
          </div>
          {pagination && (
            <Badge variant="outline" className="px-3 py-1">
              {pagination.totalItems} total
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={cn(
                      'px-6 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:bg-slate-200 transition-colors duration-200',
                      column.width && `w-${column.width}`
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={cn(
                      'flex items-center gap-2',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}>
                      <span>{column.header}</span>
                      {renderSortIcon(column)}
                    </div>
                  </th>
                ))}
                {showActions && actions.length > 0 && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors duration-200">
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                    {showActions && actions.length > 0 && (
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // No data message
                <tr>
                  <td
                    colSpan={columns.length + (showActions && actions.length > 0 ? 1 : 0)}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">{noDataMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data rows
                data.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'hover:bg-slate-50 transition-colors duration-200',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key as string}
                        className={cn(
                          'px-6 py-4 text-sm text-slate-900 whitespace-nowrap',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {showActions && actions.length > 0 && (
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {actions
                              .filter(action => !action.hidden || !action.hidden(row))
                              .map((action, actionIndex) => (
                                <DropdownMenuItem
                                  key={actionIndex}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                  }}
                                  className={cn(
                                    'flex items-center gap-2 cursor-pointer',
                                    action.variant === 'destructive' && 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                  )}
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems} entries
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === pagination.currentPage;
                  
                  return (
                    <Button
                      key={page}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => pagination.onPageChange(page)}
                      className={cn(
                        'h-8 w-8 p-0',
                        isActive && 'bg-orange-600 hover:bg-orange-700 text-white'
                      )}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
