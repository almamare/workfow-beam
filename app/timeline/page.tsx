'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/stores/store';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { FilterBar } from '@/components/ui/filter-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, Info, RefreshCw } from 'lucide-react';
import {
    fetchNotifications,
    selectNotifications,
    selectNotificationsLoading,
    selectNotificationsCounts,
} from '@/stores/slices/notifications';
import type { NotificationItem } from '@/stores/types/notifications';

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

    const getStatusColor = (status: TimelineItem['status']) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'rejected':
                return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            default:
                return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    const getStatusIcon = (status: TimelineItem['status']) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-4">
            <Breadcrumb />

            <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                        Timeline
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        View a chronological history of key actions in the system
                    </p>
                </div>
            </div>

            <FilterBar
                searchPlaceholder="Search in timeline items..."
                searchValue={search}
                onSearchChange={(value) => setSearch(value)}
                filters={[
                    {
                        key: 'status',
                        label: 'Status',
                        value: statusFilter,
                        options: [
                            { key: 'all', label: 'All', value: 'all' },
                            { key: 'unread', label: 'Unread', value: 'unread' },
                            { key: 'read', label: 'Read', value: 'read' },
                        ],
                        onValueChange: (value: string) => {
                            setStatusFilter(value as 'all' | 'unread' | 'read');
                        },
                    },
                    {
                        key: 'type',
                        label: 'Type',
                        value: typeFilter,
                        options: [
                            { key: 'all', label: 'All Types', value: 'all' },
                            ...uniqueTypes.map((t) => ({
                                key: t,
                                label: t,
                                value: t,
                            })),
                        ],
                        onValueChange: (value: string) => {
                            setTypeFilter(value);
                        },
                    },
                ]}
                activeFilters={activeFilters}
                onClearFilters={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                }}
                actions={
                    <Button
                        variant="outline"
                        onClick={refreshTimeline}
                        disabled={isRefreshing || loading}
                        className="border-orange-200 dark:border-orange-800 hover:text-orange-700 hover:border-orange-300 dark:hover:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <EnhancedCard
                    title="Total Events"
                    description="All timeline notifications"
                    variant="default"
                    size="sm"
                    stats={{
                        total: counts.read + counts.unread,
                        badge: 'Total',
                        badgeColor: 'default',
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Unread"
                    description="Notifications not yet read"
                    variant="default"
                    size="sm"
                    stats={{
                        total: counts.unread,
                        badge: 'Unread',
                        badgeColor: 'warning',
                    }}
                >
                    <></>
                </EnhancedCard>
                <EnhancedCard
                    title="Read"
                    description="Notifications already read"
                    variant="default"
                    size="sm"
                    stats={{
                        total: counts.read,
                        badge: 'Read',
                        badgeColor: 'success',
                    }}
                >
                    <></>
                </EnhancedCard>
            </div>

            <EnhancedCard
                title="Activity Timeline"
                description={
                    loading
                        ? 'Loading events...'
                        : `${filteredTimeline.length} event${filteredTimeline.length === 1 ? '' : 's'}`
                }
                variant="default"
                size="sm"
            >
                <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                    <div className="space-y-6">
                        {filteredTimeline.map((item) => (
                            <div key={item.id} className="relative pl-10">
                                <div className="absolute left-0 top-2 w-6 h-6 rounded-full border-2 border-orange-400 bg-slate-50 dark:bg-slate-900 flex items-center justify-center shadow-sm">
                                    <Clock className="h-3 w-3 text-orange-500" />
                                </div>
                                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`${getStatusColor(item.status)} flex items-center gap-1`}
                                            >
                                                {getStatusIcon(item.status)}
                                                <span className="capitalize">{item.status}</span>
                                            </Badge>
                                            {item.type && (
                                                <Badge
                                                    variant="outline"
                                                    className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 capitalize"
                                                >
                                                    {item.type}
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {item.description}
                                        </p>
                                    )}

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
                        ))}

                        {!loading && filteredTimeline.length === 0 && (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
                                No timeline events found for the current filters.
                            </div>
                        )}
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
}


