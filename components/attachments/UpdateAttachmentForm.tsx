'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { updateAttachment, setUploadProgress } from '@/stores/slices/attachments';
import { fileToBase64WithProgress, validateFile, formatFileSize } from '@/utils/fileUtils';
import type { Attachment, UpdateAttachmentPayload } from '@/stores/types/attachments';

interface UpdateAttachmentFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    attachment: Attachment | null;
}

export const UpdateAttachmentForm: React.FC<UpdateAttachmentFormProps> = ({
    open,
    onClose,
    onSuccess,
    attachment,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgressLocal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form when attachment changes
    useEffect(() => {
        if (attachment) {
            setTitle(attachment.title || '');
            setFile(null);
            setUploadProgressLocal(0);
            setErrors({});
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [attachment]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setTitle('');
            setFile(null);
            setUploadProgressLocal(0);
            setErrors({});
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Validate file
        const validation = validateFile(selectedFile);
        if (!validation.valid) {
            toast.error(validation.error || 'Invalid file');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setErrors({ file: validation.error || 'Invalid file' });
            return;
        }

        setFile(selectedFile);
        setErrors({});
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Title is optional, but if provided, must be at least 3 characters
        if (title.trim() && title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!attachment) {
            toast.error('No attachment selected');
            return;
        }

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        // Check if at least one field is being updated
        if (!title.trim() && !file) {
            toast.error('Please update at least one field');
            return;
        }

        try {
            setUploadProgressLocal(0);

            const payload: UpdateAttachmentPayload = {
                attachment_id: attachment.id,
            };

            // Add title if provided
            if (title.trim() && title.trim() !== attachment.title) {
                payload.title = title.trim();
            }

            // Add file if provided
            if (file) {
                const base64 = await fileToBase64WithProgress(file, (progress) => {
                    setUploadProgressLocal(progress);
                    dispatch(setUploadProgress(progress));
                });
                payload.file = base64;
            }

            // Dispatch update action
            await dispatch(updateAttachment(payload)).unwrap();

            toast.success('Attachment updated successfully');
            
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
        } catch (error: any) {
            const errorMessage = error || 'Failed to update attachment';
            toast.error(errorMessage);
        } finally {
            setUploadProgressLocal(0);
            dispatch(setUploadProgress(0));
        }
    };

    if (!attachment) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Update Attachment</DialogTitle>
                    <DialogDescription>
                        Update the attachment details. Leave fields empty to keep current values.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current File Info */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current File:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{attachment.file || 'N/A'}</p>
                    </div>

                    {/* Title Field */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">
                            Title <span className="text-slate-400 text-xs">(optional)</span>
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder={attachment.title || 'Enter new title'}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors({ ...errors, title: '' });
                            }}
                            className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* File Upload Field */}
                    <div className="space-y-2">
                        <Label htmlFor="file" className="text-slate-700 dark:text-slate-300 font-medium">
                            New File <span className="text-slate-400 text-xs">(optional)</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="file"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                                className="flex-1"
                            />
                        </div>
                        {file && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{file.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        {errors.file && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.file}
                            </p>
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={uploadProgress > 0 && uploadProgress < 100}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={uploadProgress > 0 && uploadProgress < 100}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                    >
                        {uploadProgress > 0 && uploadProgress < 100 ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating... {uploadProgress}%
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

