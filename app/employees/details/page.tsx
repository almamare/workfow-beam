/* eslint-disable @next/next/no-img-element */
/* =========================================================
   src/app/employees/details/page.tsx
   Employee Details
=========================================================== */

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
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
import {
    Loader2,
    SquarePen,
    Trash2,
    ArrowLeft,
    ArrowDownToLine, // ✅ FIX: import download icon
    Building,
    User,
} from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';

/* ---------- Types ---------- */
type Employee = {
    id: string;
    name: string;
    surname: string;
    job_title: string;
    employee_code: string;
    hire_date: string;
    salary_grade: string;
    role: string;
    notes: string;
    avatar?: string;
    created_at: string;
    updated_at: string;
};

type User = {
    id: string;
    username: string;
    name: string;
    surname: string;
    number: string;
    email: string;
    phone: string;
    role: string;
    type: string;
    status: string;
    created_at: string;
    updated_at: string;
};

interface ApiResponse {
    employee: Employee;
    user: User | null;
}

/* ---------- Badge Variant ---------- */
const statusVariant = (s: string) =>
    s === 'Active'
        ? 'completed'
        : s === 'Disabled'
            ? 'rejected'
            : s === 'Locked'
                ? 'draft'
                : 'outline';

/* =========================================================
   Component
=========================================================== */
function EmployeeDetails() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // ✅ FIX: state to track download status
    const [downloading, setDownloading] = useState(false);

    /* ---------- Fetch employee ---------- */
    const load = useCallback(async () => {
        if (!id) {
            toast.error('Missing employee id');
            router.push('/employees');
            return;
        }
        setLoading(true);
        try {
            const res = await axios.get(`/employees/fetch/${id}`);
            const d: ApiResponse = res?.data?.body;
            if (!d?.employee?.id) throw new Error('Employee not found');
            setData(d);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Unable to load employee');
            router.push('/employees');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        load();
    }, [load]);

    /* ---------- Delete ---------- */
    const handleDelete = async () => {
        if (!id) return;
        try {
            setDeleting(true);
            await axios.delete(`/employees/delete/${id}`);
            toast.success('Employee deleted successfully');
            router.push('/employees');
        } catch {
            toast.error('Failed to delete employee');
        } finally {
            setDeleting(false);
            setOpen(false);
        }
    };

    /* ---------- Download Employee Card ---------- */
    const employeeCard = async (id: string, fileName = 'EmployeeCard') => {
        setDownloading(true);
        try {
            const { data } = await axios.get(`/employees/card/${id}`, {
                responseType: 'blob',
            });

            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error('Failed to download employee card');
        } finally {
            setDownloading(false);
        }
    };

    /* ---------- Loading skeleton ---------- */
    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading employee …</p>
            </Centered>
        );
    }
    if (!data) return null;

    const { employee, user } = data;

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
                        Employee Details
                    </h1>
                    {employee.employee_code && (
                        <p className="text-muted-foreground mt-1">
                            Code: {employee.employee_code}
                        </p>
                    )}
                </div>
                <Button variant="outline" onClick={() => router.push('/employees')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back&nbsp;to&nbsp;Employees
                </Button>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Profile Section */}
                <Card>
                    <CardContent className="flex items-center gap-4 py-4">
                        <img
                            src={employee.avatar || '/placeholder-avatar.png'}
                            alt={employee.name || 'Not Found'}
                            className="h-24 w-24 rounded-md object-cover"
                        />
                        <div>
                            <h2 className="text-xl font-semibold">
                                {employee.name || 'Not Found'} {employee.surname || ''}
                            </h2>
                            <Badge variant="approved">{employee.role || 'Not Found'}</Badge>
                        </div>
                    </CardContent>
                </Card>
                <StatCard title="Job Title" icon={Building} value={employee.job_title || 'Not Found'} />
                <StatCard title="Role" icon={User} value={employee.role} />
            </div>

            {/* Action buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>Action</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push(`/employees/update?id=${employee.id}`)}>
                            <SquarePen className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="destructive" onClick={() => setOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => employee.id && employeeCard(employee.id, 'EmployeeCard')}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4" /> Loading...
                                </>
                            ) : (
                                <>
                                    <ArrowDownToLine className="w-4 h-4" /> Employee Card
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* User Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <DataCard title="Employee Info">
                    {user ? (
                        <>
                            <Detail label="Employee Code" value={employee.employee_code || 'Not Found'} />
                            <Detail label="Hire Date" value={employee.hire_date || 'Not Found'} />
                            <Detail label="Job Title" value={employee.job_title || 'Not Found'} />
                            <Detail label="Role" value={employee.role || 'Not Found'} />
                            <Detail label="Salary Grade" value={employee.salary_grade || 'Not Found'} />
                            <Detail label="Created" value={fmt(employee.created_at)} />
                            <Detail label="Updated" value={fmt(employee.updated_at)} />
                        </>
                    ) : (
                        <p className="text-muted-foreground">Not Found</p>
                    )}
                </DataCard>
                <DataCard title="User Account">
                    {user ? (
                        <>
                            <Detail label="Username" value={user.username || 'Not Found'} />
                            <Detail label="Email" value={user.email || 'Not Found'} />
                            <Detail label="Phone" value={user.phone || 'Not Found'} />
                            <Detail label="Role" value={user.role || 'Not Found'} />
                            <Detail
                                label="Status"
                                value={<Badge variant={statusVariant(user.status)}>{user.status || 'Not Found'}</Badge>}
                            />
                            <Detail label="Created" value={fmt(user.created_at)} />
                            <Detail label="Updated" value={fmt(user.updated_at)} />
                        </>
                    ) : (
                        <p className="text-muted-foreground">Not Found</p>
                    )}
                </DataCard>
            </div>

            {/* Note section */}
            <Card>
                <CardHeader>
                    <CardTitle>Note</CardTitle>
                    <CardDescription>Additional comments</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="prose max-w-none text-sm md:text-base">
                        {employee.notes || 'No note for this employee.'}
                    </p>
                </CardContent>
            </Card>

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
   Reusable components
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
            {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
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
function fmt(date?: string) {
    if (!date) return 'Not Found';
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

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground text-center">Loading employee...</div>}>
            <EmployeeDetails />
        </Suspense>
    );
}
