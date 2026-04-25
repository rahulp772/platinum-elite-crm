"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp, TrendingDown, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface StatsResponseTimeWidgetProps {
  period: PeriodType
}

interface ResponseTimeData {
  averageMinutes: number
  leadsContacted: number
  totalLeads: number
  trend: number
  byHour: { hours: number; count: number }[]
}

export function StatsResponseTimeWidget({ period }: StatsResponseTimeWidgetProps) {
  const { data, isLoading } = useQuery<ResponseTimeData>({
    queryKey: ['analytics-response-time', period],
    queryFn: async () => {
      const res = await api.get(`/analytics/lead-response-time?period=${period}`)
      return res.data
    }
  })

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[160px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const responseTime = data?.averageMinutes || 0
  const leadsContacted = data?.leadsContacted || 0
  const totalLeads = data?.totalLeads || 0
  const trend = data?.trend || 0
  const contactedPercent = totalLeads > 0 ? Math.round((leadsContacted / totalLeads) * 100) : 0

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`
    return `${Math.round(minutes / 1440)}d`
  }

  const getStatusColor = () => {
    if (responseTime <= 30) return "text-teal-600"
    if (responseTime <= 60) return "text-yellow-600"
    return "text-rose-600"
  }

  const getStatusLabel = () => {
    if (responseTime <= 30) return "Excellent"
    if (responseTime <= 60) return "Good"
    if (responseTime <= 240) return "Needs Improvement"
    return "Critical"
  }

  return (
    <Card className={cn("h-full",
      "relative overflow-hidden",
      responseTime <= 30 && "border-teal-500/50",
      responseTime > 240 && "border-rose-500/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lead Response Time
          </CardTitle>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            responseTime <= 30 && "bg-teal-500/10 text-teal-600",
            responseTime > 30 && responseTime <= 60 && "bg-yellow-500/10 text-yellow-600",
            responseTime > 60 && responseTime <= 240 && "bg-orange-500/10 text-orange-600",
            responseTime > 240 && "bg-rose-500/10 text-rose-600"
          )}>
            {getStatusLabel()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <span className={cn("text-3xl font-bold", getStatusColor())}>
              {formatTime(responseTime)}
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              {trend < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 text-teal-600" />
                  <span className="text-teal-600">{Math.abs(Math.round(trend))}% faster</span>
                </>
              ) : trend > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-rose-600" />
                  <span className="text-rose-600">{Math.round(trend)}% slower</span>
                </>
              ) : (
                <span>No change</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Leads contacted</span>
              <span>{leadsContacted} / {totalLeads}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-realty-gold transition-all duration-500"
                style={{ width: `${contactedPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{contactedPercent}% contacted</p>
          </div>

          {responseTime > 60 && (
            <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-500/10 p-2 rounded">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Aiming for under 1 hour response time improves conversion by 3x</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}