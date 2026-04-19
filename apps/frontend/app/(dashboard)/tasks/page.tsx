"use client"

import * as React from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { CalendarSidebar } from "@/components/tasks/calendar-sidebar"
import { mockTasks } from "@/lib/mock-data/tasks"
import { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Filter } from "lucide-react"

export default function TasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>(mockTasks)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<"all" | "todo" | "done">("all")

    const handleStatusChange = (id: string, newStatus: Task["status"]) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
    }

    // Filter logic
    const filteredTasks = React.useMemo(() => {
        return tasks.filter((task) => {
            // 1. Search filter
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false
            }

            // 2. Status filter
            if (statusFilter === "todo" && task.status === "done") return false
            if (statusFilter === "done" && task.status !== "done") return false

            // 3. Date filter (if selected)
            // If a date is selected, show tasks for that day OR overdue tasks (if today is selected)
            if (selectedDate) {
                const taskDate = new Date(task.dueDate)
                const isSameDay = taskDate.getDate() === selectedDate.getDate() &&
                    taskDate.getMonth() === selectedDate.getMonth() &&
                    taskDate.getFullYear() === selectedDate.getFullYear()

                // Show overdue tasks if we are looking at Today
                const isToday = new Date().toDateString() === selectedDate.toDateString()
                const isOverdue = task.dueDate < new Date() && task.status !== "done"

                return isSameDay || (isToday && isOverdue)
            }

            return true
        }).sort((a, b) => {
            // Sort by status (todo first) then date
            if (a.status === "done" && b.status !== "done") return 1
            if (a.status !== "done" && b.status === "done") return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
    }, [tasks, selectedDate, searchQuery, statusFilter])

    const selectedDateLabel = selectedDate
        ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
        : "All Tasks"

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage your daily to-do list and schedule
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {/* Main Content (Task List) */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                    <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-9 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-[400px]">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="todo">To Do</TabsTrigger>
                                <TabsTrigger value="done">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            {selectedDateLabel}
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {filteredTasks.length}
                            </span>
                        </h2>

                        <div className="space-y-3">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No tasks found for this day.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Calendar & Stats) */}
                <div className="lg:col-span-4 space-y-6">
                    <CalendarSidebar
                        tasks={tasks}
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                    />
                </div>
            </div>
        </div>
    )
}
