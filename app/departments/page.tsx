'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Users, Building, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const filteredDepartments = departments.filter(dept => {
        const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            dept.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const columns = [
        {
            key: 'name' as keyof Department,
            header: 'Department',
            render: (value: any, department: Department) => (
                <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {department.name}
                    </div>
                    <div className="text-sm text-slate-600">
                        {department.description}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            key: 'manager' as keyof Department,
            header: 'Manager',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'employeeCount' as keyof Department,
            header: 'Employees',
            render: (value: any) => (
                <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-slate-500" />
                    <span className="font-semibold text-slate-800">{value}</span>
                </div>
            ),
            sortable: true
        },
        {
            key: 'budget' as keyof Department,
            header: 'Budget',
            render: (value: any) => (
                <span className="font-semibold text-green-600">
                    ${value.toLocaleString()}
                </span>
            ),
            sortable: true
        },
        {
            key: 'status' as keyof Department,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'active': 'bg-green-100 text-green-700 border-green-200',
                    'inactive': 'bg-red-100 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors]} font-medium`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'createdAt' as keyof Department,
            header: 'Created',
            render: (value: any) => <span className="text-slate-500 text-sm">{new Date(value).toLocaleDateString()}</span>,
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'Edit Department',
            onClick: (department: Department) => {
                setSelectedDepartment(department);
                setIsEditDialogOpen(true);
            },
            icon: <Edit className="h-4 w-4" />
        },
        {
            label: 'Delete Department',
            onClick: (department: Department) => {
                setDepartments(prev => prev.filter(d => d.id !== department.id));
                toast.success('Department deleted successfully');
            },
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive' as const
        }
    ];

    const handleCreateDepartment = (formData: FormData) => {
        const newDepartment: Department = {
            id: Date.now().toString(),
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            manager: formData.get('manager') as string,
            employeeCount: 0,
            budget: parseInt(formData.get('budget') as string),
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0]
        };

        setDepartments(prev => [...prev, newDepartment]);
        setIsCreateDialogOpen(false);
        toast.success('Department created successfully');
    };

    const handleEditDepartment = (formData: FormData) => {
        if (!selectedDepartment) return;

        const updatedDepartment: Department = {
            ...selectedDepartment,
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            manager: formData.get('manager') as string,
            budget: parseInt(formData.get('budget') as string),
            status: formData.get('status') as 'active' | 'inactive'
        };

        setDepartments(prev => prev.map(d => d.id === selectedDepartment.id ? updatedDepartment : d));
        setIsEditDialogOpen(false);
        setSelectedDepartment(null);
        toast.success('Department updated successfully');
    };

    const stats = [
        {
            label: 'Total Departments',
            value: departments.length,
            change: '+2%',
            trend: 'up' as const
        },
        {
            label: 'Active Departments',
            value: departments.filter(d => d.status === 'active').length,
            change: '+1%',
            trend: 'up' as const
        },
        {
            label: 'Total Employees',
            value: departments.reduce((sum, dept) => sum + dept.employeeCount, 0),
            change: '+5%',
            trend: 'up' as const
        },
        {
            label: 'Total Budget',
            value: `$${(departments.reduce((sum, dept) => sum + dept.budget, 0) / 1000000).toFixed(1)}M`,
            change: '+8%',
            trend: 'up' as const
        }
    ];

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'active', label: 'Active', value: 'active' },
                { key: 'inactive', label: 'Inactive', value: 'inactive' }
            ],
            onValueChange: setStatusFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Departments"
                description="Manage organizational departments and their structure with comprehensive department management tools"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Add Department',
                        onClick: () => setIsCreateDialogOpen(true),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Export Data',
                            onClick: () => toast.info('Export feature coming soon'),
                            icon: <Download className="h-4 w-4" />
                        },
                        {
                            label: 'Department Report',
                            onClick: () => toast.info('Department report coming soon'),
                            icon: <Filter className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by department name, manager, or description..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                }}
            />

            {/* Departments Table */}
            <EnhancedCard
                title="Department Directory"
                description={`${filteredDepartments.length} departments in the organization`}
                variant="gradient"
                size="lg"
                stats={{
                    total: departments.length,
                    badge: 'Active Departments',
                    badgeColor: 'success'
                }}
            >
                <EnhancedDataTable
                    data={filteredDepartments}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No departments found matching your criteria"
                    searchPlaceholder="Search departments..."
                />
            </EnhancedCard>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Department</DialogTitle>
                        <DialogDescription>
                            Create a new department with manager and budget allocation.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleCreateDepartment} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Department Name</Label>
                            <Input id="name" name="name" required className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" required className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="manager">Manager</Label>
                            <Input id="manager" name="manager" required className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="budget">Annual Budget</Label>
                            <Input id="budget" name="budget" type="number" required className="mt-1" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                Create Department
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Department</DialogTitle>
                        <DialogDescription>
                            Update department information and settings.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedDepartment && (
                        <form action={handleEditDepartment} className="space-y-4">
                            <div>
                                <Label htmlFor="editName">Department Name</Label>
                                <Input
                                    id="editName"
                                    name="name"
                                    defaultValue={selectedDepartment.name}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editDescription">Description</Label>
                                <Input
                                    id="editDescription"
                                    name="description"
                                    defaultValue={selectedDepartment.description}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editManager">Manager</Label>
                                <Input
                                    id="editManager"
                                    name="manager"
                                    defaultValue={selectedDepartment.manager}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editBudget">Annual Budget</Label>
                                <Input
                                    id="editBudget"
                                    name="budget"
                                    type="number"
                                    defaultValue={selectedDepartment.budget}
                                    required
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="editStatus">Status</Label>
                                <select
                                    id="editStatus"
                                    name="status"
                                    defaultValue={selectedDepartment.status}
                                    className="w-full p-2 border rounded-md mt-1"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setSelectedDepartment(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                                    Update Department
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}