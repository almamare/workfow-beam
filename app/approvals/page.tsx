'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, Eye, Check, X, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Approval {
    id: string;
    requestId: string;
    requestType: string;
    title: string;
    description: string;
    requester: string;
    status: 'pending' | 'approved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    approvedAt?: string;
    approver?: string;
    comments?: string;
}

const mockApprovals: Approval[] = [
    {
        id: '1',
        requestId: 'REQ-001',
        requestType: 'Financial Request',
        title: 'Purchase Building Materials',
        description: 'Request to purchase building materials for new construction project',
        requester: 'Ahmed Mohamed',
        status: 'pending',
        priority: 'high',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        requestId: 'REQ-002',
        requestType: 'Leave Request',
        title: 'Annual Leave Request',
        description: 'Request for annual leave for 15 days',
        requester: 'Sara Ahmed',
        status: 'approved',
        priority: 'medium',
        createdAt: '2024-01-14',
        approvedAt: '2024-01-15',
        approver: 'Mohamed Ali',
        comments: 'Request approved'
    },
    {
        id: '3',
        requestId: 'REQ-003',
        requestType: 'Purchase Request',
        title: 'Equipment Purchase',
        description: 'Request to purchase new equipment for the project',
        requester: 'Khalid Hassan',
        status: 'rejected',
        priority: 'low',
        createdAt: '2024-01-13',
        approvedAt: '2024-01-14',
        approver: 'Fatima Mohamed',
        comments: 'Budget not available at the moment'
    }
];

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
};

const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800'
};

export default function ApprovalsPage() {
    const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [actionComments, setActionComments] = useState('');

    const filteredApprovals = approvals.filter(approval => {
        const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            approval.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            approval.requestId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || approval.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const handleApprove = (id: string) => {
        setApprovals(prev => prev.map(approval => 
            approval.id === id 
                ? { 
                    ...approval, 
                    status: 'approved' as const,
                    approvedAt: new Date().toISOString().split('T')[0],
                    approver: 'General Manager',
                    comments: actionComments
                  }
                : approval
        ));
        setActionComments('');
        toast.success('Request approved successfully');
    };

    const handleReject = (id: string) => {
        if (!actionComments.trim()) {
            toast.error('Please add a comment to reject the request');
            return;
        }
        
        setApprovals(prev => prev.map(approval => 
            approval.id === id 
                ? { 
                    ...approval, 
                    status: 'rejected' as const,
                    approvedAt: new Date().toISOString().split('T')[0],
                    approver: 'General Manager',
                    comments: actionComments
                  }
                : approval
        ));
        setActionComments('');
        toast.success('Request rejected');
    };

    const openDetails = (approval: Approval) => {
        setSelectedApproval(approval);
        setIsDetailsDialogOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'approved':
                return <Check className="h-4 w-4" />;
            case 'rejected':
                return <X className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Approvals Management</h1>
                    <p className="text-muted-foreground">Review and approve various requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search approvals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Approval Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Approvals Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Approvals List
                    </CardTitle>
                    <CardDescription>
                        {filteredApprovals.length} approvals out of {approvals.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Request Type</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Requester</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredApprovals.map((approval) => (
                                    <TableRow key={approval.id}>
                                        <TableCell className="font-medium">{approval.requestId}</TableCell>
                                        <TableCell>{approval.requestType}</TableCell>
                                        <TableCell className="max-w-xs truncate">{approval.title}</TableCell>
                                        <TableCell>{approval.requester}</TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[approval.status]} flex items-center gap-1 w-fit`}>
                                                {getStatusIcon(approval.status)}
                                                {statusLabels[approval.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${priorityColors[approval.priority]} w-fit`}>
                                                {priorityLabels[approval.priority]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{approval.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDetails(approval)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {approval.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleApprove(approval.id)}
                                                            className="text-green-600 hover:text-green-700"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleReject(approval.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Approval Details</DialogTitle>
                        <DialogDescription>
                            View request details and approve or reject it
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApproval && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                                    <p className="text-lg font-semibold">{selectedApproval.requestId}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Request Type</Label>
                                    <p className="text-lg">{selectedApproval.requestType}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Requester</Label>
                                    <p className="text-lg">{selectedApproval.requester}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                                    <p className="text-lg">{selectedApproval.createdAt}</p>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                                <p className="text-lg font-semibold">{selectedApproval.title}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                <p className="text-lg">{selectedApproval.description}</p>
                            </div>

                            {selectedApproval.status !== 'pending' && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-muted-foreground">Comment</Label>
                                    <p className="text-lg">{selectedApproval.comments}</p>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Approved by:</Label>
                                        <span className="text-lg">{selectedApproval.approver}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-muted-foreground">Approval Date:</Label>
                                        <span className="text-lg">{selectedApproval.approvedAt}</span>
                                    </div>
                                </div>
                            )}

                            {selectedApproval.status === 'pending' && (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="comments">Comment</Label>
                                        <Textarea
                                            id="comments"
                                            value={actionComments}
                                            onChange={(e) => setActionComments(e.target.value)}
                                            placeholder="Add your comment here..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsDetailsDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => {
                                                handleReject(selectedApproval.id);
                                                setIsDetailsDialogOpen(false);
                                            }}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleApprove(selectedApproval.id);
                                                setIsDetailsDialogOpen(false);
                                            }}
                                        >
                                            <Check className="h-4 w-4 mr-2" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}