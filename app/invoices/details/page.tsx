'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import {
    fetchInvoice,
    selectSelectedInvoice,
    selectInvoicesLoading,
    clearSelectedInvoice,
} from '@/stores/slices/invoices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Edit, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { toast } from 'sonner';

const InvoiceDetailsPageContent: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const invoiceId = params.get('id') || '';
    const dispatch = useReduxDispatch<AppDispatch>();
    const selectedInvoice = useSelector(selectSelectedInvoice);
    const loading = useSelector(selectInvoicesLoading);

    /**
     * Fetch invoice data by ID
     */
    const fetchInvoiceData = useCallback(async () => {
        if (!invoiceId) {
            toast.error('Invoice ID is required');
            router.push('/invoices');
            return;
        }
        try {
            await dispatch(fetchInvoice({ id: invoiceId })).unwrap();
        } catch (err: any) {
            toast.error(err || 'Failed to load invoice data.');
            router.push('/invoices');
        }
    }, [invoiceId, dispatch, router]);

    // Fetch invoice when component mounts
    useEffect(() => {
        fetchInvoiceData();
        return () => {
            dispatch(clearSelectedInvoice());
        };
    }, [fetchInvoiceData, dispatch]);

    // Helper function to get status badge
    const getStatusBadge = (status?: string) => {
        const statusValue = status || 'Draft';
        switch (statusValue) {
            case 'Draft':
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 font-medium"
                    >
                        Draft
                    </Badge>
                );
            case 'Issued':
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium"
                    >
                        Issued
                    </Badge>
                );
            case 'Paid':
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 font-medium"
                    >
                        Paid
                    </Badge>
                );
            case 'Cancelled':
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 font-medium"
                    >
                        Cancelled
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 font-medium"
                    >
                        {statusValue}
                    </Badge>
                );
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            </div>
        );
    }

    if (!selectedInvoice) {
        return (
            <div className="space-y-4">
                <Breadcrumb />
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Invoice not found</p>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/invoices')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoices
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Invoice Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View complete invoice information
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/invoices')}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Invoices
                    </Button>
                    <Button
                        type="button"
                        onClick={() => router.push(`/invoices/update?id=${invoiceId}`)}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Invoice
                    </Button>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="grid gap-4 md:grid-cols-2">
                <EnhancedCard
                    title="Basic Information"
                    description="Invoice identification and basic details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Invoice Number</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {selectedInvoice.invoice_no || '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Invoice Date</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedInvoice.invoice_date
                                    ? new Date(selectedInvoice.invoice_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Due Date</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedInvoice.due_date
                                    ? new Date(selectedInvoice.due_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '-'}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Status</Label>
                            <div className="mt-1">
                                {getStatusBadge(selectedInvoice.status)}
                            </div>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Client & Bank Information"
                    description="Client and bank details"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Client Name</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedInvoice.client_name || selectedInvoice.client?.name || '-'}
                            </p>
                        </div>
                        {selectedInvoice.client?.client_no && (
                            <div>
                                <Label className="text-slate-500 dark:text-slate-400 text-sm">Client Number</Label>
                                <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                    {selectedInvoice.client.client_no}
                                </p>
                            </div>
                        )}
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Bank Name</Label>
                            <p className="text-slate-900 dark:text-slate-100 mt-1">
                                {selectedInvoice.bank_name || selectedInvoice.bank?.name || '-'}
                            </p>
                        </div>
                        {selectedInvoice.bank?.account_number && (
                            <div>
                                <Label className="text-slate-500 dark:text-slate-400 text-sm">Account Number</Label>
                                <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                    {selectedInvoice.bank.account_number}
                                </p>
                            </div>
                        )}
                        {selectedInvoice.bank?.iban && (
                            <div>
                                <Label className="text-slate-500 dark:text-slate-400 text-sm">IBAN</Label>
                                <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                    {selectedInvoice.bank.iban}
                                </p>
                            </div>
                        )}
                        {selectedInvoice.bank?.swift_code && (
                            <div>
                                <Label className="text-slate-500 dark:text-slate-400 text-sm">SWIFT Code</Label>
                                <p className="text-slate-900 dark:text-slate-100 font-mono mt-1">
                                    {selectedInvoice.bank.swift_code}
                                </p>
                            </div>
                        )}
                    </div>
                </EnhancedCard>
            </div>

            {/* Invoice Items */}
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <EnhancedCard
                    title="Invoice Items"
                    description="All items in this invoice"
                    variant="default"
                    size="sm"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="text-left p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Description</th>
                                    <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</th>
                                    <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Unit Price</th>
                                    <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-slate-300">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInvoice.items.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="p-3 text-slate-900 dark:text-slate-100">{item.description}</td>
                                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">{item.quantity}</td>
                                        <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">{formatCurrency(item.unit_price || 0)}</td>
                                        <td className="p-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.total || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </EnhancedCard>
            )}

            {/* Financial Summary */}
            <EnhancedCard
                title="Financial Summary"
                description="Invoice totals and calculations"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Subtotal</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {formatCurrency(selectedInvoice.subtotal || 0)}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Tax</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {formatCurrency(selectedInvoice.tax || 0)}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Discount</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-lg mt-1">
                                {formatCurrency(selectedInvoice.discount || 0)}
                            </p>
                        </div>
                        <div>
                            <Label className="text-slate-500 dark:text-slate-400 text-sm">Total</Label>
                            <p className="text-slate-900 dark:text-slate-100 font-mono text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                                {formatCurrency(selectedInvoice.total || 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Notes */}
            {selectedInvoice.notes && (
                <EnhancedCard
                    title="Notes"
                    description="Additional notes"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-2">
                        <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                            {selectedInvoice.notes}
                        </p>
                    </div>
                </EnhancedCard>
            )}

            {/* Timestamps */}
            <EnhancedCard
                title="Additional Information"
                description="Timestamps and metadata"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Created At</Label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {selectedInvoice.created_at
                                ? new Date(selectedInvoice.created_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <Label className="text-slate-500 dark:text-slate-400 text-sm">Updated At</Label>
                        <p className="text-slate-900 dark:text-slate-100 mt-1">
                            {selectedInvoice.updated_at
                                ? new Date(selectedInvoice.updated_at).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : '-'}
                        </p>
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading invoice details...</div>}>
            <InvoiceDetailsPageContent />
        </Suspense>
    );
}

