'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Download, Filter, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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
        currency: '',
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
        currency: '',
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
        currency: '',
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
        currency: '',
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
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        unit: '',
        currentStock: '',
        minimumStock: '',
        maximumStock: '',
        unitPrice: '',
        currency: '',
        supplier: '',
        location: ''
    });

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        let matchesStock = true;
        if (stockFilter === 'low') {
            matchesStock = item.currentStock <= item.minimumStock;
        } else if (stockFilter === 'out') {
            matchesStock = item.currentStock === 0;
        } else if (stockFilter === 'over') {
            matchesStock = item.currentStock > item.maximumStock;
        }
        
        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });

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
            currency: '',
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
            currency: '',
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

    const totalItems = filteredItems.length;
    const lowStockItems = filteredItems.filter(item => item.currentStock <= item.minimumStock).length;
    const outOfStockItems = filteredItems.filter(item => item.currentStock === 0).length;
    const totalValue = filteredItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    const columns = [
        {
            key: 'itemCode' as keyof InventoryItem,
            header: 'Item Code',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '120px'
        },
        {
            key: 'name' as keyof InventoryItem,
            header: 'Item Name',
            render: (value: any, item: InventoryItem) => (
                <div>
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="text-sm text-slate-600 truncate max-w-xs">{item.description}</div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'category' as keyof InventoryItem,
            header: 'Category',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'currentStock' as keyof InventoryItem,
            header: 'Current Stock',
            render: (value: any, item: InventoryItem) => (
                <span className={`font-semibold ${item.currentStock <= item.minimumStock ? 'text-red-600' : 'text-green-600'}`}>
                    {item.currentStock} {item.unit}
                </span>
            ),
            sortable: true
        },
        {
            key: 'minimumStock' as keyof InventoryItem,
            header: 'Min/Max Stock',
            render: (value: any, item: InventoryItem) => (
                <span className="text-sm text-slate-600">
                    {item.minimumStock}/{item.maximumStock} {item.unit}
                </span>
            ),
            sortable: true
        },
        {
            key: 'unitPrice' as keyof InventoryItem,
            header: 'Unit Price',
            render: (value: any, item: InventoryItem) => (
                <span className="font-semibold text-slate-800">
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'supplier' as keyof InventoryItem,
            header: 'Supplier',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'location' as keyof InventoryItem,
            header: 'Location',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'status' as keyof InventoryItem,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'active': 'bg-green-100 text-green-700 border-green-200',
                    'inactive': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'discontinued': 'bg-red-100 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors]} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'View Details',
            onClick: (item: InventoryItem) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Item',
            onClick: (item: InventoryItem) => handleEdit(item),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Activate Item',
            onClick: (item: InventoryItem) => handleStatusChange(item.id, 'active'),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (item: InventoryItem) => item.status !== 'inactive'
        },
        {
            label: 'Deactivate Item',
            onClick: (item: InventoryItem) => handleStatusChange(item.id, 'inactive'),
            icon: <RotateCcw className="h-4 w-4" />,
            hidden: (item: InventoryItem) => item.status !== 'active'
        },
        {
            label: 'Delete Item',
            onClick: (item: InventoryItem) => handleDelete(item.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Items',
            value: totalItems,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Low Stock Items',
            value: lowStockItems,
            change: '-2%',
            trend: 'down' as const
        },
        {
            label: 'Out of Stock',
            value: outOfStockItems,
            change: '-1%',
            trend: 'down' as const
        },
        {
            label: 'Total Value',
            value: formatNumber(totalValue),
            change: '+12%',
            trend: 'up' as const
        }
    ];

    const filterOptions = [
        {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            options: [
                { key: 'all', label: 'All Categories', value: 'all' },
                ...categories.map(cat => ({ key: cat, label: cat, value: cat }))
            ],
            onValueChange: setCategoryFilter
        },
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'active', label: 'Active', value: 'active' },
                { key: 'inactive', label: 'Inactive', value: 'inactive' },
                { key: 'discontinued', label: 'Discontinued', value: 'discontinued' }
            ],
            onValueChange: setStatusFilter
        },
        {
            key: 'stock',
            label: 'Stock Level',
            value: stockFilter,
            options: [
                { key: 'all', label: 'All Stock Levels', value: 'all' },
                { key: 'low', label: 'Low Stock', value: 'low' },
                { key: 'out', label: 'Out of Stock', value: 'out' },
                { key: 'over', label: 'Over Stock', value: 'over' }
            ],
            onValueChange: setStockFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (categoryFilter !== 'all') activeFilters.push(`Category: ${categoryFilter}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
    if (stockFilter !== 'all') activeFilters.push(`Stock: ${stockFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Inventory Items"
                description="Manage inventory items and stock levels with comprehensive tracking and alert system"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Add Item',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Export Report',
                            onClick: () => toast.info('Export feature coming soon'),
                            icon: <Download className="h-4 w-4" />
                        },
                        {
                            label: 'Stock Analysis',
                            onClick: () => toast.info('Stock analysis coming soon'),
                            icon: <Filter className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by item name, code, or description..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setStockFilter('all');
                }}
            />

            {/* Items Table */}
            <EnhancedCard
                title="Inventory Overview"
                description={`${filteredItems.length} items out of ${items.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: items.length,
                    badge: 'Active Items',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredItems}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No items found matching your criteria"
                    searchPlaceholder="Search items..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Item</DialogTitle>
                        <DialogDescription>
                            Add a new item to inventory
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Item Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Item name"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Item description"
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="unit">Unit</Label>
                                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map(unit => (
                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="currentStock">Current Stock</Label>
                                <Input
                                    id="currentStock"
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="minimumStock">Min Stock</Label>
                                <Input
                                    id="minimumStock"
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="maximumStock">Max Stock</Label>
                                <Input
                                    id="maximumStock"
                                    type="number"
                                    value={formData.maximumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
                                    placeholder="0"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="unitPrice">Unit Price</Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">US Dollar</SelectItem>
                                        <SelectItem value="EUR">Euro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="supplier">Supplier</Label>
                                <Select value={formData.supplier} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Supplier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(supplier => (
                                            <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                <Package className="h-4 w-4 mr-2" />
                                Create Item
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Update item information and stock levels
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Item Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-unit">Unit</Label>
                                <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map(unit => (
                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="edit-currentStock">Current Stock</Label>
                                <Input
                                    id="edit-currentStock"
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-minimumStock">Min Stock</Label>
                                <Input
                                    id="edit-minimumStock"
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-maximumStock">Max Stock</Label>
                                <Input
                                    id="edit-maximumStock"
                                    type="number"
                                    value={formData.maximumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-unitPrice">Unit Price</Label>
                                <Input
                                    id="edit-unitPrice"
                                    type="number"
                                    step="0.01"
                                    value={formData.unitPrice}
                                    onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-currency">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">US Dollar</SelectItem>
                                        <SelectItem value="EUR">Euro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-supplier">Supplier</Label>
                                <Select value={formData.supplier} onValueChange={(value) => setFormData(prev => ({ ...prev, supplier: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {suppliers.map(supplier => (
                                            <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-location">Location</Label>
                                <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locations.map(location => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
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