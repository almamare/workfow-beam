/* eslint-disable @next/next/no-img-element */
'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/utils/axios';
import { toast } from 'sonner';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    ArrowDownToLine,
    ArrowLeft,
    CalendarDays,
    CreditCard,
    Eye,
    ExternalLink,
    Loader2,
    Mail,
    Pencil,
    Phone,
    Printer,
    RefreshCw,
    Replace,
    Save,
    ShieldOff,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type Employee = {
    id: string;
    name?: string;
    surname?: string;
    job_title?: string | null;
    job_title_id?: number | string | null;
    employee_code?: string;
    role_key?: string | null;
    level?: number | null;
    hire_date?: string;
    salary_grade?: string | number;
    status?: string;
    avatar?: string;
    notes?: string | null;
    department_id?: string | null;
    department_name?: string | null;
    manager_id?: string | null;
    manager_name?: string | null;
    created_at?: string;
    updated_at?: string;
};

type UserData = {
    id?: string;
    name?: string | null;
    surname?: string | null;
    number?: string | null;
    email?: string | null;
    phone?: string | null;
    username?: string | null;
    role?: string | null;
    type?: string | null;
    status?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type CardRow = {
    card_id: string;
    employee_id: string;
    card_number: string;
    card_number_raw: string;
    issue_date: string;
    expiry_date: string;
    status: 'Active' | 'Expired' | 'Lost' | 'Revoked' | 'Replaced';
    print_count: number | string;
    last_printed_at?: string | null;
    notes?: string | null;
    created_at?: string;
};

type PrintRow = {
    print_id: string;
    print_serial: string;
    printed_by?: string | null;
    printed_ip?: string | null;
    user_agent?: string | null;
    printed_at: string;
    printer_name?: string | null;
    printer_surname?: string | null;
    printer_username?: string | null;
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const STATUS_STYLES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
    Active:   { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-800', label: 'Active' },
    Expired:  { bg: 'bg-amber-50   dark:bg-amber-900/20',   text: 'text-amber-700   dark:text-amber-300',   ring: 'ring-amber-200   dark:ring-amber-800',   label: 'Expired' },
    Lost:     { bg: 'bg-rose-50    dark:bg-rose-900/20',    text: 'text-rose-700    dark:text-rose-300',    ring: 'ring-rose-200    dark:ring-rose-800',    label: 'Lost' },
    Revoked:  { bg: 'bg-rose-50    dark:bg-rose-900/20',    text: 'text-rose-700    dark:text-rose-300',    ring: 'ring-rose-200    dark:ring-rose-800',    label: 'Revoked' },
    Replaced: { bg: 'bg-slate-100  dark:bg-slate-800',      text: 'text-slate-700   dark:text-slate-300',   ring: 'ring-slate-200   dark:ring-slate-700',   label: 'Replaced' },
};

const formatDate = (s?: string | null) => {
    if (!s) return 'â€”';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-CA');
};

const formatDateTime = (s?: string | null) => {
    if (!s) return 'â€”';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString('en-CA', { hour12: false }).replace(',', '');
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ UI atoms (aligned with client request details page) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SKY_OUTLINE_BTN =
    'border-brand-sky-200 dark:border-brand-sky-800 hover:text-brand-sky-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-700 text-brand-sky-700 dark:text-brand-sky-300 hover:bg-brand-sky-50 dark:hover:bg-brand-sky-900/20';

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        Pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        Rejected: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        Inactive: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
        Expired: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        Lost: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Revoked: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        Replaced: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        Suspended: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        Complete: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        Completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    };
    return (
        colors[status] ||
        'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
    );
};

const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">{children}</div>
);

