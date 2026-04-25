"use client"

import * as React from "react"
import { Task } from "@/types/task"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Calendar, Clock, Phone, Mail, Users, FileText, AlertCircle } from "lucide-react"

interface TaskCardProps {
    task: Task
    onStatusChange?: (id: string, newStatus: Task["status"]) => void
}

const typeIcons = {
    call: Phone,
    meeting: Users,
    email: Mail,
    deadline: AlertCircle,
    todo: FileText,
}

const priorityColors = {
    low: "text-slate-500 bg-slate-100 dark:bg-slate-900/50",
    medium: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    high: "text-rose-600 bg-rose-100 dark:bg-rose-900/30",
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
    const Icon = typeIcons[task.type] || FileText
    
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const isOverdue = dueDate < now && task.status !== "done"
    const isDone = task.status === "done"

    return (
        <Card className={cn("transition-all hover:shadow-sm", isDone && "opacity-60 bg-muted/50")}>
            <CardContent className="p-4 flex gap-4">
                <Checkbox
                    checked={isDone}
                    onCheckedChange={(checked) =>
                        onStatusChange?.(task.id, checked ? "done" : "todo")
                    }
                    className="mt-1"
                />

                <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <span className={cn("font-medium leading-none", isDone && "line-through text-muted-foreground")}>
                            {task.title}
                        </span>
                        <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold tracking-wider", priorityColors[task.priority])}>
                            {task.priority}
                        </Badge>
                    </div>

                    {task.description && (
                        <p className={cn("text-sm text-muted-foreground line-clamp-2", isDone && "line-through")}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-muted-foreground">
                        {/* Due Date */}
                        <div className={cn("flex items-center gap-1.5", isOverdue && "text-rose-600 font-medium")}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                {", "}
                                {dueDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })}
                            </span>
                        </div>

                        {/* Type */}
                        <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5" />
                            <span className="capitalize">{task.type}</span>
                        </div>

                        {/* Assigned To */}
                        {task.assignedTo && (
                            <div className="flex items-center gap-1.5 text-primary">
                                <span className="opacity-60">For:</span>
                                <span className="font-medium">{task.assignedTo.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
