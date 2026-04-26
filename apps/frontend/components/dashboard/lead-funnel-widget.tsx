"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { FunnelSVG } from "./funnel-svg"
import { Loader2 } from "lucide-react"

export function LeadFunnelWidget() {
    const { data: funnelData, isLoading } = useQuery({
        queryKey: ["lead-funnel"],
        queryFn: async () => {
            const res = await api.get("/analytics/leads/funnel")
            return res.data
        }
    })

    return (
        <Card className="h-full flex flex-col bg-white/80 dark:bg-[#050A15]/40 backdrop-blur-xl border-slate-200 dark:border-realty-gold/20 hover:shadow-md transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-realty-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 relative z-10">
                <div>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-realty-gold-light tracking-tight uppercase">
                        Lead Conversion Funnel
                    </CardTitle>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 font-medium tracking-wide uppercase opacity-70">
                        Prospect to Booked journey
                    </p>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-realty-gold" />
                        <p className="text-xs text-realty-gold/50 animate-pulse font-bold tracking-widest uppercase">Calculating Metrics...</p>
                    </div>
                ) : funnelData && funnelData.length > 0 ? (
                    <FunnelSVG data={funnelData} />
                ) : (
                    <div className="text-muted-foreground italic font-medium">No lead data available for this period</div>
                )}
            </CardContent>
        </Card>
    )
}
