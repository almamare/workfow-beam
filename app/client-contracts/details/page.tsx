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
const getStatusColor = (status?: string) => {
    if (!status) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    const colors: Record<string, string> = {
        'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Rejected': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        'Closed': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
        'Complete': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Draft': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        'Suspended': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        'Submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Expired': 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        'Cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
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

// DateTime formatting helper
function formatDateTime(dateString?: string) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
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
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contracts
                </Button>
            </Centered>
        );
    }

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Contract Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the contract with available actions.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/client-contracts')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        Back to Contracts
                    </Button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Contract No"
                    description="Contract number"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {contract.contract_no || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Contract Status"
                    description="Status and workflow stage"
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-2 text-xl md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {contract.status ? (
                            <Badge variant="outline" className={getStatusColor(contract.status)}>
                                {contract.status}
                            </Badge>
                        ) : 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Contract Value"
                    description={`Contract value in ${contract.currency || 'IQD'}`}
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(contract.contract_value, contract.currency)}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Created At"
                    description="Contract creation date"
                    variant="default"
                    size="sm"
                >
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatDateTime(contract.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {/* Contract Information */}
                <EnhancedCard
                    title="Contract Information"
                    description="Contract details and information"
                    variant="default"
                    size="sm"
                    headerActions={
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/client-contracts/update?id=${contract.id}`)}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Contract
                        </Button>
                    }
                >
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        <Detail label="Contract No" value={<span className="font-mono">{contract.contract_no}</span>} />
                        <Detail label="Title" value={contract.title} />
                        <Detail
                            label="Status"
                            value={
                                contract.status ? (
                                    <Badge variant="outline" className={getStatusColor(contract.status)}>
                                        {contract.status}
                                    </Badge>
                                ) : 'N/A'
                            }
                        />
                        <Detail label="Currency" value={contract.currency} />
                        <Detail label="Contract Date" value={formatDate(contract.contract_date)} />
                        <Detail label="Start Date" value={formatDate(contract.start_date)} />
                        <Detail label="End Date" value={formatDate(contract.end_date)} />
                        {contract.start_date && contract.end_date && (
                            <Detail 
                                label="Contract Duration" 
                                value={`${calculateDuration(contract.start_date, contract.end_date)} days`} 
                            />
                        )}
                        {contract.description && (
                            <div className="py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200 block mb-2">Description</span>
                                <p className="text-slate-600 dark:text-slate-400">{contract.description}</p>
                            </div>
                        )}
                        {contract.notes && (
                            <div className="py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200 block mb-2">Notes</span>
                                <p className="text-slate-600 dark:text-slate-400">{contract.notes}</p>
                            </div>
                        )}
                        <Detail label="Created At" value={formatDateTime(contract.created_at)} />
                        {contract.updated_at && (
                            <Detail label="Updated At" value={formatDateTime(contract.updated_at)} />
                        )}
                    </div>
                </EnhancedCard>

                {/* Client & Financial Information */}
                <EnhancedCard
                    title="Client & Financial Information"
                    description="Client details and financial information"
                    variant="default"
                    size="sm"
                >
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        {contract.client ? (
                            <>
                                <Detail label="Client Name" value={contract.client.name || contract.client_name} />
                                <Detail label="Client Number" value={contract.client.client_no || contract.client_no} />
                                {contract.client.client_type && (
                                    <Detail label="Client Type" value={contract.client.client_type} />
                                )}
                                {contract.client.status && (
                                    <Detail
                                        label="Client Status"
                                        value={
                                            <Badge variant="outline" className={getStatusColor(contract.client.status)}>
                                                {contract.client.status}
                                            </Badge>
                                        }
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <Detail label="Client Name" value={contract.client_name || 'N/A'} />
                                <Detail label="Client Number" value={contract.client_no || 'N/A'} />
                            </>
                        )}
                        <div className="py-2 border-t-2 border-slate-300 dark:border-slate-600 my-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">Financial Details</span>
                        </div>
                        <Detail 
                            label="Contract Value" 
                            value={<span className="font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(contract.contract_value, contract.currency)}</span>} 
                        />
                        <Detail label="Guarantee Percent" value={`${contract.guarantee_percent || 0}%`} />
                        <Detail 
                            label="Guarantee Amount" 
                            value={<span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(calculateGuaranteeAmount(contract), contract.currency)}</span>} 
                        />
                        <Detail label="Retention Percent" value={`${contract.retention_percent || 0}%`} />
                        <Detail 
                            label="Retention Amount" 
                            value={<span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(calculateRetentionAmount(contract), contract.currency)}</span>} 
                        />
                    </div>
                </EnhancedCard>
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
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
                </Centered>
            }
        >
            <ContractDetailsContent />
        </Suspense>
    );
}
