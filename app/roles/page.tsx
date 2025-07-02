'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column, Action } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['user_management', 'financial_management', 'project_management', 'inventory_management', 'audit_logs'],
    userCount: 3,
    isActive: true,
    createdAt: '2023-01-15'
  },
  {
    id: '2',
    name: 'Finance Manager',
    description: 'Access to financial modules and reporting',
    permissions: ['financial_management', 'contractor_payments', 'budget_management'],
    userCount: 5,
    isActive: true,
    createdAt: '2023-02-20'
  },
  {
    id: '3',
    name: 'Project Manager',
    description: 'Manage projects, tasks, and team assignments',
    permissions: ['project_management', 'task_management', 'team_management'],
    userCount: 8,
    isActive: true,
    createdAt: '2023-03-10'
  },
  {
    id: '4',
    name: 'HR Specialist',
    description: 'Human resources and employee management',
    permissions: ['user_management', 'department_management', 'permission_requests'],
    userCount: 2,
    isActive: true,
    createdAt: '2023-04-05'
  },
  {
    id: '5',
    name: 'Inventory Manager',
    description: 'Manage inventory items and transactions',
    permissions: ['inventory_management', 'item_management'],
    userCount: 4,
    isActive: false,
    createdAt: '2023-05-12'
  }
];

const availablePermissions = [
  { id: 'user_management', name: 'User Management', description: 'Create, edit, and manage user accounts' },
  { id: 'financial_management', name: 'Financial Management', description: 'Access to financial data and reports' },
  { id: 'project_management', name: 'Project Management', description: 'Create and manage projects' },
  { id: 'inventory_management', name: 'Inventory Management', description: 'Manage inventory items and stock' },
  { id: 'contractor_payments', name: 'Contractor Payments', description: 'Process contractor payments' },
  { id: 'budget_management', name: 'Budget Management', description: 'Manage project budgets' },
  { id: 'task_management', name: 'Task Management', description: 'Create and assign tasks' },
  { id: 'team_management', name: 'Team Management', description: 'Manage team assignments' },
  { id: 'department_management', name: 'Department Management', description: 'Manage departments' },
  { id: 'permission_requests', name: 'Permission Requests', description: 'Handle permission requests' },
  { id: 'item_management', name: 'Item Management', description: 'Manage inventory items' },
  { id: 'audit_logs', name: 'Audit Logs', description: 'View system audit logs' }
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const columns: Column<Role>[] = [
    {
      key: 'name',
      header: 'Role Name',
      render: (_, role) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {role.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {role.description}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (_, role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map(permission => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {availablePermissions.find(p => p.id === permission)?.name || permission}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{role.permissions.length - 3} more
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'userCount',
      header: 'Users',
      render: (_, role) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {role.userCount}
        </div>
      ),
      sortable: true
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (_, role) => (
        <Badge variant={role.isActive ? 'default' : 'secondary'}>
          {role.isActive ? 'Active' : 'Inactive'}
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

  const actions: Action<Role>[] = [
    {
      label: 'Edit',
      onClick: (role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions);
        setIsEditDialogOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete',
      onClick: (role) => {
        setRoles(prev => prev.filter(r => r.id !== role.id));
      },
      icon: <Trash2 className="h-4 w-4" />
    }
  ];

  const handleCreateRole = (formData: FormData) => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      permissions: selectedPermissions,
      userCount: 0,
      isActive: formData.get('isActive') === 'on',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setRoles(prev => [...prev, newRole]);
    setIsCreateDialogOpen(false);
    setSelectedPermissions([]);
  };

  const handleEditRole = (formData: FormData) => {
    if (!selectedRole) return;
    
    const updatedRole: Role = {
      ...selectedRole,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      permissions: selectedPermissions,
      isActive: formData.get('isActive') === 'on'
    };
    
    setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
    setIsEditDialogOpen(false);
    setSelectedRole(null);
    setSelectedPermissions([]);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const stats = [
    {
      title: 'Total Roles',
      value: roles.length.toString(),
      description: 'System roles',
      icon: Shield
    },
    {
      title: 'Active Roles',
      value: roles.filter(r => r.isActive).length.toString(),
      description: 'Currently active',
      icon: Shield
    },
    {
      title: 'Total Users',
      value: roles.reduce((sum, role) => sum + role.userCount, 0).toString(),
      description: 'Assigned users',
      icon: Users
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles</h1>
          <p className="text-muted-foreground mt-1">
            Manage system roles and permissions
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions and access levels.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateRole} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" name="name" placeholder="Enter role name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe the role's purpose and responsibilities"
                  required 
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Switch
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={permission.id} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" name="isActive" defaultChecked />
                <Label htmlFor="isActive">Active Role</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setSelectedPermissions([]);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Create Role</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            View and manage all system roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={roles}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search roles..."
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <form action={handleEditRole} className="space-y-4">
              <div>
                <Label htmlFor="editName">Role Name</Label>
                <Input 
                  id="editName" 
                  name="name" 
                  defaultValue={selectedRole.name}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea 
                  id="editDescription" 
                  name="description" 
                  defaultValue={selectedRole.description}
                  required 
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto">
                  {availablePermissions.map(permission => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Switch
                        id={`edit-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="editIsActive" 
                  name="isActive" 
                  defaultChecked={selectedRole.isActive}
                />
                <Label htmlFor="editIsActive">Active Role</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Role</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}