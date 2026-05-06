/* eslint-disable @next/next/no-img-element */
/* =========================================================
   src/app/employees/details/page.tsx
   Employee Details – Branded design (orange + slate), dark mode
=========================================================== */

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/delete-dialog';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import {
    Loader2,
    SquarePen,
    Trash2,
    ArrowLeft,
    ArrowDownToLine,
    Building,
    User,
    Briefcase,
    RefreshCw,
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

/* ---------- Badge Classes ---------- */
const statusBadgeClasses = (status: string) => {
    const statusMap: Record<string, string> = {
        'Active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Disabled': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        'Locked': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        'Inactive': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
    };
    return statusMap[status] || statusMap['Active'];
};

const roleBadgeClasses = (role: string) => {
    const roleMap: Record<string, string> = {
        'Admin': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        'Manager': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Employee': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Contractor': 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    };
    return roleMap[role] || roleMap['Employee'];
};

/* =========================================================
   Component
=========================================================== */
function EmployeeDetailsContent() {
    const router = useRouter();
    const params = useSearchParams();
    const id = params.get('id');

    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [updatingStatus, setUpdatingStatus] = useState(false);

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
            // Set initial status from user if exists
            if (d?.user?.status) {
                setSelectedStatus(d.user.status);
            }
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

    /* ---------- Change User Status ---------- */
    const handleStatusChange = async () => {
        if (!id || !data?.user?.id || !selectedStatus) {
            toast.error('Missing required information');
            return;
        }

        if (selectedStatus === data.user.status) {
            toast.info('Status is already set to this value');
            return;
        }

        setUpdatingStatus(true);
        try {
            const res = await axios.put(`/users/update/${data.user.id}`, {
                status: selectedStatus
            });

            if (res?.data?.header?.success || res?.data?.success) {
                toast.success('Status updated successfully');
                // Reload employee data to get updated status
                await load();
            } else {
                toast.error(res?.data?.header?.messages?.[0]?.message || 'Failed to update status');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    /* ---------- Loading skeleton ---------- */
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading employee…</p>
            </div>
        );
    }
    if (!data) return null;

    const { employee, user } = data;

    /* =========================================================
       Render
    ========================================================= */
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Employee Details
                    </h1>
                    {employee.employee_code && (
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Code: {employee.employee_code}
                        </p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Review employee information and manage actions.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/employees')}
                    className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                    Back to Employees
                </Button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Profile Section */}
                <EnhancedCard
                    title="Employee Name"
                    description={employee.employee_code || undefined}
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-4">
                        <img
                            src={employee.avatar || '/placeholder-avatar.png'}
                            alt={employee.name || 'Not Found'}
                            className="h-20 w-20 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-700"
                        />
                        <div>
                            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {employee.name || 'Not Found'} {employee.surname || ''}
                            </div>
                            <Badge variant="outline" className={`${roleBadgeClasses(employee.role || 'Employee')} mt-2`}>
                                {employee.role || 'Not Found'}
                            </Badge>
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Job Title"
                    description="Current position"
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {employee.job_title || 'Not Found'}
                        </div>
                    </div>
                </EnhancedCard>

                <EnhancedCard
                    title="Role"
                    description="Employee role"
                    variant="default"
                    size="sm"
                >
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <Badge variant="outline" className={roleBadgeClasses(employee.role || 'Employee')}>
                            {employee.role || 'Not Found'}
                        </Badge>
                    </div>
                </EnhancedCard>
            </div>

            {/* Actions */}
            <EnhancedCard
                title="Actions"
                description="Update status, delete, or download employee card"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Status Change Section */}
                    {user && (
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Change User Status
                                </label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={setSelectedStatus}
                                    disabled={updatingStatus}
                                >
                                    <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                        <SelectItem value="Active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="Disabled" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Disabled
                                        </SelectItem>
                                        <SelectItem value="Locked" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Locked
                                        </SelectItem>
                                        <SelectItem value="Inactive" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">
                                            Inactive
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                onClick={handleStatusChange}
                                disabled={updatingStatus || !selectedStatus || selectedStatus === user.status}
                                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updatingStatus ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4 mr-2" /> Updating...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" /> Change Status
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => employee.id && employeeCard(employee.id, 'EmployeeCard')}
                            disabled={downloading}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="animate-spin w-4 h-4 mr-2" /> Loading...
                                </>
                            ) : (
                                <>
                                    <ArrowDownToLine className="w-4 h-4 mr-2" /> Employee Card
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/employees/update?id=${employee.id}`)}
                            className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                        >
                            <SquarePen className="h-4 w-4 mr-2" />
                            Edit Employee
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
                </div>
            </EnhancedCard>

            {/* Information cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <EnhancedCard title="Employee Information" description="Employee information" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <Detail label="Employee Code" value={employee.employee_code || 'N/A'} />
                        <Detail label="Hire Date" value={employee.hire_date ? employee.hire_date : 'N/A'} />
                        <Detail label="Job Title" value={employee.job_title || 'N/A'} />
                        <Detail
                            label="Role"
                            value={
                                <Badge variant="outline" className={roleBadgeClasses(employee.role || 'Employee')}>
                                    {employee.role || 'N/A'}
                                </Badge>
                            }
                        />
                        <Detail label="Salary Grade" value={employee.salary_grade || 'N/A'} />
                            <Detail label="Created" value={employee.created_at || 'N/A'} />
                        <Detail label="Updated" value={employee.updated_at || 'N/A'} />
                    </div>
                </EnhancedCard>

                <EnhancedCard title="User Account" description={user ? "Associated user account details" : "No user account linked"} variant="default" size="sm">
                    {user ? (
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            <Detail label="Username" value={user.username || 'N/A'} />
                            <Detail label="Email" value={user.email || 'N/A'} />
                            <Detail label="Phone" value={user.phone || 'N/A'} />
                            <Detail label="Role" value={user.role || 'N/A'} />
                            <Detail
                                label="Status"
                                value={
                                    <Badge variant="outline" className={statusBadgeClasses(user.status || 'Active')}>
                                        {user.status || 'N/A'}
                                    </Badge>
                                }
                            />
                            <Detail label="Created" value={user.created_at || 'N/A'} />
                            <Detail label="Updated" value={user.updated_at || 'N/A'} />
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-400">No user account linked to this employee.</p>
                    )}
                </EnhancedCard>
            </div>

            {/* Note section */}
            <EnhancedCard title="Note" description="Additional comments" variant="default" size="sm">
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                    {employee.notes || 'No note for this employee.'}
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
   Reusable components
=========================================================== */
const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({
    label,
    value,
}) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right">{value}</span>
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
            <EmployeeDetailsContent />
        </Suspense>
    );
}
