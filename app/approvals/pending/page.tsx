'use client';

// REFACTOR-PHASE-1: Added role/permission awareness for UI
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column } from '@/components/ui/enhanced-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, RefreshCw, CheckCircle, XCircle, Eye } from 'lucide-react';
import { usePendingApprovals, PendingApproval } from '@/hooks/usePendingApprovals';
import { ApprovalModal } from '@/components/ApprovalModal';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { canApproveApproval } from '@/utils/permissions';
import type { Action } from '@/components/ui/enhanced-data-table';

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'Pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        'Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Rejected': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        'Skipped': 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800',
    };
    return colors[status] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

const getRequestTypeColor = (type: string) => {
    const colors: Record<string, string> = {
        'Clients': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        'Projects': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        'Tasks': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        'Financial': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
        'Employment': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    };
    return colors[type] || 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
};

export default function PendingApprovalsPage() {
    const router = useRouter();
    const { user } = useAuth(); // REFACTOR-PHASE-1: Get current user for permission checking
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [requestTypeFilter, setRequestTypeFilter] = useState<string>('all');
    const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
    const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

    const { approvals, loading, error, total, pages, fetchApprovals, refresh } = usePendingApprovals();

    // Filter approvals
    const filteredApprovals = useMemo(() => {
        let filtered = approvals;

        if (requestTypeFilter !== 'all') {
            filtered = filtered.filter(a => a.request_type === requestTypeFilter);
        }

        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(a =>
                a.request_code.toLowerCase().includes(searchLower) ||
                a.request_notes?.toLowerCase().includes(searchLower) ||
                a.creator_name?.toLowerCase().includes(searchLower) ||
                a.step_name.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [approvals, requestTypeFilter, search]);

    const handleApprove = (approval: PendingApproval) => {
        setSelectedApproval(approval);
        setModalAction('approve');
    };

    const handleReject = (approval: PendingApproval) => {
        setSelectedApproval(approval);
        setModalAction('reject');
    };

    const handleViewDetails = (approval: PendingApproval) => {
        const routeMap: Record<string, string> = {
            'Clients': '/requests/clients/details',
            'Projects': '/requests/projects/details',
            'Tasks': '/requests/tasks/details',
            'Financial': '/requests/financial/details',
            'Employment': '/requests/employees/details',
        };
        const route = routeMap[approval.request_type] || '/requests';
        router.push(`${route}?id=${approval.request_id}`);
    };

    const handleModalClose = () => {
        setSelectedApproval(null);
        setModalAction(null);
        refresh();
    };

    const handleSearch = () => {
        fetchApprovals(page, limit, {
            request_type: requestTypeFilter !== 'all' ? requestTypeFilter : undefined,
            search: search.trim() || undefined
        });
    };

    const handleClear = () => {
        setSearch('');
        setRequestTypeFilter('all');
        fetchApprovals(page, limit);
    };

    const columns: Column<PendingApproval>[] = [
        {
            key: 'request_code',
            header: 'رقم الطلب',
            render: (value: any) => (
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{value || '-'}</span>
            )
        },
        {
            key: 'request_type',
            header: 'نوع الطلب',
            render: (value: any) => (
                <Badge variant="outline" className={getRequestTypeColor(value)}>
                    {value || '-'}
                </Badge>
            )
        },
        {
            key: 'step_name',
            header: 'الخطوة',
            render: (value: any) => (
                <span className="text-slate-700 dark:text-slate-300">{value || '-'}</span>
            )
        },
        {
            key: 'creator_name',
            header: 'المنشئ',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">{value || '-'}</span>
            )
        },
        {
            key: 'request_notes',
            header: 'الملاحظات',
            render: (value: any) => (
                <div className="max-w-xs">
                    <div className="text-sm text-slate-600 dark:text-slate-400 truncate">{value || '-'}</div>
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'التاريخ',
            render: (value: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {value ? new Date(value).toLocaleDateString('ar-SA') : '-'}
                </span>
            )
        }
    ];

    // Actions for each approval row
    // REFACTOR-PHASE-1: Added permission checking - only show approve/reject if user has permission
    const getActions = (approval: PendingApproval): Action<PendingApproval>[] => {
        const canApprove = canApproveApproval(user, approval.required_role, approval.status);
        
        const actionsList: Action<PendingApproval>[] = [
            {
                label: 'عرض التفاصيل',
                onClick: () => handleViewDetails(approval),
                icon: <Eye className="h-4 w-4" />
            }
        ];
        
        // Only add approve/reject actions if user has permission
        if (canApprove && approval.status === 'Pending') {
            actionsList.push(
                {
                    label: 'موافق',
                    onClick: () => handleApprove(approval),
                    icon: <CheckCircle className="h-4 w-4" />,
                    variant: 'success'
                },
                {
                    label: 'رفض',
                    onClick: () => handleReject(approval),
                    icon: <XCircle className="h-4 w-4" />,
                    variant: 'destructive'
                }
            );
        }
        
        return actionsList;
    };

    const stats = [
        {
            label: 'إجمالي الموافقات المعلقة',
            value: total.toString(),
            description: 'جميع الموافقات المعلقة'
        },
        {
            label: 'المعروضة',
            value: filteredApprovals.length.toString(),
            description: 'بعد التصفية'
        },
        {
            label: 'الصفحات',
            value: pages.toString(),
            description: 'إجمالي الصفحات'
        }
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        الموافقات المعلقة
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        قائمة بجميع الموافقات المعلقة التي تحتاج إلى مراجعة
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <EnhancedCard
                        key={index}
                        title={stat.label}
                        description={stat.description}
                        variant="default"
                        size="sm"
                    >
                        <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {stat.value}
                        </div>
                    </EnhancedCard>
                ))}
            </div>

            {/* Search & Filters */}
            <EnhancedCard
                title="البحث والتصفية"
                description="ابحث وفلتر الموافقات المعلقة"
                variant="default"
                size="sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 space-y-4 md:space-y-0">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="ابحث في رقم الطلب، الملاحظات، أو المنشئ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pr-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-100 dark:focus-visible:ring-sky-900/50 focus:border-sky-300 dark:focus:border-sky-500"
                            />
                        </div>
                    </div>
                    <div>
                        <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
                            <SelectTrigger className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                <SelectValue placeholder="نوع الطلب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الأنواع</SelectItem>
                                <SelectItem value="Clients">Clients</SelectItem>
                                <SelectItem value="Projects">Projects</SelectItem>
                                <SelectItem value="Tasks">Tasks</SelectItem>
                                <SelectItem value="Financial">Financial</SelectItem>
                                <SelectItem value="Employment">Employment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleSearch}
                            className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            بحث
                        </Button>
                        <Button
                            onClick={handleClear}
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                        >
                            مسح
                        </Button>
                        <Button
                            onClick={refresh}
                            variant="outline"
                            className="border-slate-200 dark:border-slate-700"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </EnhancedCard>

            {/* Approvals Table */}
            <EnhancedCard
                title="قائمة الموافقات المعلقة"
                description={`${filteredApprovals.length} موافقة معلقة`}
                variant="default"
                size="sm"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                        <p className="text-slate-500 dark:text-slate-400 mr-3">جاري التحميل...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : (
                    <EnhancedDataTable
                        data={filteredApprovals}
                        columns={columns}
                        actions={getActions}
                        loading={false}
                        noDataMessage="لا توجد موافقات معلقة"
                    />
                )}
            </EnhancedCard>

            {/* Approval Modal */}
            {selectedApproval && modalAction && (
                <ApprovalModal
                    open={true}
                    onClose={handleModalClose}
                    approvalId={selectedApproval.approval_id || selectedApproval.id}
                    action={modalAction}
                    requestCode={selectedApproval.request_code}
                    requestType={selectedApproval.request_type}
                    creatorName={selectedApproval.creator_name}
                    onSuccess={handleModalClose}
                />
            )}
        </div>
    );
}

