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
import { Plus, Edit, Eye, FileText, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface ContractRequest {
  id: string;
  contractorName: string;
  company: string;
  projectName: string;
  contractType: string;
  amount: number;
  duration: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'signed';
  approvedBy?: string;
  approvedDate?: string;
  notes?: string;
  description: string;
}

const mockContractRequests: ContractRequest[] = [
  {
    id: '1',
    contractorName: 'Tech Solutions Inc.',
    company: 'TechCorp',
    projectName: 'Website Development',
    contractType: 'Service Agreement',
    amount: 50000,
    duration: '6 months',
    requestDate: '2024-01-15',
    status: 'approved',
    approvedBy: 'Jane Smith',
    approvedDate: '2024-01-16',
    notes: 'Approved for Q1 project delivery',
    description: 'Full-stack web development services for corporate website redesign'
  },
  {
    id: '2',
    contractorName: 'Design Studio LLC',
    company: 'CreativeWorks',
    projectName: 'Brand Identity',
    contractType: 'Creative Services',
    amount: 25000,
    duration: '3 months',
    requestDate: '2024-01-14',
    status: 'pending',
    description: 'Complete brand identity package including logo, guidelines, and marketing materials'
  },
  {
    id: '3',
    contractorName: 'Security Experts',
    company: 'SecureTech',
    projectName: 'Security Audit',
    contractType: 'Consulting Agreement',
    amount: 15000,
    duration: '1 month',
    requestDate: '2024-01-13',
    status: 'signed',
    approvedBy: 'Jane Smith',
    approvedDate: '2024-01-14',
    description: 'Comprehensive security assessment and penetration testing'
  },
  {
    id: '4',
    contractorName: 'Marketing Pro',
    company: 'AdAgency',
    projectName: 'Digital Campaign',
    contractType: 'Marketing Agreement',
    amount: 35000,
    duration: '4 months',
    requestDate: '2024-01-12',
    status: 'rejected',
    notes: 'Budget constraints for this quarter',
    description: 'Multi-channel digital marketing campaign for product launch'
  }
];

export default function ContractRequestsPage() {
  const [requests, setRequests] = useState<ContractRequest[]>(mockContractRequests);
  const [selectedRequest, setSelectedRequest] = useState<ContractRequest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const columns: Column<ContractRequest>[] = [
    {
      key: 'contractorName',
      header: 'Contractor',
      render: (_, request) => (
        <div>
          <div className="font-medium">{request.contractorName}</div>
          <div className="text-sm text-muted-foreground">{request.company}</div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'projectName',
      header: 'Project',
      render: (_, request) => (
        <div>
          <div className="font-medium">{request.projectName}</div>
          <div className="text-sm text-muted-foreground">{request.contractType}</div>
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
      key: 'duration',
      header: 'Duration',
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
      render: (value) => {
        const variants = {
          pending: 'secondary',
          approved: 'default',
          rejected: 'destructive',
          signed: 'default'
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

  const actions: Action<ContractRequest>[] = [
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
    const newRequest: ContractRequest = {
      id: Date.now().toString(),
      contractorName: formData.get('contractorName') as string,
      company: formData.get('company') as string,
      projectName: formData.get('projectName') as string,
      contractType: formData.get('contractType') as string,
      amount: parseFloat(formData.get('amount') as string),
      duration: formData.get('duration') as string,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      description: formData.get('description') as string
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
      case 'signed':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: requests.length.toString(),
      icon: <FileText className="h-4 w-4" />
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
      title: 'Total Value',
      value: `$${requests.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`,
      icon: <DollarSign className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contract Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage contractor agreements and service contracts
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Contract Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Contract Request</DialogTitle>
              <DialogDescription>
                Submit a new contract request for approval and processing.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractorName">Contractor Name</Label>
                  <Input id="contractorName" name="contractorName" required />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" required />
                </div>
              </div>
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" name="projectName" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select name="contractType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contract type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Service Agreement">Service Agreement</SelectItem>
                      <SelectItem value="Creative Services">Creative Services</SelectItem>
                      <SelectItem value="Consulting Agreement">Consulting Agreement</SelectItem>
                      <SelectItem value="Marketing Agreement">Marketing Agreement</SelectItem>
                      <SelectItem value="Development Contract">Development Contract</SelectItem>
                      <SelectItem value="Maintenance Contract">Maintenance Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    placeholder="e.g., 3 months, 1 year"
                    required 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="amount">Contract Amount ($)</Label>
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
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Describe the scope of work and deliverables..."
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
          <CardTitle>Contract Requests</CardTitle>
          <CardDescription>
            View and manage all contract requests and agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests}
            columns={columns}
            actions={actions}
            searchPlaceholder="Search contract requests..."
          />
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Contract Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this contract request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contractor</Label>
                  <p className="text-sm font-medium">{selectedRequest.contractorName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                  <p className="text-sm">{selectedRequest.company}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                  <p className="text-sm font-medium">{selectedRequest.projectName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contract Type</Label>
                  <p className="text-sm">{selectedRequest.contractType}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="text-sm font-medium">${selectedRequest.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-sm">{selectedRequest.duration}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request Date</Label>
                  <p className="text-sm">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedRequest.description}</p>
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
                {selectedRequest.status === 'approved' && (
                  <Button 
                    onClick={() => {
                      setRequests(prev => prev.map(r => 
                        r.id === selectedRequest.id 
                          ? { ...r, status: 'signed' as const }
                          : r
                      ));
                      setIsViewDialogOpen(false);
                      setSelectedRequest(null);
                    }}
                  >
                    Mark as Signed
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}