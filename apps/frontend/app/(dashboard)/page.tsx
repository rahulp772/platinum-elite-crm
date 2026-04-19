import { StatsCard } from "@/components/dashboard/stats-card"
import { LeadFunnelWidget } from "@/components/dashboard/lead-funnel-widget"
import { ActiveDealsWidget } from "@/components/dashboard/active-deals-widget"
import { UpcomingTasksWidget } from "@/components/dashboard/upcoming-tasks-widget"
import { Users, Building2, DollarSign, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
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
                    title="Total Leads"
                    value="107"
                    change="+12% from last month"
                    changeType="positive"
                    icon={Users}
                    iconColor="text-realty-gold"
                />
                <StatsCard
                    title="Active Properties"
                    value="34"
                    change="+3 new this week"
                    changeType="positive"
                    icon={Building2}
                    iconColor="text-primary"
                />
                <StatsCard
                    title="Deals in Pipeline"
                    value="18"
                    change="8 closing this month"
                    changeType="neutral"
                    icon={TrendingUp}
                    iconColor="text-indigo-600 dark:text-indigo-400"
                />
                <StatsCard
                    title="Revenue (MTD)"
                    value="$2.4M"
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
