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
import { Plus, Edit, Eye, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AdvanceRequest {
  id: string;
  employeeName: string;
  department: string;
  amount: number;
  purpose: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
}

const mockAdvanceRequests: AdvanceRequest[] = [
  {
    id: '1',
    employeeName: 'John Doe',
    department: 'IT',
    amount: 5000,
    purpose: 'Business travel expenses',
    requestDate: '2024-01-15',
    status: 'approved',
    approvedBy: 'Jane Smith',
    approvedDate: '2024-01-16',
    notes: 'Approved for conference attendance'
  },
  {
    id: '2',
    employeeName: 'Alice Johnson',
    department: 'Sales',
    amount: 3000,
    purpose: 'Client meeting expenses',
    requestDate: '2024-01-14',
    status: 'pending'
  },
  {
    id: '3',
    employeeName: 'Bob Wilson',
    department: 'Operations',
    amount: 2500,
    purpose: 'Equipment purchase',
    requestDate: '2024-01-13',
    status: 'paid',
    approvedBy: 'Jane Smith',
    approvedDate: '2024-01-14'
  },
  {
    id: '4',
    employeeName: 'Carol Brown',
    department: 'HR',
    amount: 1500,
    purpose: 'Training materials',
    requestDate: '2024-01-12',
    status: 'rejected',
    notes: 'Budget exceeded for this quarter'
  }
];

export default function AdvanceRequestsPage() {
  const [requests, setRequests] = useState<AdvanceRequest[]>(mockAdvanceRequests);
  const [selectedRequest, setSelectedRequest] = useState<AdvanceRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const columns: Column<AdvanceRequest>[] = [
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
      key: 'amount',
      header: 'Amount',
      render: (value) => (
        <div className="font-medium">${value.toLocaleString()}</div>
      ),
      sortable: true
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
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
      render: (value) => {
        const variants = {
          pending: 'secondary',
          approved: 'default',
          rejected: 'destructive',
          paid: 'default'
        } as const;
        
        return (
          <Badge variant={variants[value]}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        );
      },
      sortable: true
    }
  ];

  const actions: Action<AdvanceRequest>[] = [
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
    const newRequest: AdvanceRequest = {
      id: Date.now().toString(),
      employeeName: formData.get('employeeName') as string,
      department: formData.get('department') as string,
      amount: parseFloat(formData.get('amount') as string),
      purpose: formData.get('purpose') as string,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
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
      case 'paid':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: requests.length.toString(),
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      title: 'Pending Approval',
      value: requests.filter(r => r.status === 'pending').length.toString(),
      icon: <Clock className="h-4 w-4" />
    },
    {
      title: 'Approved',
      value: requests.filter(r => r.status === 'approved').length.toString(),
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      title: 'Total Amount',
      value: `$${requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advance Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee advance payment requests
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Advance Request</DialogTitle>
              <DialogDescription>
                Submit a new advance payment request for approval.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateRequest} className="space-y-4">
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
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01"
                  min="0"
                  required 
                />
              </div>
              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Textarea 
                  id="purpose" 
                  name="purpose" 
                  placeholder="Describe the purpose of this advance request..."
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
          <CardTitle>Advance Requests</CardTitle>
          <CardDescription>
            View and manage all advance payment requests
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this advance request
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
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="text-sm font-medium">${selectedRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request Date</Label>
                  <p className="text-sm">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Purpose</Label>
                <p className="text-sm mt-1">{selectedRequest.purpose}</p>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedRequest.status)}
                  <Badge variant={
                    selectedRequest.status === 'pending' ? 'secondary' :
                    selectedRequest.status === 'approved' ? 'default' :
                    selectedRequest.status === 'rejected' ? 'destructive' :
                    'default'
                  }>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
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
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setRequests(prev => prev.map(r => 
                          r.id === selectedRequest.id 
                            ? { ...r, status: 'rejected' as const }
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