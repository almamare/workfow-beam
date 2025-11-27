'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchDocument,
    selectSelectedDocument,
    selectDocumentsLoading,
    clearSelectedDocument,
} from '@/stores/slices/documents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, Download, ArrowLeft, FileText, Image as ImageIcon, Copy, ExternalLink } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';

const DocumentDetailsPage: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const documentId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedDocument = useSelector(selectSelectedDocument);
    const loading = useSelector(selectDocumentsLoading);

    /**
     * Fetch document data by ID
     */
    const fetchDocumentData = useCallback(async () => {
        if (!documentId) {
            toast.error('Document ID is required');
            router.push('/documents');
            return;
        }
        try {
            await dispatch(fetchDocument({ id: documentId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load document data.');
            router.push('/documents');
        }
    }, [documentId, dispatch, router]);

    // Fetch document when component mounts
    useEffect(() => {
        fetchDocumentData();
        return () => {
            dispatch(clearSelectedDocument());
        };
    }, [fetchDocumentData, dispatch]);

    const handleDownload = () => {
        if (!selectedDocument) return;
        try {
            if (selectedDocument.path) {
                window.open(selectedDocument.path, '_blank');
            } else if (selectedDocument.file) {
                const link = document.createElement('a');
                link.href = selectedDocument.file;
                link.download = selectedDocument.file.split('/').pop() || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            toast.success('File download started');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to download file');
        }
    };

    const handleViewFile = () => {
        if (!selectedDocument) return;
        try {
            if (selectedDocument.path) {
                window.open(selectedDocument.path, '_blank');
            } else if (selectedDocument.file) {
                window.open(selectedDocument.file, '_blank');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to open file');
        }
    };

    const handleCopyPath = () => {
        if (!selectedDocument?.path) return;
        navigator.clipboard.writeText(selectedDocument.path);
        toast.success('Path copied to clipboard');
    };

    const getFileTypeBadge = () => {
        if (!selectedDocument?.file) return null;
        const fileName = selectedDocument.file;
        const extension = fileName?.split('.').pop()?.toLowerCase() || '';
        if (['pdf'].includes(extension) || fileName.includes('application/pdf')) {
            return (
                <Badge
                    variant="outline"
                    className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-medium"
                >
                    <FileText className="h-3 w-3 mr-1" />
                    PDF
                </Badge>
            );
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension) || fileName.includes('image/')) {
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
                File
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
            </div>
        );
    }

    if (!selectedDocument) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Document not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/documents')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Documents
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Document Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete document information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/documents')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Documents
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleViewFile}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View File
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDownload}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push(`/documents/update?id=${documentId}`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Document
                    </Button>
                </div>
            </div>

            {/* Document Details */}
            <div className="grid gap-4 md:grid-cols-2">
                <EnhancedCard
                    title="Basic Information"
                    description="Document identification and basic details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Title</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg mt-1">
                                {selectedDocument.title}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">File Name</Label>
                            <div className="flex items-center gap-2 mt-1">
                                {getFileTypeBadge()}
                                <p className="text-slate-900 dark:text-slate-100 font-mono text-sm">
                                    {selectedDocument.file || '-'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">File Path</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-slate-900 dark:text-slate-100 font-mono text-sm break-all">
                                    {selectedDocument.path || '-'}
                                </p>
                                {selectedDocument.path && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyPath}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Uploaded By</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedDocument.uploader_name || selectedDocument.uploaded_by || '-'}
                            </p>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Additional Information"
                    description="Timestamps and metadata"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Uploaded At</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedDocument.uploaded_at
                                    ? new Date(selectedDocument.uploaded_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Created At</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedDocument.created_at
                                    ? new Date(selectedDocument.created_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Updated At</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedDocument.updated_at
                                    ? new Date(selectedDocument.updated_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </EnhancedCard>
            </div>

            {/* Description Card */}
            {selectedDocument.description && (
                <EnhancedCard
                    title="Description"
                    description="Full document description"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-2">
                        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                            {selectedDocument.description}
                        </p>
                    </div>
                </EnhancedCard>
            )}
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading document details...</div>}>
            <DocumentDetailsPage />
        </Suspense>
    );
}

