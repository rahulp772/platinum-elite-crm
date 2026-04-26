"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
    value?: Date | string | null
    onChange: (date: Date | undefined) => void
    placeholder?: string
    className?: string
}

export function DateTimePicker({ value, onChange, placeholder = "Select date & time", className }: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value ? new Date(value) : undefined)
    const [selectedHour, setSelectedHour] = React.useState(value ? new Date(value).getHours() : 9)
    const [selectedMinute, setSelectedMinute] = React.useState(value ? new Date(value).getMinutes() : 0)

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = [0, 15, 30, 45]

    React.useEffect(() => {
        if (value) {
            const date = new Date(value)
            setSelectedDate(date)
            setSelectedHour(date.getHours())
            setSelectedMinute(date.getMinutes())
        }
    }, [value])

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date)
        if (date) {
            const newDate = new Date(date)
            newDate.setHours(selectedHour, selectedMinute, 0, 0)
            onChange(newDate)
        } else {
            onChange(undefined)
        }
    }

    const handleTimeChange = (hour: number, minute: number) => {
        setSelectedHour(hour)
        setSelectedMinute(minute)
        if (selectedDate) {
            const newDate = new Date(selectedDate)
            newDate.setHours(hour, minute, 0, 0)
            onChange(newDate)
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen)
        if (!isOpen && selectedDate) {
            const newDate = new Date(selectedDate)
            newDate.setHours(selectedHour, selectedMinute, 0, 0)
            setSelectedDate(newDate)
            onChange(newDate)
        }
    }

    const formatDisplayValue = () => {
        if (!selectedDate) return placeholder
        const dateStr = selectedDate.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        return `${dateStr}, ${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal h-12 bg-muted/30 hover:bg-muted/50",
                        !selectedDate && "text-muted-foreground",
                        className
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDisplayValue()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col sm:flex-row">
                    <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        className="rounded-l-md"
                    />
                    <div className="border-l p-3 bg-muted/10 min-w-[140px]">
                        <div className="mb-2 text-xs font-medium text-muted-foreground">Time</div>
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                <select
                                    value={selectedHour}
                                    onChange={(e) => handleTimeChange(Number(e.target.value), selectedMinute)}
                                    className="flex-1 bg-background border rounded px-2 py-1 text-sm"
                                >
                                    {hours.map(h => (
                                        <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                                <span className="text-muted-foreground">:</span>
                                <select
                                    value={selectedMinute}
                                    onChange={(e) => handleTimeChange(selectedHour, Number(e.target.value))}
                                    className="flex-1 bg-background border rounded px-2 py-1 text-sm"
                                >
                                    {minutes.map(m => (
                                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-1">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs"
                                onClick={() => handleTimeChange(9, 0)}
                            >
                                9 AM
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs"
                                onClick={() => handleTimeChange(12, 0)}
                            >
                                12 PM
                            </Button>
                        </div>
                        <div className="mt-1 flex gap-1">
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs"
                                onClick={() => handleTimeChange(15, 0)}
                            >
                                3 PM
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="flex-1 text-xs"
                                onClick={() => handleTimeChange(18, 0)}
                            >
                                6 PM
                            </Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}