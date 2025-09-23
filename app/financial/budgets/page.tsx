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
import { BarChart3, Plus, Search, Eye, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Budget {
    id: string;
    budgetNumber: string;
    name: string;
    department: string;
    category: string;
    fiscalYear: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    currency: string;
    status: 'draft' | 'approved' | 'active' | 'closed' | 'exceeded';
    startDate: string;
    endDate: string;
    description: string;
    createdBy: string;
    approvedBy?: string;
    lastUpdated: string;
}

const mockBudgets: Budget[] = [
    {
        id: '1',
        budgetNumber: 'BUD-2024-001',
        name: 'IT Department Budget',
        department: 'Information Technology',
        category: 'Technology',
        fiscalYear: '2024',
        allocatedAmount: 500000,
        spentAmount: 350000,
        remainingAmount: 150000,
        currency: 'SAR',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: 'Annual budget for IT department operations and equipment',
        createdBy: 'Ahmed Ali',
        approvedBy: 'General Manager',
        lastUpdated: '2024-01-15'
    },
    {
        id: '2',
        budgetNumber: 'BUD-2024-002',
        name: 'Marketing Campaign Budget',
        department: 'Marketing',
        category: 'Marketing',
        fiscalYear: '2024',
        allocatedAmount: 200000,
        spentAmount: 180000,
        remainingAmount: 20000,
        currency: 'SAR',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: 'Budget for marketing campaigns and promotional activities',
        createdBy: 'Fatima Mohamed',
        approvedBy: 'Marketing Director',
        lastUpdated: '2024-01-10'
    },
    {
        id: '3',
        budgetNumber: 'BUD-2024-003',
        name: 'Office Renovation Budget',
        department: 'Administration',
        category: 'Infrastructure',
        fiscalYear: '2024',
        allocatedAmount: 100000,
        spentAmount: 105000,
        remainingAmount: -5000,
        currency: 'SAR',
        status: 'exceeded',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: 'Budget for office renovation and improvement projects',
        createdBy: 'Omar Hassan',
        approvedBy: 'Administrative Director',
        lastUpdated: '2024-01-12'
    },
    {
        id: '4',
        budgetNumber: 'BUD-2024-004',
        name: 'Training and Development Budget',
        department: 'Human Resources',
        category: 'Human Resources',
        fiscalYear: '2024',
        allocatedAmount: 75000,
        spentAmount: 25000,
        remainingAmount: 50000,
        currency: 'SAR',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        description: 'Budget for employee training and development programs',
        createdBy: 'Sara Ahmed',
        approvedBy: 'HR Director',
        lastUpdated: '2024-01-08'
    }
];

const departments = ['Information Technology', 'Marketing', 'Administration', 'Human Resources', 'Finance', 'Operations'];
const categories = ['Technology', 'Marketing', 'Infrastructure', 'Human Resources', 'Operations', 'Maintenance', 'Utilities'];
const fiscalYears = ['2024', '2023', '2025'];

const statusLabels = {
    draft: 'Draft',
    approved: 'Approved',
    active: 'Active',
    closed: 'Closed',
    exceeded: 'Exceeded'
};

const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    exceeded: 'bg-red-100 text-red-800'
};

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [fiscalYearFilter, setFiscalYearFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        category: '',
        fiscalYear: '2024',
        allocatedAmount: '',
        currency: 'SAR',
        startDate: '',
        endDate: '',
        description: ''
    });

    const filteredBudgets = budgets.filter(budget => {
        const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            budget.budgetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            budget.department.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || budget.department === departmentFilter;
        const matchesCategory = categoryFilter === 'all' || budget.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
        const matchesFiscalYear = fiscalYearFilter === 'all' || budget.fiscalYear === fiscalYearFilter;
        
        return matchesSearch && matchesDepartment && matchesCategory && matchesStatus && matchesFiscalYear;
    });

    const handleCreate = () => {
        if (!formData.name || !formData.department || !formData.category || !formData.allocatedAmount) {
            toast.error('Please fill in all required fields');
            return;
        }

        const allocatedAmount = parseFloat(formData.allocatedAmount);
        const newBudget: Budget = {
            id: Date.now().toString(),
            budgetNumber: `BUD-${formData.fiscalYear}-${String(budgets.length + 1).padStart(3, '0')}`,
            name: formData.name,
            department: formData.department,
            category: formData.category,
            fiscalYear: formData.fiscalYear,
            allocatedAmount: allocatedAmount,
            spentAmount: 0,
            remainingAmount: allocatedAmount,
            currency: formData.currency,
            status: 'draft',
            startDate: formData.startDate,
            endDate: formData.endDate,
            description: formData.description,
            createdBy: 'Current User',
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        setBudgets([...budgets, newBudget]);
        setIsCreateDialogOpen(false);
        setFormData({
            name: '',
            department: '',
            category: '',
            fiscalYear: '2024',
            allocatedAmount: '',
            currency: 'SAR',
            startDate: '',
            endDate: '',
            description: ''
        });
        toast.success('Budget created successfully');
    };

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setFormData({
            name: budget.name,
            department: budget.department,
            category: budget.category,
            fiscalYear: budget.fiscalYear,
            allocatedAmount: budget.allocatedAmount.toString(),
            currency: budget.currency,
            startDate: budget.startDate,
            endDate: budget.endDate,
            description: budget.description
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingBudget) return;

        const allocatedAmount = parseFloat(formData.allocatedAmount);
        const remainingAmount = allocatedAmount - editingBudget.spentAmount;
        const status = remainingAmount < 0 ? 'exceeded' : 
                     remainingAmount === 0 ? 'closed' : 
                     editingBudget.status === 'draft' ? 'draft' : 'active';

        const updatedBudgets = budgets.map(b =>
            b.id === editingBudget.id ? { 
                ...b, 
                name: formData.name,
                department: formData.department,
                category: formData.category,
                fiscalYear: formData.fiscalYear,
                allocatedAmount: allocatedAmount,
                remainingAmount: remainingAmount,
                currency: formData.currency,
                startDate: formData.startDate,
                endDate: formData.endDate,
                description: formData.description,
                status: status as Budget['status'],
                lastUpdated: new Date().toISOString().split('T')[0]
            } : b
        );

        setBudgets(updatedBudgets);
        setIsEditDialogOpen(false);
        setEditingBudget(null);
        setFormData({
            name: '',
            department: '',
            category: '',
            fiscalYear: '2024',
            allocatedAmount: '',
            currency: 'SAR',
            startDate: '',
            endDate: '',
            description: ''
        });
        toast.success('Budget updated successfully');
    };

    const handleDelete = (id: string) => {
        setBudgets(budgets.filter(b => b.id !== id));
        toast.success('Budget deleted successfully');
    };

    const handleApprove = (id: string) => {
        setBudgets(prev => prev.map(budget => 
            budget.id === id 
                ? { ...budget, status: 'approved' as const, approvedBy: 'General Manager' }
                : budget
        ));
        toast.success('Budget approved');
    };

    const handleActivate = (id: string) => {
        setBudgets(prev => prev.map(budget => 
            budget.id === id 
                ? { ...budget, status: 'active' as const }
                : budget
        ));
        toast.success('Budget activated');
    };

    const handleClose = (id: string) => {
        setBudgets(prev => prev.map(budget => 
            budget.id === id 
                ? { ...budget, status: 'closed' as const }
                : budget
        ));
        toast.success('Budget closed');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalRemaining = filteredBudgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);
    const exceededBudgets = filteredBudgets.filter(b => b.status === 'exceeded').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Budgets Management</h1>
                    <p className="text-muted-foreground">Manage department budgets and financial planning</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Budget
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Budget</DialogTitle>
                            <DialogDescription>
                                Create a new budget for a department or project
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Budget Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Budget name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="fiscalYear">Fiscal Year</Label>
                                    <Select value={formData.fiscalYear} onValueChange={(value) => setFormData(prev => ({ ...prev, fiscalYear: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fiscalYears.map(year => (
                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                            <div>
                                <Label htmlFor="allocatedAmount">Allocated Amount</Label>
                                <Input
                                    id="allocatedAmount"
                                    type="number"
                                    value={formData.allocatedAmount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                                    placeholder="0"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Budget description"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Create Budget
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
                        <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalAllocated, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRemaining, 'SAR')}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Exceeded Budgets</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{exceededBudgets}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search budgets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
                <Select value={fiscalYearFilter} onValueChange={setFiscalYearFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Fiscal Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {fiscalYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Budgets Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Budgets List
                    </CardTitle>
                    <CardDescription>
                        {filteredBudgets.length} budgets out of {budgets.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Budget Number</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Fiscal Year</TableHead>
                                    <TableHead>Allocated</TableHead>
                                    <TableHead>Spent</TableHead>
                                    <TableHead>Remaining</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBudgets.map((budget) => (
                                    <TableRow key={budget.id}>
                                        <TableCell className="font-medium">{budget.budgetNumber}</TableCell>
                                        <TableCell className="max-w-xs truncate">{budget.name}</TableCell>
                                        <TableCell>{budget.department}</TableCell>
                                        <TableCell>{budget.category}</TableCell>
                                        <TableCell>{budget.fiscalYear}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(budget.allocatedAmount, budget.currency)}
                                        </TableCell>
                                        <TableCell className="font-semibold text-red-600">
                                            {formatCurrency(budget.spentAmount, budget.currency)}
                                        </TableCell>
                                        <TableCell className={`font-semibold ${budget.remainingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(budget.remainingAmount, budget.currency)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[budget.status]} w-fit`}>
                                                {statusLabels[budget.status]}
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
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {budget.status === 'draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleApprove(budget.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {budget.status === 'approved' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleActivate(budget.id)}
                                                        className="text-blue-600 hover:text-blue-700"
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                                {budget.status === 'active' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleClose(budget.id)}
                                                        className="text-gray-600 hover:text-gray-700"
                                                    >
                                                        Close
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(budget.id)}
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
                        <DialogTitle>Edit Budget</DialogTitle>
                        <DialogDescription>
                            Update budget data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Budget Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-fiscalYear">Fiscal Year</Label>
                                <Select value={formData.fiscalYear} onValueChange={(value) => setFormData(prev => ({ ...prev, fiscalYear: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fiscalYears.map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        <div>
                            <Label htmlFor="edit-allocatedAmount">Allocated Amount</Label>
                            <Input
                                id="edit-allocatedAmount"
                                type="number"
                                value={formData.allocatedAmount}
                                onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-startDate">Start Date</Label>
                                <Input
                                    id="edit-startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-endDate">End Date</Label>
                                <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
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
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}