'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Eye, Check, X, Clock, Plus, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedDataTable } from '@/components/ui/enhanced-data-table';

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

    const columns = [
        {
            key: 'requestId' as keyof Approval,
            header: 'Request ID',
            render: (value: any) => <span className="font-mono text-sm text-slate-600">{value}</span>,
            sortable: true,
            width: '120px'
        },
        {
            key: 'requestType' as keyof Approval,
            header: 'Request Type',
            render: (value: any) => (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {value}
                </Badge>
            ),
            sortable: true
        },
        {
            key: 'title' as keyof Approval,
            header: 'Title',
            render: (value: any) => (
                <span className="font-semibold text-slate-800">{value}</span>
            ),
            sortable: true
        },
        {
            key: 'requester' as keyof Approval,
            header: 'Requester',
            render: (value: any) => <span className="text-slate-700">{value}</span>,
            sortable: true
        },
        {
            key: 'status' as keyof Approval,
            header: 'Status',
            render: (value: any) => {
                const statusColors = {
                    'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'approved': 'bg-green-100 text-green-700 border-green-200',
                    'rejected': 'bg-red-100 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${statusColors[value as keyof typeof statusColors]} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(value)}
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'priority' as keyof Approval,
            header: 'Priority',
            render: (value: any) => {
                const priorityColors = {
                    'low': 'bg-gray-100 text-gray-700 border-gray-200',
                    'medium': 'bg-blue-100 text-blue-700 border-blue-200',
                    'high': 'bg-red-100 text-red-700 border-red-200'
                };
                
                return (
                    <Badge variant="outline" className={`${priorityColors[value as keyof typeof priorityColors]} w-fit`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Badge>
                );
            },
            sortable: true
        },
        {
            key: 'createdAt' as keyof Approval,
            header: 'Created Date',
            render: (value: any) => <span className="text-slate-500 text-sm">{new Date(value).toLocaleDateString()}</span>,
            sortable: true
        }
    ];

    const actions = [
        {
            label: 'View Details',
            onClick: (approval: Approval) => openDetails(approval),
            icon: <Eye className="h-4 w-4" />
        },
        {
            label: 'Approve',
            onClick: (approval: Approval) => {
                if (approval.status === 'pending') {
                    handleApprove(approval.id);
                }
            },
            icon: <Check className="h-4 w-4" />,
            hidden: (approval: Approval) => approval.status !== 'pending'
        },
        {
            label: 'Reject',
            onClick: (approval: Approval) => {
                if (approval.status === 'pending') {
                    handleReject(approval.id);
                }
            },
            icon: <X className="h-4 w-4" />,
            variant: 'destructive' as const,
            hidden: (approval: Approval) => approval.status !== 'pending'
        }
    ];

    const stats = [
        {
            label: 'Total Requests',
            value: approvals.length,
            change: '+15%',
            trend: 'up' as const
        },
        {
            label: 'Pending Approval',
            value: approvals.filter(a => a.status === 'pending').length,
            change: '+8%',
            trend: 'up' as const
        },
        {
            label: 'Approved',
            value: approvals.filter(a => a.status === 'approved').length,
            change: '+12%',
            trend: 'up' as const
        },
        {
            label: 'Rejected',
            value: approvals.filter(a => a.status === 'rejected').length,
            change: '-3%',
            trend: 'down' as const
        }
    ];

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            options: [
                { key: 'all', label: 'All Statuses', value: 'all' },
                { key: 'pending', label: 'Pending', value: 'pending' },
                { key: 'approved', label: 'Approved', value: 'approved' },
                { key: 'rejected', label: 'Rejected', value: 'rejected' }
            ],
            onValueChange: setStatusFilter
        },
        {
            key: 'priority',
            label: 'Priority',
            value: priorityFilter,
            options: [
                { key: 'all', label: 'All Priorities', value: 'all' },
                { key: 'low', label: 'Low', value: 'low' },
                { key: 'medium', label: 'Medium', value: 'medium' },
                { key: 'high', label: 'High', value: 'high' }
            ],
            onValueChange: setPriorityFilter
        }
    ];

    const activeFilters = [];
    if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);
    if (statusFilter !== 'all') activeFilters.push(`Status: ${statusFilter}`);
    if (priorityFilter !== 'all') activeFilters.push(`Priority: ${priorityFilter}`);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Approvals Management"
                description="Review and approve various requests with comprehensive workflow management and approval tracking"
                stats={stats}
                actions={{
                    primary: {
                        label: 'Create Request',
                        onClick: () => toast.info('Create request feature coming soon'),
                        icon: <Plus className="h-4 w-4" />
                    },
                    secondary: [
                        {
                            label: 'Export Report',
                            onClick: () => toast.info('Export feature coming soon'),
                            icon: <Download className="h-4 w-4" />
                        },
                        {
                            label: 'Bulk Actions',
                            onClick: () => toast.info('Bulk actions coming soon'),
                            icon: <Filter className="h-4 w-4" />
                        }
                    ]
                }}
            />

            {/* Filter Bar */}
            <FilterBar
                searchPlaceholder="Search by request ID, title, or requester..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filterOptions}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                }}
            />

            {/* Approvals Table */}
            <EnhancedCard
                title="Approvals List"
                description={`${filteredApprovals.length} requests out of ${approvals.length} total`}
                variant="gradient"
                size="lg"
                stats={{
                    total: approvals.length,
                    badge: 'Pending Reviews',
                    badgeColor: 'warning'
                }}
            >
                <EnhancedDataTable
                    data={filteredApprovals}
                    columns={columns}
                    actions={actions}
                    loading={false}
                    noDataMessage="No approvals found matching your criteria"
                    searchPlaceholder="Search approvals..."
                />
            </EnhancedCard>

            {/* Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Approval Details
                        </DialogTitle>
                        <DialogDescription>
                            View request details and approve or reject it
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApproval && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-slate-600">Request ID</Label>
                                    <p className="text-lg font-semibold">{selectedApproval.requestId}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600">Request Type</Label>
                                    <p className="text-lg">{selectedApproval.requestType}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600">Requester</Label>
                                    <p className="text-lg">{selectedApproval.requester}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-600">Date</Label>
                                    <p className="text-lg">{selectedApproval.createdAt}</p>
                                </div>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-slate-600">Title</Label>
                                <p className="text-lg font-semibold">{selectedApproval.title}</p>
                            </div>
                            
                            <div>
                                <Label className="text-sm font-medium text-slate-600">Description</Label>
                                <p className="text-lg">{selectedApproval.description}</p>
                            </div>

                            {selectedApproval.status !== 'pending' && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-600">Comment</Label>
                                    <p className="text-lg">{selectedApproval.comments}</p>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-slate-600">Approved by:</Label>
                                        <span className="text-lg">{selectedApproval.approver}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label className="text-sm font-medium text-slate-600">Approval Date:</Label>
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