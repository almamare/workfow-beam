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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Eye, Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface PermissionRequest {
  id: string;
  employeeName: string;
  department: string;
  requestType: 'system_access' | 'role_change' | 'special_permission' | 'temporary_access';
  currentRole: string;
  requestedPermission: string;
  justification: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const mockPermissionRequests: PermissionRequest[] = [
  {
    id: '1',
    employeeName: 'Sarah Johnson',
    department: 'Finance',
    requestType: 'system_access',
    currentRole: 'Finance Analyst',
    requestedPermission: 'Budget Management System Access',
    justification: 'Need access to create quarterly budget reports for upcoming board meeting',
    requestDate: '2024-01-15',
    status: 'pending',
    urgency: 'high'
  },
  {
    id: '2',
    employeeName: 'Mike Chen',
    department: 'IT',
    requestType: 'role_change',
    currentRole: 'Junior Developer',
    requestedPermission: 'Senior Developer Role',
    justification: 'Promotion approved by manager, need elevated system permissions',
    requestDate: '2024-01-14',
    status: 'approved',
    approvedBy: 'John Doe',
    approvedDate: '2024-01-15',
    urgency: 'medium'
  },
  {
    id: '3',
    employeeName: 'Lisa Wang',
    department: 'HR',
    requestType: 'temporary_access',
    currentRole: 'HR Specialist',
    requestedPermission: 'Payroll System - 30 days',
    justification: 'Covering for payroll manager during medical leave',
    requestDate: '2024-01-13',
    status: 'under_review',
    urgency: 'critical'
  },
  {
    id: '4',
    employeeName: 'David Brown',
    department: 'Sales',
    requestType: 'special_permission',
    currentRole: 'Sales Representative',
    requestedPermission: 'Client Database Export Rights',
    justification: 'Need to prepare comprehensive client list for trade show',
    requestDate: '2024-01-12',
    status: 'rejected',
    notes: 'Request denied due to data security policy violations',
    urgency: 'low'
  },
  {
    id: '5',
    employeeName: 'Emma Davis',
    department: 'Operations',
    requestType: 'system_access',
    currentRole: 'Operations Coordinator',
    requestedPermission: 'Inventory Management System',
    justification: 'Taking over inventory responsibilities from departing colleague',
    requestDate: '2024-01-11',
    status: 'approved',
    approvedBy: 'Jane Smith',
    approvedDate: '2024-01-12',
    urgency: 'medium'
  }
];

export default function PermissionRequestsPage() {
  const [requests, setRequests] = useState<PermissionRequest[]>(mockPermissionRequests);
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const columns: Column<PermissionRequest>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      render: (_, request) => (
        <div>
          <div className="font-medium">{request.employeeName}</div>
          <div className="text-sm text-muted-foreground">{request.department}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'requestType',
      header: 'Request Type',
      render: (value) => {
        const typeLabels = {
          system_access: 'System Access',
          role_change: 'Role Change',
          special_permission: 'Special Permission',
          temporary_access: 'Temporary Access'
        };
        return (
          <Badge variant="outline">
            {typeLabels[value as keyof typeof typeLabels]}
          </Badge>
        );
      },
      sortable: true
    },
    {
      key: 'requestedPermission',
      header: 'Requested Permission',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'urgency',
      header: 'Urgency',
      render: (value) => {
        const urgencyColors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          critical: 'bg-red-100 text-red-800'
        };
        return (
          <Badge className={urgencyColors[value as keyof typeof urgencyColors]}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
      sortable: true
    },
    {
      key: 'requestDate',
      header: 'Request Date',
      render: (value) => new Date(value).toLocaleDateString(),
      sortable: true
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: PermissionRequest['status']) => {
        const variants = {
          pending: 'secondary',
          approved: 'default',
          rejected: 'destructive',
          under_review: 'outline'
        } as const;
        
        return (
          <Badge variant={variants[value]}>
            {value.replace('_', ' ').charAt(0).toUpperCase() + value.replace('_', ' ').slice(1)}
          </Badge>
        );
      },
      sortable: true
    }
  ];

  const actions: Action<PermissionRequest>[] = [
    {
      label: 'View Details',
      onClick: (request) => {
        setSelectedRequest(request);
        setIsViewDialogOpen(true);
      },
      icon: <Eye className="h-4 w-4" />
    }
  ];

  const handleCreateRequest = (formData: FormData) => {
    const newRequest: PermissionRequest = {
      id: Date.now().toString(),
      employeeName: formData.get('employeeName') as string,
      department: formData.get('department') as string,
      requestType: formData.get('requestType') as PermissionRequest['requestType'],
      currentRole: formData.get('currentRole') as string,
      requestedPermission: formData.get('requestedPermission') as string,
      justification: formData.get('justification') as string,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      urgency: formData.get('urgency') as PermissionRequest['urgency']
    };
    
    setRequests(prev => [...prev, newRequest]);
    setIsCreateDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: requests.length.toString(),
      icon: <Shield className="h-4 w-4" />
    },
    {
      title: 'Pending Review',
      value: requests.filter(r => r.status === 'pending' || r.status === 'under_review').length.toString(),
      icon: <Clock className="h-4 w-4" />
    },
    {
      title: 'Approved',
      value: requests.filter(r => r.status === 'approved').length.toString(),
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      title: 'Critical Urgency',
      value: requests.filter(r => r.urgency === 'critical').length.toString(),
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permission Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage system access and permission requests
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Permission Request</DialogTitle>
              <DialogDescription>
                Submit a new permission or access request for approval.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input id="employeeName" name="employeeName" required />
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requestType">Request Type</Label>
                  <Select name="requestType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select request type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system_access">System Access</SelectItem>
                      <SelectItem value="role_change">Role Change</SelectItem>
                      <SelectItem value="special_permission">Special Permission</SelectItem>
                      <SelectItem value="temporary_access">Temporary Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select name="urgency" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="currentRole">Current Role</Label>
                <Input id="currentRole" name="currentRole" required />
              </div>

              <div>
                <Label htmlFor="requestedPermission">Requested Permission/Access</Label>
                <Input 
                  id="requestedPermission" 
                  name="requestedPermission" 
                  placeholder="Describe the specific permission or access needed"
                  required 
                />
              </div>

              <div>
                <Label htmlFor="justification">Business Justification</Label>
                <Textarea 
                  id="justification" 
                  name="justification" 
                  placeholder="Explain why this permission is needed and how it will be used..."
                  required 
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Requests</CardTitle>
          <CardDescription>
            View and manage all permission and access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search requests..."
          />
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Permission Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this permission request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Employee</Label>
                  <p className="text-sm font-medium">{selectedRequest.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                  <p className="text-sm">{selectedRequest.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Current Role</Label>
                  <p className="text-sm">{selectedRequest.currentRole}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request Date</Label>
                  <p className="text-sm">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request Type</Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {selectedRequest.requestType.replace('_', ' ').charAt(0).toUpperCase() + selectedRequest.requestType.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Urgency Level</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getUrgencyIcon(selectedRequest.urgency)}
                    <Badge className={
                      selectedRequest.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                      selectedRequest.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedRequest.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Requested Permission/Access</Label>
                <p className="text-sm mt-1 font-medium">{selectedRequest.requestedPermission}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Business Justification</Label>
                <p className="text-sm mt-1">{selectedRequest.justification}</p>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedRequest.status)}
                  <Badge variant={
                    selectedRequest.status === 'pending' ? 'secondary' :
                    selectedRequest.status === 'approved' ? 'default' :
                    selectedRequest.status === 'rejected' ? 'destructive' :
                    'outline'
                  }>
                    {selectedRequest.status.replace('_', ' ').charAt(0).toUpperCase() + selectedRequest.status.replace('_', ' ').slice(1)}
                  </Badge>
                </div>
              </div>

              {selectedRequest.approvedBy && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Approved By</Label>
                    <p className="text-sm">{selectedRequest.approvedBy}</p>
                  </div>
                  {selectedRequest.approvedDate && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Approved Date</Label>
                      <p className="text-sm">{new Date(selectedRequest.approvedDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setSelectedRequest(null);
                  }}
                >
                  Close
                </Button>
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'under_review') && (
                  <>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setRequests(prev => prev.map(r => 
                          r.id === selectedRequest.id 
                            ? { ...r, status: 'rejected' as const, notes: 'Request denied by administrator' }
                            : r
                        ));
                        setIsViewDialogOpen(false);
                        setSelectedRequest(null);
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => {
                        setRequests(prev => prev.map(r => 
                          r.id === selectedRequest.id 
                            ? { 
                                ...r, 
                                status: 'approved' as const,
                                approvedBy: 'Current User',
                                approvedDate: new Date().toISOString().split('T')[0]
                              }
                            : r
                        ));
                        setIsViewDialogOpen(false);
                        setSelectedRequest(null);
                      }}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}