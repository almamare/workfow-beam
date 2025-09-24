'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Shield, Users, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'name' as keyof Role,
      header: 'Role Name',
      render: (value: any, role: Role) => (
        <div>
          <div className="font-semibold text-slate-800 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {role.name}
          </div>
          <div className="text-sm text-slate-600">
            {role.description}
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'permissions' as keyof Role,
      header: 'Permissions',
      render: (value: any, role: Role) => (
        <div className="flex flex-wrap gap-1">
          {role.permissions.slice(0, 3).map(permission => (
            <Badge key={permission} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {availablePermissions.find(p => p.id === permission)?.name || permission}
            </Badge>
          ))}
          {role.permissions.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
              +{role.permissions.length - 3} more
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'userCount' as keyof Role,
      header: 'Users',
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-slate-500" />
          <span className="font-semibold text-slate-800">{value}</span>
        </div>
      ),
      sortable: true
    },
    {
      key: 'isActive' as keyof Role,
      header: 'Status',
      render: (value: any) => (
        <Badge 
          variant="outline" 
          className={`font-medium ${
            value 
              ? 'bg-green-100 text-green-700 border-green-200' 
              : 'bg-red-100 text-red-700 border-red-200'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
      sortable: true
    },
    {
      key: 'createdAt' as keyof Role,
      header: 'Created',
      render: (value: any) => <span className="text-slate-500 text-sm">{new Date(value).toLocaleDateString()}</span>,
      sortable: true
    }
  ];

  const actions = [
    {
      label: 'Edit Role',
      onClick: (role: Role) => {
        setSelectedRole(role);
        setSelectedPermissions(role.permissions);
        setIsEditDialogOpen(true);
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: 'Delete Role',
      onClick: (role: Role) => {
        setRoles(prev => prev.filter(r => r.id !== role.id));
        toast.success('Role deleted successfully');
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const
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
    toast.success('Role created successfully');
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
    toast.success('Role updated successfully');
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
      label: 'Total Roles',
      value: roles.length,
      change: '+3%',
      trend: 'up' as const
    },
    {
      label: 'Active Roles',
      value: roles.filter(r => r.isActive).length,
      change: '+1%',
      trend: 'up' as const
    },
    {
      label: 'Total Users',
      value: roles.reduce((sum, role) => sum + role.userCount, 0),
      change: '+8%',
      trend: 'up' as const
    },
    {
      label: 'Avg. Permissions',
      value: Math.round(roles.reduce((sum, role) => sum + role.permissions.length, 0) / roles.length),
      change: '+2',
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
        title="Roles & Permissions"
        description="Manage system roles and permissions with comprehensive access control and security management"
        stats={stats}
        actions={{
          primary: {
            label: 'Create Role',
            onClick: () => setIsCreateDialogOpen(true),
            icon: <Plus className="h-4 w-4" />
          },
          secondary: [
            {
              label: 'Export Roles',
              onClick: () => toast.info('Export feature coming soon'),
              icon: <Download className="h-4 w-4" />
            },
            {
              label: 'Permission Matrix',
              onClick: () => toast.info('Permission matrix coming soon'),
              icon: <Filter className="h-4 w-4" />
            }
          ]
        }}
      />

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Search by role name or description..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filterOptions}
        activeFilters={activeFilters}
        onClearFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
        }}
      />

      {/* Roles Table */}
      <EnhancedCard
        title="Role Management"
        description={`${filteredRoles.length} roles in the system`}
        variant="gradient"
        size="lg"
        stats={{
          total: roles.length,
          badge: 'Active Roles',
          badgeColor: 'success'
        }}
      >
        <EnhancedDataTable
          data={filteredRoles}
          columns={columns}
          actions={actions}
          loading={false}
          noDataMessage="No roles found matching your criteria"
          searchPlaceholder="Search roles..."
        />
      </EnhancedCard>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              <Input id="name" name="name" placeholder="Enter role name" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the role's purpose and responsibilities"
                required 
                className="mt-1"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto custom-scrollbar">
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
                      <p className="text-xs text-slate-600">
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
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                setSelectedPermissions([]);
              }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                Create Role
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Textarea 
                  id="editDescription" 
                  name="description" 
                  defaultValue={selectedRole.description}
                  required 
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto custom-scrollbar">
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
                        <p className="text-xs text-slate-600">
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
              <div className="flex justify-end gap-2 pt-4">
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
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Update Role
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}