"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Loader2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface TodayScheduleWidgetProps {
  period: PeriodType
}

interface Appointment {
  id: string
  title: string
  time: string
  location?: string
  type: 'viewing' | 'meeting' | 'call' | 'other'
  relatedTo?: {
    type: string
    name: string
  }
}

const TYPE_COLORS = {
  viewing: "bg-blue-500",
  meeting: "bg-purple-500",
  call: "bg-teal-500",
  other: "bg-slate-500",
}

export function TodayScheduleWidget({ period }: TodayScheduleWidgetProps) {
  const { data, isLoading } = useQuery<Appointment[]>({
    queryKey: ['schedule-today', period],
    queryFn: async () => {
      const res = await api.get(`/tasks?filter=schedule-today&limit=5`)
      return res.data.data || []
    }
  })

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[180px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const appointments = data || []

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className={cn("w-1 h-full rounded-full shrink-0", TYPE_COLORS[appointment.type])} />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{appointment.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {appointment.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.time}
                    </span>
                    {appointment.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {appointment.location}
                      </span>
                    )}
                  </div>
                  {appointment.relatedTo && (
                    <p className="text-xs text-muted-foreground">
                      {appointment.relatedTo.name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}