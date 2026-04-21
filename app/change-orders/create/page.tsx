'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/stores/store';
import { createChangeOrder } from '@/stores/slices/change-orders';
import { fetchContractors } from '@/stores/slices/contractors';
import { fetchProjects } from '@/stores/slices/projects';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { ArrowLeft, GitPullRequestArrow, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateChangeOrderPage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const contractors = useSelector((state: RootState) => state.contractors?.contractors ?? []);
    const projects = useSelector((state: RootState) => state.projects?.projects ?? []);

    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        contractor_id: '',
        project_id: '',
        title: '',
        description: '',
        issue_date: '',
        est_cost: '',
        notes: '',
    });

    useEffect(() => {
        dispatch(fetchContractors({} as any));
        dispatch(fetchProjects({} as any));
    }, [dispatch]);

    const submit = async () => {
        if (!form.contractor_id || !form.project_id || !form.title || !form.issue_date) {
            toast.error('Contractor, Project, Title and Issue Date are required');
            return;
        }

        setSaving(true);
        try {
            const result = await dispatch(
                createChangeOrder({
                    contractor_id: form.contractor_id,
                    project_id: form.project_id,
                    title: form.title,
                    description: form.description,
                    issue_date: form.issue_date,
                    est_cost: form.est_cost || undefined,
                    notes: form.notes,
                })
            );

            if (createChangeOrder.fulfilled.match(result)) {
                toast.success('Change order created successfully');
                router.push('/change-orders');
                return;
            }

            toast.error((result.payload as string) || 'Failed to create change order');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                        Create Change Order
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Add a new change order linked to a contractor and project
                    </p>
                </div>
                <Link href="/change-orders">
                    <Button variant="outline" className="border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Change Orders
                    </Button>
                </Link>
            </div>

            <EnhancedCard
                title="Change order details"
                description="Fill required fields before saving"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                Contractor <span className="text-red-500">*</span>
                            </Label>
                            <Select value={form.contractor_id} onValueChange={(v) => setForm((f) => ({ ...f, contractor_id: v }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select contractor..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-56">
                                    {contractors.map((c: any) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                Project <span className="text-red-500">*</span>
                            </Label>
                            <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v }))}>
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder="Select project..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-56">
                                    {projects.map((p: any) => (
                                        <SelectItem key={p.id} value={String(p.id)}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="Change order title"
                            value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">
                                Issue Date <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker value={form.issue_date} onChange={(v) => setForm((f) => ({ ...f, issue_date: v }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Estimated Cost</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={form.est_cost}
                                onChange={(e) => setForm((f) => ({ ...f, est_cost: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">Description</Label>
                        <Textarea
                            placeholder="Describe the scope of this change order..."
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows={4}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">Notes</Label>
                        <Textarea
                            placeholder="Additional notes..."
                            value={form.notes}
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={3}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Link href="/change-orders">
                            <Button variant="outline" disabled={saving}>
                                Cancel
                            </Button>
                        </Link>
                        <Button onClick={submit} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Change Order
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </EnhancedCard>

            <EnhancedCard title="Tip" description="Submission behavior" variant="default" size="sm">
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <GitPullRequestArrow className="h-4 w-4 text-violet-500" />
                    After saving, the change order appears in the list and can be opened from details.
                </p>
            </EnhancedCard>
        </div>
    );
}

