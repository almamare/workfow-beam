'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import {
    aiAnalyzeEmployees,
    selectAiEmployeeLoading,
    selectAiEmployeeResponse,
    clearAiResponse,
} from '@/stores/slices/ai';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { UserCheck, Plus, Trash2, Sparkles } from 'lucide-react';
import { AiErrorState } from '@/components/ai/AiErrorState';

interface EmpRow {
    name: string;
    department: string;
    tasks_assigned: string;
    tasks_completed: string;
    pending_approvals: string;
    last_active: string;
}

const emptyEmp = (): EmpRow => ({
    name: '',
    department: '',
    tasks_assigned: '',
    tasks_completed: '',
    pending_approvals: '',
    last_active: '',
});

export default function AiEmployeesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAiEmployeeLoading);
    const response = useSelector(selectAiEmployeeResponse);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState('');
    const [employees, setEmployees] = useState<EmpRow[]>([emptyEmp()]);

    const update = (i: number, field: keyof EmpRow, val: string) =>
        setEmployees((e) => e.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

    const handleAnalyze = async () => {
        setError(null);
        const data = employees.filter((e) => e.name).map((e) => ({
            name: e.name,
            department: e.department,
            tasks_assigned: Number(e.tasks_assigned) || 0,
            tasks_completed: Number(e.tasks_completed) || 0,
            pending_approvals: Number(e.pending_approvals) || 0,
            last_active: e.last_active,
        }));
        if (!data.length) return;
        dispatch(clearAiResponse('employeeResponse'));
        try {
            await dispatch(aiAnalyzeEmployees({ data: { employees: data, period: period || undefined } })).unwrap();
        } catch (err: any) {
            setError(typeof err === 'string' ? err : 'حدث خطأ في تحليل أداء الموظفين');
        }
    };

    return (
        <div className="space-y-6">
            <Breadcrumb />

            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow">
                    <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Employee Performance</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Analyze workload distribution and productivity across your team
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EnhancedCard title="Employee Data" description="Enter employee performance metrics" variant="default" size="sm">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Period (e.g. 2026-Q1)</Label>
                            <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-Q1" />
                        </div>

                        <div className="space-y-3">
                            {employees.map((emp, i) => (
                                <div key={i} className="rounded-lg border p-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee {i + 1}</span>
                                        {employees.length > 1 && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setEmployees((e) => e.filter((_, idx) => idx !== i))}>
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Name</Label>
                                            <Input value={emp.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Employee name" className="h-8 text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Department</Label>
                                            <Input value={emp.department} onChange={(e) => update(i, 'department', e.target.value)} placeholder="Finance" className="h-8 text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Tasks Assigned</Label>
                                            <Input type="number" value={emp.tasks_assigned} onChange={(e) => update(i, 'tasks_assigned', e.target.value)} placeholder="15" className="h-8 text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Tasks Completed</Label>
                                            <Input type="number" value={emp.tasks_completed} onChange={(e) => update(i, 'tasks_completed', e.target.value)} placeholder="12" className="h-8 text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Pending Approvals</Label>
                                            <Input type="number" value={emp.pending_approvals} onChange={(e) => update(i, 'pending_approvals', e.target.value)} placeholder="3" className="h-8 text-xs" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px]">Last Active</Label>
                                            <Input type="date" value={emp.last_active} onChange={(e) => update(i, 'last_active', e.target.value)} className="h-8 text-xs" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setEmployees((e) => [...e, emptyEmp()])} className="w-full gap-1">
                            <Plus className="h-4 w-4" /> Add Employee
                        </Button>

                        <Button onClick={handleAnalyze} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            <Sparkles className="h-4 w-4" />
                            {loading ? 'Analyzing...' : 'Analyze Performance'}
                        </Button>
                    </div>
                </EnhancedCard>

                <EnhancedCard title="Performance Report" description="AI analysis and recommendations in Arabic" variant="default" size="sm">
                    {loading && <AiLoadingState label="جاري تحليل أداء الموظفين..." />}
                    {!loading && error && <AiErrorState message={error} onRetry={handleAnalyze} />}
                    {!loading && !error && response && <AiResponsePanel response={response} />}
                    {!loading && !error && !response && (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <UserCheck className="h-10 w-10 opacity-30" />
                            <p className="text-sm">Enter employee data and analyze</p>
                        </div>
                    )}
                </EnhancedCard>
            </div>
        </div>
    );
}
