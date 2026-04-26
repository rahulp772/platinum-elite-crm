"use client"

import * as React from "react"
import { BigCalendar } from "@/components/calendar/big-calendar"
import { AddTaskDialog } from "@/components/tasks/add-task-dialog"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { useTasksInfinite } from "@/hooks/use-tasks"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus } from "lucide-react"
import { Task } from "@/types/task"

export default function CalendarPage() {
    const { data, isLoading } = useTasksInfinite()
    const flatTasks: Task[] = data?.pages.flatMap((p) => p.data) ?? []
    const [addTaskOpen, setAddTaskOpen] = React.useState(false)
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task)
    }

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
                    <Button onClick={() => setAddTaskOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                    </Button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <BigCalendar tasks={flatTasks} onTaskClick={handleTaskClick} />
            </div>

            <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} />
            <TaskDetailDialog task={selectedTask} open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)} />
        </div>
    )
}
