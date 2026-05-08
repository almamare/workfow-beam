'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { fetchProjects, selectProjects } from '@/stores/slices/projects';
import { fetchClients, selectClients } from '@/stores/slices/clients';
import {
    fetchDisbursements,
    selectDisbursementsList,
    selectDisbursementsLoading,
} from '@/stores/slices/financial-disbursements';
import { fetchContractors, selectContractors } from '@/stores/slices/contractors';
import { fetchEmployees, selectEmployees } from '@/stores/slices/employees';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    RefreshCw, FileSpreadsheet, X,
    TrendingUp, TrendingDown,
    Activity, Users, FolderOpen, DollarSign,
    ClipboardList, Building, Target, ArrowUpRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';

const CATEGORY_COLORS: Record<string, string> = {
    Projects:    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200',
    Clients:     'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200',
    Financial:   'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200',
    Workforce:   'bg-brand-sky-100 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 border-brand-sky-200',
};

const PERF_COLORS: Record<string, string> = {
    excellent: 'bg-emerald-500',
    good:      'bg-blue-500',
    average:   'bg-yellow-500',
    poor:      'bg-red-500',
};

function perfStatus(pct: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (pct >= 100) return 'excellent';
    if (pct >= 85) return 'good';
    if (pct >= 70) return 'average';
    return 'poor';
}

function fmt(n: number, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(n);
}

