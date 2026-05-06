import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                draft: 'bg-gray-500 text-white hover:bg-gray-500/80',
                pending: 'bg-yellow-500 text-gray-700 hover:bg-yellow-500/80',
                approved: 'bg-blue-500 text-white hover:bg-blue-500/80',
                rejected: 'bg-red-500 text-white hover:bg-red-500/80',
                inprogress: 'bg-indigo-500 text-white hover:bg-indigo-500/80',
                completed: 'bg-green-500 text-white hover:bg-green-500/80',
                onhold: 'bg-purple-500 text-white hover:bg-purple-500/80',
                cancelled: 'bg-pink-500 text-white hover:bg-pink-500/80',

                // optional fallback
                default: 'bg-primary text-white hover:bg-primary/80',
                outline: 'text-foreground hover:bg-muted/80',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
