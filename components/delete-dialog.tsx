'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export function DeleteDialog({
    open,
    onClose,
    onConfirm,
    title = "Are you sure you want to delete this item?",
    description = "This action cannot be undone.",
}: DeleteDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
