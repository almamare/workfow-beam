'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Plus, Search, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
    actions: string[];
}

const mockPermissions: Permission[] = [
    {
        id: '1',
        name: 'User Management',
        description: 'Add, edit and delete users',
        module: 'Users',
        actions: ['create', 'read', 'update', 'delete']
    },
    {
        id: '2',
        name: 'Project Management',
        description: 'Manage all projects',
        module: 'Projects',
        actions: ['create', 'read', 'update', 'delete']
    },
    {
        id: '3',
        name: 'View Reports',
        description: 'View financial reports',
        module: 'Reports',
        actions: ['read']
    },
    {
        id: '4',
        name: 'Budget Management',
        description: 'Manage project budgets',
        module: 'Financial',
        actions: ['create', 'read', 'update']
    }
];

const modules = ['Users', 'Projects', 'Financial', 'Reports', 'Inventory', 'Contractors'];
const actions = ['create', 'read', 'update', 'delete', 'approve', 'reject'];

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        module: '',
        actions: [] as string[]
    });

    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.module.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        if (!formData.name || !formData.module || formData.actions.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newPermission: Permission = {
            id: Date.now().toString(),
            ...formData
        };

        setPermissions([...permissions, newPermission]);
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '', module: '', actions: [] });
        toast.success('Permission created successfully');
    };

    const handleEdit = (permission: Permission) => {
        setEditingPermission(permission);
        setFormData({
            name: permission.name,
            description: permission.description,
            module: permission.module,
            actions: permission.actions
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingPermission) return;

        const updatedPermissions = permissions.map(p =>
            p.id === editingPermission.id ? { ...editingPermission, ...formData } : p
        );

        setPermissions(updatedPermissions);
        setIsEditDialogOpen(false);
        setEditingPermission(null);
        setFormData({ name: '', description: '', module: '', actions: [] });
        toast.success('Permission updated successfully');
    };

    const handleDelete = (id: string) => {
        setPermissions(permissions.filter(p => p.id !== id));
        toast.success('Permission deleted successfully');
    };

    const handleActionToggle = (action: string) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions.includes(action)
                ? prev.actions.filter(a => a !== action)
                : [...prev.actions, action]
        }));
    };

    const getActionLabel = (action: string) => {
        const labels: { [key: string]: string } = {
            create: 'Create',
            read: 'Read',
            update: 'Update',
            delete: 'Delete',
            approve: 'Approve',
            reject: 'Reject'
        };
        return labels[action] || action;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Permissions Management</h1>
                    <p className="text-muted-foreground">Manage user permissions and modules</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Permission
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Permission</DialogTitle>
                            <DialogDescription>
                                Create a new permission with module and allowed actions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Permission Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., User Management"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of the permission"
                                />
                            </div>
                            <div>
                                <Label htmlFor="module">Module</Label>
                                <select
                                    id="module"
                                    value={formData.module}
                                    onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
                                    className="w-full p-2 border border-input rounded-md bg-background"
                                >
                                    <option value="">Select Module</option>
                                    {modules.map(module => (
                                        <option key={module} value={module}>{module}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Allowed Actions</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {actions.map(action => (
                                        <div key={action} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={action}
                                                checked={formData.actions.includes(action)}
                                                onCheckedChange={() => handleActionToggle(action)}
                                            />
                                            <Label htmlFor={action} className="text-sm">
                                                {getActionLabel(action)}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search permissions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPermissions.map((permission) => (
                    <Card key={permission.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">{permission.name}</CardTitle>
                                </div>
                                <div className="flex space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(permission)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(permission.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>{permission.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Module:</span>
                                    <Badge variant="outline" className="mr-2">
                                        {permission.module}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-muted-foreground">Allowed Actions:</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {permission.actions.map(action => (
                                            <Badge key={action} variant="outline" className="text-xs">
                                                {getActionLabel(action)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Permission</DialogTitle>
                        <DialogDescription>
                            Update permission data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-name">Permission Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-module">Module</Label>
                            <select
                                id="edit-module"
                                value={formData.module}
                                onChange={(e) => setFormData(prev => ({ ...prev, module: e.target.value }))}
                                className="w-full p-2 border border-input rounded-md bg-background"
                            >
                                {modules.map(module => (
                                    <option key={module} value={module}>{module}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Allowed Actions</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {actions.map(action => (
                                    <div key={action} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-${action}`}
                                            checked={formData.actions.includes(action)}
                                            onCheckedChange={() => handleActionToggle(action)}
                                        />
                                        <Label htmlFor={`edit-${action}`} className="text-sm">
                                            {getActionLabel(action)}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}