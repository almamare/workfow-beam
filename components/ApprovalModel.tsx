'use client';

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "@/utils/axios";

// Props interface for the ApprovalModel component
interface ApprovalModelProps {
    open: boolean; // Whether the modal is open
    onClose: () => void; // Callback to close the modal
    onCreated: (approval: any) => void; // Callback when approval is created
    requestId?: string; // Request ID associated with the approval
}

// ApprovalModel Component
const ApprovalModel: React.FC<ApprovalModelProps> = ({ open, onClose, onCreated, requestId }) => {
    // State for form inputs
    const [stepName, setStepName] = useState(""); // Approval step name
    const [remarks, setRemarks] = useState(""); // Approval remarks
    const [status, setStatus] = useState("Pending"); // Approval status
    const [stepNo, setStepNo] = useState(1); // Step number
    const [loading, setLoading] = useState(false); // Loading state during API call

    /**
     * Handle form submission to create a new approval
     */
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: ensure all required fields are filled
        if (!stepName || !requestId) {
            toast.error("Please enter step name and ensure request is loaded.");
            return;
        }

        setLoading(true);

        try {
            // POST request to create approval
            const res = await axios.post(`/approvals/create/${requestId}`, {
                params: {
                    step_no: stepNo,
                    step_name: stepName,
                    request_type: "Tasks",
                    remarks,
                    status,
                },
            });

            if (res.data.header.success) {  

            // Trigger callback with created approval
            onCreated(res.data.body.approval);
            } else {
                toast.error(res.data.header.messages[0].message);
                return;
            }

            // Show success notification
            toast.success("Approval created successfully");

            // Reset form fields
            setStepName("");
            setRemarks("");
            setStatus("Pending");
            setStepNo(1);

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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Approval</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-4">
                    {/* Step Name Input */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Step Name</label>
                        <Input
                            value={stepName}
                            onChange={e => setStepName(e.target.value)}
                            placeholder="Enter step name"
                            required
                        />
                    </div>

                    {/* Step Number Input */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Step Number</label>
                        <Input
                            type="number"
                            value={stepNo}
                            onChange={e => setStepNo(Number(e.target.value))}
                            placeholder="Enter step number"
                            required
                            min={1}
                        />
                    </div>

                    {/* Remarks Input */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Remarks</label>
                        <Input
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Enter remarks"
                        />
                    </div>

                    {/* Status Select */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Status</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {/* Modal Footer with buttons */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ApprovalModel;
