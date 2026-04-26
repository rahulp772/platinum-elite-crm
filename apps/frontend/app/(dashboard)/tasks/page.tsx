"use client"

import * as React from "react"
import { TaskCard } from "@/components/tasks/task-card"
import { CalendarSidebar } from "@/components/tasks/calendar-sidebar"
import { AddTaskDialog } from "@/components/tasks/add-task-dialog"
import { useTasksInfinite, useTaskCounts, useUpdateTask } from "@/hooks/use-tasks"
import { Task } from "@/types/task"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useInView } from "react-intersection-observer"

type DateFilter = "all" | "overdue" | "today" | "tomorrow" | "yesterday"
type StatusFilter = "all" | "todo" | "done"

function isSameDay(a: Date, b: Date): boolean {
    return a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
}

function filterByDate(tasks: Task[], filter: DateFilter): Task[] {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(yesterday)
    yesterdayEnd.setHours(23, 59, 59, 999)

    return tasks.filter((task) => {
        const taskDate = new Date(task.dueDate)
        switch (filter) {
            case "overdue":
                return taskDate < now && task.status !== "done"
            case "today":
                return taskDate >= now && taskDate <= end
            case "tomorrow":
                return taskDate >= tomorrow && taskDate <= tomorrowEnd
            case "yesterday":
                return taskDate >= yesterday && taskDate <= yesterdayEnd
            default:
                return true
        }
    })
}

function getDateFilterLabel(filter: DateFilter): string {
    const labels: Record<DateFilter, string> = {
        overdue: "Overdue",
        today: "Today",
        tomorrow: "Tomorrow",
        yesterday: "Yesterday",
        all: "All Tasks",
    }
    return labels[filter]
}

export default function TasksPage() {
    const { data: counts } = useTaskCounts()
    const updateTask = useUpdateTask()
    const [addTaskOpen, setAddTaskOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
    const [dateFilter, setDateFilter] = React.useState<DateFilter>("all")
    const [allTasks, setAllTasks] = React.useState<Task[]>([])

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useTasksInfinite()

    React.useEffect(() => {
        if (!data) return
        const flat = data.pages.flatMap((p) => p.data)
        setAllTasks(flat)
    }, [data])

    const handleStatusChange = async (id: string, newStatus: Task["status"]) => {
        await updateTask.mutateAsync({ id, status: newStatus })
    }

    const handleDateNavClick = (filter: DateFilter) => {
        setDateFilter(filter)
        setSelectedDate(undefined)
    }

    const handlePrevDay = () => {
        const current = selectedDate || new Date()
        const prev = new Date(current)
        prev.setDate(prev.getDate() - 1)
        setSelectedDate(prev)
        setDateFilter("all")
    }

    const handleNextDay = () => {
        const current = selectedDate || new Date()
        const next = new Date(current)
        next.setDate(next.getDate() + 1)
        setSelectedDate(next)
        setDateFilter("all")
    }

    const handleGoToToday = () => {
        setSelectedDate(new Date())
        setDateFilter("all")
    }

    const { ref: loadMoreRef, inView } = useInView()

    React.useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, isFetchingNextPage])

    const filteredTasks = React.useMemo(() => {
        let filtered = [...allTasks]

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter((task) => task.title.toLowerCase().includes(q))
        }

        if (statusFilter === "todo") {
            filtered = filtered.filter((task) => task.status === "todo")
        } else if (statusFilter === "done") {
            filtered = filtered.filter((task) => task.status === "done")
        }

        if (dateFilter !== "all") {
            filtered = filterByDate(filtered, dateFilter)
        } else if (selectedDate) {
            const start = new Date(selectedDate)
            start.setHours(0, 0, 0, 0)
            const end = new Date(selectedDate)
            end.setHours(23, 59, 59, 999)
            filtered = filtered.filter((task) => {
                const taskDate = new Date(task.dueDate)
                return taskDate >= start && taskDate <= end
            })
        }

        return filtered.sort((a, b) => {
            if (a.status === "done" && b.status !== "done") return 1
            if (a.status !== "done" && b.status === "done") return -1
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        })
    }, [allTasks, selectedDate, searchQuery, statusFilter, dateFilter])

    const selectedDateLabel = selectedDate
        ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
        : getDateFilterLabel(dateFilter)

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground">
                        Manage your daily to-do list and schedule
                    </p>
                </div>
                <Button onClick={() => setAddTaskOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
                <AddTaskDialog open={addTaskOpen} onOpenChange={setAddTaskOpen} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
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
                        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="w-[400px]">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="todo">To Do</TabsTrigger>
                                <TabsTrigger value="done">Completed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">
                                {selectedDateLabel}
                            </h2>
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {filteredTasks.length}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center border rounded-md overflow-hidden">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 rounded-none border-r"
                                    onClick={handlePrevDay}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs font-medium rounded-none"
                                    onClick={handleGoToToday}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 rounded-none border-l"
                                    onClick={handleNextDay}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <DateButton
                            label="Overdue"
                            count={counts?.overdue}
                            active={dateFilter === "overdue"}
                            color="red"
                            onClick={() => handleDateNavClick("overdue")}
                        />
                        <DateButton
                            label="Yesterday"
                            active={dateFilter === "yesterday"}
                            color="gray"
                            onClick={() => handleDateNavClick("yesterday")}
                        />
                        <DateButton
                            label="Today"
                            count={counts?.today}
                            active={dateFilter === "today"}
                            color="amber"
                            onClick={() => handleDateNavClick("today")}
                        />
                        <DateButton
                            label="Tomorrow"
                            count={counts?.tomorrow}
                            active={dateFilter === "tomorrow"}
                            color="green"
                            onClick={() => handleDateNavClick("tomorrow")}
                        />
                        <DateButton
                            label="All"
                            active={dateFilter === "all" && !selectedDate}
                            color="slate"
                            onClick={() => handleDateNavClick("all")}
                        />
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredTasks.length > 0 ? (
                            <>
                                {filteredTasks.map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}

                                {hasNextPage && (
                                    <div ref={loadMoreRef} className="flex items-center justify-center py-4">
                                        {isFetchingNextPage ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => fetchNextPage()}
                                            >
                                                Load more
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No tasks found for this day.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <CalendarSidebar
                        tasks={allTasks}
                        selectedDate={selectedDate}
                        onSelectDate={(date) => {
                            setSelectedDate(date)
                            setDateFilter("all")
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

interface DateButtonProps {
    label: string
    count?: number
    active: boolean
    color: "red" | "amber" | "green" | "gray" | "slate"
    onClick: () => void
}

function DateButton({ label, count, active, color, onClick }: DateButtonProps) {
    const colorMap = {
        red: {
            active: "bg-rose-600 text-white border-rose-600",
            default: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800",
        },
        amber: {
            active: "bg-amber-500 text-white border-amber-500",
            default: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
        },
        green: {
            active: "bg-emerald-600 text-white border-emerald-600",
            default: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
        },
        gray: {
            active: "bg-slate-600 text-white border-slate-600",
            default: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        },
        slate: {
            active: "bg-slate-700 text-white border-slate-700",
            default: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        },
    }

    const styles = colorMap[color]

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-3 border text-xs font-medium rounded-full transition-colors ${active ? styles.active : styles.default}`}
            onClick={onClick}
        >
            {label}
            {count !== undefined && count > 0 && (
                <span className={`ml-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                    active ? "bg-white/20" : "bg-current/10"
                }`}>
                    {count}
                </span>
            )}
        </Button>
    )
}
