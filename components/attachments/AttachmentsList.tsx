'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { Eye, Download, Trash2, Edit, FileText, Image, File } from 'lucide-react';
import type { Attachment } from '@/stores/types/attachments';
import { formatFileSize } from '@/utils/fileUtils';
import axios from '@/utils/axios';
import { toast } from 'sonner';

interface AttachmentsListProps {
    attachments: Attachment[];
    loading?: boolean;
    onDelete?: (attachmentId: string) => void;
    onEdit?: (attachment: Attachment) => void;
    requestId?: string;
}

export const AttachmentsList: React.FC<AttachmentsListProps> = ({
    attachments,
    loading = false,
    onDelete,
    onEdit,
    requestId,
}) => {
    const getFileIcon = (file: Attachment) => {
        const fileName = file.file?.toLowerCase() || '';
        if (fileName.endsWith('.pdf')) {
            return <FileText className="h-4 w-4 text-red-500" />;
        }
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => fileName.endsWith(ext))) {
            return <Image className="h-4 w-4 text-blue-500" />;
        }
        return <File className="h-4 w-4 text-slate-500" />;
    };

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('active') || statusLower.includes('نشط')) {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        }
        if (statusLower.includes('pending') || statusLower.includes('قيد')) {
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const handleView = (attachment: Attachment) => {
        const url = `${attachment.path}${attachment.file}`;
        window.open(url, '_blank');
    };

    const handleDownload = (attachment: Attachment) => {
        try {
            const url = `${attachment.path}${attachment.file}`;
            const link = document.createElement('a');
            link.href = url;
            link.download = attachment.file;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('File download started');
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    const handleDelete = async (attachment: Attachment) => {
        if (!onDelete) return;
        
        if (window.confirm(`Are you sure you want to delete "${attachment.title}"?`)) {
            try {
                // Try to delete from server if API exists
                // await axios.delete(`/attachments/${attachment.id}`);
                onDelete(attachment.id);
                toast.success('Attachment deleted successfully');
            } catch (error) {
                toast.error('Failed to delete attachment');
            }
        }
    };

    const columns: Column<Attachment>[] = [
        {
            key: 'sequence' as keyof Attachment,
            header: 'ID',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || 'N/A'}</span>
            ),
            sortable: true
        },
        {
            key: 'title' as keyof Attachment,
            header: 'Title',
            render: (value: any, row: Attachment) => (
                <div className="flex items-center gap-2">
                    {getFileIcon(row)}
                    <span className="font-medium text-slate-800 dark:text-slate-200">{value || row.file || 'N/A'}</span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'step_process' as keyof Attachment,
            header: 'Step Process',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || 'N/A'}</span>
            ),
            sortable: true
        },
        {
            key: 'version' as keyof Attachment,
            header: 'Version',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value || 'N/A'}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof Attachment,
            header: 'Status',
            render: (value: any) => (
                <Badge variant="outline" className={getStatusColor(value)}>
                    {value || 'N/A'}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'uploader_name' as keyof Attachment,
            header: 'Uploaded By',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value || 'N/A'}</span>
            ),
            sortable: true
        },
        {
            key: 'created_at' as keyof Attachment,
            header: 'Created At',
            render: (value: any) => {
                if (!value) return <span className="text-slate-400">N/A</span>;
                try {
                    return (
                        <span className="text-slate-600 dark:text-slate-400">
                            {value}
                        </span>
                    );
                } catch {
                    return <span className="text-slate-600 dark:text-slate-400">{value}</span>;
                }
            },
            sortable: true
        }
    ];

    const actions: Action<Attachment>[] = [
        {
            label: 'View',
            onClick: handleView,
            icon: <Eye className="h-4 w-4" />,
            variant: 'info' as const
        },
        {
            label: 'Download',
            onClick: handleDownload,
            icon: <Download className="h-4 w-4" />,
            variant: 'default' as const
        },
        ...(onEdit ? [{
            label: 'Edit',
            onClick: onEdit,
            icon: <Edit className="h-4 w-4" />,
            variant: 'warning' as const
        }] : []),
        ...(onDelete ? [{
            label: 'Delete',
            onClick: handleDelete,
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }] : [])
    ] as Action<Attachment>[];

    // Filter out any null/undefined attachments
    const validAttachments = attachments.filter((att) => att != null);

    return (
        <EnhancedDataTable
            data={validAttachments}
            columns={columns}
            actions={actions}
            loading={loading}
            noDataMessage="No attachments found"
            hideEmptyMessage={false}
        />
    );
};

