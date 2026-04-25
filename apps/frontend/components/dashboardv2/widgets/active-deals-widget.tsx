"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, TrendingUp, Building2, Loader2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface ActiveDealsWidgetProps {
  period: PeriodType
}

interface Deal {
  id: string
  title: string
  value: number
  probability: number
  client: string
  stage: string
  property?: {
    address?: string
  }
}

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-slate-500",
  negotiation: "bg-blue-500",
  under_contract: "bg-yellow-500",
  closed: "bg-teal-500",
}

export function ActiveDealsWidget({ period }: ActiveDealsWidgetProps) {
  const { data, isLoading } = useQuery<Deal[]>({
    queryKey: ['deals-active', period],
    queryFn: async () => {
      const res = await api.get(`/deals?status=active&limit=5&period=${period}`)
      return res.data.data || []
    }
  })

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  const deals = data || []

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Active Deals</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/deals" className="flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {deals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active deals</p>
            <Button variant="link" size="sm" asChild>
              <Link href="/deals">Create your first deal</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map((deal, index) => (
              <div 
                key={deal.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm truncate">{deal.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs capitalize",
                        STAGE_COLORS[deal.stage] && `bg-${STAGE_COLORS[deal.stage]}/10 border-${STAGE_COLORS[deal.stage]}/30`
                      )}
                    >
                      {deal.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.client}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-realty-gold">
                      {formatCurrency(deal.value)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-teal-600" />
                      {deal.probability}%
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}