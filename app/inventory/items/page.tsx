'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Package, 
    Plus, 
    Eye, 
    Edit, 
    Trash2, 
    AlertTriangle, 
    CheckCircle, 
    FileSpreadsheet, 
    RefreshCw, 
    RotateCcw,
    Search,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';

interface InventoryItem {
    id: string;
    itemCode: string;
    name: string;
    description: string;
    category: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    unitPrice: number;
    currency: string;
    supplier: string;
    location: string;
    status: 'active' | 'inactive' | 'discontinued';
    lastUpdated: string;
    createdBy: string;
}

const mockItems: InventoryItem[] = [
    {
        id: '1',
        itemCode: 'ITM-001',
        name: 'Office Chair',
        description: 'Ergonomic office chair with adjustable height',
        category: 'Furniture',
        unit: 'piece',
        currentStock: 25,
        minimumStock: 10,
        maximumStock: 100,
        unitPrice: 450,
        currency: 'USD',
        supplier: 'Office Furniture Co.',
        location: 'Warehouse A',
        status: 'active',
        lastUpdated: '2024-01-15',
        createdBy: 'Ahmed Ali'
    },
    {
        id: '2',
        itemCode: 'ITM-002',
        name: 'A4 Paper',
        description: 'White A4 paper, 80gsm',
        category: 'Office Supplies',
        unit: 'ream',
        currentStock: 5,
        minimumStock: 20,
        maximumStock: 200,
        unitPrice: 25,
        currency: 'USD',
        supplier: 'Paper Supplies Ltd.',
        location: 'Warehouse B',
        status: 'active',
        lastUpdated: '2024-01-12',
        createdBy: 'Fatima Mohamed'
    },
    {
        id: '3',
        itemCode: 'ITM-003',
        name: 'Laptop Computer',
        description: 'Dell Inspiron 15 3000 series',
        category: 'Electronics',
        unit: 'piece',
        currentStock: 0,
        minimumStock: 5,
        maximumStock: 50,
        unitPrice: 2500,
        currency: 'USD',
        supplier: 'Tech Solutions Inc.',
        location: 'Warehouse A',
        status: 'active',
        lastUpdated: '2024-01-10',
        createdBy: 'Omar Hassan'
    },
    {
        id: '4',
        itemCode: 'ITM-004',
        name: 'Printer Toner',
        description: 'HP LaserJet Pro toner cartridge',
        category: 'Office Supplies',
        unit: 'piece',
        currentStock: 15,
        minimumStock: 5,
        maximumStock: 30,
        unitPrice: 120,
        currency: 'USD',
        supplier: 'Office Supplies Co.',
        location: 'Warehouse B',
        status: 'inactive',
        lastUpdated: '2024-01-08',
        createdBy: 'Sara Ahmed'
    }
];

const categories = ['Furniture', 'Office Supplies', 'Electronics', 'Tools', 'Maintenance', 'Safety Equipment'];
const units = ['piece', 'box', 'pack', 'ream', 'roll', 'meter', 'liter', 'kg', 'set'];
const suppliers = ['Office Furniture Co.', 'Paper Supplies Ltd.', 'Tech Solutions Inc.', 'Office Supplies Co.', 'General Supplies'];
const locations = ['Warehouse A', 'Warehouse B', 'Storage Room', 'Office', 'Maintenance Room'];

