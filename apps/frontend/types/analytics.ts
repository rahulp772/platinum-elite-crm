export interface MonthlyRevenue {
    name: string
    value: number
    target: number
}

export interface DealSource {
    name: string
    value: number
    color: string
    [key: string]: string | number
}

export interface AgentPerformance {
    id: string
    name: string
    deals: number
    revenue: number
    conversionRate: number
    avatar: string
}

export interface KPIData {
    label: string
    value: string
    change: number
    trend: "up" | "down" | "neutral"
}
