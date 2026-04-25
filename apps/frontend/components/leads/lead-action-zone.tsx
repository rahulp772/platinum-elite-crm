"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, Calendar, UserPlus } from "lucide-react"
import { LeadStatus } from "@/types/lead"

interface ActionZoneProps {
  onFilterChange: (filter: "overdue" | "today" | "new" | "all") => void
  activeFilter: string
}

export function LeadActionZone({ onFilterChange, activeFilter }: ActionZoneProps) {
  const { data: overdueData, isLoading: loadingOverdue } = useQuery({
    queryKey: ["leads", "action-zone", "overdue"],
    queryFn: async () => {
      const res = await api.get("/leads/followups/overdue")
      return res.data
    },
  })

  const { data: todayData, isLoading: loadingToday } = useQuery({
    queryKey: ["leads", "action-zone", "today"],
    queryFn: async () => {
      const res = await api.get("/leads/followups")
      return res.data
    },
  })

  const { data: newData, isLoading: loadingNew } = useQuery({
    queryKey: ["leads", "action-zone", "new"],
    queryFn: async () => {
      const res = await api.get("/leads/new")
      return res.data
    },
  })

  const overdue = overdueData?.length || 0
  const today = todayData?.length || 0
  const newLeads = newData?.length || 0

  const isLoading = loadingOverdue || loadingToday || loadingNew

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </Card>
    )
  }

  return (
    <Card className="p-2">
      <div className="grid grid-cols-3 divide-x divide-border">
        <ActionCard
          label="Overdue"
          count={overdue}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="red"
          active={activeFilter === "overdue"}
          onClick={() => onFilterChange(activeFilter === "overdue" ? "all" : "overdue")}
        />
        <ActionCard
          label="Today"
          count={today}
          icon={<Calendar className="h-4 w-4" />}
          color="yellow"
          active={activeFilter === "today"}
          onClick={() => onFilterChange(activeFilter === "today" ? "all" : "today")}
        />
        <ActionCard
          label="New"
          count={newLeads}
          icon={<UserPlus className="h-4 w-4" />}
          color="green"
          active={activeFilter === "new"}
          onClick={() => onFilterChange(activeFilter === "new" ? "all" : "new")}
        />
      </div>
    </Card>
  )
}

interface ActionCardProps {
  label: string
  count: number
  icon: React.ReactNode
  color: "red" | "yellow" | "green"
  active: boolean
  onClick: () => void
}

function ActionCard({ label, count, icon, color, active, onClick }: ActionCardProps) {
  const colorMap = {
    red: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-700 dark:text-rose-400",
      border: active ? "border-rose-400 ring-2 ring-rose-400/30" : "border-rose-200 dark:border-rose-800",
      badge: "bg-rose-600 text-white",
      label: "text-rose-600 dark:text-rose-500",
    },
    yellow: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      text: "text-amber-700 dark:text-amber-400",
      border: active ? "border-amber-400 ring-2 ring-amber-400/30" : "border-amber-200 dark:border-amber-800",
      badge: "bg-amber-500 text-white",
      label: "text-amber-600 dark:text-amber-500",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      text: "text-emerald-700 dark:text-emerald-400",
      border: active ? "border-emerald-400 ring-2 ring-emerald-400/30" : "border-emerald-200 dark:border-emerald-800",
      badge: "bg-emerald-600 text-white",
      label: "text-emerald-600 dark:text-emerald-500",
    },
  }

  const styles = colorMap[color]

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:scale-[1.02] cursor-pointer ${styles.bg} ${active ? styles.border : ""}`}
    >
      <div className={`${styles.text}`}>{icon}</div>
      <div className="flex flex-col items-start">
        <span className={`text-xs font-medium ${styles.label}`}>{label}</span>
        <Badge className={`${styles.badge} text-xs px-1.5 py-0 min-w-[24px] justify-center`}>
          {count}
        </Badge>
      </div>
    </button>
  )
}