"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy, TrendingUp, DollarSign, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface TeamPerformanceWidgetProps {
  period: PeriodType
}

interface Agent {
  id: string
  name: string
  email: string
  dealsCount: number
  revenue: number
  conversionRate: number
  avatar?: string
}

export function TeamPerformanceWidget({ period }: TeamPerformanceWidgetProps) {
  const { data, isLoading } = useQuery<Agent[]>({
    queryKey: ['analytics-team-performance', period],
    queryFn: async () => {
      const res = await api.get(`/analytics/team/performance?period=${period}`)
      return res.data || []
    }
  })

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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

  const agents = data || []
  const topAgents = agents.slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-realty-gold" />
            Team Performance
          </CardTitle>
          {agents.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {agents.length} agents
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {agents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No team data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topAgents.map((agent, index) => (
              <div 
                key={agent.id}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">
                      {getInitials(agent.name)}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-realty-gold rounded-full flex items-center justify-center">
                      <Trophy className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                    {index < 3 && (
                      <span className="text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {agent.dealsCount} deals
                    </span>
                    <span className="flex items-center gap-1 text-realty-gold">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(agent.revenue)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-sm font-bold",
                    agent.conversionRate >= 20 && "text-teal-600",
                    agent.conversionRate < 20 && agent.conversionRate >= 10 && "text-yellow-600",
                    agent.conversionRate < 10 && "text-rose-600"
                  )}>
                    {agent.conversionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">conversion</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}