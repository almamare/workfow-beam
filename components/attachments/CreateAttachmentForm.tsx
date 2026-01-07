'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { createAttachment, setUploadProgress } from '@/stores/slices/attachments';
import { fileToBase64WithProgress, validateFile, formatFileSize, MAX_FILE_SIZE } from '@/utils/fileUtils';
import type { CreateAttachmentPayload } from '@/stores/types/attachments';

interface CreateAttachmentFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    requestId: string;
    requestType?: string;
}

export const CreateAttachmentForm: React.FC<CreateAttachmentFormProps> = ({
    open,
    onClose,
    onSuccess,
    requestId,
    requestType = 'Clients',
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('Active');
    const [version, setVersion] = useState('1.0');
    const [uploadProgress, setUploadProgressLocal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setTitle('');
            setFile(null);
            setStatus('Active');
            setVersion('1.0');
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
        
        // Auto-fill title if empty
        if (!title.trim()) {
            setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
        }
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

        if (!title.trim()) {
            newErrors.title = 'Title is required';
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        if (!file) {
            newErrors.file = 'File is required';
        }

        if (!status) {
            newErrors.status = 'Status is required';
        }

        if (!version.trim()) {
            newErrors.version = 'Version is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (!file) {
            toast.error('Please select a file');
            return;
        }

        try {
            setUploadProgressLocal(0);

            // Convert file to Base64 with progress tracking
            const base64 = await fileToBase64WithProgress(file, (progress) => {
                setUploadProgressLocal(progress);
                dispatch(setUploadProgress(progress));
            });

            // Prepare payload
            const payload: CreateAttachmentPayload = {
                request_id: requestId,
                title: title.trim(),
                file: base64,
                status: status,
                version: version.trim(),
            };

            // Dispatch create action
            const result = await dispatch(createAttachment(payload)).unwrap();

            toast.success('Attachment created successfully');
            
            if (onSuccess) {
                onSuccess();
            }
            
            onClose();
        } catch (error: any) {
            const errorMessage = error || 'Failed to create attachment';
            toast.error(errorMessage);
        } finally {
            setUploadProgressLocal(0);
            dispatch(setUploadProgress(0));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload New Attachment</DialogTitle>
                    <DialogDescription>
                        Upload a file attachment for this request. Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Title Field */}
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Enter attachment title"
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
                            File <span className="text-red-500">*</span>
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

                    {/* Status and Version Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                Status <span className="text-red-500">*</span>
                            </Label>
                            <Select value={status} onValueChange={(value) => {
                                setStatus(value);
                                if (errors.status) setErrors({ ...errors, status: '' });
                            }}>
                                <SelectTrigger id="status" className={errors.status ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="version" className="text-slate-700 dark:text-slate-300 font-medium">
                                Version <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="version"
                                type="text"
                                placeholder="e.g., 1.0"
                                value={version}
                                onChange={(e) => {
                                    setVersion(e.target.value);
                                    if (errors.version) setErrors({ ...errors, version: '' });
                                }}
                                className={errors.version ? 'border-red-500' : ''}
                            />
                            {errors.version && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.version}
                                </p>
                            )}
                        </div>
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
                                Uploading... {uploadProgress}%
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

