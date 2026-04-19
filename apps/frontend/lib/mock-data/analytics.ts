import { MonthlyRevenue, DealSource, AgentPerformance, KPIData } from "@/types/analytics"

export const monthlyRevenue: MonthlyRevenue[] = [
    { name: "Jan", value: 450000, target: 400000 },
    { name: "Feb", value: 520000, target: 450000 },
    { name: "Mar", value: 480000, target: 450000 },
    { name: "Apr", value: 610000, target: 500000 },
    { name: "May", value: 550000, target: 500000 },
    { name: "Jun", value: 680000, target: 550000 },
    { name: "Jul", value: 720000, target: 600000 },
    { name: "Aug", value: 690000, target: 600000 },
    { name: "Sep", value: 850000, target: 650000 },
    { name: "Oct", value: 920000, target: 700000 },
    { name: "Nov", value: 880000, target: 750000 },
    { name: "Dec", value: 980000, target: 800000 },
]

export const dealSources: DealSource[] = [
    { name: "Website", value: 45, color: "#10b981" }, // emerald-500
    { name: "Referral", value: 30, color: "#3b82f6" }, // blue-500
    { name: "Social", value: 15, color: "#8b5cf6" },   // violet-500
    { name: "Ads", value: 10, color: "#f59e0b" },      // amber-500
]

export const topAgents: AgentPerformance[] = [
    {
        id: "1",
        name: "Indica Watson",
        deals: 24,
        revenue: 12500000,
        conversionRate: 32,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Indica",
    },
    {
        id: "2",
        name: "Sarah Chen",
        deals: 18,
        revenue: 8400000,
        conversionRate: 28,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    {
        id: "3",
        name: "Michael Ross",
        deals: 15,
        revenue: 6900000,
        conversionRate: 25,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    },
    {
        id: "4",
        name: "David Kim",
        deals: 12,
        revenue: 5200000,
        conversionRate: 22,
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
]

export const kpiStats: KPIData[] = [
    {
        label: "Total Revenue (YTD)",
        value: "$8,330,000",
        change: 12.5,
        trend: "up",
    },
    {
        label: "Active Deals",
        value: "42",
        change: 5.2,
        trend: "up",
    },
    {
        label: "Conversion Rate",
        value: "28.5%",
        change: -1.4,
        trend: "down",
    },
    {
        label: "Avg Deal Size",
        value: "$485,000",
        change: 8.1,
        trend: "up",
    },
]
