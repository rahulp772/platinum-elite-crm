"use client"

import * as React from "react"
import { KPICards } from "@/components/analytics/kpi-cards"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { SourceDistribution } from "@/components/analytics/source-distribution"
import { AgentLeaderboard } from "@/components/analytics/agent-leaderboard"
import { kpiStats, monthlyRevenue, dealSources, topAgents } from "@/lib/mock-data/analytics"
import { Button } from "@/components/ui/button"
import { Download, CalendarIcon } from "lucide-react"

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Track business performance and key metrics
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Last 12 Months
                    </Button>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <KPICards data={kpiStats} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <RevenueChart data={monthlyRevenue} />
                <SourceDistribution data={dealSources} />
                <AgentLeaderboard data={topAgents} />
                {/* Placeholder for future detailed table or another chart */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    {/* Add more widgets here later */}
                </div>
            </div>
        </div>
    )
}