export default function AnalysisPage() {
    const dispatch = useDispatch<AppDispatch>();

    const projects     = useSelector(selectProjects);
    const clients      = useSelector(selectClients);
    const disbursements = useSelector(selectDisbursementsList);
    const disLoading   = useSelector(selectDisbursementsLoading);
    const contractors  = useSelector(selectContractors);
    const employees    = useSelector(selectEmployees);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const loadAll = () => {
        dispatch(fetchProjects({ page: 1, limit: 1000 }));
        dispatch(fetchClients({ page: 1, limit: 1000 }));
        dispatch(fetchDisbursements({ page: 1, per_page: 1000 }));
        dispatch(fetchContractors({ page: 1, limit: 1000 }));
        dispatch(fetchEmployees({ page: 1, limit: 1000 }));
    };

    useEffect(() => { loadAll(); }, []);

    const refresh = async () => {
        setIsRefreshing(true);
        try { loadAll(); toast.success('Analysis refreshed'); }
        catch { toast.error('Refresh failed'); }
        finally { setIsRefreshing(false); }
    };

    // ── Computed KPIs from real data ─────────────────────────────────────────
    const kpis = useMemo(() => {
        const totalProjects   = projects.length;
        const activeProjects  = projects.filter(p => p.status === 'Active').length;
        const completedProj   = projects.filter(p => p.status === 'Completed').length;
        const completionRate  = totalProjects > 0 ? (completedProj / totalProjects) * 100 : 0;

        const totalClients    = clients.length;
        const activeClients   = clients.filter((c: any) => c.status === 'Active').length;

        const paidDisb        = disbursements.filter((d: any) => d.status === 'Paid');
        const pendingDisb     = disbursements.filter((d: any) => ['Submitted', 'Under_Review', 'Approved'].includes(d.status));
        const totalDisbAmt    = paidDisb.reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
        const pendingDisbAmt  = pendingDisb.reduce((s: number, d: any) => s + Number(d.amount || 0), 0);

        // Budget adherence: projects with budget > 0
        const budgetedProjects = projects.filter((p: any) => Number(p.budget || 0) > 0);
        const withinBudget     = budgetedProjects.filter(
            (p: any) => Number(p.spent_budget || 0) <= Number(p.budget || 0)
        ).length;
        const budgetAdherence  = budgetedProjects.length > 0
            ? (withinBudget / budgetedProjects.length) * 100 : 0;

        const totalContractors = contractors.length;
        const totalEmployees   = employees.length;

        return {
            totalProjects, activeProjects, completedProj, completionRate,
            totalClients, activeClients,
            totalDisbAmt, pendingDisbAmt,
            paidCount: paidDisb.length, pendingCount: pendingDisb.length,
            budgetAdherence, budgetedProjects: budgetedProjects.length,
            totalContractors, totalEmployees,
        };
    }, [projects, clients, disbursements, contractors, employees]);

    const metrics = useMemo(() => [
        {
            category: 'Projects',
            title: 'Total Projects',
            value: fmt(kpis.totalProjects),
            sub: `${kpis.activeProjects} active · ${kpis.completedProj} completed`,
            icon: FolderOpen,
        },
        {
            category: 'Projects',
            title: 'Completion Rate',
            value: `${fmt(kpis.completionRate, 1)}%`,
            sub: `${kpis.completedProj} of ${kpis.totalProjects} projects completed`,
            icon: Target,
        },
        {
            category: 'Clients',
            title: 'Total Clients',
            value: fmt(kpis.totalClients),
            sub: `${kpis.activeClients} active clients`,
            icon: Building,
        },
        {
            category: 'Financial',
            title: 'Total Paid (IQD)',
            value: fmt(kpis.totalDisbAmt),
            sub: `${kpis.paidCount} paid disbursements`,
            icon: DollarSign,
        },
        {
            category: 'Financial',
            title: 'Pending (IQD)',
            value: fmt(kpis.pendingDisbAmt),
            sub: `${kpis.pendingCount} pending disbursements`,
            icon: Activity,
        },
        {
            category: 'Projects',
            title: 'Budget Adherence',
            value: kpis.budgetedProjects > 0 ? `${fmt(kpis.budgetAdherence, 1)}%` : 'N/A',
            sub: kpis.budgetedProjects > 0
                ? `${kpis.budgetedProjects} projects with set budgets`
                : 'No projects with budget set',
            icon: TrendingUp,
        },
        {
            category: 'Workforce',
            title: 'Employees',
            value: fmt(kpis.totalEmployees),
            sub: 'Total employee records',
            icon: Users,
        },
        {
            category: 'Workforce',
            title: 'Contractors',
            value: fmt(kpis.totalContractors),
            sub: 'Total contractor records',
            icon: ClipboardList,
        },
    ], [kpis]);

    const filtered = categoryFilter === 'All'
        ? metrics
        : metrics.filter(m => m.category === categoryFilter);

    const performanceMetrics = useMemo(() => [
        {
            metric: 'Project Completion',
            value: kpis.completionRate,
            target: 80,
            label: `${fmt(kpis.completionRate, 1)}%`,
        },
        {
            metric: 'Budget Adherence',
            value: kpis.budgetAdherence,
            target: 90,
            label: kpis.budgetedProjects > 0 ? `${fmt(kpis.budgetAdherence, 1)}%` : 'N/A',
        },
        {
            metric: 'Active Projects Ratio',
            value: kpis.totalProjects > 0 ? (kpis.activeProjects / kpis.totalProjects) * 100 : 0,
            target: 60,
            label: kpis.totalProjects > 0
                ? `${fmt((kpis.activeProjects / kpis.totalProjects) * 100, 1)}%`
                : 'N/A',
        },
        {
            metric: 'Disbursement Settlement',
            value: (kpis.paidCount + kpis.pendingCount) > 0
                ? (kpis.paidCount / (kpis.paidCount + kpis.pendingCount)) * 100 : 0,
            target: 70,
            label: (kpis.paidCount + kpis.pendingCount) > 0
                ? `${fmt((kpis.paidCount / (kpis.paidCount + kpis.pendingCount)) * 100, 1)}%`
                : 'N/A',
        },
        {
            metric: 'Active Client Ratio',
            value: kpis.totalClients > 0 ? (kpis.activeClients / kpis.totalClients) * 100 : 0,
            target: 75,
            label: kpis.totalClients > 0
                ? `${fmt((kpis.activeClients / kpis.totalClients) * 100, 1)}%`
                : 'N/A',
        },
    ], [kpis]);

    const activeFilters: string[] = [];
    if (categoryFilter !== 'All') activeFilters.push(`Category: ${categoryFilter}`);
    if (dateFrom) activeFilters.push(`From: ${dateFrom}`);
    if (dateTo)   activeFilters.push(`To: ${dateTo}`);

    const loading = disLoading;

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Analysis</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Live insights from your projects, clients, financial, and workforce data
                    </p>
                </div>
            </div>

            {/* KPI summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard title="Total Projects" variant="default" size="sm"
                    stats={{ total: kpis.totalProjects, badge: `${kpis.activeProjects} active`, badgeColor: 'default' }}>
                    <p className="text-xs text-slate-500 mt-1">{kpis.completedProj} completed</p>
                </EnhancedCard>
                <EnhancedCard title="Total Clients" variant="default" size="sm"
                    stats={{ total: kpis.totalClients, badge: `${kpis.activeClients} active`, badgeColor: 'success' }}>
                    <p className="text-xs text-slate-500 mt-1">&nbsp;</p>
                </EnhancedCard>
                <EnhancedCard title="Paid Disbursements" variant="default" size="sm"
                    stats={{ total: kpis.paidCount, badge: 'paid', badgeColor: 'success' }}>
                    <p className="text-xs text-slate-500 mt-1">{kpis.pendingCount} pending</p>
                </EnhancedCard>
                <EnhancedCard title="Completion Rate" variant="default" size="sm"
                    stats={{ badge: `${fmt(kpis.completionRate, 1)}%`, badgeColor: kpis.completionRate >= 70 ? 'success' : 'warning' }}>
                    <p className="text-xs text-slate-500 mt-1">{kpis.completedProj} of {kpis.totalProjects} projects</p>
                </EnhancedCard>
            </div>

            {/* Filters */}
            <EnhancedCard title="Filters" variant="default" size="sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Categories</SelectItem>
                                    <SelectItem value="Projects">Projects</SelectItem>
                                    <SelectItem value="Clients">Clients</SelectItem>
                                    <SelectItem value="Financial">Financial</SelectItem>
                                    <SelectItem value="Workforce">Workforce</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <DatePicker value={dateFrom} onChange={setDateFrom} />
                        </div>
                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <DatePicker value={dateTo} onChange={setDateTo} />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}
                            className="border-brand-sky-200 text-brand-sky-700 hover:bg-brand-sky-50 dark:border-brand-sky-700 dark:text-brand-sky-300">
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-sm text-slate-500">Active filters:</span>
                            {activeFilters.map((f, i) => (
                                <Badge key={i} variant="outline" className="bg-brand-sky-50 dark:bg-brand-sky-900/30 text-brand-sky-700 border-brand-sky-200">{f}</Badge>
                            ))}
                            <Button variant="outline" size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 ml-auto"
                                onClick={() => { setCategoryFilter('All'); setDateFrom(''); setDateTo(''); }}>
                                <X className="h-4 w-4 mr-1" /> Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Performance Metrics */}
            <EnhancedCard title="Performance Metrics" description="Key indicators vs targets"
                variant="default" size="sm"
                stats={{ total: performanceMetrics.length, badge: 'KPIs', badgeColor: 'info' }}>
                <div className="space-y-5">
                    {performanceMetrics.map((m, i) => {
                        const pct = m.target > 0 ? (m.value / m.target) * 100 : 0;
                        const status = perfStatus(pct);
                        return (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{m.metric}</span>
                                        <Badge variant="outline" className={
                                            status === 'excellent' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            status === 'good' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            status === 'average' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                        }>{status}</Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.label}</div>
                                        <div className="text-xs text-slate-400">target: {m.target}%</div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div className={`h-2 rounded-full transition-all duration-500 ${PERF_COLORS[status]}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </EnhancedCard>

            {/* Metric cards */}
            <EnhancedCard
                title="Detailed Metrics"
                description={`${filtered.length} metric${filtered.length !== 1 ? 's' : ''}`}
                variant="default"
                size="sm"
                stats={{ total: filtered.length, badge: 'Metrics', badgeColor: 'default' }}
            >
                {loading ? (
                    <div className="flex justify-center py-10">
                        <RefreshCw className="h-8 w-8 animate-spin text-brand-sky-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((item, idx) => {
                            const Icon = item.icon;
                            return (
                                <div key={idx}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-sky-300 dark:hover:border-brand-sky-600 transition-colors">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className={`p-2 rounded-lg ${CATEGORY_COLORS[item.category] || 'bg-slate-100'}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <Badge variant="outline" className={CATEGORY_COLORS[item.category] || ''}>
                                            {item.category}
                                        </Badge>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{item.title}</h3>
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{item.value}</div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </EnhancedCard>
        </div>
    );
}
