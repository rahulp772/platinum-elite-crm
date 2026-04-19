"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KPIData } from "@/types/analytics"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICardsProps {
    data: KPIData[]
}

export function KPICards({ data }: KPICardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.map((kpi, index) => {
                const TrendIcon = kpi.trend === "up" ? ArrowUp : kpi.trend === "down" ? ArrowDown : Minus
                const trendColor = kpi.trend === "up" ? "text-realty-gold" : kpi.trend === "down" ? "text-rose-500" : "text-muted-foreground"

                return (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {kpi.label}
                            </CardTitle>
                            <TrendIcon className={cn("h-4 w-4", trendColor)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className={cn("font-medium", trendColor)}>
                                    {kpi.change > 0 ? "+" : ""}{kpi.change}%
                                </span>
                                {" from last month"}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
