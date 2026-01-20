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
    Plus, 
    Edit, 
    Trash2, 
    Users, 
    Building, 
    FileSpreadsheet, 
    RefreshCw,
    Search,
    X,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable, Column, Action } from '@/components/ui/enhanced-data-table';
import { DatePicker } from '@/components/DatePicker';

interface Department {
    id: string;
    name: string;
    description: string;
    manager: string;
    employeeCount: number;
    budget: number;
    status: 'active' | 'inactive';
    createdAt: string;
}

const mockDepartments: Department[] = [
    {
        id: '1',
        name: 'Information Technology',
        description: 'Manages all technology infrastructure and software development',
        manager: 'John Doe',
        employeeCount: 15,
        budget: 250000,
        status: 'active',
        createdAt: '2023-01-15'
    },
    {
        id: '2',
        name: 'Finance',
        description: 'Handles financial planning, accounting, and budget management',
        manager: 'Jane Smith',
        employeeCount: 8,
        budget: 180000,
        status: 'active',
        createdAt: '2023-02-20'
    },
    {
        id: '3',
        name: 'Human Resources',
        description: 'Manages employee relations, recruitment, and organizational development',
        manager: 'Alice Williams',
        employeeCount: 6,
        budget: 120000,
        status: 'active',
        createdAt: '2023-03-10'
    },
    {
        id: '4',
        name: 'Operations',
        description: 'Oversees daily operations and project management',
        manager: 'Bob Johnson',
        employeeCount: 12,
        budget: 200000,
        status: 'active',
        createdAt: '2023-04-05'
    },
    {
        id: '5',
        name: 'Sales',
        description: 'Drives revenue growth and customer acquisition',
        manager: 'Carol Davis',
        employeeCount: 10,
        budget: 300000,
        status: 'inactive',
        createdAt: '2023-05-12'
    }
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>(mockDepartments);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        manager: '',
        budget: ''
    });

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const filteredDepartments = useMemo(() => {
        return departments.filter(dept => {
            const matchesSearch = dept.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                dept.manager.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                                dept.description.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesStatus = statusFilter === 'All' || dept.status === statusFilter;
            
            let matchesDate = true;
            if (dateFrom) {
                matchesDate = new Date(dept.createdAt) >= new Date(dateFrom);
            }
            if (dateTo) {
                matchesDate = matchesDate && new Date(dept.createdAt) <= new Date(dateTo + 'T23:59:59');
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [departments, debouncedSearch, statusFilter, dateFrom, dateTo]);

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
            toast.success('Departments exported successfully');
        } catch (err) {
            toast.error('Failed to export departments');
        } finally {
            setIsExporting(false);
        }
    }, []);

    const handleCreateDepartment = () => {
        if (!formData.name || !formData.description || !formData.manager || !formData.budget) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newDepartment: Department = {
            id: Date.now().toString(),
            name: formData.name,
            description: formData.description,
            manager: formData.manager,
            employeeCount: 0,
            budget: parseInt(formData.budget),
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0]
        };

        setDepartments(prev => [...prev, newDepartment]);
        setIsCreateDialogOpen(false);
        setFormData({
            name: '',
            description: '',
            manager: '',
            budget: ''
        });
        toast.success('Department created successfully');
    };

    const handleEditDepartment = () => {
        if (!selectedDepartment || !formData.name || !formData.description || !formData.manager || !formData.budget) {
            toast.error('Please fill in all required fields');
            return;
        }

        const updatedDepartment: Department = {
            ...selectedDepartment,
            name: formData.name,
            description: formData.description,
            manager: formData.manager,
            budget: parseInt(formData.budget)
        };

        setDepartments(prev => prev.map(d => d.id === selectedDepartment.id ? updatedDepartment : d));
        setIsEditDialogOpen(false);
        setSelectedDepartment(null);
        setFormData({
            name: '',
            description: '',
            manager: '',
            budget: ''
        });
        toast.success('Department updated successfully');
    };

    const handleEdit = (department: Department) => {
        setSelectedDepartment(department);
        setFormData({
            name: department.name,
            description: department.description,
            manager: department.manager,
            budget: department.budget.toString()
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setDepartments(prev => prev.filter(d => d.id !== id));
        toast.success('Department deleted successfully');
    };

    const formatNumber = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Calculate stats
    const totalDepartments = departments.length;
    const activeDepartments = departments.filter(d => d.status === 'active').length;
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
    const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);

    const activeFilters = [];
    if (search) activeFilters.push(`Search: ${search}`);
    if (statusFilter !== 'All') activeFilters.push(`Status: ${statusFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    const columns: Column<Department>[] = [
        {
            key: 'name' as keyof Department,
            header: 'Department',
            render: (value: any, department: Department) => (
                <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        {department.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        {department.description}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'manager' as keyof Department,
            header: 'Manager',
            render: (value: any) => <span className="text-slate-700 dark:text-slate-300">{value}</span>,
            sortable: true
        },
        {
            key: 'employeeCount' as keyof Department,
            header: 'Employees',
            render: (value: any) => (
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'budget' as keyof Department,
            header: 'Budget',
            render: (value: any) => (
                <span className="font-semibold text-green-600 dark:text-green-400">
                    ${formatNumber(value)}
                </span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof Department,
            header: 'Status',
            render: (value: any) => {
                const statusColors: Record<string, string> = {
                    'active': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
                    'inactive': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value] || ''} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'createdAt' as keyof Department,
            header: 'Created',
            render: (value: any) => (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                    {new Date(value).toLocaleDateString('en-US')}
                </span>
            ),
            sortable: true
        }
    ];

    const actions: Action<Department>[] = [
        {
            label: 'View Details',
            icon: <Eye className="h-4 w-4" />,
            onClick: (item: Department) => {
                toast.info(`Viewing details for: ${item.name}`);
            },
            variant: 'info' as const
        },
        {
            label: 'Edit Department',
            icon: <Edit className="h-4 w-4" />,
            onClick: (item: Department) => handleEdit(item),
            variant: 'default' as const
        },
        {
            label: 'Delete Department',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: (item: Department) => handleDelete(item.id),
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
                        Departments
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage organizational departments and their structure with comprehensive department management tools
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
                        Add Department
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Departments"
                    description="All departments"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {totalDepartments}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Active Departments"
                    description="Currently active"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                        {activeDepartments}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Employees"
                    description="Across all departments"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {totalEmployees}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Total Budget"
                    description="Combined budget"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                        ${formatNumber(totalBudget)}
                    </div>
                </EnhancedCard>
            </div>

            {/* Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Filter departments by status or date range"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input with Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by department name, manager, or description..."
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                    setStatusFilter('All');
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

            {/* Departments Table */}
            <EnhancedCard
                title="Department Directory"
                description={`${filteredDepartments.length} department${filteredDepartments.length !== 1 ? 's' : ''} found`}
                variant="default"
                size="sm"
                stats={{
                    total: filteredDepartments.length,
                    badge: 'Filtered Departments',
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
                    data={filteredDepartments}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    pagination={{
                        currentPage: page,
                        totalPages: Math.ceil(filteredDepartments.length / limit),
                        pageSize: limit,
                        totalItems: filteredDepartments.length,
                        onPageChange: setPage,
                    }}
                    noDataMessage="No departments found matching your search criteria"
                    searchPlaceholder="Search departments..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Department</DialogTitle>
                        <DialogDescription>
                            Create a new department with manager and budget allocation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Department Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Department name"
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description" className="text-slate-700 dark:text-slate-200">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Department description"
                                rows={3}
                                className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="manager" className="text-slate-700 dark:text-slate-200">Manager *</Label>
                                <Input
                                    id="manager"
                                    value={formData.manager}
                                    onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                                    placeholder="Manager name"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="budget" className="text-slate-700 dark:text-slate-200">Annual Budget *</Label>
                                <Input
                                    id="budget"
                                    type="number"
                                    value={formData.budget}
                                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                                    placeholder="Budget amount"
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateDialogOpen(false)}
                                className="border-slate-200 dark:border-slate-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateDepartment}
                                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white"
                            >
                                <Building className="h-4 w-4 mr-2" />
                                Create Department
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Update department information and settings.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDepartment && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="editName" className="text-slate-700 dark:text-slate-200">Department Name *</Label>
                                <Input
                                    id="editName"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editDescription" className="text-slate-700 dark:text-slate-200">Description *</Label>
                                <Textarea
                                    id="editDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editManager" className="text-slate-700 dark:text-slate-200">Manager *</Label>
                                    <Input
                                        id="editManager"
                                        value={formData.manager}
                                        onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                                        className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="editBudget" className="text-slate-700 dark:text-slate-200">Annual Budget *</Label>
                                    <Input
                                        id="editBudget"
                                        type="number"
                                        value={formData.budget}
                                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                                        className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="editStatus" className="text-slate-700 dark:text-slate-200">Status</Label>
                                <Select
                                    value={selectedDepartment.status}
                                    onValueChange={(value) => {
                                        setSelectedDepartment(prev => prev ? { ...prev, status: value as 'active' | 'inactive' } : null);
                                    }}
                                >
                                    <SelectTrigger className="mt-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="active" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Active</SelectItem>
                                        <SelectItem value="inactive" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedDepartment(null);
                                        setFormData({
                                            name: '',
                                            description: '',
                                            manager: '',
                                            budget: ''
                                        });
                                    }}
                                    className="border-slate-200 dark:border-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleEditDepartment}
                                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white"
                                >
                                    <Building className="h-4 w-4 mr-2" />
                                    Update Department
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
