'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { createInvoice } from '@/stores/slices/invoices';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import type { CreateInvoicePayload, CreateInvoiceItemPayload, InvoiceItem } from '@/stores/types/invoices';
import axios from '@/utils/axios';

// Client and Bank options
interface ClientOption {
    id: string;
    name: string;
    client_no?: string;
}

interface BankOption {
    id: string;
    name: string;
    account_number?: string;
}

// Initial form values
const initialValues: CreateInvoicePayload = {
    invoice_date: '',
    due_date: '',
    client_id: '',
    bank_id: '',
    tax: 0,
    discount: 0,
    status: 'Draft',
    notes: '',
    items: [],
};

const CreateInvoicePage: React.FC = () => {
    const [form, setForm] = useState<CreateInvoicePayload>(initialValues);
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [clients, setClients] = useState<ClientOption[]>([]);
    const [banks, setBanks] = useState<BankOption[]>([]);
    const [clientsLoading, setClientsLoading] = useState(false);
    const [banksLoading, setBanksLoading] = useState(false);
    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();

    // Fetch clients and banks
    useEffect(() => {
        // Fetch clients
        setClientsLoading(true);
        axios.get('/clients/fetch', { params: { page: 1, limit: 1000, search: '' } })
            .then(res => {
                const items: any[] = res?.data?.body?.clients?.items || [];
                setClients(items.map(c => ({ id: c.id, name: c.name, client_no: c.client_no })));
            })
            .catch(() => toast.error('Failed to load clients'))
            .finally(() => setClientsLoading(false));

        // Fetch banks
        setBanksLoading(true);
        axios.get('/banks/fetch', { params: { page: 1, limit: 1000, search: '', status: 'Active' } })
            .then(res => {
                const items: any[] = res?.data?.body?.banks?.items || [];
                setBanks(items.map(b => ({ id: b.id, name: b.name, account_number: b.account_number })));
            })
            .catch(() => toast.error('Failed to load banks'))
            .finally(() => setBanksLoading(false));
    }, []);

    // Calculate subtotal from items
    const calculateSubtotal = useCallback(() => {
        return items.reduce((sum, item) => sum + (item.total || 0), 0);
    }, [items]);

    // Calculate total
    const calculateTotal = useCallback(() => {
        const subtotal = calculateSubtotal();
        const tax = form.tax || 0;
        const discount = form.discount || 0;
        return subtotal + tax - discount;
    }, [calculateSubtotal, form.tax, form.discount]);

    // Update a single field in the form
    const updateField = useCallback((name: keyof CreateInvoicePayload, value: any) => {
        setForm(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => {
            const clone = { ...prev };
            delete clone[name];
            return clone;
        });
    }, []);

    // Add new item
    const addItem = () => {
        const newItem: InvoiceItem = {
            description: '',
            quantity: 1,
            unit_price: 0,
            total: 0,
        };
        setItems(prev => [...prev, newItem]);
    };

    // Update item
    const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
        setItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            // Calculate total for this item
            if (field === 'quantity' || field === 'unit_price') {
                updated[index].total = (updated[index].quantity || 0) * (updated[index].unit_price || 0);
            }
            return updated;
        });
    };

    // Remove item
    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    // Validate the form
    const validate = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!form.invoice_date || form.invoice_date.trim() === '') {
            errors.invoice_date = 'Invoice date is required';
        }

        if (form.due_date && form.invoice_date) {
            const invoiceDate = new Date(form.invoice_date);
            const dueDate = new Date(form.due_date);
            if (dueDate < invoiceDate) {
                errors.due_date = 'Due date must be after invoice date';
            }
        }

        if (items.length === 0) {
            errors.items = 'At least one item is required';
        }

        items.forEach((item, index) => {
            if (!item.description || item.description.trim() === '') {
                errors[`item_${index}_description`] = 'Description is required';
            }
            if (!item.quantity || item.quantity <= 0) {
                errors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
            }
            if (!item.unit_price || item.unit_price <= 0) {
                errors[`item_${index}_unit_price`] = 'Unit price must be greater than 0';
            }
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    }, [form, items]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix validation errors.');
            return;
        }

        setLoading(true);
        try {
            const payload: CreateInvoicePayload = {
                invoice_date: form.invoice_date,
                due_date: form.due_date || undefined,
                client_id: form.client_id || undefined,
                bank_id: form.bank_id || undefined,
                tax: form.tax || 0,
                discount: form.discount || 0,
                status: form.status || 'Draft',
                notes: form.notes || undefined,
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                })),
            };
            await dispatch(createInvoice(payload)).unwrap();
            toast.success('Invoice created successfully!');
            setForm(initialValues);
            setItems([]);
            router.push('/invoices');
        } catch (error: any) {
            toast.error(error || 'Failed to create invoice.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setForm(initialValues);
        setItems([]);
        setFieldErrors({});
        toast.message('Form reset to defaults.');
    };

    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Add New Invoice
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill in the details below to create a new invoice.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/invoices')}
                    className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                    Back to Invoices
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Invoice Information */}
                <EnhancedCard
                    title="Invoice Information"
                    description="Enter invoice basic details."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Invoice Date */}
                            <div className="space-y-2">
                                <Label htmlFor="invoice_date" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Invoice Date *
                                </Label>
                                <DatePicker
                                    value={form.invoice_date}
                                    onChange={(value) => updateField('invoice_date', value)}
                                />
                                {fieldErrors.invoice_date && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.invoice_date}</p>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <Label htmlFor="due_date" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Due Date
                                </Label>
                                <DatePicker
                                    value={form.due_date || ''}
                                    onChange={(value) => updateField('due_date', value)}
                                />
                                {fieldErrors.due_date && (
                                    <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.due_date}</p>
                                )}
                            </div>

                            {/* Client */}
                            <div className="space-y-2">
                                <Label htmlFor="client_id" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Client
                                </Label>
                                <Select
                                    value={form.client_id || ''}
                                    onValueChange={(val) => updateField('client_id', val)}
                                    disabled={clientsLoading}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder={clientsLoading ? "Loading..." : "Select Client"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name} {client.client_no ? `(${client.client_no})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bank */}
                            <div className="space-y-2">
                                <Label htmlFor="bank_id" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Bank
                                </Label>
                                <Select
                                    value={form.bank_id || ''}
                                    onValueChange={(val) => updateField('bank_id', val)}
                                    disabled={banksLoading}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder={banksLoading ? "Loading..." : "Select Bank"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {banks.map(bank => (
                                            <SelectItem key={bank.id} value={bank.id}>
                                                {bank.name} {bank.account_number ? `(${bank.account_number})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Status
                                </Label>
                                <Select
                                    value={form.status || 'Draft'}
                                    onValueChange={(val) => updateField('status', val)}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Issued">Issued</SelectItem>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={form.notes || ''}
                                    placeholder="Enter invoice notes (optional)"
                                    onChange={e => updateField('notes', e.target.value)}
                                    rows={3}
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </EnhancedCard>

                {/* Invoice Items */}
                <EnhancedCard
                    title="Invoice Items"
                    description="Add items to the invoice."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="text-left p-2 text-sm font-medium text-slate-700 dark:text-slate-300">Description *</th>
                                        <th className="text-left p-2 text-sm font-medium text-slate-700 dark:text-slate-300">Quantity *</th>
                                        <th className="text-left p-2 text-sm font-medium text-slate-700 dark:text-slate-300">Unit Price *</th>
                                        <th className="text-left p-2 text-sm font-medium text-slate-700 dark:text-slate-300">Total</th>
                                        <th className="text-left p-2 text-sm font-medium text-slate-700 dark:text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="p-2">
                                                <Input
                                                    value={item.description}
                                                    onChange={e => updateItem(index, 'description', e.target.value)}
                                                    placeholder="Item description"
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                />
                                                {fieldErrors[`item_${index}_description`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                        {fieldErrors[`item_${index}_description`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.quantity || ''}
                                                    onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                />
                                                {fieldErrors[`item_${index}_quantity`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                        {fieldErrors[`item_${index}_quantity`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={item.unit_price || ''}
                                                    onChange={e => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                />
                                                {fieldErrors[`item_${index}_unit_price`] && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                        {fieldErrors[`item_${index}_unit_price`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <span className="font-mono text-slate-900 dark:text-slate-100">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total || 0)}
                                                </span>
                                            </td>
                                            <td className="p-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {fieldErrors.items && (
                            <p className="text-xs text-red-500 dark:text-red-400">{fieldErrors.items}</p>
                        )}

                        {/* Add Item Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addItem}
                            className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                    </div>
                </EnhancedCard>

                {/* Financial Summary */}
                <EnhancedCard
                    title="Financial Summary"
                    description="Invoice totals and calculations."
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Subtotal */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Subtotal</Label>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <span className="font-mono text-lg text-slate-900 dark:text-slate-100">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Tax */}
                            <div className="space-y-2">
                                <Label htmlFor="tax" className="text-slate-700 dark:text-slate-300 font-medium">Tax</Label>
                                <Input
                                    id="tax"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.tax || ''}
                                    onChange={e => updateField('tax', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            {/* Discount */}
                            <div className="space-y-2">
                                <Label htmlFor="discount" className="text-slate-700 dark:text-slate-300 font-medium">Discount</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.discount || ''}
                                    onChange={e => updateField('discount', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                />
                            </div>

                            {/* Total */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 dark:text-slate-300 font-medium">Total</Label>
                                <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border-2 border-orange-300 dark:border-orange-700">
                                    <span className="font-mono text-2xl font-bold text-orange-700 dark:text-orange-300">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </EnhancedCard>

                {/* Form Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={loading}
                        className="border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-700 dark:hover:text-orange-300 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset Form
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoicePage;

