"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Calendar, Loader2, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface TodayTasksWidgetProps {
  period: PeriodType
}

interface Task {
  id: string
  title: string
  dueDate: string
  priority: "high" | "medium" | "low"
  completed: boolean
  relatedTo?: {
    type: string
    name: string
  }
  assignee?: {
    name: string
  }
}

const PRIORITY_COLORS = {
  high: "bg-rose-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-slate-500 text-white",
}

export function TodayTasksWidget({ period }: TodayTasksWidgetProps) {
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks-today', period],
    queryFn: async () => {
      const res = await api.get(`/tasks?filter=today&limit=6`)
      return res.data.data || []
    }
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      await api.patch(`/tasks/${id}`, { completed })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] })
    }
  })

  const handleToggle = (task: Task) => {
    toggleMutation.mutate({ id: task.id, completed: !task.completed })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[250px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const tasks = data || []
  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Today's Tasks</CardTitle>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalCount}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks" className="flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tasks for today</p>
            <Button variant="link" size="sm" asChild>
              <Link href="/tasks">Add a task</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors",
                  task.completed && "opacity-60"
                )}
              >
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => handleToggle(task)}
                  disabled={toggleMutation.isPending}
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <label
                    className={cn(
                      "text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(task.dueDate)}
                      </span>
                    )}
                    {task.relatedTo && (
                      <span className="truncate">{task.relatedTo.name}</span>
                    )}
                  </div>
                </div>
                <Badge 
                  className={cn("text-xs capitalize shrink-0", PRIORITY_COLORS[task.priority])}
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}