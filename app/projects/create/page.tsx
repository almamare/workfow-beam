'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from '@/utils/axios';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProjectPayload = {
  project_code: string;
  name: string;
  client_name: string;
  start_date: string;
  end_date: string;
  type: string;
  fiscal_year: string;
  original_budget: number | string;
  revised_budget: number | string;
  committed_cost: number | string;
  actual_cost: number | string;
  description?: string;
};

const initialValues: ProjectPayload = {
  project_code: '',
  name: '',
  client_name: '',
  start_date: '',
  end_date: '',
  type: '',
  fiscal_year: '',
  original_budget: 0,
  revised_budget: 0,
  committed_cost: 0,
  actual_cost: 0,
  description: ''
};

const projectTypes = [
  'Public',
  'Communications',
  'Restoration',
  'Referral'
];

const fiscalYears = Array.from({ length: 6 }).map((_, i) => `${2024 + i}`);

const numberFields: (keyof ProjectPayload)[] = [
  'original_budget',
  'revised_budget',
  'committed_cost',
  'actual_cost'
];

const CreateProjectPage: React.FC = () => {
  const [form, setForm] = useState<ProjectPayload>(initialValues);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Update field
  const updateField = useCallback(
    (name: keyof ProjectPayload, value: string) => {
      if (numberFields.includes(name)) {
        if (value === '') {
          setForm(prev => ({ ...prev, [name]: '' }));
        } else if (/^\d+(\.\d+)?$/.test(value)) {
          setForm(prev => ({ ...prev, [name]: value }));
        }
      } else {
        setForm(prev => ({ ...prev, [name]: value }));
      }
      setFieldErrors(prev => {
        const clone = { ...prev };
        delete clone[name as string];
        return clone;
      });
    },
    []
  );

  /**
   * Validation:
   * - required fields
   * - end_date >= start_date
   * - numeric non-negative
   * - ORIGINAL > REVISED (as you requested)
   */
  const validate = useCallback(() => {
    const errors: Record<string, string> = {};

    const required: (keyof ProjectPayload)[] = [
      'project_code',
      'name',
      'client_name',
      'start_date',
      'end_date',
      'type',
      'fiscal_year'
    ];

    required.forEach(f => {
      if (!form[f] || String(form[f]).trim() === '') {
        errors[f] = 'Required';
      }
    });

    if (form.start_date && form.end_date) {
      const sd = new Date(form.start_date);
      const ed = new Date(form.end_date);
      if (ed < sd) errors.end_date = 'End date must be after or equal to start date';
    }

    numberFields.forEach(f => {
      const val = form[f];
      if (val === '' || val === null || val === undefined) {
        errors[f] = 'Required';
      } else {
        const num = Number(val);
        if (Number.isNaN(num)) {
          errors[f] = 'Invalid number';
        } else if (num < 0) {
          errors[f] = 'Must be ≥ 0';
        }
      }
    });

    // Enforce original_budget > revised_budget
    if (!errors.original_budget && !errors.revised_budget) {
      const original = Number(form.original_budget);
      const revised = Number(form.revised_budget);
      if (!(original > revised)) {
        errors.revised_budget = 'Revised budget must be LESS than Original Budget';
        // Optionally also:
        // errors.original_budget = 'Original must be greater than revised';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const formattedPayload = useMemo(() => {
    const payload: any = { ...form };
    numberFields.forEach(nf => {
      payload[nf] = form[nf] === '' ? 0 : Number(form[nf]);
    });
    return payload as ProjectPayload;
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors.');
      return;
    }
    setLoading(true);
    try {
      const result = await axios.post('/projects/create', { params: formattedPayload });

      if (result.data?.header?.success) {
        toast.success('Project created successfully!');
        setForm(prev => ({
          ...prev,
          project_code: '',
            name: '',
            client_name: '',
            description: '',
            original_budget: '',
            revised_budget: '',
            committed_cost: '',
            actual_cost: ''
        }));
      } else {
        toast.error(
          result.data?.header?.messages?.[0]?.message || 'Failed to create project.'
        );
        return;
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create project. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialValues);
    setFieldErrors({});
    toast.message('Form reset to initial defaults.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Create Project
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter the project details below, then submit to create a new project.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/projects')}
          >
            Back to Projects
          </Button>
        </div>
      </div>

      {/* Form */}
      <form
        id="project-create-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* Basic Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Core identifying information for the project.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="project_code">Project Code *</Label>
                    <Input
                      id="project_code"
                      value={form.project_code}
                      onChange={e => updateField('project_code', e.target.value)}
                      placeholder="XXX-XXX-XXX"
                    />
                    {fieldErrors.project_code && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.project_code}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={e => updateField('name', e.target.value)}
                      placeholder="Project Name"
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Client Name *</Label>
                    <Input
                      id="client_name"
                      value={form.client_name}
                      onChange={e => updateField('client_name', e.target.value)}
                      placeholder="Client / Owner"
                    />
                    {fieldErrors.client_name && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.client_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={form.type}
                      onValueChange={val => updateField('type', val)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map(t => (
                          <SelectItem value={t} key={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.type && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.type}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fiscal_year">Fiscal Year *</Label>
                    <Select
                      value={form.fiscal_year}
                      onValueChange={val => updateField('fiscal_year', val)}
                    >
                      <SelectTrigger id="fiscal_year">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {fiscalYears.map(y => (
                          <SelectItem value={y} key={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.fiscal_year && (
                      <p className="text-xs text-red-500">
                        {fieldErrors.fiscal_year}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <textarea
                    id="description"
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.description}
                    onChange={e => updateField('description', e.target.value)}
                    placeholder="Short project description..."
                  />
                </div>
              </CardContent>
            </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Dates</CardTitle>
              <CardDescription>
                Define the planned start and end dates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={e => updateField('start_date', e.target.value)}
                />
                {fieldErrors.start_date && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.start_date}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={e => updateField('end_date', e.target.value)}
                />
                {fieldErrors.end_date && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.end_date}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget & Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Budget & Costs</CardTitle>
            <CardDescription>
              Enter amounts as plain numbers (no formatting). Original must be greater than revised.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="original_budget">Original Budget *</Label>
                <Input
                  id="original_budget"
                  inputMode="numeric"
                  value={form.original_budget}
                  onChange={e => updateField('original_budget', e.target.value)}
                  placeholder="0"
                />
                {fieldErrors.original_budget && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.original_budget}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="revised_budget">Revised Budget *</Label>
                <Input
                  id="revised_budget"
                  inputMode="numeric"
                  value={form.revised_budget}
                  onChange={e => updateField('revised_budget', e.target.value)}
                  placeholder="0"
                />
                {fieldErrors.revised_budget && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.revised_budget}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="committed_cost">Committed Cost *</Label>
                <Input
                  id="committed_cost"
                  inputMode="numeric"
                  value={form.committed_cost}
                  onChange={e => updateField('committed_cost', e.target.value)}
                  placeholder="0"
                />
                {fieldErrors.committed_cost && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.committed_cost}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="actual_cost">Actual Cost *</Label>
                <Input
                  id="actual_cost"
                  inputMode="numeric"
                  value={form.actual_cost}
                  onChange={e => updateField('actual_cost', e.target.value)}
                  placeholder="0"
                />
                {fieldErrors.actual_cost && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.actual_cost}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Create Project'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default CreateProjectPage;
