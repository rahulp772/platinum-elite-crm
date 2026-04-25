"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp } from "lucide-react"
import { PeriodType } from "../period-selector"

interface LeadFunnelWidgetProps {
  period: PeriodType
}

interface FunnelStage {
  stage: string
  count: number
}

const STAGE_COLORS = [
  '#0A192F', // Discovery - Navy
  '#1E3A5F', // Engagement
  '#2D5A87', // Qualification
  '#4A7DB0', // Negotiation
  '#D4AF37', // Conversion - Gold
]

export function LeadFunnelWidget({ period }: LeadFunnelWidgetProps) {
  const { data, isLoading } = useQuery<FunnelStage[]>({
    queryKey: ['analytics-lead-funnel', period],
    queryFn: async () => {
      const res = await api.get(`/analytics/leads/funnel?period=${period}`)
      return res.data || []
    }
  })

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const funnel = data || []
  const maxCount = Math.max(...funnel.map(f => f.count), 1)
  const totalLeads = funnel.reduce((sum, f) => sum + f.count, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Lead Funnel</CardTitle>
          {totalLeads > 0 && (
            <span className="text-sm text-muted-foreground">
              {totalLeads} total leads
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {funnel.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No lead data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {funnel.map((stage, index) => {
              const percentage = (stage.count / maxCount) * 100
              const conversionRate = index > 0 
                ? Math.round((stage.count / funnel[index - 1].count) * 100)
                : 100

              return (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stage.count}</span>
                      {index > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: STAGE_COLORS[index % STAGE_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}