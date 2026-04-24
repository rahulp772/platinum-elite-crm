"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { StatsCard } from "@/components/dashboard/stats-card"
import { LeadFunnelWidget } from "@/components/dashboard/lead-funnel-widget"
import { ActiveDealsWidget } from "@/components/dashboard/active-deals-widget"
import { UpcomingTasksWidget } from "@/components/dashboard/upcoming-tasks-widget"
import { Users, Building2, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const res = await api.get("/analytics/dashboard")
            return res.data
        }
    })

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const overview = stats?.overview || {
        totalLeads: 0,
        totalProperties: 0,
        totalDeals: 0,
        totalRevenue: 0
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's what's happening with your real estate business.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    index={0}
                    title="Total Leads"
                    value={overview.totalLeads.toString()}
                    change="+12% from last month"
                    changeType="positive"
                    icon={Users}
                    iconColor="text-realty-gold"
                />
                <StatsCard
                    index={1}
                    title="Active Properties"
                    value={overview.totalProperties.toString()}
                    change="+3 new this week"
                    changeType="positive"
                    icon={Building2}
                    iconColor="text-primary"
                />
                <StatsCard
                    index={2}
                    title="Deals in Pipeline"
                    value={overview.totalDeals.toString()}
                    change="8 closing this month"
                    changeType="neutral"
                    icon={TrendingUp}
                    iconColor="text-indigo-600 dark:text-indigo-400"
                />
                <StatsCard
                    index={3}
                    title="Revenue (Closed)"
                    value={`$${(overview.totalRevenue / 1000000).toFixed(1)}M`}
                    change="+18% from last month"
                    changeType="positive"
                    icon={DollarSign}
                    iconColor="text-realty-gold"
                />
            </div>

            {/* Widgets Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="lg:col-span-3">
                    <LeadFunnelWidget />
                </div>
                <div className="lg:col-span-4">
                    <ActiveDealsWidget />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <UpcomingTasksWidget />
                <Card className="h-full flex flex-col justify-center items-center p-8 text-center text-muted-foreground border-dashed bg-card/20">
                    <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                    <p>Performance insights coming soon</p>
                </Card>
            </div>
        </div>
    )
}

