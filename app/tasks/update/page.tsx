/* eslint-disable @next/next/no-img-element */
/* =========================================================================
   Task Orders - Update Page
   - Uses `useSearchParams` to read taskId from URL: /tasks/update?taskId=123
   - Fetches the existing task order and pre-fills the form
   - Submits an update via PUT /task-orders/update/:id
   - Includes robust field validation and file handling (base64)
   ========================================================================= */
   'use client';

   import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
   import { Label } from '@/components/ui/label';
   import { Input } from '@/components/ui/input';
   import {
       Select,
       SelectTrigger,
       SelectContent,
       SelectItem,
       SelectValue
   } from '@/components/ui/select';
   import { DatePicker } from '@/components/DatePicker';
   import { Button } from '@/components/ui/button';
   import { toast } from 'sonner';
   import axios from '@/utils/axios';
   import { Loader2, Save, RotateCcw, Plus, Trash2, FileUp } from 'lucide-react';
   import { useDispatch, useSelector } from 'react-redux';
   import { useRouter, useSearchParams } from 'next/navigation';
   import type { AppDispatch } from '@/stores/store';
   import {
       fetchContractors,
       selectContractors,
       selectLoading as selectContractorsLoading,
       selectError as selectContractorsError
   } from '@/stores/slices/contractors';
   import type { Contractor } from '@/stores/types/contractors';
   import {
       fetchProjects,
       selectProjects,
       selectLoading as selectProjectsLoading,
       selectError as selectProjectsError
   } from '@/stores/slices/projects';
   import type { Project } from '@/stores/types/projects';
   import { Breadcrumb } from '@/components/layout/breadcrumb';
   import { EnhancedCard } from '@/components/ui/enhanced-card';
   
   /* ============================== Types ============================== */
   type ContractTerm = {
       title: string;
       description: string;
   };
   
   type TaskOrderDocument = {
       title: string;
       file: string; // base64 or URL
       name?: string; // original filename (for UI)
       type?: string; // MIME type
       size?: number; // bytes
   };
   
   type TaskOrderPayload = {
       contractor_id: string;
       project_id: string;
       title: string;
       description?: string;
       issue_date: string; // YYYY-MM-DD
       est_cost: string; // numeric string
       notes: string;
       status: 'Active' | 'Closed' | 'Cancelled' | 'Pending' | 'Onhold';
       contract_terms: ContractTerm[];
       documents: TaskOrderDocument[];
   };
   
   /* ======================== Initial Form State ======================= */
   const initialValues: TaskOrderPayload = {
       contractor_id: '',
       project_id: '',
       title: '',
       description: '',
       issue_date: '',
       est_cost: '',
       notes: '',
       status: 'Active',
       contract_terms: [{ title: '', description: '' }],
       documents: [{ title: '', file: '' }]
   };
   
   const statuses: TaskOrderPayload['status'][] = [
       'Active',
       'Pending',
       'Onhold',
       'Closed',
       'Cancelled'
   ];
   
   const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
   const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
   const EMPTY_CONTRACTOR_VALUE = 'no-contractors-available';
   const EMPTY_PROJECT_VALUE = 'no-projects-available';
   
   /* ============================== Page =============================== */
   const UpdateTaskOrderPageContent: React.FC = () => {
       // Form state
       const [form, setForm] = useState<TaskOrderPayload>(initialValues);
   
       // UI and errors
       const [loading, setLoading] = useState(false); // submit loading
       const [initialLoading, setInitialLoading] = useState(true); // initial fetch loading
       const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
   
       const router = useRouter();
   
       // Read taskId from query string using useSearchParams
       const searchParams = useSearchParams();
       const taskId = searchParams.get('id');
   
       // Redux
       const dispatch = useDispatch<AppDispatch>();
       const contractors = useSelector(selectContractors);
       const contractorsLoading = useSelector(selectContractorsLoading);
       const contractorsError = useSelector(selectContractorsError);
       const projects = useSelector(selectProjects);
       const projectsLoading = useSelector(selectProjectsLoading);
       const projectsError = useSelector(selectProjectsError);
   
       /* ---------------------- Helpers (labels) ---------------------- */
       // Safely build labels for selects (fallbacks included)
       const getContractorLabel = (c: Contractor) =>
           (c as any).name || (c as any).number || `Contractor ${(c as any).id}`;
   
       const getProjectLabel = (p: Project) =>
           (p as any).name || (p as any).client_name || `Project ${(p as any).id}`;
   
       // Select options (ensure IDs are strings)
       const contractorOptions = useMemo(
           () =>
               (contractors || []).map((c) => ({
                   id: String((c as any).id),
                   label: getContractorLabel(c)
               })),
           [contractors]
       );
   
       const projectOptions = useMemo(
           () =>
               (projects || []).map((p) => ({
                   id: String((p as any).id),
                   label: getProjectLabel(p)
               })),
           [projects]
       );
   
       /* ---------------------- File to Base64 ----------------------- */
       const readFileAsDataURL = (file: File) =>
           new Promise<string>((resolve, reject) => {
               const reader = new FileReader();
               reader.onload = () => resolve(String(reader.result));
               reader.onerror = reject;
               reader.readAsDataURL(file);
           });
   
       /* ---------------------- Field Updaters ----------------------- */
       const updateField = useCallback((name: keyof TaskOrderPayload, value: string) => {
           // Avoid updating from disabled placeholder values
           if (value === EMPTY_CONTRACTOR_VALUE || value === EMPTY_PROJECT_VALUE) return;
           setForm((prev) => ({ ...prev, [name]: value }));
           setFieldErrors((prev) => ({ ...prev, [name]: '' }));
       }, []);
   
       // Contract terms handlers
       const updateTermField = (index: number, key: keyof ContractTerm, value: string) => {
           setForm((prev) => {
               const terms = [...prev.contract_terms];
               terms[index] = { ...terms[index], [key]: value };
               return { ...prev, contract_terms: terms };
           });
       };
   
       const addTerm = () => {
           setForm((prev) => ({
               ...prev,
               contract_terms: [...prev.contract_terms, { title: '', description: '' }]
           }));
       };
   
       const removeTerm = (index: number) => {
           setForm((prev) => ({
               ...prev,
               contract_terms: prev.contract_terms.filter((_, i) => i !== index)
           }));
       };
   
       // Documents handlers
       const updateDocTitle = (index: number, value: string) => {
           setForm((prev) => {
               const docs = [...prev.documents];
               docs[index] = { ...docs[index], title: value };
               return { ...prev, documents: docs };
           });
       };
   
       const updateDocFile = async (index: number, file?: File) => {
           if (!file) return;
   
           // Basic validation
           if (!ALLOWED_FILE_TYPES.includes(file.type)) {
               toast.error('Only JPG, PNG, and PDF files are allowed');
               return;
           }
           if (file.size > MAX_FILE_SIZE) {
               toast.error('File size exceeds 5MB limit');
               return;
           }
   
           try {
               const dataUrl = await readFileAsDataURL(file);
               setForm((prev) => {
                   const docs = [...prev.documents];
                   docs[index] = {
                       ...docs[index],
                       file: dataUrl,
                       name: file.name,
                       type: file.type,
                       size: file.size
                   };
                   return { ...prev, documents: docs };
               });
           } catch (err) {
               toast.error('Failed to process file');
           }
       };
   
       const addDocument = () => {
           setForm((prev) => ({
               ...prev,
               documents: [...prev.documents, { title: '', file: '' }]
           }));
       };
   
       const removeDocument = (index: number) => {
           setForm((prev) => ({
               ...prev,
               documents: prev.documents.filter((_, i) => i !== index)
           }));
       };
   
       /* -------------------------- Validation -------------------------- */
       const validate = useCallback(() => {
           const errors: Record<string, string> = {};
           const required: (keyof TaskOrderPayload)[] = [
               'contractor_id',
               'project_id',
               'title',
               'issue_date',
               'est_cost',
               'status'
           ];
   
           // Required checks
           required.forEach((field) => {
               if (!form[field] || String(form[field]).trim() === '') {
                   errors[field] = 'This field is required';
               }
           });
   
           // Number check for cost
           if (!errors.est_cost) {
               const value = Number(form.est_cost);
               if (isNaN(value)) errors.est_cost = 'Must be a valid number';
               else if (value < 0) errors.est_cost = 'Must be >= 0';
           }
   
           // Terms paired fields check
           form.contract_terms.forEach((t, i) => {
               const hasTitle = t.title.trim() !== '';
               const hasDescription = t.description.trim() !== '';
               if ((hasTitle && !hasDescription) || (!hasTitle && hasDescription)) {
                   errors[`contract_terms_${i}`] = 'Both title and description are required';
               }
           });
   
           // Documents paired fields check
           form.documents.forEach((d, i) => {
               const hasTitle = d.title.trim() !== '';
               const hasFile = d.file.trim() !== '';
               if ((hasTitle && !hasFile) || (!hasTitle && hasFile)) {
                   errors[`documents_${i}`] = 'Both title and file are required';
               }
           });
   
           setFieldErrors(errors);
           return Object.keys(errors).length === 0;
       }, [form]);
   
       /* ---------------------- Format Payload ---------------------- */
       const formattedPayload = useMemo((): TaskOrderPayload => {
           // Keep only fully filled terms/documents
           const validTerms = form.contract_terms
               .filter((t) => t.title.trim() && t.description.trim())
               .map((t) => ({ title: t.title.trim(), description: t.description.trim() }));
   
           const validDocs = form.documents
               .filter((d) => d.title.trim() && d.file.trim())
               .map((d) => ({
                   title: d.title.trim(),
                   file: d.file.trim(),
                   // Optionally keep name/type/size if your backend accepts them
                   name: d.name,
                   type: d.type,
                   size: d.size
               }));
   
           // Force 2 decimal places for cost
           return {
               ...form,
               contractor_id: form.contractor_id.trim(),
               project_id: form.project_id.trim(),
               title: form.title.trim(),
               description: form.description?.trim() || '',
               est_cost: Number(form.est_cost).toFixed(2),
               notes: form.notes?.trim() || '',
               contract_terms: validTerms,
               documents: validDocs
           };
       }, [form]);
   
       /* -------------------------- Data Fetch -------------------------- */
       // Normalize API shape into our form shape safely
       const normalizeTaskOrder = (payload: any): TaskOrderPayload => {
           const issueRaw: string = String(payload?.issue_date ?? '');
           const issueDate = issueRaw.includes('T') ? issueRaw.slice(0, 10) : issueRaw;
   
           return {
               contractor_id: String(payload?.contractor_id ?? ''),
               project_id: String(payload?.project_id ?? ''),
               title: String(payload?.title ?? ''),
               description: String(payload?.description ?? ''),
               issue_date: issueDate,
               est_cost: String(payload?.est_cost ?? ''),
               notes: String(payload?.notes ?? ''),
               status: (payload?.status as TaskOrderPayload['status']) ?? 'Active',
               contract_terms:
                   Array.isArray(payload?.contract_terms) && payload.contract_terms.length
                       ? payload.contract_terms.map((t: any) => ({
                           title: String(t?.title ?? ''),
                           description: String(t?.description ?? '')
                       }))
                       : [{ title: '', description: '' }],
               documents:
                   Array.isArray(payload?.documents) && payload.documents.length
                       ? payload.documents.map((d: any) => ({
                           title: String(d?.title ?? ''),
                           file: String(d?.file ?? ''),
                           name: d?.name ? String(d.name) : undefined,
                           type: d?.type ? String(d.type) : undefined,
                           size: typeof d?.size === 'number' ? d.size : undefined
                       }))
                       : [{ title: '', file: '' }]
           };
       };
   
       useEffect(() => {
           // If no taskId, show error and prevent rendering the form
           if (!taskId) {
               toast.error('Missing task ID in the URL');
               setInitialLoading(false);
               return;
           }
   
           // Load dropdown data
           dispatch(fetchContractors({ page: 1, limit: 1000 }));
           dispatch(fetchProjects({ page: 1, limit: 1000, search: '', type: 'Public' }));
   
           // Load existing task order
           const fetchTaskOrder = async () => {
               setInitialLoading(true);
               try {
                   const res = await axios.get(`/task-orders/fetch/${taskId}`);
                   if (res?.data?.header?.success) {
                       const taskOrderData = res.data?.body?.task_order || res.data?.body || res.data;
                       setForm(normalizeTaskOrder(taskOrderData));
                   } else {
                       toast.error(
                           res?.data?.header?.messages?.[0]?.message || 'Failed to load task order data'
                       );
                   }
               } catch (err: any) {
                   toast.error(err?.message || 'Error fetching task order details');
               } finally {
                   setInitialLoading(false);
               }
           };
   
           fetchTaskOrder();
       }, [dispatch, taskId]);
   
       /* -------------------------- Submit Update -------------------------- */
       const handleSubmit = async (e: React.FormEvent) => {
           e.preventDefault();
           if (!taskId) {
               toast.error('Missing task ID');
               return;
           }
           if (!validate()) {
               toast.error('Please fix form errors before updating');
               return;
           }
           setLoading(true);
           try {
               const res = await axios.put(`/task-orders/update/${taskId}`, formattedPayload);
   
               if (res?.data?.header?.success) {
                   toast.success('Task order updated successfully!');
                   router.push('/tasks');
               } else {
                   const msg =
                       res?.data?.header?.messages?.[0]?.message || res?.data?.header?.message || 'Update failed';
                   toast.error(msg);
               }
           } catch (err: any) {
               toast.error(err?.message || 'Error updating task order');
           } finally {
               setLoading(false);
           }
       };
   
       /* ------------------------------ Reset ------------------------------ */
       const handleReset = () => {
           setForm(initialValues);
           setFieldErrors({});
           toast.info('Form has been reset');
       };

       if (initialLoading) {
        return (
            <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-orange-500" />
            <span className="text-slate-600 dark:text-slate-400">Loading task order...</span>
        </div>
        );
    }
   
       /* ============================== Render ============================== */
       return (
           <div className="space-y-4">
               <Breadcrumb />
   
               <div className="flex flex-col md:flex-row md:items-end mb-2 justify-between">
                   <div>
                       <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Update Task Order</h1>
                       <p className="text-slate-600 dark:text-slate-400">Edit the task order details, manage supporting documents, and save changes</p>
                   </div>
                   <Button 
                       variant="outline" 
                       onClick={() => router.push('/tasks')}
                       className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                   >
                       Back Task Orders
                   </Button>
               </div>
   

                   <form id="taskorder-update-form" onSubmit={handleSubmit} className="space-y-4">
                       <div className="grid gap-4 md:grid-cols-3">
                           {/* ================= Left Column - Basic Info ================= */}
                           <EnhancedCard title="Core Information" description="Essential details for the task order" variant="default" size="sm" className="md:col-span-2">
                               <div className="space-y-4">
                                   <div className="grid gap-4 md:grid-cols-2">
                                       {/* Contractor */}
                                       <div className="space-y-2">
                                           <Label htmlFor="contractor_id" className="text-slate-700 dark:text-slate-200">Contractor *</Label>
                                           <Select value={form.contractor_id} onValueChange={(value) => updateField('contractor_id', value)}>
                                               <SelectTrigger id="contractor_id" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                                   {contractorsLoading ? (
                                                       <div className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading contractors...</div>
                                                   ) : (
                                                       <SelectValue placeholder="Select contractor" />
                                                   )}
                                               </SelectTrigger>
                                               <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                                   {contractorOptions.length === 0 ? (
                                                       <SelectItem value={EMPTY_CONTRACTOR_VALUE} disabled className="text-slate-500 dark:text-slate-400 cursor-not-allowed">No contractors available</SelectItem>
                                                   ) : (
                                                       contractorOptions.map((c) => (
                                                           <SelectItem key={c.id} value={c.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400">{c.label}</SelectItem>
                                                       ))
                                                   )}
                                               </SelectContent>
                                           </Select>
                                           {fieldErrors.contractor_id && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.contractor_id}</p>}
                                           {contractorsError && <p className="text-xs text-red-500 dark:text-red-400">Error loading contractors: {contractorsError}</p>}
                                       </div>
   
                                       {/* Project */}
                                       <div className="space-y-2">
                                           <Label htmlFor="project_id" className="text-slate-700 dark:text-slate-200">Project *</Label>
                                           <Select value={form.project_id} onValueChange={(value) => updateField('project_id', value)}>
                                               <SelectTrigger id="project_id" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                                   {projectsLoading ? (
                                                       <div className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading projects...</div>
                                                   ) : (
                                                       <SelectValue placeholder="Select project" />
                                                   )}
                                               </SelectTrigger>
                                               <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                                   {projectOptions.length === 0 ? (
                                                       <SelectItem value={EMPTY_PROJECT_VALUE} disabled className="text-slate-500 dark:text-slate-400 cursor-not-allowed">No projects available</SelectItem>
                                                   ) : (
                                                       projectOptions.map((p) => (
                                                           <SelectItem key={p.id} value={p.id} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400">{p.label}</SelectItem>
                                                       ))
                                                   )}
                                               </SelectContent>
                                           </Select>
                                           {fieldErrors.project_id && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.project_id}</p>}
                                           {projectsError && <p className="text-xs text-red-500 dark:text-red-400">Error loading projects: {projectsError}</p>}
                                       </div>
   
                                       {/* Title */}
                                       <div className="space-y-2">
                                           <Label htmlFor="title" className="text-slate-700 dark:text-slate-200">Title *</Label>
                                           <Input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Task order title" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                           {fieldErrors.title && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.title}</p>}
                                       </div>
   
                                       {/* Issue Date */}
                                       <div className="flex flex-col">
                                           <Label htmlFor="issue_date" className="mb-3 mt-[6px] text-slate-700 dark:text-slate-200">Issue Date *</Label>
                                           <DatePicker value={form.issue_date} onChange={(val: any) => updateField('issue_date', String(val))} />
                                           {fieldErrors.issue_date && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{fieldErrors.issue_date}</p>}
                                       </div>
   
                                       {/* Status */}
                                       <div className="space-y-2">
                                           <Label htmlFor="status" className="text-slate-700 dark:text-slate-200">Status *</Label>
                                           <Select value={form.status} onValueChange={(value) => updateField('status', value)}>
                                               <SelectTrigger id="status" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100">
                                                   <SelectValue placeholder="Select status" />
                                               </SelectTrigger>
                                               <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                                                   {statuses.map((s) => (
                                                       <SelectItem key={s} value={s} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-orange-600 dark:hover:text-orange-400">{s}</SelectItem>
                                                   ))}
                                               </SelectContent>
                                           </Select>
                                           {fieldErrors.status && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.status}</p>}
                                       </div>
   
                                       {/* Estimated Cost */}
                                       <div className="space-y-2">
                                           <Label htmlFor="est_cost" className="text-slate-700 dark:text-slate-200">Estimated Cost (IQD) *</Label>
                                           <Input id="est_cost" type="number" min="0" step="0.01" value={form.est_cost} onChange={(e) => updateField('est_cost', e.target.value)} placeholder="0" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                           {fieldErrors.est_cost && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.est_cost}</p>}
                                       </div>
                                   </div>
   
                                   {/* Description */}
                                   <div className="space-y-2">
                                       <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description</Label>
                                       <textarea id="description" className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100 dark:focus-visible:ring-orange-900/50 focus:border-orange-300 dark:focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Detailed description of the task order..." />
                                   </div>
                               </div>
                           </EnhancedCard>
   
                           {/* ================= Right Column - Contract Terms ================= */}
                           <EnhancedCard title="Contract Terms" description="Define terms and conditions for this task order" variant="default" size="sm">
                               <div className="space-y-4">
                                   {form.contract_terms.map((term, index) => (
                                       <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                                           <div className="flex items-center justify-between">
                                               <Label className="font-medium text-slate-700 dark:text-slate-200">Term - ({index + 1})</Label>
                                               <Button type="button" variant="outline" size="sm" onClick={() => removeTerm(index)} disabled={form.contract_terms.length <= 1} className="border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                   <Trash2 className="h-4 w-4 me-1" /> Delete
                                               </Button>
                                           </div>
                                           <Input placeholder="Term title" value={term.title} onChange={(e) => updateTermField(index, 'title', e.target.value)} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                           <textarea className="min-h-[80px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100 dark:focus-visible:ring-orange-900/50 focus:border-orange-300 dark:focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Term description" value={term.description} onChange={(e) => updateTermField(index, 'description', e.target.value)} />
                                           {fieldErrors[`contract_terms_${index}`] && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors[`contract_terms_${index}`]}</p>}
                                       </div>
                                   ))}
                                   <Button type="button" variant="outline" size="sm" onClick={addTerm} className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                       <Plus className="h-4 w-4 mr-2" /> Add Term
                                   </Button>
                               </div>
                           </EnhancedCard>
                       </div>
   
                       {/* ================= Notes Section ================= */}
                       <EnhancedCard title="Notes Task Order Requests" description="Additional notes or instructions for this task order" variant="default" size="sm">
                           <div className="space-y-2">
                               <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">Notes</Label>
                               <textarea id="notes" className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-100 dark:focus-visible:ring-orange-900/50 focus:border-orange-300 dark:focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Detailed notes of the task order..." />
                           </div>
                       </EnhancedCard>
   
                       {/* ================= Documents Section ================= */}
                       <EnhancedCard title="Supporting Documents" description="Upload relevant files (PDF, JPG, PNG - max 5MB each)" variant="default" size="sm">
                           <div className="space-y-4">
                               <div className="grid gap-4 md:grid-cols-3">
                                   {form.documents.map((doc, index) => (
                                       <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                                           <div className="flex items-center justify-between">
                                               <Label className="font-medium text-slate-700 dark:text-slate-200">Document - ({index + 1})</Label>
                                               <Button type="button" variant="outline" size="sm" onClick={() => removeDocument(index)} disabled={form.documents.length <= 1} className="border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 hover:text-rose-700 dark:hover:text-rose-300 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                   <Trash2 className="h-4 w-4 me-1" /> Delete
                                               </Button>
                                           </div>
                                           <Input placeholder="Document title" value={doc.title} onChange={(e) => updateDocTitle(index, e.target.value)} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-orange-300 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                           <div className="flex items-center gap-3">
                                               <label htmlFor={`file_${index}`} className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                                                   <FileUp className="h-4 w-4" />
                                                   {doc.name ? 'Change File' : 'Select File'}
                                               </label>
                                               <input id={`file_${index}`} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => updateDocFile(index, e.target.files?.[0])} />
                                               {doc.name ? (
                                                   <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{doc.name}</span>
                                               ) : (
                                                   <span className="text-sm text-slate-600 dark:text-slate-400">No file selected</span>
                                               )}
                                           </div>
   
                                           {/* Preview */}
                                           {doc.file && (
                                               <div className="mt-2">
                                                   {doc.type?.startsWith('image/') ? (
                                                       <img src={doc.file} alt="Preview" className="h-24 object-contain border rounded" />
                                                   ) : doc.type === 'application/pdf' ? (
                                                       <div className="flex items-center text-blue-600 dark:text-blue-400">
                                                           <FileUp className="h-6 w-6 mr-2" />
                                                           <span>PDF Document</span>
                                                       </div>
                                                   ) : null}
                                               </div>
                                           )}
   
                                           {fieldErrors[`documents_${index}`] && <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors[`documents_${index}`]}</p>}
                                       </div>
                                   ))}
                               </div>
   
                               <Button
                                   type="button"
                                   variant="outline"
                                   size="sm"
                                   onClick={addDocument}
                                   className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                               >
                                   <Plus className="h-4 w-4 mr-2" />
                                   Add Document
                               </Button>
                           </div>
                       </EnhancedCard>
   
                       {/* Form Actions */}
                       <div className="flex justify-end gap-3 pt-2">
                           <Button
                               type="button"
                               variant="outline"
                               onClick={handleReset}
                               disabled={loading}
                               className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                           >
                               <RotateCcw className="h-4 w-4 mr-2" /> Reset Form
                           </Button>
                           <Button
                               type="submit"
                               disabled={loading}
                               className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                           >
                               {loading ? (
                                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                               ) : (
                                   <Save className="h-4 w-4 mr-2" />
                               )}
                               {loading ? 'Updating...' : 'Update Task Order'}
                           </Button>
                       </div>
                   </form>
           </div>
       );
   };
   
   // Centered Layout Component for states
   const Centered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
       <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
           {children}
       </div>
   );
   
   
   /* =========================================================
      Page Wrapper
   =========================================================== */
   export default function Page() {
       return (
           <Suspense
               fallback={
                   <Centered>
                       <Loader2 className="h-8 w-8 animate-spin text-primary" />
                       <p className="text-muted-foreground">Loading update...</p>
                   </Centered>
               }
           >
               <UpdateTaskOrderPageContent />
           </Suspense>
       );
   }