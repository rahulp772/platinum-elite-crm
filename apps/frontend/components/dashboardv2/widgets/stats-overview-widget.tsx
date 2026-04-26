"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface StatsOverviewWidgetProps {
  period: PeriodType
}

export function StatsOverviewWidget({ period }: StatsOverviewWidgetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: async () => {
      const res = await api.get(`/analytics/dashboard?period=${period}`)
      return res.data
    }
  })

  const overview = data?.overview || {
    totalLeads: 0,
    totalProperties: 0,
    totalDeals: 0,
    totalRevenue: 0
  }

  const stats = [
    { 
      title: 'Total Leads', 
      value: overview.totalLeads, 
      icon: Users, 
      color: 'text-realty-gold',
      change: data?.changes?.leads || 0
    },
    { 
      title: 'Active Properties', 
      value: overview.totalProperties, 
      icon: Building2, 
      color: 'text-primary',
      change: data?.changes?.properties || 0
    },
    { 
      title: 'Deals in Pipeline', 
      value: overview.totalDeals, 
      icon: TrendingUp, 
      color: 'text-indigo-600 dark:text-indigo-400',
      change: data?.changes?.deals || 0
    },
    { 
      title: 'Revenue', 
      value: overview.totalRevenue, 
      icon: DollarSign, 
      color: 'text-realty-gold',
      change: data?.changes?.revenue || 0,
      prefix: '$',
      format: 'currency'
    },
  ]

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const formattedValue = stat.format === 'currency' 
              ? `$${(stat.value / 1000000).toFixed(1)}M`
              : stat.value.toLocaleString()
            
            return (
              <div key={stat.title} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                  <span className="text-xs text-muted-foreground">{stat.title}</span>
                </div>
                <div className="text-xl font-bold">{formattedValue}</div>
                {stat.change !== 0 && (
                  <div className={cn(
                    "text-xs",
                    stat.change > 0 ? "text-teal-600" : "text-rose-600"
                  )}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}