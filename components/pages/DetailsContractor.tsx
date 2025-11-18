/* =========================================================
   Contractor Details – Branded design (orange + slate), dark mode
=========================================================== */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteDialog } from '@/components/delete-dialog';
import { EnhancedCard } from '@/components/ui/enhanced-card';

import { Loader2, SquarePen, Trash2 } from 'lucide-react';

import {
    fetchContractor,
    selectSelectedContractor,
    selectLoading,
    selectError,
    clearSelectedContractor
} from '@/stores/slices/contractors';
import type { Contractor } from '@/stores/types/contractors';

/* =========================================================
   Component
=========================================================== */
export default function ContractorDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id') || '';

    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const contractor = useSelector(selectSelectedContractor);

    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch contractor
    useEffect(() => {
        if (!id) {
            toast.error('Missing contractor id');
            router.push('/contractors');
            return;
        }
        dispatch(fetchContractor({ id }));
        return () => {
            dispatch(clearSelectedContractor());
        };
    }, [dispatch, id, router]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const statusBadge = useMemo(() => {
        const status = contractor?.status || '-';
        const classes =
            status === 'Active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                : status === 'Inactive'
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        return <Badge className={classes}>{status}</Badge>;
    }, [contractor]);

    // Delete (simple fetch placeholder; backend route may differ)
    const handleDelete = async () => {
        if (!id) return;
        try {
            setDeleting(true);
            const res = await fetch(`/api/contractors/delete?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            toast.success('Contractor deleted successfully');
            router.push('/contractors');
        } catch {
            toast.error('Failed to delete contractor');
        } finally {
            setDeleting(false);
            setOpen(false);
        }
    };

    if (loading && !contractor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading contractor…</p>
            </div>
        );
    }
    if (!contractor) return null;

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Contractor Details
                    </h1>
                    {contractor.number && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            No. {contractor.number}
                        </p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Review contractor information and manage actions.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/contractors')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Contractors
                </Button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <EnhancedCard
                    title="Contractor Name"
                    description={contractor.number ? `No. ${contractor.number}` : undefined}
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {contractor.name}
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Phone"
                    description={contractor.email || 'No email'}
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {contractor.phone}
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Province"
                    description={contractor.address || 'No address'}
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {contractor.province}
                    </div>
                </EnhancedCard>
            </div>

            {/* Actions */}
            <EnhancedCard
                title="Actions"
                description="Update or delete contractor"
                variant="default"
                size="sm"
            >
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => router.push(`/contractors/update?id=${contractor.id}`)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <SquarePen className="h-4 w-4 mr-2" />
                        Edit Contractor
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(true)}
                        className="border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </EnhancedCard>

            {/* Information cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EnhancedCard title="General Information" description="" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <Detail label="Status" value={statusBadge} />
                        <Detail label="Province" value={contractor.province} />
                        <Detail label="Address" value={contractor.address || '-'} />
                        <Detail label="Created" value={fmt(contractor.created_at)} />
                        <Detail label="Updated" value={fmt(contractor.updated_at)} />
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Contact & Bank" description="" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <Detail label="Phone" value={contractor.phone} />
                        <Detail label="Email" value={contractor.email || '-'} />
                        <Detail label="Bank Name" value={contractor.bank_name || '-'} />
                        <Detail label="Bank Account" value={String(contractor.bank_account || '') || '-'} />
                    </div>
                </EnhancedCard>
            </div>

            {/* Note */}
            <EnhancedCard title="Note" description="Additional comments" variant="default" size="sm">
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                    {contractor.note || 'No note for this contractor.'}
                </p>
            </EnhancedCard>

            {/* Delete Dialog */}
            <DeleteDialog
                open={open}
                onClose={() => !deleting && setOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

/* =========================================================
   Reusable
=========================================================== */
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right">{value}</span>
    </div>
);

function fmt(date: string) {
    try {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return 'Invalid date';
    }
}
