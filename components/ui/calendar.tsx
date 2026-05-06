'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col sm:flex-row gap-4',
                month: 'space-y-3',
                caption: 'flex justify-center items-center pt-1 relative',
                caption_label: 'text-sm font-semibold tracking-wide',
                nav: 'flex items-center gap-1',
                nav_button: cn(
                    buttonVariants({ variant: 'outline' }),
                    'h-7 w-7 p-0 opacity-70 hover:opacity-100'
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse',
                head_row: 'flex',
                head_cell:
                    'w-9 text-[0.8rem] font-medium text-muted-foreground rounded-md',
                row: 'flex w-full mt-1',
                cell:
                    'h-9 w-9 p-0 text-center text-sm relative focus-within:z-20 [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
                day: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-9 w-9 p-0 font-normal rounded-full aria-selected:opacity-100'
                ),
                day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary focus:bg-primary',
                day_today: 'ring-1 ring-primary/50',
                day_outside:
                    'day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/40 aria-selected:text-muted-foreground',
                day_disabled: 'text-muted-foreground opacity-40',
                day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                day_hidden: 'invisible',
                ...classNames,
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
