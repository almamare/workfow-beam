'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchContract, selectSelectedContract, selectContractsLoading, clearSelectedContract } from '@/stores/slices/client-contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit, Trash2, FileText, DollarSign, Calendar, Building } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { deleteContract } from '@/stores/slices/client-contracts';
import type { ClientContract } from '@/stores/types/client-contracts';

// Status badge classes
const statusBadgeClasses = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('active') || statusLower.includes('نشط')) {
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
    }
    if (statusLower.includes('expired') || statusLower.includes('منتهي')) {
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
    if (statusLower.includes('cancelled') || statusLower.includes('ملغي')) {
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    }
    return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
};

// Date formatting helper
function formatDate(dateString?: string) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Invalid date';
    }
}

// Currency formatting helper
const formatCurrency = (value: number | string, currency: string = 'IQD') => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    return new Intl.NumberFormat('en-US').format(numValue) + ' ' + currency;
};

// Detail Row Component
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right">{value || 'N/A'}</span>
    </div>
);

// Centered Layout Component for states
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        {children}
    </div>
);

function ContractDetailsContent() {
    const params = useSearchParams();
    const router = useRouter();
    const contractId = params.get('id') || '';

    const dispatch = useReduxDispatch<AppDispatch>();
    const contract = useSelector(selectSelectedContract);
    const loading = useSelector(selectContractsLoading);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchContractData = useCallback(async () => {
        if (!contractId) {
            toast.error('Contract ID is required');
            router.push('/client-contracts');
            return;
        }
        try {
            await dispatch(fetchContract(contractId)).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load contract data.');
            router.push('/client-contracts');
        }
    }, [contractId, dispatch, router]);

    useEffect(() => {
        fetchContractData();
        return () => {
            dispatch(clearSelectedContract());
        };
    }, [fetchContractData, dispatch]);

    const calculateGuaranteeAmount = (contractData: ClientContract | null) => {
        if (!contractData) return 0;
        const value = typeof contractData.contract_value === 'string' ? parseFloat(contractData.contract_value) : contractData.contract_value;
        const percent = contractData.guarantee_percent || 0;
        return (value * percent) / 100;
    };

    const calculateRetentionAmount = (contractData: ClientContract | null) => {
        if (!contractData) return 0;
        const value = typeof contractData.contract_value === 'string' ? parseFloat(contractData.contract_value) : contractData.contract_value;
        const percent = contractData.retention_percent || 0;
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
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading contract details...</p>
            </Centered>
        );
    }

    if (!contract) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">Contract not found</p>
                <Button
                    variant="outline"
                    onClick={() => router.push('/client-contracts')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contracts
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <Breadcrumb />
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Contract Details
                    </h1>
                    {contract.contract_no && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Contract No: {contract.contract_no}</p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Review contract data and related info.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/client-contracts')}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        Back to Contracts
                    </Button>
                    <Button
                        onClick={() => router.push(`/client-contracts/update?id=${contract.id}`)}
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

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Contract Title" description={contract.contract_no} variant="default" size="sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">{contract.title}</div>
                </EnhancedCard>
                <EnhancedCard title="Status" description={formatDate(contract.contract_date)} variant="default" size="sm">
                    <Badge className={statusBadgeClasses(contract.status)}>{contract.status}</Badge>
                </EnhancedCard>
                <EnhancedCard title="Contract Value" description={contract.currency} variant="default" size="sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(contract.contract_value, contract.currency)}
                    </div>
                </EnhancedCard>
                <EnhancedCard title="Client" description={contract.client_no || 'N/A'} variant="default" size="sm">
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {contract.client_name || contract.client?.name || 'N/A'}
                    </div>
                </EnhancedCard>
            </div>

            {/* Detailed Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Basic Information */}
                <EnhancedCard title="Basic Information" description="Contract basic details" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <Detail label="Contract No" value={<span className="font-mono">{contract.contract_no}</span>} />
                        <Detail label="Title" value={contract.title} />
                        <Detail label="Status" value={<Badge className={statusBadgeClasses(contract.status)}>{contract.status}</Badge>} />
                        <Detail label="Currency" value={contract.currency} />
                        <Detail label="Created At" value={formatDate(contract.created_at)} />
                        {contract.updated_at && <Detail label="Updated At" value={formatDate(contract.updated_at)} />}
                    </div>
                </EnhancedCard>

                {/* Client Information */}
                {contract.client && (
                    <EnhancedCard title="Client Information" description="Details about the associated client" variant="default" size="sm">
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            <Detail label="Client Name" value={contract.client.name} />
                            <Detail label="Client Number" value={contract.client.client_no} />
                            {contract.client.client_type && <Detail label="Client Type" value={contract.client.client_type} />}
                            {contract.client.status && <Detail label="Client Status" value={contract.client.status} />}
                        </div>
                    </EnhancedCard>
                )}

                {/* Date Information */}
                <EnhancedCard title="Date Information" description="Contract dates and duration" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <Detail label="Contract Date" value={formatDate(contract.contract_date)} />
                        <Detail label="Start Date" value={formatDate(contract.start_date)} />
                        <Detail label="End Date" value={formatDate(contract.end_date)} />
                        {contract.start_date && contract.end_date && (
                            <Detail 
                                label="Contract Duration" 
                                value={`${calculateDuration(contract.start_date, contract.end_date)} days`} 
                            />
                        )}
                    </div>
                </EnhancedCard>

                {/* Financial Information */}
                <EnhancedCard title="Financial Information" description="Contract financial details" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <Detail 
                            label="Contract Value" 
                            value={<span className="font-semibold">{formatCurrency(contract.contract_value, contract.currency)}</span>} 
                        />
                        <Detail label="Guarantee Percent" value={`${contract.guarantee_percent || 0}%`} />
                        <Detail 
                            label="Guarantee Amount" 
                            value={<span className="font-semibold">{formatCurrency(calculateGuaranteeAmount(contract), contract.currency)}</span>} 
                        />
                        <Detail label="Retention Percent" value={`${contract.retention_percent || 0}%`} />
                        <Detail 
                            label="Retention Amount" 
                            value={<span className="font-semibold">{formatCurrency(calculateRetentionAmount(contract), contract.currency)}</span>} 
                        />
                    </div>
                </EnhancedCard>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {contract.description && (
                    <EnhancedCard title="Contract Description" description="Details about this contract" variant="default" size="sm">
                        <p className="text-slate-700 dark:text-slate-300">{contract.description}</p>
                    </EnhancedCard>
                )}
                {contract.notes && (
                    <EnhancedCard title="Notes" description="Additional notes about this contract" variant="default" size="sm">
                        <p className="text-slate-700 dark:text-slate-300">{contract.notes}</p>
                    </EnhancedCard>
                )}
            </div>

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

/* =========================================================
   Page Wrapper
=========================================================== */
export default function ContractDetailsPage() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
                </Centered>
            }
        >
            <ContractDetailsContent />
        </Suspense>
    );
}
