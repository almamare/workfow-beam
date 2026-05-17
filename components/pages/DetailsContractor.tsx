'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { toast } from 'sonner';
import axios from '@/utils/axios';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import {
    ArrowLeft, Edit, Trash2, Loader2, AlertCircle, Download,
} from 'lucide-react';

import {
    fetchContractor,
    selectSelectedContractor,
    selectLoading,
    selectError,
    clearSelectedContractor,
} from '@/stores/slices/contractors';

/* ── Shared helpers ── */
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">{children}</div>
);

const DetailRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
        {icon && <span className="mt-0.5 text-brand-sky-500 shrink-0">{icon}</span>}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">{label}</span>
        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium flex-1">{value ?? 'N/A'}</span>
    </div>
);

const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
        Active:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        Inactive: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Close:    'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    };
    return colors[status ?? ''] ?? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
};

const formatDateTime = (d?: string) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return 'Invalid date'; }
};

/* ── Main content ── */
function ContractorDetailsContent() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id') || '';

    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const contractor = useSelector(selectSelectedContractor);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!id) {
            toast.error('Missing contractor ID');
            router.push('/contracts/contractors');
            return;
        }
        dispatch(fetchContractor({ id }));
        return () => { dispatch(clearSelectedContractor()); };
    }, [dispatch, id, router]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const handleDownload = async () => {
        if (!contractor) return;
        setIsDownloading(true);
        try {
            const res = await axios.get(`/contractors/download/${contractor.id}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `contractor_${contractor.number || contractor.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('PDF downloaded successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDelete = async () => {
        if (!contractor) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/contractors/delete/${contractor.id}`);
            toast.success('Contractor deleted successfully');
            router.push('/contracts/contractors');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to delete contractor');
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    };

    if (loading && !contractor) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading contractor details...</p>
            </Centered>
        );
    }

    if (!contractor) {
        return (
            <Centered>
                <AlertCircle className="h-10 w-10 text-rose-400" />
                <p className="text-rose-600 dark:text-rose-400">Contractor not found</p>
                <Button variant="outline" onClick={() => router.push('/contracts/contractors')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contractors
                </Button>
            </Centered>
        );
    }

    const isActive = contractor.status?.toLowerCase() === 'active';

    return (
        <div className="space-y-4 pb-8">
            <Breadcrumb />

            {/* ── Header ── */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Contractor Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the contractor with available actions.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/contracts/contractors')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contractors
                </Button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <EnhancedCard title="Contractor Name" description="Full name" variant="default" size="sm">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug">
                        {contractor.name || 'N/A'}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Contractor Number" description="Unique identifier" variant="default" size="sm">
                    <div className="text-lg font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">
                        {contractor.number || contractor.id || 'N/A'}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Governorate" description="Province" variant="default" size="sm">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {contractor.province || 'N/A'}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Status" description="Current account state" variant="default" size="sm">
                    <Badge variant="outline" className={`${getStatusColor(contractor.status)} font-semibold`}>
                        {contractor.status || 'N/A'}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Created" description="Registration date" variant="default" size="sm">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateTime(contractor.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* ── Actions Card ── */}
            <EnhancedCard title="Actions" description="Available operations for this contractor" variant="default" size="sm">
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        variant="outline"
                        className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20"
                    >
                        {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        {isDownloading ? 'Generating...' : 'Download PDF'}
                    </Button>
                    {!isActive && (
                        <Button
                            onClick={() => router.push(`/contracts/contractors/update?id=${contractor.id}`)}
                            className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Contractor
                        </Button>
                    )}
                    {!isActive && (
                        <Button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    {isActive && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Active contractors cannot be edited or deleted.
                        </p>
                    )}
                </div>
            </EnhancedCard>

            {/* ── Info Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Basic Info */}
                <EnhancedCard title="Basic Information" description="Core contractor details" variant="default" size="sm">
                    <DetailRow label="Number"      value={<span className="font-mono">{contractor.number || 'N/A'}</span>} />
                    <DetailRow label="Name"        value={contractor.name} />
                    <DetailRow label="Governorate" value={contractor.province} />
                    <DetailRow label="Address"     value={contractor.address || '—'} />
                    <DetailRow label="Status" value={
                        <Badge variant="outline" className={`${getStatusColor(contractor.status)} w-fit`}>
                            {contractor.status || 'N/A'}
                        </Badge>
                    } />
                </EnhancedCard>

                {/* Contact & Bank */}
                <EnhancedCard title="Contact & Bank" description="Communication and banking details" variant="default" size="sm">
                    <DetailRow label="Phone"        value={contractor.phone || '—'} />
                    <DetailRow label="Email"        value={contractor.email || '—'} />
                    <DetailRow label="Bank Name"    value={contractor.bank_name || '—'} />
                    <DetailRow label="Bank Account" value={contractor.bank_account ? String(contractor.bank_account) : '—'} />
                </EnhancedCard>

                {/* Dates */}
                <EnhancedCard title="Dates" description="Timeline information" variant="default" size="sm">
                    <DetailRow label="Created" value={formatDateTime(contractor.created_at)} />
                    <DetailRow label="Updated" value={formatDateTime(contractor.updated_at)} />
                </EnhancedCard>
            </div>

            {/* ── Note ── */}
            {contractor.note && (
                <EnhancedCard title="Note" description="Additional remarks" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{contractor.note}</p>
                </EnhancedCard>
            )}

            {/* ── Delete Dialog ── */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contractor</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contractor? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Name:</strong> {contractor.name}</p>
                        {contractor.number && (
                            <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Number:</strong> {contractor.number}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ContractorDetails() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
            </div>
        }>
            <ContractorDetailsContent />
        </Suspense>
    );
}
