"use client"

import * as React from "react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from "date-fns"
import { Task } from "@/types/task"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BigCalendarProps {
    tasks: Task[]
    onTaskClick?: (task: Task) => void
}

export function BigCalendar({ tasks, onTaskClick }: BigCalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date())

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const today = () => {
        setCurrentDate(new Date())
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const dateFormat = "d"
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] border rounded-lg overflow-hidden bg-card">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={today}>Today</Button>
                    <div className="flex items-center border rounded-md">
                        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-none rounded-l-md border-r">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-none rounded-r-md">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 border-b bg-muted/40">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden">
                {days.map((day, i) => {
                    const dayTasks = tasks.filter(task => isSameDay(new Date(task.dueDate), day))
                    const isCurrentMonth = isSameMonth(day, monthStart)

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "border-r border-b p-2 flex flex-col gap-1 transition-colors hover:bg-muted/30 min-h-[100px]",
                                !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                                i % 7 === 6 && "border-r-0"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                                    isToday(day) && "bg-primary text-primary-foreground"
                                )}>
                                    {format(day, dateFormat)}
                                </span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-muted">
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>

                            <div className="flex flex-col gap-1 flex-1 overflow-y-auto mt-1 custom-scrollbar">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick?.(task)}
                                        className={cn(
                                            "text-[10px] px-2 py-1 rounded truncate border-l-2 font-medium cursor-pointer hover:opacity-80",
                                            task.priority === 'high' ? "bg-rose-100 dark:bg-rose-900/30 border-rose-500 text-rose-700 dark:text-rose-300" :
                                                task.priority === 'medium' ? "bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-300" :
                                                    "bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300",
                                            task.status === "done" && "opacity-50 line-through"
                                        )}
                                    >
                                        {format(new Date(task.dueDate), "h:mm a")} {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
