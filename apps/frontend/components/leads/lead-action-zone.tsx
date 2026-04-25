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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 flex items-center justify-center h-[120px] bg-card/50 backdrop-blur-sm border-border/50">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ActionCard
        label="Overdue Follow-ups"
        count={overdue}
        icon={<AlertTriangle />}
        color="red"
        active={activeFilter === "overdue"}
        onClick={() => onFilterChange(activeFilter === "overdue" ? "all" : "overdue")}
      />
      <ActionCard
        label="Today's Follow-ups"
        count={today}
        icon={<Calendar />}
        color="yellow"
        active={activeFilter === "today"}
        onClick={() => onFilterChange(activeFilter === "today" ? "all" : "today")}
      />
      <ActionCard
        label="New Leads"
        count={newLeads}
        icon={<UserPlus />}
        color="green"
        active={activeFilter === "new"}
        onClick={() => onFilterChange(activeFilter === "new" ? "all" : "new")}
      />
    </div>
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
      gradient: "from-rose-500/10 to-rose-900/5 dark:from-rose-500/20 dark:to-rose-900/10",
      border: active ? "border-rose-500/50 ring-1 ring-rose-500/50" : "border-rose-500/20",
      glow: active ? "shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]",
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    yellow: {
      gradient: "from-amber-500/10 to-amber-900/5 dark:from-amber-500/20 dark:to-amber-900/10",
      border: active ? "border-amber-500/50 ring-1 ring-amber-500/50" : "border-amber-500/20",
      glow: active ? "shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    green: {
      gradient: "from-emerald-500/10 to-emerald-900/5 dark:from-emerald-500/20 dark:to-emerald-900/10",
      border: active ? "border-emerald-500/50 ring-1 ring-emerald-500/50" : "border-emerald-500/20",
      glow: active ? "shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  }

  const styles = colorMap[color]

  return (
    <Card 
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br backdrop-blur-xl border ${styles.gradient} ${styles.border} ${styles.glow}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
        <div className={styles.iconColor}>{icon}</div>
      </div>
      
      <div className="p-5 relative z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-xl ${styles.iconBg} ${styles.iconColor}`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "h-5 w-5" })}
          </div>
          {active && (
            <Badge variant="outline" className={`bg-background/50 backdrop-blur-md ${styles.iconColor} border-current`}>
              Active Filter
            </Badge>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-bold tracking-tight mb-1">{count}</h3>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}