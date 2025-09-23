'use client';

import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/utils/axios";
import { Loader2 } from "lucide-react";

interface AttachmentModelProps {
    open: boolean;
    onClose: () => void;
    onUploaded?: (attachment: any) => void;
    requestId: string;
}

/**
 * Modal component to upload an attachment related to a request.
 */
const AttachmentModel: React.FC<AttachmentModelProps> = ({
    open,
    onClose,
    onUploaded,
    requestId,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handle file input change.
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    /**
     * Upload the selected file to the server.
     */
    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file");
            return;
        }
        if (!title.trim()) {
            toast.error("Please enter an attachment title");
            return;
        }
        setLoading(true);
        try {
            const formData = {
                params: {
                    file: await toBase64(file),
                    title: title,
                    request_type: "Tasks",
                    request_id: requestId,
                },
            };


            const response = await axios.post("/attachments/create", formData);

            if (response.data.header.success) {
                toast.success("Attachment uploaded successfully");
                if (onUploaded) onUploaded(response.data);
            } else {
                toast.error(response.data.header.messages[0].message);
                return;
            }

            // Reset form
            setFile(null);
            setTitle("");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            onClose();
        } catch (error: any) {
            const message = error?.response?.data?.header?.messages?.[0]?.message || error?.response?.data?.message || "Failed to upload attachment";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload New Attachment</DialogTitle>
                    <DialogDescription>
                        Upload a file attachment for this request.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Attachment Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                        aria-label="Attachment Title"
                    />
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={loading}
                        accept="*"
                        aria-label="File input"
                    />
                    {file && (
                        <div className="text-xs text-muted-foreground">
                            Selected file: {file.name}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={loading || !file}>
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                Uploading...
                            </>
                        ) : (
                            "Upload"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AttachmentModel;
function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
}

