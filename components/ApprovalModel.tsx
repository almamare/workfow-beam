'use client';

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "@/utils/axios";

// Props interface for the ApprovalModel component
interface ApprovalModelProps {
    open: boolean; // Whether the modal is open
    onClose: () => void; // Callback to close the modal
    onCreated: (approval: any) => void; // Callback when approval is created
    requestId?: string; // Request ID associated with the approval
    requestType?: string; // Request type
    lastApprovalId?: string; // Last approval ID to send instead of step_name
}

// ApprovalModel Component
const ApprovalModel: React.FC<ApprovalModelProps> = ({ open, onClose, onCreated, requestId, requestType, lastApprovalId }) => {
    // State for form inputs
    const [remarks, setRemarks] = useState(""); // Approval remarks
    const [status, setStatus] = useState("Pending"); // Approval status
    const [loading, setLoading] = useState(false); // Loading state during API call

    /**
     * Handle form submission to create a new approval
     */
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: ensure all required fields are filled
        if (!requestId) {
            toast.error("Please ensure request is loaded.");
            return;
        }

        setLoading(true);

        try {
            // POST request to create approval
            // FIXED: Changed from /approvals/update to /approvals/create per API contract
            const res = await axios.post(`/approvals/create/${lastApprovalId}`, {
                params: {
                    last_approval_id: lastApprovalId || undefined,
                    request_type: requestType,
                    remarks,
                    status,
                },
            });

            if (res.data.header.success) {

                // Show success notification
                toast.success("Approval created successfully");

                // Trigger callback with created approval
                onCreated(res.data.body.approval);
            } else {
                toast.error(res.data.header.messages[0].message);
                return;
            }

            // Reset form fields
            setRemarks("");
            setStatus("Pending");
            // Close modal
            onClose();
        } catch (err: any) {
            // Handle errors from API call
            toast.error(err?.response?.data?.header?.messages?.[0]?.message || err?.response?.data?.message || "Failed to create approval");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-slate-100">Add New Review</DialogTitle>
                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                        Create a new review step for this request.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-4">
                    {/* Status Select */}
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                            Status *
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger 
                                id="status"
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200"
                            >
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                <SelectItem 
                                    value="Approved"
                                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                >
                                    Approved
                                </SelectItem>
                                <SelectItem 
                                    value="Rejected"
                                    className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200"
                                >
                                    Rejected
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Remarks Input */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-300 font-medium">
                            Remarks
                        </Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Enter remarks (optional)"
                            rows={4}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                        />
                    </div>

                    {/* Modal Footer with buttons */}
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose} 
                            disabled={loading}
                            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Review"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ApprovalModel;
