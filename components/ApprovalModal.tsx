'use client';

// REFACTOR-PHASE-2: Updated to use Redux instead of direct API calls
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { updateApproval, selectUpdateLoading, selectUpdateError } from '@/stores/slices/approvals';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalModalProps {
    open: boolean;
    onClose: () => void;
    approvalId: string;
    action: 'approve' | 'reject';
    requestCode?: string;
    requestType?: string;
    creatorName?: string;
    onSuccess?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
    open,
    onClose,
    approvalId,
    action,
    requestCode,
    requestType,
    creatorName,
    onSuccess
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectUpdateLoading);
    const updateError = useSelector(selectUpdateError);
    
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState<string | null>(null);

    // REFACTOR-PHASE-2: Reset error when modal opens/closes
    useEffect(() => {
        if (!open) {
            setRemarks('');
            setError(null);
        }
    }, [open]);

    // REFACTOR-PHASE-2: Handle Redux error state
    useEffect(() => {
        if (updateError) {
            setError(updateError);
            toast.error(updateError);
        }
    }, [updateError]);

    const handleSubmit = async () => {
        // التحقق من النكات عند الرفض
        if (action === 'reject' && !remarks.trim()) {
            setError('يرجى إدخال سبب الرفض');
            return;
        }

        setError(null);

        // REFACTOR-PHASE-2: Use Redux thunk instead of direct API call
        const result = await dispatch(updateApproval({
            approvalId,
            status: action === 'approve' ? 'Approved' : 'Rejected',
            remarks: remarks.trim() || (action === 'approve' ? 'تمت الموافقة' : '')
        }));

        if (updateApproval.fulfilled.match(result)) {
            toast.success(`تم ${action === 'approve' ? 'الموافقة' : 'الرفض'} بنجاح`);
            setRemarks('');
            onClose();
            if (onSuccess) {
                onSuccess();
            }
        }
        // Error handling is done via useEffect watching updateError
    };

    const handleClose = () => {
        if (!loading) {
            setRemarks('');
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {action === 'approve' ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                موافقة على الطلب
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                رفض الطلب
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {action === 'approve' 
                            ? 'يرجى مراجعة الطلب والتأكد من صحة جميع المستندات قبل الموافقة'
                            : 'يرجى إدخال سبب الرفض لتوضيح المشكلة للمستخدم'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Request Info */}
                    {(requestCode || requestType || creatorName) && (
                        <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            {requestCode && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">رقم الطلب:</span>
                                    <span className="text-sm font-mono text-slate-900 dark:text-slate-100">{requestCode}</span>
                                </div>
                            )}
                            {requestType && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">نوع الطلب:</span>
                                    <span className="text-sm text-slate-900 dark:text-slate-100">{requestType}</span>
                                </div>
                            )}
                            {creatorName && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">المنشئ:</span>
                                    <span className="text-sm text-slate-900 dark:text-slate-100">{creatorName}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Remarks Field */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks" className="text-slate-700 dark:text-slate-200">
                            النكات / الملاحظات:
                            {action === 'reject' && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => {
                                setRemarks(e.target.value);
                                setError(null);
                            }}
                            placeholder={
                                action === 'reject' 
                                    ? 'يرجى إدخال سبب الرفض...' 
                                    : 'ملاحظات (اختياري)...'
                            }
                            rows={4}
                            className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/50 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            required={action === 'reject'}
                        />
                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="border-slate-200 dark:border-slate-700"
                    >
                        إلغاء
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || (action === 'reject' && !remarks.trim())}
                        className={
                            action === 'approve'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        }
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                جاري المعالجة...
                            </>
                        ) : (
                            action === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

