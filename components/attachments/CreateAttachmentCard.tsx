'use client';

import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { createAttachment, setUploadProgress } from '@/stores/slices/attachments';
import { fileToBase64WithProgress, validateFile, formatFileSize } from '@/utils/fileUtils';
import type { CreateAttachmentPayload } from '@/stores/types/attachments';

interface CreateAttachmentCardProps {
    requestId?: string;
    requestType?: string;
    onCreated: () => void;
}

export const CreateAttachmentCard: React.FC<CreateAttachmentCardProps> = ({ 
    requestId, 
    requestType = 'Clients',
    onCreated 
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('Active');
    const [version, setVersion] = useState('1.0');
    const [uploadProgress, setUploadProgressLocal] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (!file || !requestId) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);

        try {
            setUploadProgressLocal(0);

            const base64 = await fileToBase64WithProgress(file, (progress) => {
                setUploadProgressLocal(progress);
                dispatch(setUploadProgress(progress));
            });

            const payload: CreateAttachmentPayload = {
                request_id: requestId,
                title: title.trim(),
                file: base64,
                status: status,
                version: version.trim(),
            };

            const result = await dispatch(createAttachment(payload)).unwrap();

            toast.success('Attachment created successfully');
            
            // Reset form
            setTitle('');
            setFile(null);
            setStatus('Active');
            setVersion('1.0');
            setUploadProgressLocal(0);
            setErrors({});
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            onCreated();
        } catch (error: any) {
            const errorMessage = error || 'Failed to create attachment';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setUploadProgressLocal(0);
            dispatch(setUploadProgress(0));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
                {/* Title Field */}
                <div className="flex-1 min-w-[150px]">
                    <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1.5 block">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        type="text"
                        placeholder="Enter title"
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setTitle(e.target.value);
                            if (errors.title) setErrors({ ...errors, title: '' });
                        }}
                        className={errors.title ? 'border-red-500 h-[40px]' : 'h-[40px]'}
                    />
                    {errors.title && (
                        <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                    )}
                </div>

                {/* File Upload Field */}
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="file" className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1.5 block">
                        File <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="file"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="h-[40px]"
                            disabled={loading}
                        />
                        {file && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="h-[40px]"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {file && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <FileText className="h-3 w-3" />
                            <span>{file.name}</span>
                            <span>({formatFileSize(file.size)})</span>
                        </div>
                    )}
                    {errors.file && (
                        <p className="text-xs text-red-500 mt-1">{errors.file}</p>
                    )}
                </div>

                {/* Status Field */}
                <div className="flex-1 min-w-[120px]">
                    <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1.5 block">
                        Status
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger 
                            id="status"
                            className="h-[40px]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Version Field */}
                <div className="flex-1 min-w-[100px]">
                    <Label htmlFor="version" className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1.5 block">
                        Version
                    </Label>
                    <Input
                        id="version"
                        type="text"
                        placeholder="1.0"
                        value={version}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVersion(e.target.value)}
                        className="h-[40px]"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex-shrink-0">
                    <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-[40px]"
                        disabled={loading || !file}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </>
                        )}
                    </Button>
                </div>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                        className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}
        </form>
    );
};
