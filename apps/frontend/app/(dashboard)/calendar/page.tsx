"use client"

import * as React from "react"
import { BigCalendar } from "@/components/calendar/big-calendar"
import { mockTasks } from "@/lib/mock-data/tasks"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus } from "lucide-react"

export default function CalendarPage() {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-muted-foreground">
                        View your schedule and upcoming deadlines
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Sync Calendar
                    </Button>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                    </Button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <BigCalendar tasks={mockTasks} />
            </div>
        </div>
    )
}
