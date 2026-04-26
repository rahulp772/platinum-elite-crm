"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Loader2, Flame, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { PeriodType } from "../period-selector"

interface HotLeadsWidgetProps {
  period: PeriodType
}

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  source: string
  createdAt: string
  status: string
  assignedTo?: {
    name: string
  }
}

const SOURCE_BADGES: Record<string, string> = {
  website: "bg-blue-500",
  referral: "bg-teal-500",
  social: "bg-purple-500",
  ads: "bg-orange-500",
  other: "bg-slate-500",
}

export function HotLeadsWidget({ period }: HotLeadsWidgetProps) {
  const { data, isLoading } = useQuery<Lead[]>({
    queryKey: ['leads-hot', period],
    queryFn: async () => {
      const res = await api.get(`/leads?status=new&sort=createdAt&order=desc&limit=5`)
      return res.data.data || []
    }
  })

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const isUrgent = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    return diffHours > 2
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

  const leads = data || []

  return (
    <Card className={cn("h-full", leads.some(l => isUrgent(l.createdAt)) && "border-rose-500/30")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Hot Leads
          </CardTitle>
          {leads.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {leads.filter(l => isUrgent(l.createdAt)).length} urgent
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/leads" className="flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No new leads</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div 
                key={lead.id}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-3",
                  isUrgent(lead.createdAt) && "bg-rose-500/5 border-rose-500/20"
                )}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{lead.name}</h4>
                    <Badge className={cn("text-xs capitalize", SOURCE_BADGES[lead.source] || "bg-slate-500")}>
                      {lead.source}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(lead.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {lead.phone && (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Mail className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}