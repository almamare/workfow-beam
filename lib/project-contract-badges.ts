import type { BadgeProps } from '@/components/ui/badge';

/** Maps API `approval_status` to this app’s {@link Badge} variants. */
export function approvalBadgeVariant(status: string): NonNullable<BadgeProps['variant']> {
    const map: Record<string, NonNullable<BadgeProps['variant']>> = {
        Draft: 'draft',
        Pending: 'pending',
        Approved: 'approved',
        Rejected: 'rejected',
    };
    return map[status] ?? 'default';
}
