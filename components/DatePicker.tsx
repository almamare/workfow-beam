'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
    value?: string
    onChange: (value: string) => void
}

export function DatePicker({ value, onChange }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    )
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        if (value) {
            const parsed = new Date(value)
            if (!isNaN(parsed.getTime())) {
                setDate(parsed)
            }
        } else {
            setDate(undefined)
        }
    }, [value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'yyyy-MM-dd') : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 space-y-2" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                        if (selectedDate) {
                            setDate(selectedDate)
                            onChange(format(selectedDate, 'yyyy-MM-dd'))
                            setOpen(false)
                        }
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
