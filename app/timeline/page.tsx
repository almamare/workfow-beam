'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/stores/store';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Clock, CheckCircle, XCircle, Info, RefreshCw, AlertCircle, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    fetchNotifications,
    selectNotifications,
    selectNotificationsLoading,
    selectNotificationsCounts,
} from '@/stores/slices/notifications';
import type { NotificationItem } from '@/stores/types/notifications';

// Date formatting helper
const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Invalid date';
    }
};

interface TimelineItem {
    id: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'info';
    title: string;
    description?: string;
    createdAt: string;
    by?: string;
    reference?: string;
}

export default function TimelinePage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const dispatch = useReduxDispatch<AppDispatch>();
    const notifications = useSelector((state: RootState) => selectNotifications(state));
    const loading = useSelector((state: RootState) => selectNotificationsLoading(state));
    const counts = useSelector((state: RootState) => selectNotificationsCounts(state));

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const mapNotificationToTimelineItem = (n: NotificationItem): TimelineItem => {
        const type = n.notification_type || 'system';

        const messageLower = (n.message || '').toLowerCase();
        let status: TimelineItem['status'] = 'info';
        if (messageLower.includes('approved') || messageLower.includes('موافق')) {
            status = 'approved';
        } else if (messageLower.includes('rejected') || messageLower.includes('مرفوض')) {
            status = 'rejected';
        } else if (!n.is_read) {
            status = 'pending';
        }

        return {
            id: n.id,
            type,
            status,
            title: n.title || 'Notification',
            description: n.message,
            createdAt: n.created_at,
            by: n.is_read ? 'Read' : 'Unread',
        };
    };

    // Unique notification types for filter
    const uniqueTypes = useMemo(() => {
        const set = new Set<string>();
        notifications.forEach((n) => {
            const t = n.notification_type || 'system';
            set.add(t);
        });
        return Array.from(set).sort();
    }, [notifications]);

    // Apply server data + local filters (status & type)
    const filteredTimelineItems: TimelineItem[] = useMemo(() => {
        let items = notifications;

        if (statusFilter === 'unread') {
            items = items.filter((n) => !n.is_read);
        } else if (statusFilter === 'read') {
            items = items.filter((n) => !!n.is_read);
        }

        if (typeFilter !== 'all') {
            items = items.filter((n) => (n.notification_type || 'system') === typeFilter);
        }

        return items.map(mapNotificationToTimelineItem);
    }, [notifications, statusFilter, typeFilter]);

    const filteredTimeline = useMemo(() => {
        if (!search) return filteredTimelineItems;
        const s = search.toLowerCase();
        return filteredTimelineItems.filter(
            (item) =>
                item.title.toLowerCase().includes(s) ||
                item.description?.toLowerCase().includes(s) ||
                item.reference?.toLowerCase().includes(s) ||
                item.by?.toLowerCase().includes(s) ||
                item.type?.toLowerCase().includes(s)
        );
    }, [search, filteredTimelineItems]);

    const activeFilters = useMemo(() => {
        const arr: string[] = [];
        if (search) arr.push(`Search: ${search}`);
        if (statusFilter !== 'all') arr.push(`Status: ${statusFilter === 'unread' ? 'Unread' : 'Read'}`);
        if (typeFilter !== 'all') arr.push(`Type: ${typeFilter}`);
        return arr;
    }, [search, statusFilter, typeFilter]);

    const refreshTimeline = async () => {
        setIsRefreshing(true);
        try {
            await dispatch(fetchNotifications());
        } finally {
            setIsRefreshing(false);
        }
    };

    const getStatusColor = (status: string) => {
        if (!status) return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('approved') || statusLower.includes('موافق') || statusLower === 'approved') {
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
        }
        if (statusLower.includes('rejected') || statusLower.includes('مرفوض') || statusLower === 'rejected') {
            return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
        }
        if (statusLower.includes('pending') || statusLower.includes('قيد') || statusLower === 'pending') {
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
        }
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    };

    const getStatusIcon = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('approved') || statusLower.includes('موافق') || statusLower === 'approved') {
            return <CheckCircle className="h-4 w-4" />;
        }
        if (statusLower.includes('rejected') || statusLower.includes('مرفوض') || statusLower === 'rejected') {
            return <XCircle className="h-4 w-4" />;
        }
        if (statusLower.includes('pending') || statusLower.includes('قيد') || statusLower === 'pending') {
            return <Clock className="h-4 w-4" />;
        }
        return <Info className="h-4 w-4" />;
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Timeline
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View a chronological history of key actions and notifications in the system
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={refreshTimeline}
                        disabled={isRefreshing || loading}
                        className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Filters Card */}
            <EnhancedCard
                title="Search & Filters"
                description="Filter timeline events by status, type, or search term"
                variant="default"
                size="sm"
            >
                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search in timeline items..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-medium">
                                Status
                            </Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => {
                                    setStatusFilter(value as 'all' | 'unread' | 'read');
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All</SelectItem>
                                    <SelectItem value="unread" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Unread</SelectItem>
                                    <SelectItem value="read" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Read</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Type Filter */}
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-700 dark:text-slate-300 font-medium">
                                Type
                            </Label>
                            <Select
                                value={typeFilter}
                                onValueChange={(value) => {
                                    setTypeFilter(value);
                                }}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <SelectItem value="all" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Types</SelectItem>
                                    {uniqueTypes.map((t) => (
                                        <SelectItem key={t} value={t} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters & Clear Button */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                {activeFilters.map((filter, index) => (
                                    <Badge
                                        key={index}
                                        variant="outline"
                                        className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
                                    >
                                        {filter}
                                    </Badge>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
            </EnhancedCard>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EnhancedCard
                    title="Total Events"
                    description="All timeline notifications"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {counts.read + counts.unread}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Unread"
                    description="Notifications not yet read"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {counts.unread}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Read"
                    description="Notifications already read"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {counts.read}
                    </div>
                </EnhancedCard>
                <EnhancedCard
                    title="Filtered Events"
                    description="Events matching current filters"
                    variant="default"
                    size="sm"
                >
                    <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                        {filteredTimeline.length}
                    </div>
                </EnhancedCard>
            </div>

            {/* Timeline */}
            <EnhancedCard
                title="Activity Timeline"
                description={
                    loading
                        ? 'Loading events...'
                        : `${filteredTimeline.length} event${filteredTimeline.length === 1 ? '' : 's'} in the timeline`
                }
                variant="default"
                size="sm"
            >
                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                        <RefreshCw className="h-8 w-8 animate-spin text-sky-500" />
                        <p className="text-slate-500 dark:text-slate-400">Loading timeline...</p>
                    </div>
                ) : filteredTimeline.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                        <AlertCircle className="h-12 w-12 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">No timeline events found for the current filters</p>
                    </div>
                ) : (
                    <div className="relative py-2">
                        {/* Timeline line - vertical line connecting all items */}
                        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

                        <div className="space-y-3">
                            {filteredTimeline.map((item, index) => {
                                const isLast = index === filteredTimeline.length - 1;
                                const statusLower = item.status.toLowerCase();
                                const isApproved = statusLower.includes('approved') || statusLower.includes('موافق');
                                const isRejected = statusLower.includes('rejected') || statusLower.includes('مرفوض');
                                const isPending = statusLower.includes('pending') || statusLower.includes('قيد');

                                return (
                                    <div key={item.id} className="relative pl-10">
                                        {/* Timeline dot - compact design */}
                                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${
                                            isApproved 
                                                ? 'border-green-500 bg-green-500' 
                                                : isRejected 
                                                    ? 'border-red-500 bg-red-500' 
                                                    : isPending
                                                        ? 'border-yellow-500 bg-yellow-500'
                                                        : 'border-slate-400 bg-slate-400'
                                        } flex items-center justify-center`}>
                                            <div className="text-white">
                                                {getStatusIcon(item.status)}
                                            </div>
                                        </div>

                                        {/* Timeline content - compact */}
                                        <div className={`bg-white dark:bg-slate-800/50 border-l-2 rounded p-3 ${
                                            isApproved 
                                                ? 'border-l-green-500' 
                                                : isRejected 
                                                    ? 'border-l-red-500' 
                                                    : isPending
                                                        ? 'border-l-yellow-500'
                                                        : 'border-l-slate-400'
                                        }`}>
                                            {/* Header - compact */}
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getStatusColor(item.status)} flex items-center gap-1 text-xs px-2 py-0.5`}
                                                    >
                                                        {getStatusIcon(item.status)}
                                                        <span className="text-xs capitalize">{item.status}</span>
                                                    </Badge>
                                                    {item.type && (
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 capitalize text-xs"
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {formatDateTime(item.createdAt)}
                                                </span>
                                            </div>

                                            {/* Title - compact */}
                                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
                                                {item.title}
                                            </h3>

                                            {/* Description - compact */}
                                            {item.description && (
                                                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-xs">
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Footer info - compact */}
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                {item.by && (
                                                    <span>
                                                        <span className="font-medium">By:</span> {item.by}
                                                    </span>
                                                )}
                                                {item.reference && (
                                                    <span>
                                                        <span className="font-medium">Ref:</span> {item.reference}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </EnhancedCard>
        </div>
    );
}


