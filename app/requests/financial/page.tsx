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
import { DollarSign, Plus, Search, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialRequest {
    id: string;
    requestNumber: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    requester: string;
    status: 'pending' | 'approved' | 'rejected' | 'processing';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    approvedAt?: string;
    approver?: string;
    comments?: string;
}

const mockRequests: FinancialRequest[] = [
    {
        id: '1',
        requestNumber: 'FIN-001',
        title: 'Building Materials Purchase',
        description: 'Request to purchase building materials for new construction project',
        amount: 50000,
        currency: 'SAR',
        category: 'Building Materials',
        requester: 'Ahmed Mohamed',
        status: 'pending',
        priority: 'high',
        createdAt: '2024-01-15',
    },
    {
        id: '2',
        requestNumber: 'FIN-002',
        title: 'Equipment Maintenance',
        description: 'Request for heavy equipment maintenance',
        amount: 15000,
        currency: 'SAR',
        category: 'Maintenance',
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
        requestNumber: 'FIN-003',
        title: 'Office Furniture Purchase',
        description: 'Request to purchase new office furniture',
        amount: 25000,
        currency: 'SAR',
        category: 'Furniture',
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
    rejected: 'Rejected',
    processing: 'Processing'
};

const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800'
};

const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-red-100 text-red-800'
};

const categories = ['Building Materials', 'Maintenance', 'Furniture', 'Equipment', 'Fuel', 'Other'];

export default function FinancialRequestsPage() {
    const [requests, setRequests] = useState<FinancialRequest[]>(mockRequests);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingRequest, setEditingRequest] = useState<FinancialRequest | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        currency: 'SAR',
        category: '',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });

    const filteredRequests = requests.filter(request => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const handleCreate = () => {
        if (!formData.title || !formData.amount || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newRequest: FinancialRequest = {
            id: Date.now().toString(),
            requestNumber: `FIN-${String(requests.length + 1).padStart(3, '0')}`,
            title: formData.title,
            description: formData.description,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            category: formData.category,
            requester: 'Current User',
            status: 'pending',
            priority: formData.priority,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setRequests([...requests, newRequest]);
        setIsCreateDialogOpen(false);
        setFormData({ title: '', description: '', amount: '', currency: 'SAR', category: '', priority: 'medium' });
        toast.success('Financial request created successfully');
    };

    const handleEdit = (request: FinancialRequest) => {
        setEditingRequest(request);
        setFormData({
            title: request.title,
            description: request.description,
            amount: request.amount.toString(),
            currency: request.currency,
            category: request.category,
            priority: request.priority
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!editingRequest) return;

        const updatedRequests = requests.map(r =>
            r.id === editingRequest.id ? { 
                ...r, 
                title: formData.title,
                description: formData.description,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                category: formData.category,
                priority: formData.priority
            } : r
        );

        setRequests(updatedRequests);
        setIsEditDialogOpen(false);
        setEditingRequest(null);
        setFormData({ title: '', description: '', amount: '', currency: 'SAR', category: '', priority: 'medium' });
        toast.success('Financial request updated successfully');
    };

    const handleDelete = (id: string) => {
        setRequests(requests.filter(r => r.id !== id));
        toast.success('Financial request deleted successfully');
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Financial Requests</h1>
                    <p className="text-muted-foreground">Manage financial requests and expenses</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            New Financial Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Financial Request</DialogTitle>
                            <DialogDescription>
                                Create a new financial request with amount and purpose details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Request Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Building Materials Purchase"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Detailed description of the request"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SAR">Saudi Riyal</SelectItem>
                                            <SelectItem value="USD">US Dollar</SelectItem>
                                            <SelectItem value="EUR">Euro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreate}>
                                    <DollarSign className="h-4 w-4 mr-2" />
                                    Create Request
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search financial requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Request Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
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

            {/* Requests Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Requests List
                    </CardTitle>
                    <CardDescription>
                        {filteredRequests.length} requests out of {requests.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Request Number</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Requester</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">{request.requestNumber}</TableCell>
                                        <TableCell className="max-w-xs truncate">{request.title}</TableCell>
                                        <TableCell className="font-semibold">
                                            {formatCurrency(request.amount, request.currency)}
                                        </TableCell>
                                        <TableCell>{request.category}</TableCell>
                                        <TableCell>{request.requester}</TableCell>
                                        <TableCell>
                                            <Badge className={`${statusColors[request.status]} w-fit`}>
                                                {statusLabels[request.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${priorityColors[request.priority]} w-fit`}>
                                                {priorityLabels[request.priority]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{request.createdAt}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(request)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(request.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Financial Request</DialogTitle>
                        <DialogDescription>
                            Update financial request data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-title">Request Title</Label>
                            <Input
                                id="edit-title"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-amount">Amount</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-currency">Currency</Label>
                                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SAR">Saudi Riyal</SelectItem>
                                        <SelectItem value="USD">US Dollar</SelectItem>
                                        <SelectItem value="EUR">Euro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="edit-category">Category</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="edit-priority">Priority</Label>
                                <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData(prev => ({ ...prev, priority: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}