'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchContract, selectSelectedContract, selectContractsLoading } from '@/stores/slices/client-contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { deleteContract } from '@/stores/slices/client-contracts';

export default function ContractDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const contractId = params.id as string;

    const dispatch = useReduxDispatch<AppDispatch>();
    const contract = useSelector(selectSelectedContract);
    const loading = useSelector(selectContractsLoading);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (contractId) {
            dispatch(fetchContract(contractId));
        }
    }, [dispatch, contractId]);

    const getStatusColor = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('نشط') || statusLower.includes('active')) {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        }
        if (statusLower.includes('منتهي') || statusLower.includes('expired') || statusLower.includes('ended')) {
            return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
        }
        if (statusLower.includes('ملغي') || statusLower.includes('cancelled') || statusLower.includes('canceled')) {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const getStatusIcon = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('نشط') || statusLower.includes('active')) {
            return <CheckCircle className="h-4 w-4" />;
        }
        if (statusLower.includes('منتهي') || statusLower.includes('expired') || statusLower.includes('ended')) {
            return <Clock className="h-4 w-4" />;
        }
        if (statusLower.includes('ملغي') || statusLower.includes('cancelled') || statusLower.includes('canceled')) {
            return <XCircle className="h-4 w-4" />;
        }
        return <Clock className="h-4 w-4" />;
    };

    const formatCurrency = (value: number | string, currency: string = 'IQD') => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '0';
        return new Intl.NumberFormat('en-US').format(numValue) + ' ' + currency;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateGuaranteeAmount = (contract: typeof contract) => {
        if (!contract) return 0;
        const value = typeof contract.contract_value === 'string' ? parseFloat(contract.contract_value) : contract.contract_value;
        const percent = contract.guarantee_percent || 0;
        return (value * percent) / 100;
    };

    const calculateRetentionAmount = (contract: typeof contract) => {
        if (!contract) return 0;
        const value = typeof contract.contract_value === 'string' ? parseFloat(contract.contract_value) : contract.contract_value;
        const percent = contract.retention_percent || 0;
        return (value * percent) / 100;
    };

    const calculateDuration = (startDate?: string, endDate?: string) => {
        if (!startDate || !endDate) return null;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleDelete = async () => {
        if (!contract) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteContract(contract.id));
            toast.success('Contract deleted successfully');
            router.push('/client-contracts');
        } catch (error: any) {
            toast.error(error || 'Failed to delete contract');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    Loading contract details...
                </div>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                    Contract not found
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Breadcrumb />
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-slate-200 dark:border-slate-700"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Contract Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete contract information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => router.push(`/client-contracts/${contract.id}/edit`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Basic Information */}
            <EnhancedCard
                title="Basic Information"
                description="Contract basic details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contract No</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-mono text-lg">{contract.contract_no}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Title</Label>
                        <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold">{contract.title}</p>
                    </div>
                    <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Description</Label>
                        <p className="text-slate-900 dark:text-slate-100">{contract.description || '-'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client</Label>
                        <div className="flex flex-col">
                            <p className="text-slate-900 dark:text-slate-100 font-medium text-lg">
                                {contract.client_name || contract.client?.name || '-'}
                            </p>
                            {contract.client_no && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">#{contract.client_no}</p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</Label>
                        <div>
                            <Badge variant="outline" className={`${getStatusColor(contract.status)} flex items-center gap-1 w-fit`}>
                                {getStatusIcon(contract.status)}
                                {contract.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Date Information */}
            <EnhancedCard
                title="Date Information"
                description="Contract dates and duration"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contract Date</Label>
                        <p className="text-slate-900 dark:text-slate-100">{formatDate(contract.contract_date)}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Start Date</Label>
                        <p className="text-slate-900 dark:text-slate-100">{formatDate(contract.start_date)}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">End Date</Label>
                        <p className="text-slate-900 dark:text-slate-100">{formatDate(contract.end_date)}</p>
                    </div>
                    {contract.start_date && contract.end_date && (
                        <div className="md:col-span-3">
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contract Duration</Label>
                            <p className="text-slate-900 dark:text-slate-100 text-lg font-semibold">
                                {calculateDuration(contract.start_date, contract.end_date)} days
                            </p>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Financial Information */}
            <EnhancedCard
                title="Financial Information"
                description="Contract financial details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contract Value</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold text-xl">
                            {formatCurrency(contract.contract_value, contract.currency)}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Currency</Label>
                        <p className="text-slate-900 dark:text-slate-100">{contract.currency}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Guarantee Percent</Label>
                        <p className="text-slate-900 dark:text-slate-100">{contract.guarantee_percent || 0}%</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Guarantee Amount</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg">
                            {formatCurrency(calculateGuaranteeAmount(contract), contract.currency)}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Retention Percent</Label>
                        <p className="text-slate-900 dark:text-slate-100">{contract.retention_percent || 0}%</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Retention Amount</Label>
                        <p className="text-slate-900 dark:text-slate-100 font-semibold text-lg">
                            {formatCurrency(calculateRetentionAmount(contract), contract.currency)}
                        </p>
                    </div>
                </div>
            </EnhancedCard>

            {/* Additional Information */}
            <EnhancedCard
                title="Additional Information"
                description="Additional contract details"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Notes</Label>
                        <p className="text-slate-900 dark:text-slate-100">{contract.notes || '-'}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created At</Label>
                        <p className="text-slate-900 dark:text-slate-100">
                            {contract.created_at ? new Date(contract.created_at).toLocaleString() : '-'}
                        </p>
                    </div>
                    {contract.updated_at && (
                        <div>
                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Updated At</Label>
                            <p className="text-slate-900 dark:text-slate-100">
                                {new Date(contract.updated_at).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contract</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contract? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Contract No:</strong> {contract.contract_no}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            <strong>Title:</strong> {contract.title}
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

