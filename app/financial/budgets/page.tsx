'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Plus, Eye, Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle, Download, Filter, CheckCircle, PlayCircle, StopCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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
        currency: '',
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
        currency: '',
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
        currency: '',
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
        currency: '',
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
        currency: '',
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
            currency: '',
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
            currency: '',
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

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalRemaining = filteredBudgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);
    const exceededBudgets = filteredBudgets.filter(b => b.status === 'exceeded').length;

    const columns = [
        {
            key: 'budgetNumber' as keyof Budget,
            header: 'Budget Number',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '140px'
        },
        {
            key: 'name' as keyof Budget,
            header: 'Budget Name',
            render: (value: any) => <span className="font-semibold text-slate-800">{value}</span>,
            sortable: true
        },
        {
            key: 'department' as keyof Budget,
            header: 'Department',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'category' as keyof Budget,
            header: 'Category',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'fiscalYear' as keyof Budget,
            header: 'Fiscal Year',
            render: (value: any) => <span className="font-semibold text-slate-600">{value}</span>,
            sortable: true
        },
        {
            key: 'allocatedAmount' as keyof Budget,
            header: 'Allocated',
            render: (value: any, budget: Budget) => (
                <span className="font-semibold text-slate-800">
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'spentAmount' as keyof Budget,
            header: 'Spent',
            render: (value: any, budget: Budget) => (
                <span className="font-semibold text-red-600">
                    {formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'remainingAmount' as keyof Budget,
            header: 'Remaining',
            render: (value: any, budget: Budget) => {
                const isNegative = value < 0;
                return (
                    <span className={`font-semibold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                        {formatNumber(value)}
                    </span>
                );
            },
            sortable: true
        },
        {
            key: 'status' as keyof Budget,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'draft': 'bg-gray-100 text-gray-700 border-gray-200',
                    'approved': 'bg-blue-100 text-blue-700 border-blue-200',
                    'active': 'bg-green-100 text-green-700 border-green-200',
                    'closed': 'bg-gray-100 text-gray-700 border-gray-200',
                    'exceeded': 'bg-red-100 text-red-700 border-red-200'
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
            onClick: (budget: Budget) => toast.info('View details feature coming soon'),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Edit Budget',
            onClick: (budget: Budget) => handleEdit(budget),
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Approve Budget',
            onClick: (budget: Budget) => handleApprove(budget.id),
            icon: <CheckCircle className="h-4 w-4" />,
            hidden: (budget: Budget) => budget.status !== 'draft'
        },
        {
            label: 'Activate Budget',
            onClick: (budget: Budget) => handleActivate(budget.id),
            icon: <PlayCircle className="h-4 w-4" />,
            hidden: (budget: Budget) => budget.status !== 'approved'
        },
        {
            label: 'Close Budget',
            onClick: (budget: Budget) => handleClose(budget.id),
            icon: <StopCircle className="h-4 w-4" />,
            hidden: (budget: Budget) => budget.status !== 'active'
        },
        {
            label: 'Delete Budget',
            onClick: (budget: Budget) => handleDelete(budget.id),
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const stats = [
        {
            label: 'Total Allocated',
            value: formatNumber(totalAllocated),
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Total Spent',
            value: formatNumber(totalSpent),
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Total Remaining',
            value: formatNumber(totalRemaining),
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Exceeded Budgets',
            value: exceededBudgets,
            change: '-2%',
            trend: 'down' as const
        }
    ];

    const filterOptions = [
        {
            key: 'department',
            label: 'Department',
            value: departmentFilter,
            options: [
                { key: 'all', label: 'All Departments', value: 'all' },
                ...departments.map(dept => ({ key: dept, label: dept, value: dept }))
            ],
            onValueChange: setDepartmentFilter
        },
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
                { key: 'draft', label: 'Draft', value: 'draft' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'active', label: 'Active', value: 'active' },
                { key: 'closed', label: 'Closed', value: 'closed' },
                { key: 'exceeded', label: 'Exceeded', value: 'exceeded' }
            ],
            onValueChange: setStatusFilter
        },
        {
            key: 'fiscalYear',
            label: 'Fiscal Year',
            value: fiscalYearFilter,
            options: [
                { key: 'all', label: 'All Years', value: 'all' },
                ...fiscalYears.map(year => ({ key: year, label: year, value: year }))
            ],
            onValueChange: setFiscalYearFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (departmentFilter !== 'all') activeFilters.push(`Department: ${departmentFilter}`);
    if (categoryFilter !== 'all') activeFilters.push(`Category: ${categoryFilter}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
    if (fiscalYearFilter !== 'all') activeFilters.push(`Year: ${fiscalYearFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Budgets Management"
                description="Manage department budgets and financial planning with comprehensive budget tracking and analysis tools"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Create Budget',
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
                            label: 'Budget Analysis',
                            onClick: () => toast.info('Analysis feature coming soon'),
                            icon: <Filter className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by budget name, number, or department..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setDepartmentFilter('all');
                    setCategoryFilter('all');
                    setStatusFilter('all');
                    setFiscalYearFilter('all');
                }}
            />

            {/* Budgets Table */}
            <EnhancedCard
                title="Budget Overview"
                description={`${filteredBudgets.length} budgets out of ${budgets.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: budgets.length,
                    badge: 'Active Budgets',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredBudgets}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No budgets found matching your criteria"
                    searchPlaceholder="Search budgets..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger className="mt-1">
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fiscalYear">Fiscal Year</Label>
                                <Select value={formData.fiscalYear} onValueChange={(value) => setFormData(prev => ({ ...prev, fiscalYear: value }))}>
                                    <SelectTrigger className="mt-1">
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
                        <div>
                            <Label htmlFor="allocatedAmount">Allocated Amount</Label>
                            <Input
                                id="allocatedAmount"
                                type="number"
                                value={formData.allocatedAmount}
                                onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                                placeholder="0"
                                className="mt-1"
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
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="mt-1"
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
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Create Budget
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Budget</DialogTitle>
                        <DialogDescription>
                            Update budget information and settings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Budget Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-department">Department</Label>
                                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                                    <SelectTrigger className="mt-1">
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
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-fiscalYear">Fiscal Year</Label>
                                <Select value={formData.fiscalYear} onValueChange={(value) => setFormData(prev => ({ ...prev, fiscalYear: value }))}>
                                    <SelectTrigger className="mt-1">
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
                        <div>
                            <Label htmlFor="edit-allocatedAmount">Allocated Amount</Label>
                            <Input
                                id="edit-allocatedAmount"
                                type="number"
                                value={formData.allocatedAmount}
                                onChange={(e) => setFormData(prev => ({ ...prev, allocatedAmount: e.target.value }))}
                                className="mt-1"
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
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-endDate">End Date</Label>
                                <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="mt-1"
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
                                className="mt-1"
                            />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700">
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