const Detail: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 py-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-600 dark:text-slate-400 text-right break-words max-w-[65%]">{value ?? 'N/A'}</span>
    </div>
);

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    const s = STATUS_STYLES[status ?? 'Active'] ?? STATUS_STYLES.Active;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {s.label}
        </span>
    );
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const EmployeeDetailsContent: React.FC = () => {
    const router = useRouter();
    const params = useSearchParams();
    const employeeId = params.get('id') ?? '';

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [user, setUser] = useState<UserData | null>(null);
    const [card, setCard] = useState<CardRow | null>(null);
    const [prints, setPrints] = useState<PrintRow[]>([]);
    const [downloading, setDownloading] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [replaceOpen, setReplaceOpen] = useState(false);
    const [revokeReason, setRevokeReason] = useState('');
    const [actionBusy, setActionBusy] = useState(false);
    const [statusValue, setStatusValue] = useState('');
    const [statusBusy, setStatusBusy] = useState(false);

    const verifyUrl = useMemo(() => {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/api\/v1\/?$/, '');
        if (!employeeId) return '';
        return `${base}/verify/employee/${encodeURIComponent(employeeId)}`;
    }, [employeeId]);

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Data fetchers â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const loadAll = useCallback(async (showSpinner = true) => {
        if (!employeeId) return;
        if (showSpinner) setLoading(true);
        try {
            const [empRes, cardRes] = await Promise.all([
                axios.get(`/employees/fetch/${employeeId}`),
                axios.get(`/employees/card-info/${employeeId}`),
            ]);

            const empBody = empRes.data?.body ?? {};
            const empItem =
                empBody?.employees?.items?.[0] ??
                empBody?.employee ??
                empBody?.items?.[0] ??
                null;
            setEmployee(empItem);
            setUser(empBody?.user ?? null);

            const cardBody = cardRes.data?.body ?? {};
            setCard(cardBody?.card ?? null);
            setPrints(Array.isArray(cardBody?.prints) ? cardBody.prints : []);
            // backfill employee from card-info if employee fetch failed
            if (!empItem && cardBody?.employee) {
                setEmployee(cardBody.employee);
            }
        } catch (err) {
            // axios interceptor already toasts on auth/server errors; only show data error here
            console.error('loadAll error', err);
            toast.error('Failed to load employee details.');
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        if (!employeeId) {
            toast.error('Missing employee ID');
            router.push('/employees');
            return;
        }
        loadAll(true);
    }, [employeeId, loadAll, router]);

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Actions â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAll(false);
        setRefreshing(false);
        toast.success('Refreshed');
    };

    const fetchCardBlob = async (preview: boolean): Promise<Blob | null> => {
        const url = preview
            ? `/employees/card-preview/${employeeId}`
            : `/employees/card/${employeeId}`;
        try {
            const { data } = await axios.get(url, { responseType: 'blob' });
            return new Blob([data], { type: 'application/pdf' });
        } catch {
            return null;
        }
    };

    const handleDownload = async () => {
        if (!employeeId) return;
        setDownloading(true);
        try {
            const blob = await fetchCardBlob(false);
            if (!blob) throw new Error();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const code = employee?.employee_code || 'card';
            a.download = `${(employee?.name || 'employee').replace(/\s+/g, '_')}_${code}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Card PDF downloaded â€” print logged');
            void loadAll(false);
        } catch {
            toast.error('Failed to download card PDF');
        } finally {
            setDownloading(false);
        }
    };

    const handlePreview = async () => {
        if (!employeeId) return;
        setPreviewing(true);
        try {
            const blob = await fetchCardBlob(true);
            if (!blob) throw new Error();
            const url = window.URL.createObjectURL(blob);
            const win = window.open(url, '_blank', 'noopener');
            if (!win) {
                // Pop-up blocked â€” fall back to anchor click
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener';
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
            // revoke URL after the new tab has had time to load it
            setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
            toast.success('Preview opened â€” not logged as a print');
        } catch {
            toast.error('Failed to open preview');
        } finally {
            setPreviewing(false);
        }
    };

    const handlePrintNow = async () => {
        if (!employeeId) return;
        setPrinting(true);
        try {
            const blob = await fetchCardBlob(false);
            if (!blob) throw new Error();
            const url = window.URL.createObjectURL(blob);
            // Open in a hidden iframe to trigger print; falls back to opening a tab
            // when iframe printing is blocked by the browser's PDF plugin.
            const frame = document.createElement('iframe');
            frame.style.position = 'fixed';
            frame.style.right = '0';
            frame.style.bottom = '0';
            frame.style.width = '0';
            frame.style.height = '0';
            frame.style.border = '0';
            frame.src = url;
            document.body.appendChild(frame);
            frame.onload = () => {
                try {
                    frame.contentWindow?.focus();
                    frame.contentWindow?.print();
                } catch {
                    window.open(url, '_blank', 'noopener');
                }
            };
            setTimeout(() => {
                try { frame.remove(); } catch { /* noop */ }
                window.URL.revokeObjectURL(url);
            }, 60_000);
            toast.success('Print dialog opened â€” print logged');
            void loadAll(false);
        } catch {
            toast.error('Failed to open print dialog');
        } finally {
            setPrinting(false);
        }
    };

    const handleRevoke = async () => {
        if (!employeeId) return;
        setActionBusy(true);
        try {
            await axios.post(`/employees/card-revoke/${employeeId}`, { reason: revokeReason || null });
            toast.success('Card revoked');
            setRevokeOpen(false);
            setRevokeReason('');
            await loadAll(false);
        } catch {
            toast.error('Failed to revoke card');
        } finally {
            setActionBusy(false);
        }
    };

    const handleReplace = async () => {
        if (!employeeId) return;
        setActionBusy(true);
        try {
            await axios.post(`/employees/card-replace/${employeeId}`, {});
            toast.success('Replacement card issued');
            setReplaceOpen(false);
            await loadAll(false);
        } catch {
            toast.error('Failed to replace card');
        } finally {
            setActionBusy(false);
        }
    };

    useEffect(() => {
        if (employee?.status) setStatusValue(employee.status);
    }, [employee]);

    const handleUpdateStatus = async () => {
        if (!employeeId || !statusValue) return;
        setStatusBusy(true);
        try {
            const res = await axios.put(`/employees/update/${employeeId}`, { status: statusValue });
            if (res?.data?.header?.success) {
                toast.success('Status updated successfully');
                await loadAll(false);
            } else {
                toast.error(res?.data?.header?.messages?.[0]?.message || 'Failed to update status');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Network error');
        } finally {
            setStatusBusy(false);
        }
    };

    const copyVerifyUrl = async () => {
        if (!verifyUrl) return;
        try {
            await navigator.clipboard.writeText(verifyUrl);
            toast.success('Verify link copied');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Loading / 404 â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    if (loading) {
        return (
            <Centered>
                <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
            </Centered>
        );
    }

    if (!employee) {
        return (
            <Centered>
                <p className="text-rose-600 dark:text-rose-400">Employee not found</p>
                <Button variant="outline" onClick={() => router.push('/employees')} className={SKY_OUTLINE_BTN}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Employees
                </Button>
            </Centered>
        );
    }

    const fullName = `${employee.name ?? ''} ${employee.surname ?? ''}`.trim() || 'Unnamed Employee';

    const LEVEL_LABELS: Record<number, string> = { 1: 'C-Level', 2: 'Director', 3: 'Manager', 4: 'Senior', 5: 'Staff' };

    const departmentLine =
        employee.department_name && employee.department_id
            ? `${employee.department_name} (${employee.department_id})`
            : employee.department_name || employee.department_id || 'â€”';

    const managerLine = employee.manager_name
        ? `${employee.manager_name}${employee.manager_id ? ` Â· ${employee.manager_id}` : ''}`
        : employee.manager_id
            ? String(employee.manager_id)
            : 'â€”';

    const userColumns: Column<any>[] = [
        {
            key: 'number',
            header: 'User Number',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-sm">{value || 'N/A'}</span>
            ),
        },
        {
            key: 'name',
            header: 'Full Name',
            render: (_value: any, row: any) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {`${row?.name || ''} ${row?.surname || ''}`.trim() || 'N/A'}
                </span>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {value || 'N/A'}
                </span>
            ),
        },
        {
            key: 'phone',
            header: 'Phone',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {value || 'N/A'}
                </span>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (value: any) => (
                <Badge
                    variant="outline"
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                >
                    {value || 'N/A'}
                </Badge>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value || 'N/A'}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: any) => (
                <Badge variant="outline" className={`${getStatusColor(value || '')} font-medium`}>
                    {value || 'N/A'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: any) => <span className="text-slate-600 dark:text-slate-400">{value ? value : 'N/A'}</span>,
        },
    ];

    const printColumns: Column<PrintRow>[] = [
        {
            key: 'print_serial',
            header: 'Print Serial',
            render: (value: string) => (
                <span className="font-mono text-xs font-bold text-brand-sky-700 dark:text-brand-sky-300 bg-brand-sky-50 dark:bg-brand-sky-900/30 px-2 py-1 rounded ring-1 ring-brand-sky-100 dark:ring-brand-sky-900/50">
                    {value || 'N/A'}
                </span>
            ),
        },
        {
            key: 'printed_by',
            header: 'Printed By',
            render: (_v: string | null | undefined, row: PrintRow) =>
                row.printer_name
                    ? `${row.printer_name} ${row.printer_surname ?? ''}`.trim()
                    : row.printer_username || 'â€”',
        },
        {
            key: 'printed_ip',
            header: 'IP Address',
            render: (value: string | null | undefined) => (
                <span className="font-mono text-xs text-slate-600 dark:text-slate-400">{value || 'â€”'}</span>
            ),
        },
        {
            key: 'printed_at',
            header: 'Date / Time',
            render: (value: string) => (
                <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {formatDateTime(value)}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Employee Details
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        A brief overview of the employee record, linked account, ID card, and print audit trail.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => router.push('/employees')} className={SKY_OUTLINE_BTN}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Employees
                    </Button>
                    <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className={SKY_OUTLINE_BTN}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/employees/update?id=${employeeId}`)}
                        className={SKY_OUTLINE_BTN}
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Employee Code" description="Human-readable code" variant="default" size="sm">
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {employee.employee_code || 'N/A'}
                    </div>
                </EnhancedCard>
                <EnhancedCard title="Full Name" description="Employee name" variant="default" size="sm">
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">{fullName}</div>
                </EnhancedCard>
                <EnhancedCard title="Employment Status" description="Current HR status" variant="default" size="sm">
                    <div className="flex items-center gap-2 text-xl md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {employee.status ? (
                            <Badge variant="outline" className={getStatusColor(employee.status)}>
                                {employee.status}
                            </Badge>
                        ) : (
                            'N/A'
                        )}
                    </div>
                </EnhancedCard>
                <EnhancedCard title="ID Card" description="Card state & prints" variant="default" size="sm">
                    <div className="text-lg md:text-lg font-bold text-slate-900 dark:text-slate-100">
                        {card ? (
                            <span className="flex flex-col gap-1">
                                <Badge variant="outline" className={`${getStatusColor(card.status)} w-fit`}>
                                    {card.status}
                                </Badge>
                                <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                                    Prints logged: {String(card.print_count ?? 0)}
                                </span>
                            </span>
                        ) : (
                            'No card on file'
                        )}
                    </div>
                </EnhancedCard>
            </div>

            <EnhancedCard
                title="Linked User Account"
                description={user ? 'Login profile tied to this employee' : 'No account linked'}
                variant="default"
                size="sm"
            >
                <EnhancedDataTable
                    data={user ? [user] : []}
                    columns={userColumns}
                    actions={[]}
                    loading={false}
                    noDataMessage="No login account is linked to this employee."
                    hideEmptyMessage={false}
                    showActions={false}
                />
            </EnhancedCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <EnhancedCard title="Employment" description="Role, organization, and compensation" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        <Detail label="Job Title" value={employee.job_title || 'N/A'} />
                        <Detail
                            label="Job Title ID"
                            value={
                                employee.job_title_id != null && String(employee.job_title_id) !== '' ? (
                                    <span className="font-mono text-sm">{String(employee.job_title_id)}</span>
                                ) : (
                                    'N/A'
                                )
                            }
                        />
                        <Detail
                            label="Role Key"
                            value={
                                employee.role_key ? (
                                    <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                                        {employee.role_key}
                                        {employee.level ? ` Â· ${LEVEL_LABELS[employee.level] ?? `L${employee.level}`}` : ''}
                                    </span>
                                ) : 'â€”'
                            }
                        />
                        <Detail label="Hire Date" value={formatDate(employee.hire_date)} />
                        <Detail label="Department" value={departmentLine} />
                        <Detail label="Manager" value={managerLine} />
                        <Detail
                            label="Salary Grade"
                            value={
                                employee.salary_grade != null &&
                                Number(String(employee.salary_grade).replace(/,/g, '')) > 0 ? (
                                    <span className="font-mono">{String(employee.salary_grade)}</span>
                                ) : (
                                    'Not set'
                                )
                            }
                        />
                        {employee.notes ? (
                            <div className="py-2">
                                <span className="font-medium text-slate-700 dark:text-slate-200 block mb-2">Notes</span>
                                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{employee.notes}</p>
                            </div>
                        ) : null}
                    </div>
                </EnhancedCard>

                <EnhancedCard title="System Record" description="Identifiers and timestamps" variant="default" size="sm">
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        <Detail
                            label="Employee Record ID"
                            value={<span className="font-mono text-xs break-all">{employee.id}</span>}
                        />
                        <Detail
                            label="Linked User ID"
                            value={
                                user?.id ? <span className="font-mono text-xs break-all">{user.id}</span> : 'N/A'
                            }
                        />
                        <Detail label="Record Created" value={formatDateTime(employee.created_at)} />
                        <Detail label="Record Updated" value={formatDateTime(employee.updated_at)} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Change Employment Status</p>
                        <div className="flex items-center gap-2">
                            <Select value={statusValue} onValueChange={setStatusValue}>
                                <SelectTrigger className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Suspended">Suspended</SelectItem>
                                    <SelectItem value="Resigned">Resigned</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                onClick={handleUpdateStatus}
                                disabled={statusBusy || !statusValue || statusValue === employee.status}
                                className="bg-gradient-to-r from-brand-sky-500 to-brand-sky-600 hover:from-brand-sky-600 hover:to-brand-sky-700 text-white shrink-0"
                            >
                                {statusBusy
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <><Save className="h-4 w-4 mr-1" />Save</>}
                            </Button>
                        </div>
                        {statusValue && statusValue !== employee.status && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Changing from <span className="font-semibold">{employee.status}</span> â†’ <span className="font-semibold">{statusValue}</span>
                            </p>
                        )}
                    </div>
                </EnhancedCard>
            </div>

            <EnhancedCard
                title="ID Card & Verification"
                description="Official card data, public verify link, and lifecycle actions"
                variant="default"
                size="sm"
                headerActions={
                    <div className="flex flex-wrap gap-2 justify-end">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePreview}
                            disabled={previewing || !employeeId}
                            className={SKY_OUTLINE_BTN}
                        >
                            {previewing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
                            Preview
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handlePrintNow}
                            disabled={printing || !employeeId}
                            className={SKY_OUTLINE_BTN}
                        >
                            {printing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Printer className="h-4 w-4 mr-1" />}
                            Print
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDownload}
                            disabled={downloading || !employeeId}
                            className={SKY_OUTLINE_BTN}
                        >
                            {downloading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <ArrowDownToLine className="h-4 w-4 mr-1" />
                            )}
                            Download
                        </Button>
                    </div>
                }
            >
                {card ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
                        <Detail label="Card Status" value={<StatusBadge status={card.status} />} />
                        <Detail
                            label="Card Number"
                            value={<span className="font-mono tracking-wider">{card.card_number}</span>}
                        />
                        <Detail
                            label="Card Number (raw)"
                            value={<span className="font-mono text-xs">{card.card_number_raw}</span>}
                        />
                        <Detail
                            label="Card Record ID"
                            value={<span className="font-mono text-xs break-all">{card.card_id}</span>}
                        />
                        <Detail label="Issue Date" value={formatDate(card.issue_date)} />
                        <Detail label="Expiry Date" value={formatDate(card.expiry_date)} />
                        <Detail label="Total Prints (logged)" value={String(card.print_count ?? 0)} />
                        <Detail label="Last Printed" value={formatDateTime(card.last_printed_at)} />
                        {card.notes ? <Detail label="Card Notes" value={card.notes} /> : null}
                        {card.created_at ? (
                            <Detail label="Card Record Created" value={formatDateTime(card.created_at)} />
                        ) : null}
                        <div className="py-3 space-y-2">
                            <span className="font-medium text-slate-700 dark:text-slate-200">Verification URL</span>
                            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                                {verifyUrl || 'â€”'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={copyVerifyUrl} disabled={!verifyUrl} className={SKY_OUTLINE_BTN}>
                                    Copy link
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => verifyUrl && window.open(verifyUrl, '_blank', 'noopener')}
                                    disabled={!verifyUrl}
                                    className={SKY_OUTLINE_BTN}
                                >
                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                    Open
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        <CreditCard className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        No ID card issued yet. Use <span className="font-semibold">Download</span> above to generate the first
                        card (creates the record and logs a print).
                    </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setReplaceOpen(true)}
                        disabled={actionBusy || !card}
                        className="border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    >
                        <Replace className="h-4 w-4 mr-2" />
                        Replace Card
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setRevokeOpen(true)}
                        disabled={actionBusy || !card || card.status === 'Revoked' || card.status === 'Replaced'}
                        className="border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                    >
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Revoke Card
                    </Button>
                </div>
            </EnhancedCard>

            <EnhancedCard
                title="Print History"
                description={`${prints.length} print event${prints.length === 1 ? '' : 's'} logged for this card`}
                variant="default"
                size="sm"
            >
                <EnhancedDataTable
                    data={prints}
                    columns={printColumns}
                    actions={[]}
                    loading={false}
                    noDataMessage="No print events yet. Download or Print logs an entry."
                    
                    showActions={false}
                />
            </EnhancedCard>

            {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Revoke dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke this card?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The card will immediately become invalid. Anyone scanning the QR code or barcode will see a
                            REVOKED status. The card record stays in the audit trail.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Reason (optional)</label>
                        <textarea
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Reported lost, employee resigned, security incidentâ€¦"
                            className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionBusy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleRevoke();
                            }}
                            disabled={actionBusy}
                            className="bg-rose-600 hover:bg-rose-700"
                        >
                            {actionBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Revoke Card
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Replace dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Issue a replacement card?</AlertDialogTitle>
                        <AlertDialogDescription>
                            The current card will be archived as <b>Replaced</b> and a brand-new card with a fresh
                            number, fresh barcode, and fresh validity period (2 years) will be issued. The previous
                            card&apos;s print history is preserved for audit.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionBusy}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleReplace();
                            }}
                            disabled={actionBusy}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {actionBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            Issue New Card
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

/* Suspense wrapper to keep useSearchParams happy in production builds. */
export default function EmployeeDetailsPage() {
    return (
        <Suspense
            fallback={
                <Centered>
                    <Loader2 className="h-8 w-8 animate-spin text-brand-sky-500" />
                    <p className="text-slate-500 dark:text-slate-400">Loading details...</p>
                </Centered>
            }
        >
            <EmployeeDetailsContent />
        </Suspense>
    );
}
