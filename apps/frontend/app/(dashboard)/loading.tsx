import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-realty-gold" />
      <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
    </div>
  )
}