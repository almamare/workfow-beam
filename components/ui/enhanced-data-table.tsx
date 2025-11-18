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
    variant?: 'default' | 'destructive' | 'outline' | 'info' | 'success' | 'warning';
    hidden?: (row: T) => boolean;
    title?: string;
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
    hideEmptyMessage?: boolean; // When true, shows empty table instead of no data message
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
    showActions = true,
    hideEmptyMessage = false
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

        return <ArrowUpDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />;
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Bar */}
            {onSearch && (
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                        />
                    </div>
                    {pagination && (
                        <Badge variant="outline" className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                            {pagination.totalItems} total
                        </Badge>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key as string}
                                        className={cn(
                                            'px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap',
                                            column.align === 'center' && 'text-center',
                                            column.align === 'right' && 'text-right',
                                            column.sortable && 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200',
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
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
                                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                                        {columns.map((_, colIndex) => (
                                            <td key={colIndex} className="px-4 py-2">
                                                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-700" />
                                            </td>
                                        ))}
                                        {showActions && actions.length > 0 && (
                                            <td className="px-4 py-2 text-right">
                                                <Skeleton className="h-8 w-8 ml-auto bg-slate-200 dark:bg-slate-700" />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                // No data message or empty table
                                hideEmptyMessage ? (
                                    // Show empty table (just header, no rows)
                                    null
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length + (showActions && actions.length > 0 ? 1 : 0)}
                                            className="px-6 py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <Search className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium">{noDataMessage}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ) : (
                                // Data rows
                                data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={cn(
                                            'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200',
                                            onRowClick && 'cursor-pointer'
                                        )}
                                        onClick={() => onRowClick && onRowClick(row)}
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key as string}
                                                className={cn(
                                                    'px-4 py-2 text-sm text-slate-900 dark:text-slate-200 whitespace-nowrap',
                                                    column.align === 'center' && 'text-center',
                                                    column.align === 'right' && 'text-right'
                                                )}
                                            >
                                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                                            </td>
                                        ))}
                                        {showActions && actions.length > 0 && (
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex gap-1 justify-start">
                                                    {actions
                                                        .filter(action => !action.hidden || !action.hidden(row))
                                                        .map((action, actionIndex) => {
                                                            // Choose color classes based on action.variant or custom property (optional)
                                                            let colorClasses = "transition-all border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300";
                                                            if (action.variant === 'destructive') {
                                                                colorClasses += " hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-700 dark:hover:text-red-400";
                                                            } else if (action.variant === 'info') {
                                                                colorClasses += " hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400";
                                                            } else if (action.variant === 'success') {
                                                                colorClasses += " hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 hover:text-green-700 dark:hover:text-green-400";
                                                            } else if (action.variant === 'warning') {
                                                                colorClasses += " hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-700 hover:text-yellow-700 dark:hover:text-yellow-400";
                                                            } else {
                                                                colorClasses += " hover:bg-slate-100 dark:hover:bg-slate-700";
                                                            }
                                                            return (
                                                                <Button
                                                                    key={actionIndex}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        action.onClick(row);
                                                                    }}
                                                                    className={colorClasses}
                                                                    title={action.title || action.label}
                                                                >
                                                                    {action.icon}
                                                                </Button>
                                                            );
                                                        })}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
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
                                className="h-8 w-8 p-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
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
                                                isActive 
                                                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
                                className="h-8 w-8 p-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
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
