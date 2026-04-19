"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Task } from "@/types/task"

interface CalendarSidebarProps {
    tasks: Task[]
    selectedDate: Date | undefined
    onSelectDate: (date: Date | undefined) => void
}

export function CalendarSidebar({ tasks, selectedDate, onSelectDate }: CalendarSidebarProps) {
    // Identify days with tasks
    const daysWithTasks = tasks.map((t) => new Date(t.dueDate.setHours(0, 0, 0, 0)))

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={onSelectDate}
                        modifiers={{
                            hasTask: daysWithTasks,
                        }}
                        modifiersStyles={{
                            hasTask: {
                                fontWeight: "bold",
                                textDecoration: "underline",
                                textDecorationColor: "var(--primary)",
                            },
                        }}
                        className="rounded-md border-0 w-full flex justify-center pb-4"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Task Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">To Do</span>
                        <span className="font-bold">{tasks.filter(t => t.status === "todo").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">In Progress</span>
                        <span className="font-bold">{tasks.filter(t => t.status === "in_progress").length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Done</span>
                        <span className="font-bold text-realty-gold">{tasks.filter(t => t.status === "done").length}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
