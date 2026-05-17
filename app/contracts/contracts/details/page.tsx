'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { AppDispatch } from '@/stores/store';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProjectContract,
    selectSelectedProjectContract,
    selectProjectContractsLoading,
    clearSelectedProjectContract,
    deleteProjectContract,
} from '@/stores/slices/project-contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, Edit, Trash2, Download,
    Loader2, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ProjectContract } from '@/stores/types/project-contracts';

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">{children}</div>
);

const DetailRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
        {icon && <span className="mt-0.5 text-brand-sky-500 shrink-0">{icon}</span>}
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-32 shrink-0">{label}</span>
        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium flex-1">{value ?? '—'}</span>
    </div>
);

function fmtDate(s?: string | null) {
    if (!s) return '—';
    try { return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return 'Invalid date'; }
}

function fmtDateTime(s?: string | null) {
    if (!s) return '—';
    try { return new Date(s).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return 'Invalid date'; }
}

function fmtMoney(v?: string | number | null) {
    if (v === undefined || v === null || v === '') return '—';
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (isNaN(n)) return '—';
    return `${new Intl.NumberFormat('en-US').format(n)} IQD`;
}

function getStatusColor(status?: string) {
    const colors: Record<string, string> = {
        Draft:      'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
        Active:     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        Expired:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Cancelled:  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Suspended:  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        Pending:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Approved:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        Rejected:   'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };
    return colors[status ?? ''] ?? 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
}

function getContractTypeColor(type?: string) {
    const colors: Record<string, string> = {
        Main:        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        Subcontract: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        Amendment:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Framework:   'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
        Other:       'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    };
    return colors[type ?? ''] ?? 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
}

function ContractDetailsContent() {
    const params = useSearchParams();
    const router = useRouter();
    const contractId = params.get('id') || '';
    const dispatch = useDispatch<AppDispatch>();
    const contract = useSelector(selectSelectedProjectContract);
    const loading = useSelector(selectProjectContractsLoading);
    const [delOpen, setDelOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const loadContract = useCallback(async () => {
        if (!contractId) {
            toast.error('Contract ID is required');
            router.push('/contracts/contracts');
            return;
        }
        try {
            await dispatch(fetchProjectContract(contractId)).unwrap();
        } catch (e: unknown) {
            toast.error(typeof e === 'string' ? e : 'Failed to load contract');
            router.push('/contracts/contracts');
        }
    }, [contractId, dispatch, router]);

    useEffect(() => {
        loadContract();
        return () => { dispatch(clearSelectedProjectContract()); };
    }, [loadContract, dispatch]);

    const onDelete = async () => {
        if (!contract) return;
        setDeleting(true);
        try {
            await dispatch(deleteProjectContract(contract.id)).unwrap();
            toast.success('Contract deleted successfully');
            router.push('/contracts/contracts');
        } catch (e: unknown) {
            toast.error(typeof e === 'string' ? e : 'Failed to delete contract');
        } finally {
            setDeleting(false);
            setDelOpen(false);
        }
    };

    const handleDownloadPdf = async () => {
        setDownloading(true);
        try {
            const token = Cookies.get('token');
            const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
            const response = await fetch(`${apiBase}/project-contracts/download/${contractId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contract_${contractId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download PDF');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading contract details...</p>
            </Centered>
        );
    }

    if (!contract) {
        return (
            <Centered>
                <AlertCircle className="h-10 w-10 text-rose-400" />
                <p className="text-rose-600 dark:text-rose-400">Contract not found</p>
                <Button variant="outline" onClick={() => router.push('/contracts/contracts')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contracts
                </Button>
            </Centered>
        );
    }

    const p = contract as ProjectContract;
    const proj   = p.project as Record<string, any> | undefined;
    const cli    = p.client as Record<string, any> | undefined;
    const con    = p.contractor as Record<string, any> | undefined;
    const budget = (p as any).project_budget as Record<string, any> | null | undefined;
    const isApproved = p.approval_status === 'Approved';

    return (
        <div className="space-y-4 pb-8">
            <Breadcrumb />

            {/* ─── Header ─── */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Contract Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the contract with available actions.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.push('/contracts/contracts')}
                    className="border-brand-sky-200 dark:border-brand-sky-800 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20 shrink-0">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Contracts
                </Button>
            </div>

            {/* ─── Stat Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <EnhancedCard title="Contract No." description="Unique identifier" variant="default" size="sm">
                    <div className="text-lg font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">
                        {p.contract_no || 'N/A'}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Contract Type" description="Category" variant="default" size="sm">
                    <Badge variant="outline" className={`${getContractTypeColor(p.contract_type)} w-fit font-semibold`}>
                        {p.contract_type || 'N/A'}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Status" description="Current contract state" variant="default" size="sm">
                    <Badge variant="outline" className={`${getStatusColor(p.status)} font-semibold`}>
                        {p.status || 'N/A'}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Approval" description="Approval status" variant="default" size="sm">
                    <Badge variant="outline" className={`${getStatusColor(p.approval_status)} font-semibold`}>
                        {p.approval_status || 'N/A'}
                    </Badge>
                </EnhancedCard>

                <EnhancedCard title="Created" description="Registration date" variant="default" size="sm">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {fmtDateTime(p.created_at)}
                    </div>
                </EnhancedCard>
            </div>

            {/* ─── Actions Card ─── */}
            <EnhancedCard title="Actions" description="Available operations for this contract" variant="default" size="sm">
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm"
                    >
                        {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                        {downloading ? 'Generating...' : 'Download Document'}
                    </Button>

                    {!isApproved && (
                        <Button
                            onClick={() => router.push(`/contracts/contracts/update?id=${p.id}`)}
                            className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shadow-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Contract
                        </Button>
                    )}

                    {!isApproved && (
                        <Button
                            onClick={() => setDelOpen(true)}
                            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-sm"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                </div>
            </EnhancedCard>

            {/* ─── 3-column Info Grid ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Contract Information */}
                <EnhancedCard title="Contract Information" description="Core contract details" variant="default" size="sm">
                    <DetailRow label="Contract No."   value={<span className="font-mono">{p.contract_no}</span>} />
                    <DetailRow label="Title"          value={p.title} />
                    <DetailRow label="Type"           value={
                        p.contract_type
                            ? <Badge variant="outline" className={`${getContractTypeColor(p.contract_type)} w-fit`}>{p.contract_type}</Badge>
                            : '—'
                    } />
                    <DetailRow label="Status"         value={
                        p.status
                            ? <Badge variant="outline" className={`${getStatusColor(p.status)} w-fit`}>{p.status}</Badge>
                            : '—'
                    } />
                    <DetailRow label="Approval"       value={
                        p.approval_status
                            ? <Badge variant="outline" className={`${getStatusColor(p.approval_status)} w-fit`}>{p.approval_status}</Badge>
                            : '—'
                    } />
                </EnhancedCard>

                {/* Timeline & Dates */}
                <EnhancedCard title="Timeline & Dates" description="Key dates and timestamps" variant="default" size="sm">
                    <DetailRow label="Contract Date"  value={fmtDate(p.contract_date)} />
                    <DetailRow label="Start Date"     value={fmtDate(p.start_date)} />
                    <DetailRow label="End Date"       value={fmtDate(p.end_date)} />
                    <DetailRow label="Created"        value={fmtDateTime(p.created_at)} />
                    <DetailRow label="Updated"        value={fmtDateTime(p.updated_at)} />
                </EnhancedCard>

                {/* Project Overview */}
                <EnhancedCard title="Project Overview" description="Linked project summary" variant="default" size="sm">
                    {proj ? (
                        <>
                            <DetailRow label="Project No."   value={<span className="font-mono">{proj.number || '—'}</span>} />
                            <DetailRow label="Code"          value={<span className="font-mono">{proj.project_code || '—'}</span>} />
                            <DetailRow label="Name"          value={proj.name || '—'} />
                            <DetailRow label="Type"          value={proj.type || '—'} />
                            <DetailRow label="Status"        value={
                                proj.status
                                    ? <Badge variant="outline" className={`${getStatusColor(proj.status)} w-fit`}>{proj.status}</Badge>
                                    : '—'
                            } />
                            {budget?.original_budget != null && (
                                <DetailRow label="Orig. Budget" value={
                                    <span className="font-bold font-mono text-brand-sky-600 dark:text-brand-sky-400">{fmtMoney(budget.original_budget)}</span>
                                } />
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No project linked</p>
                    )}
                </EnhancedCard>
            </div>

            {/* ─── Client + Contractor ─── */}
            {(cli || con) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <EnhancedCard title="Client" description="First party information" variant="default" size="sm">
                        {cli ? (
                            <>
                                <DetailRow label="Client No."  value={<span className="font-mono">{cli.client_no || '—'}</span>} />
                                <DetailRow label="Name"        value={cli.name || '—'} />
                                <DetailRow label="Type"        value={cli.client_type || '—'} />
                                <DetailRow label="Governorate" value={cli.state || '—'} />
                                <DetailRow label="City"        value={cli.city || '—'} />
                                <DetailRow label="Status"      value={
                                    cli.status
                                        ? <Badge variant="outline" className={`${getStatusColor(cli.status)} w-fit`}>{cli.status}</Badge>
                                        : '—'
                                } />
                            </>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center italic">No client specified</p>
                        )}
                    </EnhancedCard>

                    <EnhancedCard title="Contractor" description="Second party information" variant="default" size="sm">
                        {con ? (
                            <>
                                <DetailRow label="Number"   value={<span className="font-mono">{con.number || '—'}</span>} />
                                <DetailRow label="Name"     value={con.name || '—'} />
                                <DetailRow label="Phone"    value={con.phone || '—'} />
                                <DetailRow label="Email"    value={con.email || '—'} />
                                <DetailRow label="Province" value={con.province || '—'} />
                                <DetailRow label="Bank"     value={con.bank_name || '—'} />
                                <DetailRow label="Status"   value={
                                    con.status
                                        ? <Badge variant="outline" className={`${getStatusColor(con.status)} w-fit`}>{con.status}</Badge>
                                        : '—'
                                } />
                            </>
                        ) : (
                            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center italic">No contractor specified</p>
                        )}
                    </EnhancedCard>
                </div>
            )}

            {/* ─── Payment Terms ─── */}
            {p.payment_terms && (
                <EnhancedCard title="Payment Terms" description="Terms of payment agreed upon in this contract" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{p.payment_terms}</p>
                </EnhancedCard>
            )}

            {/* ─── Description ─── */}
            {p.description && (
                <EnhancedCard title="Description" description="Contract description" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{p.description}</p>
                </EnhancedCard>
            )}

            {/* ─── Scope ─── */}
            {p.scope && (
                <EnhancedCard title="Scope of Work" description="Contract scope" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{p.scope}</p>
                </EnhancedCard>
            )}

            {/* ─── Notes ─── */}
            {p.notes && (
                <EnhancedCard title="Notes" description="Additional remarks" variant="default" size="sm">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{p.notes}</p>
                </EnhancedCard>
            )}

            {/* ─── Delete Dialog ─── */}
            <Dialog open={delOpen} onOpenChange={setDelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contract</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this contract? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-1">
                        <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Title:</strong> {p.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Contract No.:</strong> {p.contract_no}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDelOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={onDelete} disabled={deleting}>
                            {deleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</> : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ProjectContractDetailsPage() {
    return (
        <Suspense fallback={
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading details…</p>
            </Centered>
        }>
            <ContractDetailsContent />
        </Suspense>
    );
}
