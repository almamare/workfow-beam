'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Users, Building } from 'lucide-react';

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
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Department',
      render: (_, department) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <Building className="h-4 w-4" />
            {department.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {department.description}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'manager',
      header: 'Manager',
      sortable: true
    },
    {
      key: 'employeeCount',
      header: 'Employees',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {value}
        </div>
      ),
      sortable: true
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (value) => `$${value.toLocaleString()}`,
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge variant={value === 'active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  const actions: Action<Department>[] = [
    {
      label: 'Edit',
      onClick: (department) => {
        setSelectedDepartment(department);
        setIsEditDialogOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (department) => {
        setDepartments(prev => prev.filter(d => d.id !== department.id));
      },
      icon: <Trash2 className="h-4 w-4" />
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-muted-foreground mt-1">
            Manage organizational departments and their structure
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
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
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" required />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Input id="manager" name="manager" required />
              </div>
              <div>
                <Label htmlFor="budget">Annual Budget</Label>
                <Input id="budget" name="budget" type="number" required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Department</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              {departments.filter(d => d.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${departments.reduce((sum, dept) => sum + dept.budget, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual allocation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Department Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(departments.reduce((sum, dept) => sum + dept.employeeCount, 0) / departments.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Employees per department
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Management</CardTitle>
          <CardDescription>
            View and manage all organizational departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={departments}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search departments..."
          />
        </CardContent>
      </Card>

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
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input 
                  id="editDescription" 
                  name="description" 
                  defaultValue={selectedDepartment.description}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="editManager">Manager</Label>
                <Input 
                  id="editManager" 
                  name="manager" 
                  defaultValue={selectedDepartment.manager}
                  required 
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
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <select 
                  id="editStatus" 
                  name="status" 
                  defaultValue={selectedDepartment.status}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
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
                <Button type="submit">Update Department</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}