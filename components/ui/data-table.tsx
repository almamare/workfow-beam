'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Ellipsis } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export interface Column<T> {
    key: keyof T;
    header: string;
    render?: (value: any, row: T) => React.ReactNode;
    sortable?: boolean;
}

export interface Action<T> {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
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
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    actions = [],
    pagination,
    loading = false,
    onSearch,
    onSort,
    onRowClick,
    noDataMessage = 'No data available'
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

    return (
        <div className="space-y-4">
            {/* Search */}
            {onSearch && (
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                {columns.map((column) => (
                                    <th
                                        key={column.key as string}
                                        className={`px-4 py-3 text-left text-sm font-medium ${column.sortable ? 'cursor-pointer hover:bg-muted' : ''
                                            }`}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.header}
                                            {column.sortable && sortKey === column.key && (
                                                <span className="text-xs">
                                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                                {actions.length > 0 && (
                                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                // Loading skeleton
                                Array.from({ length: pagination?.pageSize || 5 }).map((_, index) => (
                                    <tr key={index} className="border-b">
                                        {columns.map((column, colIndex) => (
                                            <td key={colIndex} className="px-3 py-2">
                                                <Skeleton className="h-4 w-full" />
                                            </td>
                                        ))}
                                        {actions.length > 0 && (
                                            <td className="px-3 py-2 text-right">
                                                <Skeleton className="h-6 w-6 mx-auto" />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : data.length === 0 ? (
                                // No data message
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        {noDataMessage}
                                    </td>
                                </tr>
                            ) : (
                                // Data rows
                                data.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b hover:bg-muted/50 ${onRowClick ? 'cursor-pointer' : ''
                                            }`}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {columns.map((column) => (
                                            <td key={column.key as string} className="px-3 py-2 text-sm">
                                                {column.render
                                                    ? column.render(row[column.key], row)
                                                    : row[column.key]}
                                            </td>
                                        ))}
                                        {actions.length > 0 && (
                                            <td className="px-3 py-2 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="sm" className="h-6">
                                                            <Ellipsis className="h-3 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {actions.map((action, actionIndex) => (
                                                            <DropdownMenuItem
                                                                key={actionIndex}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    action.onClick(row);
                                                                }}
                                                            >
                                                                {action.icon && <span className="mr-2">{action.icon}</span>}
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
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.totalItems)} {' '}
                        to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} {' '}
                        of {pagination.totalItems} results
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
                                const pageNum = pagination.currentPage <= 3
                                    ? idx + 1
                                    : pagination.currentPage >= pagination.totalPages - 2
                                        ? pagination.totalPages - 4 + idx
                                        : pagination.currentPage - 2 + idx;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => pagination.onPageChange(pageNum)}
                                        disabled={loading}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}

                            {pagination.totalPages > 5 && (
                                <span className="mx-1 text-muted-foreground">...</span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages || loading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {pagination.onPageSizeChange && (
                        <div className="flex items-center gap-2 text-sm">
                            <span>Items per page:</span>
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                                className="border rounded p-1"
                                disabled={loading}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}