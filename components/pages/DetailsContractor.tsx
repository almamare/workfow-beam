/* =========================================================
   src/app/contractors/details/page.tsx
   Contractor Details – same pattern used in “Project Details”
=========================================================== */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { Loader2, SquarePen, Trash2, ArrowLeft, Phone, Mail, Building } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';

/* ---------- Types ---------- */
type Contractor = {
    id: string;
    number: string;
    name: string;
    phone: string;
    email: string;
    province: string;
    address: string;
    status: 'Active' | 'Inactive' | string;
    bank_name: string;
    bank_account: string | number;
    note: string;
    created_at: string;
    updated_at: string;
};

/* ---------- Helper badge variants ---------- */
const statusVariant = (s: Contractor['status']) =>
    s === 'Active'
        ? 'completed'
        : s === 'Inactive'
            ? 'rejected'
            : 'outline';

/* =========================================================
   Component
=========================================================== */
export default function ContractorDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const [data, setData] = useState<Contractor | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* ---------- Fetch contractor ---------- */
    const load = useCallback(async () => {
        if (!id) {
            toast.error('Missing contractor id');
            router.push('/contractors');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`/contractors/fetch/contractor/${id}`);
            const c =
                res?.data?.contractor ||
                res?.data?.body?.contractor ||
                res?.data?.data;
            if (!c?.id) throw new Error('Contractor not found');
            setData(c);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Unable to load contractor');
            router.push('/contractors');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => { load(); }, [load]);

    /* ---------- Delete ---------- */
    const handleDelete = async () => {
        if (!id) return;
        try {
            setDeleting(true);
            await axios.delete(`/contractors/delete/${id}`);
            toast.success('Contractor deleted successfully');
            router.push('/contractors');
        } catch {
            toast.error('Failed to delete contractor');
        } finally {
            setDeleting(false);
            setOpen(false);
        }
    };

    /* ---------- Loading skeleton ---------- */
    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading contractor …</p>
            </Centered>
        );
    }
    if (!data) return null;

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">

            {/* Header */}
            <Breadcrumb />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Details Contractor
                    </h1>
                    {data.number && (
                        <p className="text-muted-foreground mt-1">No. {data.number}</p>
                    )}
                </div>
                <Button variant="outline" onClick={() => router.push('/contractors')}>
                    Back&nbsp;to&nbsp;Contractors
                </Button>
            </div>

            {/* ——— Statistic cards (mirror project pattern) ——— */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Contractor Name"
                    icon={Building}
                    value={data.name}
                    sub={`No. ${data.number}`}
                />
                <StatCard
                    title="Phone"
                    icon={Phone}
                    value={data.phone}
                    sub={data.email || 'No email'}
                />
                <StatCard
                    title="Province"
                    icon={Mail}
                    value={data.province}
                    sub={data.address || 'No address'}
                />
            </div>

            {/* ——— Note section ——— */}
            <Card>
                <CardHeader>
                    <CardTitle>Action</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/contractors/update?id=${data.id}`)}
                        >
                            <SquarePen className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="destructive" onClick={() => setOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ——— Main grid (general / contact / bank) ——— */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DataCard title="General Information">
                    <Detail label="Status" value={<Badge variant={statusVariant(data.status)}>{data.status}</Badge>} />
                    <Detail label="Province" value={data.province} />
                    <Detail label="Address" value={data.address || '-'} />
                    <Detail label="Created" value={fmt(data.created_at)} />
                    <Detail label="Updated" value={fmt(data.updated_at)} />
                </DataCard>

                <DataCard title="Contact & Bank">
                    <Detail label="Phone" value={data.phone} />
                    <Detail label="Email" value={data.email || '-'} />
                    <Detail label="Bank Name" value={data.bank_name || '-'} />
                    <Detail label="Bank Account" value={String(data.bank_account) || '-'} />
                </DataCard>
            </div>

            {/* ——— Note section ——— */}
            <Card>
                <CardHeader>
                    <CardTitle>Note</CardTitle>
                    <CardDescription>Additional comments</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="prose max-w-none text-sm md:text-base">
                        {data.note || 'No note for this contractor.'}
                    </p>
                </CardContent>
            </Card>

            {/* ——— Delete Dialog ——— */}
            <DeleteDialog
                open={open}
                onClose={() => !deleting && setOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

/* =========================================================
   Reusable components (same pattern as project page)
=========================================================== */
const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
        {children}
    </div>
);

interface StatProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    value: React.ReactNode;
    sub?: string;
}
const StatCard: React.FC<StatProps> = ({ title, icon: Icon, value, sub }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-1">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{value}</div>
            {sub && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>
            )}
        </CardContent>
    </Card>
);

const DataCard: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => (
    <Card>
        <CardHeader className="p-3">
            <CardTitle className="text-lg md:text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
}) => (
    <div className="flex justify-between items-center py-2 border-b">
        <span className="font-medium text-sm md:text-base">{label}:</span>
        <span className="text-muted-foreground text-xs md:text-sm max-w-[250px] truncate text-right">
            {value}
        </span>
    </div>
);

/* ---------- date helper ---------- */
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
