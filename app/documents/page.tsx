'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import {
    fetchDocuments,
    deleteDocument,
    selectDocuments,
    selectDocumentsLoading,
    selectDocumentsTotal,
    selectDocumentsPages,
} from '@/stores/slices/documents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Eye, Edit, Plus, RefreshCw, FileSpreadsheet, Trash2, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import type { Document } from '@/stores/types/documents';

export default function DocumentsPage() {
    const documents = useSelector(selectDocuments);
    const loading = useSelector(selectDocumentsLoading);
    const totalItems = useSelector(selectDocumentsTotal);
    const totalPages = useSelector(selectDocumentsPages);

    const dispatch = useReduxDispatch<AppDispatch>();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

    useEffect(() => {
        dispatch(fetchDocuments({
            page,
            limit,
            search: search || undefined,
        }));
    }, [dispatch, page, limit, search]);

    // Helper function to get file type badge
    const getFileTypeBadge = (fileName: string) => {
        const extension = fileName?.split('.').pop()?.toLowerCase() || '';
        if (['pdf'].includes(extension)) {
            return (
                <Badge
                    variant="outline"
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-medium"
                >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                </Badge>
            );
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
                >
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Image
                </Badge>
            );
        }
        return (
            <Badge
                variant="outline"
                className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 font-medium"
            >
                {extension.toUpperCase() || 'File'}
            </Badge>
        );
    };

    const columns: Column<Document>[] = [
        {
            key: 'title',
            header: 'Title',
            sortable: true,
            render: (value: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
            )
        },
        {
            key: 'description',
            header: 'Description',
            sortable: false,
            render: (value: any) => {
                const maxLength = 50;
                const shouldTruncate = value && value.length > maxLength;
                const displayText = shouldTruncate
                    ? `${value.substring(0, maxLength)}...`
                    : value || '-';

                return (
                    <div className="text-slate-700 dark:text-slate-300">
                        <span title={value || ''}>{displayText}</span>
                    </div>
                );
            }
        },
        {
            key: 'file',
            header: 'File',
            sortable: false,
            render: (value: any, document: Document) => {
                const fileName = document.file || value || '-';
                return (
                    <div className="flex items-center gap-2">
                        {getFileTypeBadge(fileName)}
                        <span className="text-slate-600 dark:text-slate-400 text-sm font-mono">
                            {fileName.length > 20 ? `${fileName.substring(0, 20)}...` : fileName}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'uploader_name',
            header: 'Uploaded By',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value || '-'}</span>
            )
        },
        {
            key: 'uploaded_at',
            header: 'Uploaded At',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    }) : '-'}
                </span>
            )
        },
        {
            key: 'created_at',
            header: 'Created At',
            sortable: true,
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    }) : '-'}
                </span>
            )
        }
    ];

    const actions: Action<Document>[] = [
        {
            label: 'View Details',
            onClick: (document: Document) => {
                router.push(`/documents/details?id=${document.id}`);
            },
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Download File',
            onClick: async (doc: Document) => {
                try {
                    // If document has a path, download from there
                    if (doc.path) {
                        window.open(doc.path, '_blank');
                    } else if (doc.file) {
                        // If file is base64, convert and download
                        const link = document.createElement('a');
                        link.href = doc.file;
                        link.download = doc.file.split('/').pop() || 'document';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    toast.success('File download started');
                } catch (err: any) {
                    toast.error(err?.message || 'Failed to download file');
                }
            },
            icon: <Download className="h-4 w-4" />,
            variant: 'default' as const
        },
        {
            label: 'Edit Document',
            onClick: (document: Document) => {
                router.push(`/documents/update?id=${document.id}`);
            },
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        },
        {
            label: 'Delete Document',
            onClick: (document: Document) => {
                setDocumentToDelete(document);
                setIsDeleteDialogOpen(true);
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        return arr;
    }, [search]);

    const refreshTable = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchDocuments({
                page,
                limit,
                search: search || undefined,
            })).unwrap();
            toast.success('Table refreshed successfully');
        } catch (err: any) {
            toast.error(err || 'Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportToExcel = async () => {
        setIsExporting(true);
        try {
            const { data } = await axios.get('/documents/fetch', {
                params: {
                    search: search || undefined,
                    limit: 10000,
                    page: 1
                }
            });

            const headers = ['Title', 'Description', 'File', 'Uploaded By', 'Uploaded At', 'Created At'];
            const csvHeaders = headers.join(',');
            const csvRows = (data?.body?.documents?.items || []).map((d: Document) => {
                return [
                    escapeCsv(d.title),
                    escapeCsv(d.description || ''),
                    escapeCsv(d.file || ''),
                    escapeCsv(d.uploader_name || ''),
                    d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString('en-US') : '',
                    d.created_at ? new Date(d.created_at).toLocaleDateString('en-US') : ''
                ].join(',');
            });
            const csvContent = [csvHeaders, ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `documents_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Data exported successfully');
        } catch {
            toast.error('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!documentToDelete) return;

        try {
            await dispatch(deleteDocument(documentToDelete.id)).unwrap();
            setIsDeleteDialogOpen(false);
            setDocumentToDelete(null);
            toast.success('Document deleted successfully');
            dispatch(fetchDocuments({
                page,
                limit,
                search: search || undefined,
            }));
        } catch (err: any) {
            toast.error(err || 'Failed to delete document');
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Documents</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Browse and manage all system documents</p>
                </div>
                <Button
                    onClick={() => router.push('/documents/create')}
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add New Document
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Documents"
                    description="All documents in the system"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalItems,
                        badge: 'Total',
                        badgeColor: 'default'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Current Page"
                    description="Documents in current view"
                    variant="default"
                    size="sm"
                    stats={{
                        total: documents.length,
                        badge: 'Visible',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Pages"
                    description="Number of pages"
                    variant="default"
                    size="sm"
                    stats={{
                        total: totalPages,
                        badge: 'Pages',
                        badgeColor: 'success'
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Filtered Results"
                    description="Current filter results"
                    variant="default"
                    size="sm"
                    stats={{
                        total: documents.length,
                        badge: 'Filtered',
                        badgeColor: 'info'
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by document title..."
                searchValue={search}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                filters={[]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setPage(1);
                }}
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={refreshTable}
                            disabled={isRefreshing || loading}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={exportToExcel}
                            disabled={isExporting}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                        </Button>
                    </>
                }
            />

            {/* Documents Table */}
            <EnhancedCard
                title="Documents List"
                description={`${documents.length} documents out of ${totalItems} total`}
                variant="default"
                size="sm"
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            {[5, 10, 20, 50, 100, 200].map(n => (
                                <SelectItem key={n} value={String(n)} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                    {n} per page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={documents}
                    columns={columns}
                    actions={actions}
                    loading={loading}
                    pagination={{
                        currentPage: page,
                        totalPages,
                        pageSize: limit,
                        totalItems,
                        onPageChange: setPage
                    }}
                    noDataMessage="No documents found matching your search criteria"
                    searchPlaceholder="Search documents..."
                />
            </EnhancedCard>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Document</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {documentToDelete && (
                        <div className="py-4">
                            <p className="text-slate-900 dark:text-slate-100 font-semibold">{documentToDelete.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                File: {documentToDelete.file || '-'}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function escapeCsv(val: any) {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

