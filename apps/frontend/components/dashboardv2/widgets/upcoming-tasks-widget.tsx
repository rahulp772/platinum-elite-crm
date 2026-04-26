"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Loader2, Calendar } from "lucide-react"
import { PeriodType } from "../period-selector"

interface UpcomingTasksWidgetProps {
  period: PeriodType
}

interface Task {
  id: string
  title: string
  dueDate: string
  priority: "high" | "medium" | "low"
  completed: boolean
}

const PRIORITY_COLORS = {
  high: "text-rose-600 bg-rose-500/10",
  medium: "text-yellow-600 bg-yellow-500/10",
  low: "text-slate-600 bg-slate-500/10",
}

export function UpcomingTasksWidget({ period }: UpcomingTasksWidgetProps) {
  const { data, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks-upcoming', period],
    queryFn: async () => {
      const res = await api.get(`/tasks?filter=upcoming&limit=5`)
      return res.data.data || []
    }
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const tasks = data || []

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-accent/50"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </div>
                </div>
                <Badge className={`text-xs capitalize ${PRIORITY_COLORS[task.priority]}`}>
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