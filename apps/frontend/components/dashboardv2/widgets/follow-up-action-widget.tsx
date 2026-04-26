"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Phone, AlertTriangle, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { formatDateTimeInTimezone, getUserTimezone } from "@/lib/date-utils"

export function FollowUpActionWidget() {
  const { user } = useAuth()
  const timezone = getUserTimezone(user)
  const { data: overdue, isLoading: loadingOverdue } = useQuery({
    queryKey: ["dashboard", "followups", "overdue"],
    queryFn: async () => {
      const res = await api.get("/leads/followups/overdue")
      return res.data as any[]
    },
  })

  const { data: today, isLoading: loadingToday } = useQuery({
    queryKey: ["dashboard", "followups", "today"],
    queryFn: async () => {
      const res = await api.get("/leads/followups")
      return res.data as any[]
    },
  })

  const { data: newLeads, isLoading: loadingNew } = useQuery({
    queryKey: ["dashboard", "leads", "new"],
    queryFn: async () => {
      const res = await api.get("/leads/new")
      return res.data as any[]
    },
  })

  const isLoading = loadingOverdue || loadingToday || loadingNew

  if (isLoading) {
    return (
      <Card className="p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
      </Card>
    )
  }

  const overdueLeads = overdue || []
  const todayLeads = today || []
  const newLeadsList = newLeads || []
  const total = overdueLeads.length + todayLeads.length + newLeadsList.length

  if (total === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Action Required
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Action Required
        </h3>
        <Link href="/leads">
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {overdueLeads.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs font-semibold text-rose-600">Overdue ({overdueLeads.length})</span>
            </div>
            <div className="space-y-1.5">
              {overdueLeads.slice(0, 3).map((lead: any) => (
                <LeadRow key={lead.id} lead={lead} variant="overdue" timezone={timezone} />
              ))}
            </div>
          </div>
        )}

        {todayLeads.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-600">Today ({todayLeads.length})</span>
            </div>
            <div className="space-y-1.5">
              {todayLeads.slice(0, 3).map((lead: any) => (
                <LeadRow key={lead.id} lead={lead} variant="today" timezone={timezone} />
              ))}
            </div>
          </div>
        )}

        {newLeadsList.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600">New ({newLeadsList.length})</span>
            </div>
            <div className="space-y-1.5">
              {newLeadsList.slice(0, 3).map((lead: any) => (
                <LeadRow key={lead.id} lead={lead} variant="new" timezone={timezone} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

interface LeadRowProps {
  lead: any
  variant: "overdue" | "today" | "new"
  timezone: string
}

function LeadRow({ lead, variant, timezone }: LeadRowProps) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-md text-xs ${
      variant === "overdue" ? "bg-rose-50 dark:bg-rose-950/20" :
      variant === "today" ? "bg-amber-50 dark:bg-amber-950/20" :
      "bg-emerald-50 dark:bg-emerald-950/20"
    }`}>
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">{lead.name}</span>
        {lead.followUpAt && (
          <span className={`${variant === "overdue" ? "text-rose-600" : "text-muted-foreground"}`}>
            {formatDateTimeInTimezone(lead.followUpAt, timezone)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => window.open(`tel:${lead.phone}`)}
        >
          <Phone className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}