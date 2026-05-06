'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/utils/axios';

interface CreateReviewFormProps {
    requestId?: string;
    requestType?: string;
    lastApprovalId?: string;
    onCreated: (approval: any) => void;
}

export const CreateReviewForm: React.FC<CreateReviewFormProps> = ({ 
    requestId, 
    requestType, 
    lastApprovalId, 
    onCreated 
}) => {
    const [remarks, setRemarks] = useState("");
    const [status, setStatus] = useState("Pending");
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requestId) {
            toast.error("Please ensure request is loaded.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(`/approvals/create/${lastApprovalId}`, {
                params: {
                    last_approval_id: lastApprovalId || undefined,
                    request_type: requestType,
                    remarks,
                    status,
                },
            });

            if (res.data.header.success) {
                toast.success("Review created successfully");
                onCreated(res.data.body.approval);
                // Reset form
                setRemarks("");
                setStatus("Pending");
            } else {
                toast.error(res.data.header.messages[0].message);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.header?.messages?.[0]?.message || err?.response?.data?.message || "Failed to create review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Status Select */}
            <div className="flex-1 min-w-[150px]">
                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1.5 block">
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
            <div className="flex-1 min-w-[200px]">
                <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1.5 block">
                    Remarks
                </Label>
                <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    placeholder="Enter remarks (optional)"
                    rows={1}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none min-h-[40px]"
                />
            </div>

            {/* Submit Button */}
            <div className="flex-shrink-0">
                <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-[40px]"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4 mr-2" />
                            Save Review
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};
