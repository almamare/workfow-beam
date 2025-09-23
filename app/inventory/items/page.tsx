'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Search, Eye, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
        currency: 'SAR',
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
        currency: 'SAR',
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
        currency: 'SAR',
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
        currency: 'SAR',
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

const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    discontinued: 'Discontinued'
};

const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    discontinued: 'bg-red-100 text-red-800'
};

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
        currency: 'SAR',
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
            currency: 'SAR',
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
            currency: 'SAR',
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

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalItems = filteredItems.length;
    const lowStockItems = filteredItems.filter(item => item.currentStock <= item.minimumStock).length;
    const outOfStockItems = filteredItems.filter(item => item.currentStock === 0).length;
    const totalValue = filteredItems.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventory Items</h1>
                    <p className="text-muted-foreground">Manage inventory items and stock levels</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Item
                        </Button>
                    </DialogTrigger>
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
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
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
                                        <SelectTrigger>
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
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SAR">Saudi Riyal</SelectItem>
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
                                        <SelectTrigger>
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
                                        <SelectTrigger>
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
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <Package className="h-4 w-4 mr-2" />
                                    Create Item
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue, 'SAR')}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Stock Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Stock Levels</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                        <SelectItem value="over">Over Stock</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Items List
                    </CardTitle>
                    <CardDescription>
                        {filteredItems.length} items out of {items.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Min/Max Stock</TableHead>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.itemCode}</TableCell>
                                        <TableCell className="max-w-xs">
                                            <div>
                                                <div className="font-medium truncate">{item.name}</div>
                                                <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell className={`font-semibold ${item.currentStock <= item.minimumStock ? 'text-red-600' : 'text-green-600'}`}>
                                            {item.currentStock} {item.unit}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {item.minimumStock}/{item.maximumStock} {item.unit}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(item.unitPrice, item.currency)}
                                        </TableCell>
                                        <TableCell>{item.supplier}</TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[item.status]} w-fit`}>
                                                {statusLabels[item.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {item.status === 'active' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(item.id, 'inactive')}
                                                        className="text-yellow-600 hover:text-yellow-700"
                                                    >
                                                        Deactivate
                                                    </Button>
                                                )}
                                                {item.status === 'inactive' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleStatusChange(item.id, 'active')}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleStatusChange(item.id, 'discontinued')}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Discontinue
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Item</DialogTitle>
                        <DialogDescription>
                            Update item data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Item Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
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
                                    <SelectTrigger>
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
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-minimumStock">Min Stock</Label>
                                <Input
                                    id="edit-minimumStock"
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-maximumStock">Max Stock</Label>
                                <Input
                                    id="edit-maximumStock"
                                    type="number"
                                    value={formData.maximumStock}
                                    onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
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
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-currency">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SAR">Saudi Riyal</SelectItem>
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
                                    <SelectTrigger>
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
                                    <SelectTrigger>
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
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
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
