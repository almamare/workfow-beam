'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Mail, Phone } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    role: 'Administrator',
    department: 'IT',
    status: 'active',
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 (555) 234-5678',
    role: 'Finance Manager',
    department: 'Finance',
    status: 'active',
    joinDate: '2023-02-20'
  },
  {
    id: '3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@company.com',
    phone: '+1 (555) 345-6789',
    role: 'Project Manager',
    department: 'Operations',
    status: 'active',
    joinDate: '2023-03-10'
  },
  {
    id: '4',
    firstName: 'Alice',
    lastName: 'Williams',
    email: 'alice.williams@company.com',
    phone: '+1 (555) 456-7890',
    role: 'HR Specialist',
    department: 'Human Resources',
    status: 'inactive',
    joinDate: '2023-04-05'
  }
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const columns: Column<User>[] = [
    {
      key: 'firstName',
      header: 'Name',
      render: (_, user) => (
        <div>
          <div className="font-medium">{user.firstName} {user.lastName}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {user.email}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (_, user) => (
        <div className="text-sm flex items-center gap-1">
          <Phone className="h-3 w-3" />
          {user.phone}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      ),
      sortable: true
    },
    {
      key: 'department',
      header: 'Department',
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
      key: 'joinDate',
      header: 'Join Date',
      render: (value) => new Date(value).toLocaleDateString(),
      sortable: true
    }
  ];

  const actions: Action<User>[] = [
    {
      label: 'Edit',
      onClick: (user) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (user) => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
      },
      icon: <Trash2 className="h-4 w-4" />
    }
  ];

  const handleCreateUser = (formData: FormData) => {
    const newUser: User = {
      id: Date.now().toString(),
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsCreateDialogOpen(false);
  };

  const handleEditUser = (formData: FormData) => {
    if (!selectedUser) return;
    
    const updatedUser: User = {
      ...selectedUser,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
      department: formData.get('department') as string,
      status: formData.get('status') as 'active' | 'inactive'
    };
    
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role and department assignment.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="HR Specialist">HR Specialist</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select name="department" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all user accounts in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search users..."
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form action={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input 
                    id="editFirstName" 
                    name="firstName" 
                    defaultValue={selectedUser.firstName}
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input 
                    id="editLastName" 
                    name="lastName" 
                    defaultValue={selectedUser.lastName}
                    required 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input 
                  id="editEmail" 
                  name="email" 
                  type="email" 
                  defaultValue={selectedUser.email}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input 
                  id="editPhone" 
                  name="phone" 
                  type="tel" 
                  defaultValue={selectedUser.phone}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="editRole">Role</Label>
                <Select name="role" defaultValue={selectedUser.role} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrator">Administrator</SelectItem>
                    <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="HR Specialist">HR Specialist</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDepartment">Department</Label>
                <Select name="department" defaultValue={selectedUser.department} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select name="status" defaultValue={selectedUser.status} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}