export default function InventoryItemsPage() {
    const [items, setItems] = useState<InventoryItem[]>(mockItems);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive' | 'discontinued'>('All');
    const [stockFilter, setStockFilter] = useState<'All' | 'low' | 'out' | 'over'>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        unit: '',
        currentStock: '',
        minimumStock: '',
        maximumStock: '',
        unitPrice: '',
        currency: 'USD',
        supplier: '',
        location: ''
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                item.itemCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                item.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                item.supplier.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                item.location.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
            const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
            
            let matchesStock = true;
            if (stockFilter === 'low') {
                matchesStock = item.currentStock <= item.minimumStock && item.currentStock > 0;
            } else if (stockFilter === 'out') {
                matchesStock = item.currentStock === 0;
            } else if (stockFilter === 'over') {
                matchesStock = item.currentStock > item.maximumStock;
            }

            let matchesDate = true;
            if (dateFrom) {
                matchesDate = new Date(item.lastUpdated) >= new Date(dateFrom);
            }
            if (dateTo) {
                matchesDate = matchesDate && new Date(item.lastUpdated) <= new Date(dateTo + 'T23:59:59');
            }
            
            return matchesSearch && matchesCategory && matchesStatus && matchesStock && matchesDate;
        });
    }, [items, debouncedSearch, categoryFilter, statusFilter, stockFilter, dateFrom, dateTo]);

    const refreshTable = useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Table refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh table');
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const exportToExcel = useCallback(async () => {
        setIsExporting(true);
        try {
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Inventory exported successfully');
        } catch (err) {
            toast.error('Failed to export inventory');
        } finally {
            setIsExporting(false);
        }
    }, []);

    const handleCreate = () => {
        if (!formData.name || !formData.category || !formData.unit || !formData.currentStock || !formData.minimumStock || !formData.maximumStock || !formData.unitPrice) {
            toast.error('Please fill in all required fields');
            return;
        }

        const currentStock = parseInt(formData.currentStock);
        const minimumStock = parseInt(formData.minimumStock);
        const maximumStock = parseInt(formData.maximumStock);
        const unitPrice = parseFloat(formData.unitPrice);

        if (minimumStock > maximumStock) {
            toast.error('Minimum stock cannot be greater than maximum stock');
            return;
        }

        const newItem: InventoryItem = {
            id: Date.now().toString(),
            itemCode: `ITM-${String(items.length + 1).padStart(3, '0')}`,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            unit: formData.unit,
            currentStock: currentStock,
            minimumStock: minimumStock,
            maximumStock: maximumStock,
            unitPrice: unitPrice,
            currency: formData.currency,
            supplier: formData.supplier,
            location: formData.location,
            status: 'active',
            lastUpdated: new Date().toISOString().split('T')[0],
            createdBy: 'Current User'
        };

        setItems([...items, newItem]);
        setIsCreateDialogOpen(false);
        setFormData({
            name: '',
            description: '',
            category: '',
            unit: '',
            currentStock: '',
            minimumStock: '',
            maximumStock: '',
            unitPrice: '',
            currency: 'USD',
            supplier: '',
            location: ''
        });
        toast.success('Item created successfully');
    };

    const handleEdit = (item: InventoryItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            category: item.category,
            unit: item.unit,
            currentStock: item.currentStock.toString(),
            minimumStock: item.minimumStock.toString(),
            maximumStock: item.maximumStock.toString(),
            unitPrice: item.unitPrice.toString(),
            currency: item.currency,
            supplier: item.supplier,
            location: item.location
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingItem) return;

        const currentStock = parseInt(formData.currentStock);
        const minimumStock = parseInt(formData.minimumStock);
        const maximumStock = parseInt(formData.maximumStock);
        const unitPrice = parseFloat(formData.unitPrice);

        if (minimumStock > maximumStock) {
            toast.error('Minimum stock cannot be greater than maximum stock');
            return;
        }

        const updatedItems = items.map(i =>
            i.id === editingItem.id ? { 
                ...i, 
                name: formData.name,
                description: formData.description,
                category: formData.category,
                unit: formData.unit,
                currentStock: currentStock,
                minimumStock: minimumStock,
                maximumStock: maximumStock,
                unitPrice: unitPrice,
                currency: formData.currency,
                supplier: formData.supplier,
                location: formData.location,
                lastUpdated: new Date().toISOString().split('T')[0]
            } : i
        );

        setItems(updatedItems);
        setIsEditDialogOpen(false);
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            category: '',
            unit: '',
            currentStock: '',
            minimumStock: '',
            maximumStock: '',
            unitPrice: '',
            currency: 'USD',
            supplier: '',
            location: ''
        });
        toast.success('Item updated successfully');
    };

    const handleDelete = (id: string) => {
        setItems(items.filter(i => i.id !== id));
        toast.success('Item deleted successfully');
    };

    const handleStatusChange = (id: string, status: InventoryItem['status']) => {
        setItems(prev => prev.map(item => 
            item.id === id 
                ? { ...item, status: status, lastUpdated: new Date().toISOString().split('T')[0] }
                : item
        ));
        toast.success(`Item ${status} successfully`);
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Calculate stats
    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.currentStock <= item.minimumStock && item.currentStock > 0).length;
    const outOfStockItems = items.filter(item => item.currentStock === 0).length;
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (categoryFilter !== 'All') activeFilters.push(`Category: ${categoryFilter}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (stockFilter !== 'All') activeFilters.push(`Stock: ${stockFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    const columns: Column<InventoryItem>[] = [
        {
            key: 'itemCode' as keyof InventoryItem,
            header: 'Item Code',
            render: (value: any) => <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{value}</span>,
            sortable: true
        },
        {
            key: 'name' as keyof InventoryItem,
            header: 'Item Name',
            render: (value: any, item: InventoryItem) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">{item.description}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'category' as keyof InventoryItem,
            header: 'Category',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'currentStock' as keyof InventoryItem,
            header: 'Current Stock',
            render: (value: any, item: InventoryItem) => (
                <span className={`font-semibold ${item.currentStock <= item.minimumStock ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {item.currentStock} {item.unit}
                </span>
            ),
            sortable: true
        },
        {
            key: 'minimumStock' as keyof InventoryItem,
            header: 'Min/Max Stock',
            render: (value: any, item: InventoryItem) => (
                <span className="text-sm text-slate-600 dark:text-slate-400">
                    {item.minimumStock}/{item.maximumStock} {item.unit}
                </span>
            ),
            sortable: true
        },
        {
            key: 'unitPrice' as keyof InventoryItem,
            header: 'Unit Price',
            render: (value: any, item: InventoryItem) => (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatNumber(value)} {item.currency}
                </span>
            ),
            sortable: true
        },
        {
            key: 'supplier' as keyof InventoryItem,
            header: 'Supplier',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true
        },
        {
            key: 'location' as keyof InventoryItem,
            header: 'Location',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true
        },
        {
            key: 'status' as keyof InventoryItem,
            header: 'Status',
            render: (value: any) => {
                const statusColors: Record<string, string> = {
                    'active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'inactive': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                    'discontinued': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value] || ''} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        }
    ];

    const actions: Action<InventoryItem>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (item: InventoryItem) => {
                toast.info(`Viewing details for: ${item.name}`);
            },
            variant: 'info' as const
        },
        {
            label: 'Edit Item',
            icon: <Edit className="h-4 w-4" />,
            onClick: (item: InventoryItem) => handleEdit(item),
            variant: 'default' as const
        },
        {
            label: 'Activate Item',
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: (item: InventoryItem) => handleStatusChange(item.id, 'active'),
            hidden: (item: InventoryItem) => item.status !== 'inactive'
        },
        {
            label: 'Deactivate Item',
            icon: <RotateCcw className="h-4 w-4" />,
            onClick: (item: InventoryItem) => handleStatusChange(item.id, 'inactive'),
            hidden: (item: InventoryItem) => item.status !== 'active'
        },
        {
            label: 'Delete Item',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (item: InventoryItem) => handleDelete(item.id),
            variant: 'destructive' as const
        }
    ];

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Inventory Items
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage inventory items and stock levels with comprehensive tracking and alert system
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={refreshTable}
                        disabled={isRefreshing}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Items"
                    description="All inventory items"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {totalItems}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Low Stock"
                    description="Items below minimum"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {lowStockItems}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Out of Stock"
                    description="Items with zero stock"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                        {outOfStockItems}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Value"
                    description="Inventory value"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatNumber(totalValue)}
                    </div>
                </EnhancedCard>
            </div>

            {/* Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Filter inventory items by category, status, stock level, or date range"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by item name, code, description, supplier, or location..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToExcel}
                                disabled={isExporting}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
                                Category
                            </Label>
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => {
                                    setCategoryFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                Status
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value as typeof statusFilter);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Statuses</SelectItem>
                                    <SelectItem value="active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Active</SelectItem>
                                    <SelectItem value="inactive" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Inactive</SelectItem>
                                    <SelectItem value="discontinued" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Discontinued</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Stock Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-slate-700 dark:text-slate-300 font-medium">
                                Stock Level
                            </Label>
                            <Select
                                value={stockFilter}
                                onValueChange={(value) => {
                                    setStockFilter(value as typeof stockFilter);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Stock Levels" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Stock Levels</SelectItem>
                                    <SelectItem value="low" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Low Stock</SelectItem>
                                    <SelectItem value="out" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Out of Stock</SelectItem>
                                    <SelectItem value="over" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Over Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* From Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date_from" className="text-slate-700 dark:text-slate-300 font-medium">
                                From Date
                            </Label>
                            <DatePicker
                                value={dateFrom}
                                onChange={(value) => {
                                    setDateFrom(value);
                                    setPage(1);
                                }}
                            />
                        </div>

                        {/* To Date */}
                        <div className="space-y-2">
                            <Label htmlFor="date_to" className="text-slate-700 dark:text-slate-300 font-medium">
                                To Date
                            </Label>
                            <DatePicker
                                value={dateTo}
                                onChange={(value) => {
                                    setDateTo(value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {/* Active Filters & Clear Button */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                {activeFilters.map((filter, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
                                    >
                                        {filter}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setCategoryFilter('All');
                                    setStatusFilter('All');
                                    setStockFilter('All');
                                    setDateFrom('');
                                    setDateTo('');
                                    setPage(1);
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Items Table */}
            <EnhancedCard
                title="Inventory Items"
                description={`${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: filteredItems.length,
                    badge: 'Filtered Items',
                    badgeColor: 'success'
                }}
                headerActions={
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-36 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 transition-colors duration-200">
                            <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
                            <SelectItem value="5" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">5 per page</SelectItem>
                            <SelectItem value="10" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">10 per page</SelectItem>
                            <SelectItem value="20" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">20 per page</SelectItem>
                            <SelectItem value="50" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">50 per page</SelectItem>
                            <SelectItem value="100" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-600 dark:hover:text-sky-400 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-sky-600 dark:focus:text-sky-400 cursor-pointer transition-colors duration-200">100 per page</SelectItem>
                        </SelectContent>
                    </Select>
                }
            >
                <EnhancedDataTable
                    data={filteredItems}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredItems.length / limit),
                        pageSize: limit,
                        totalItems: filteredItems.length,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No inventory items found matching your search criteria"
                    searchPlaceholder="Search items..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                        <DialogDescription>
                            Add a new item to inventory
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Item Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Item name"
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Item description"
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category" className="text-slate-700 dark:text-slate-200">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="unit" className="text-slate-700 dark:text-slate-200">Unit *</Label>
                                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {units.map(unit => (
                                            <SelectItem key={unit} value={unit} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="currentStock" className="text-slate-700 dark:text-slate-200">Current Stock *</Label>
                                <Input
                                    id="currentStock"
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="minimumStock" className="text-slate-700 dark:text-slate-200">Min Stock *</Label>
                                <Input
                                    id="minimumStock"
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="maximumStock" className="text-slate-700 dark:text-slate-200">Max Stock *</Label>
                                <Input
                                    id="maximumStock"
                                    type="number"
                                    value={formData.maximumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="unitPrice" className="text-slate-700 dark:text-slate-200">Unit Price *</Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency" className="text-slate-700 dark:text-slate-200">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="USD" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">US Dollar</SelectItem>
                                        <SelectItem value="EUR" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Euro</SelectItem>
                                        <SelectItem value="SAR" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Saudi Riyal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="supplier" className="text-slate-700 dark:text-slate-200">Supplier</Label>
                                <Select value={formData.supplier} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {suppliers.map(supplier => (
                                            <SelectItem key={supplier} value={supplier} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{supplier}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="location" className="text-slate-700 dark:text-slate-200">Location</Label>
                                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-slate-200 dark:border-slate-700">
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white">
                                <Package className="h-4 w-4 mr-2" />
                                Create Item
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Update item information and stock levels
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name" className="text-slate-700 dark:text-slate-200">Item Name *</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description" className="text-slate-700 dark:text-slate-200">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-category" className="text-slate-700 dark:text-slate-200">Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-unit" className="text-slate-700 dark:text-slate-200">Unit *</Label>
                                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {units.map(unit => (
                                            <SelectItem key={unit} value={unit} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="edit-currentStock" className="text-slate-700 dark:text-slate-200">Current Stock *</Label>
                                <Input
                                    id="edit-currentStock"
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-minimumStock" className="text-slate-700 dark:text-slate-200">Min Stock *</Label>
                                <Input
                                    id="edit-minimumStock"
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-maximumStock" className="text-slate-700 dark:text-slate-200">Max Stock *</Label>
                                <Input
                                    id="edit-maximumStock"
                                    type="number"
                                    value={formData.maximumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-unitPrice" className="text-slate-700 dark:text-slate-200">Unit Price *</Label>
                                <Input
                                    id="edit-unitPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-currency" className="text-slate-700 dark:text-slate-200">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="USD" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">US Dollar</SelectItem>
                                        <SelectItem value="EUR" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Euro</SelectItem>
                                        <SelectItem value="SAR" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Saudi Riyal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-supplier" className="text-slate-700 dark:text-slate-200">Supplier</Label>
                                <Select value={formData.supplier} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {suppliers.map(supplier => (
                                            <SelectItem key={supplier} value={supplier} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{supplier}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-location" className="text-slate-700 dark:text-slate-200">Location</Label>
                                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-200 dark:border-slate-700">
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white">
                                <Package className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
