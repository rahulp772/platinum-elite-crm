"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface ClosingSoonWidgetProps {
  period: PeriodType
}

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  expectedCloseDate: string
  client: string
}

export function ClosingSoonWidget({ period }: ClosingSoonWidgetProps) {
  const { data, isLoading } = useQuery<Deal[]>({
    queryKey: ['deals-closing-soon', period],
    queryFn: async () => {
      const res = await api.get(`/deals?filter=closing-soon&days=30&limit=5`)
      return res.data.data || []
    }
  })

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[180px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const deals = data || []

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold">Closing Soon</CardTitle>
          {deals.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Next 30 days
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/deals" className="flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No deals closing soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => {
              const daysUntil = getDaysUntil(deal.expectedCloseDate)
              const isUrgent = daysUntil <= 7
              
              return (
                <div 
                  key={deal.id}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-lg border p-3",
                    isUrgent && "bg-rose-500/5"
                  )}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{deal.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {deal.stage.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{deal.client}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-realty-gold">{formatCurrency(deal.value)}</span>
                      {isUrgent && (
                        <span className="text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {daysUntil} days
                        </span>
                      )}
                      {!isUrgent && daysUntil > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {daysUntil} days
                        </span>
                      )}
                    </div>
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