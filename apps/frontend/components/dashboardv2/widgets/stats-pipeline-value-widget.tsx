"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Target, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface StatsPipelineValueWidgetProps {
  period: PeriodType
}

interface PipelineData {
  rawValue: number
  weightedValue: number
  dealCount: number
  avgDealSize: number
  trend: number
  byStage: { stage: string; value: number; count: number; probability: number }[]
}

const STAGE_PROBABILITIES: Record<string, number> = {
  lead: 10,
  negotiation: 60,
  under_contract: 80,
  closed: 100,
}

export function StatsPipelineValueWidget({ period }: StatsPipelineValueWidgetProps) {
  const { data, isLoading } = useQuery<PipelineData>({
    queryKey: ['analytics-pipeline-value', period],
    queryFn: async () => {
      const res = await api.get(`/analytics/pipeline-value?period=${period}`)
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

  const pipeline = data || {
    rawValue: 0,
    weightedValue: 0,
    dealCount: 0,
    avgDealSize: 0,
    trend: 0,
    byStage: []
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Pipeline Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Weighted Value</p>
              <p className="text-2xl font-bold text-realty-gold">
                {formatCurrency(pipeline.weightedValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                {pipeline.dealCount} deals
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Raw Value</p>
              <p className="text-xl font-semibold">
                {formatCurrency(pipeline.rawValue)}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(pipeline.avgDealSize)}
              </p>
            </div>
          </div>

          {pipeline.trend !== 0 && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              pipeline.trend > 0 ? "text-teal-600" : "text-rose-600"
            )}>
              <TrendingUp className={cn("h-3 w-3", pipeline.trend < 0 && "rotate-180")} />
              <span>{Math.abs(Math.round(pipeline.trend))}% vs last period</span>
            </div>
          )}

          {pipeline.byStage && pipeline.byStage.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">By Stage</p>
              <div className="flex gap-1 h-2">
                {pipeline.byStage.map((stage, i) => {
                  const percentage = pipeline.rawValue > 0 
                    ? (stage.value / pipeline.rawValue) * 100 
                    : 0
                  return (
                    <div
                      key={stage.stage}
                      className="bg-realty-gold/60 rounded-sm"
                      style={{ width: `${percentage}%` }}
                      title={`${stage.stage}: ${formatCurrency(stage.value)}`}
                    />
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {pipeline.byStage.map(stage => (
                  <span key={stage.stage} className="text-xs text-muted-foreground">
                    {stage.stage}: {stage.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}